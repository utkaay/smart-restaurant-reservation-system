function getUaeDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: BOOKING_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);
    const dateParts = {};

    parts.forEach(function ({ type, value }) {
        if (type !== "literal") {
            dateParts[type] = value;
        }
    });

    return dateParts;
}

function getTodayDateValue() {
    const { year, month, day } = getUaeDateParts();

    return `${year}-${month}-${day}`;
}

function getTimeMinutes(time = "") {
    const [hours = "0", minutes = "0"] = time.split(":");

    return Number(hours) * 60 + Number(minutes);
}

function getCurrentUaeTimeMinutes() {
    const { hour, minute } = getUaeDateParts();

    return Number(hour) * 60 + Number(minute);
}

function getRestaurantClosingMinutes(restaurant = getSelectedRestaurant()) {
    if (!restaurant) {
        return 0;
    }

    const openingMinutes = getTimeMinutes(restaurant.openingTime);
    const closingMinutes = getTimeMinutes(restaurant.closingTime);

    if (closingMinutes === 0 && openingMinutes > 0) {
        return 24 * 60;
    }

    if (closingMinutes <= openingMinutes) {
        return closingMinutes + 24 * 60;
    }

    return closingMinutes;
}

function getRestaurantTimeSlots(restaurant = getSelectedRestaurant()) {
    if (
        !restaurant ||
        !isValidRestaurantTime(restaurant.openingTime) ||
        !isValidRestaurantTime(restaurant.closingTime)
    ) {
        return [];
    }

    const openingMinutes = getTimeMinutes(restaurant.openingTime);
    const closingMinutes = getRestaurantClosingMinutes(restaurant);
    const slots = [];

    for (let minutes = openingMinutes; minutes < closingMinutes; minutes += TIME_SLOT_INTERVAL_MINUTES) {
        slots.push(formatTimeFromMinutes(minutes));
    }

    return slots;
}

function isBookingDateToday(date = bookingState.date) {
    return date === getTodayDateValue();
}

function isBookingDateInPast(date = bookingState.date) {
    return Boolean(date) && date < getTodayDateValue();
}

function isBookingTimeAvailable(
    time = bookingState.time,
    date = bookingState.date,
    restaurant = getSelectedRestaurant()
) {
    if (!date || !time || !restaurant || isBookingDateInPast(date)) {
        return false;
    }

    if (!getRestaurantTimeSlots(restaurant).includes(time)) {
        return false;
    }

    if (!isBookingDateToday(date)) {
        return true;
    }

    return getTimeMinutes(time) > getCurrentUaeTimeMinutes();
}

function getAvailableBookingTimeSlots(date = bookingState.date, restaurant = getSelectedRestaurant()) {
    return getRestaurantTimeSlots(restaurant).filter(function (time) {
        return isBookingTimeAvailable(time, date, restaurant);
    });
}

function getDefaultBookingTime(date = bookingState.date, restaurant = getSelectedRestaurant()) {
    return getAvailableBookingTimeSlots(date, restaurant)[0] || "";
}

function getSelectedRestaurant() {
    return getRestaurants().find(function ({ id }) {
        return Number(id) === Number(bookingState.restaurantId);
    });
}

function getRestaurantTableLayout(restaurant = getSelectedRestaurant()) {
    if (!restaurant) {
        return [];
    }

    return normalizeRestaurantTableLayout(restaurant?.tableLayout);
}

function getTableBaseFee(seats = 0) {
    const tableFees = getPriceTiers();

    return tableFees[seats] || 0;
}

function getTableExperience(table = {}) {
    return normalizeTableExperience(table.experience);
}

function getExperienceFee(table = {}) {
    return TABLE_EXPERIENCES[getTableExperience(table)].fee;
}

function getTimePricingAdjustment(tableFee, time) {
    if (peakHours.includes(time)) {
        return {
            label: "Peak surcharge",
            rate: 0.25,
            amount: roundCurrency(tableFee * 0.25)
        };
    }

    if (offPeakHours.includes(time)) {
        return {
            label: "Off-peak discount",
            rate: -0.1,
            amount: roundCurrency(tableFee * -0.1)
        };
    }

    return {
        label: "Normal hours",
        rate: 0,
        amount: 0
    };
}

function getCouponDiscount(subtotal, couponCode = "") {
    const normalizedCouponCode = couponCode.trim().toUpperCase();

    if (normalizedCouponCode === "WELCOME10") {
        return {
            code: normalizedCouponCode,
            label: "WELCOME10",
            amount: roundCurrency(subtotal * 0.1)
        };
    }

    if (normalizedCouponCode === "SAVE5") {
        return {
            code: normalizedCouponCode,
            label: "SAVE5",
            amount: Math.min(5, subtotal)
        };
    }

    return {
        code: normalizedCouponCode,
        label: normalizedCouponCode ? "Invalid coupon" : "No coupon",
        amount: 0
    };
}

function getMemberDiscount(subtotal, memberTier = "Standard") {
    const safeMemberTier = memberDiscountRates[memberTier] === undefined ? "Standard" : memberTier;
    const rate = memberDiscountRates[safeMemberTier];

    return {
        tier: safeMemberTier,
        rate,
        amount: roundCurrency(subtotal * rate)
    };
}

function calculateReservationPrice({ table, time, couponCode, memberTier }) {
    const tableFee = getTableBaseFee(table?.seats);
    const tableExperience = getTableExperience(table);
    const experienceFee = getExperienceFee(table);
    const subtotalBeforeTime = roundCurrency(tableFee + experienceFee);
    const timeAdjustment = getTimePricingAdjustment(subtotalBeforeTime, time);
    const adjustedSubtotal = Math.max(0, roundCurrency(subtotalBeforeTime + timeAdjustment.amount));
    const couponDiscount = getCouponDiscount(adjustedSubtotal, couponCode);
    const afterCouponSubtotal = Math.max(0, roundCurrency(adjustedSubtotal - couponDiscount.amount));
    const memberDiscount = getMemberDiscount(afterCouponSubtotal, memberTier);
    const finalTotal = Math.max(0, roundCurrency(afterCouponSubtotal - memberDiscount.amount));

    return {
        currency: "USD",
        tableFee,
        tableExperience,
        experienceFee,
        timeAdjustment,
        couponDiscount,
        memberDiscount,
        finalTotal
    };
}

function renderPricingSummaryRows(pricing) {
    const { tableFee, tableExperience, experienceFee, timeAdjustment, couponDiscount, memberDiscount, finalTotal } =
        pricing;
    const timeAdjustmentClass = timeAdjustment.amount < 0 ? "discount" : "charge";

    return `
        <div>
            <span>Table fee</span>
            <strong>${formatUSD(tableFee)}</strong>
        </div>
        <div>
            <span>${escapeHTML(normalizeTableExperience(tableExperience))} experience</span>
            <strong>${formatUSD(experienceFee || 0)}</strong>
        </div>
        <div>
            <span>Time adjustment (${timeAdjustment.label})</span>
            <strong class="${timeAdjustmentClass}">${formatUSD(timeAdjustment.amount)}</strong>
        </div>
        <div>
            <span>Coupon discount (${couponDiscount.label})</span>
            <strong class="discount">${formatDiscountUSD(couponDiscount.amount)}</strong>
        </div>
        <div>
            <span> Member discount </span>
            <strong class="discount">${formatDiscountUSD(memberDiscount.amount)}</strong>
        </div>
        <div class="pricing-total">
            <span>Final total</span>
            <strong>${formatUSD(finalTotal)}</strong>
        </div>
    `;
}

function renderPricingSummary(selectedTable) {
    if (!selectedTable) {
        return `
        <section class="profile-panel pricing-panel">
            <div class="form-heading">
                <p class="eyebrow">Pricing summary</p>
                <h3>Select a table to calculate pricing</h3>
            </div>
            <p class="summary-muted">Pricing updates after a table and time are selected.</p>
            </section>
        `;
    }

    const pricing = calculateReservationPrice({
        table: selectedTable,
        time: bookingState.time,
        couponCode: bookingState.couponCode,
        memberTier: bookingState.memberTier
    });

    return `
        <section class="profile-panel pricing-panel">
            <div class="form-heading">
                <p class="eyebrow">Pricing summary</p>
                <h3>Reservation total</h3>
            </div>

            <div class="pricing-controls">
                <label>
                    Coupon code
                    <input
                        id="couponCodeInput"
                        type="text"
                        value="${escapeHTML(bookingState.couponCode)}"
                        placeholder="WELCOME10 or SAVE5"
                        autocomplete="off"
                    >
                </label>

                <label>
                    Member tier
                    <select id="memberTierSelect">
                        ${Object.keys(memberDiscountRates)
                            .map(function (tier) {
                                return `
                                <option value="${tier}" ${bookingState.memberTier === tier ? "selected" : ""}>${getMemberDiscountLabel(
                                    {
                                        tier,
                                        rate: memberDiscountRates[tier]
                                    }
                                )}</option>
                            `;
                            })
                            .join("")}
                    </select>
                </label>
            </div>

            <div class="pricing-summary" id="pricingSummary">
                ${renderPricingSummaryRows(pricing)}
            </div>
        </section>
    `;
}
