function getUsers() {
    const users = getFromStorage(storageKeys.users);
    return Array.isArray(users) ? users.map(withUserRole) : [];
}

function getStoredRecordCount(key) {
    const records = getFromStorage(key);
    return Array.isArray(records) ? records.length : 0;
}

function findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return (
        getUsers().find(function (user) {
            return normalizeEmail(user.email) === normalizedEmail;
        }) || null
    );
}

function getAdminUser() {
    return findUserByEmail(ADMIN_EMAIL);
}

function getAdminSession() {
    return getFromStorage(storageKeys.adminSession);
}

function hasValidAdminSession() {
    const session = getAdminSession();
    const adminUser = getAdminUser();

    return Boolean(
        session &&
        adminUser &&
        session.userId === adminUser.id &&
        normalizeEmail(session.email) === ADMIN_EMAIL &&
        getRoleForEmail(adminUser.email) === USER_ROLES.admin
    );
}

function saveAdminSession(adminUser) {
    saveToStorage(storageKeys.adminSession, {
        userId: adminUser.id,
        email: adminUser.email,
        role: USER_ROLES.admin,
        createdAt: new Date().toISOString()
    });
}

function clearAdminSession() {
    removeFromStorage(storageKeys.adminSession);
}

function containsOnlyDigits(value) {
    const text = String(value);

    if (!text) {
        return false;
    }

    for (const character of text) {
        if (character < "0" || character > "9") {
            return false;
        }
    }

    return true;
}

function containsWhitespace(value) {
    for (const character of String(value)) {
        if (character.trim() === "") {
            return true;
        }
    }

    return false;
}

function escapeHTML(text = "") {
    const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    };
    let escapedText = "";

    for (const character of String(text)) {
        escapedText += replacements[character] || character;
    }

    return escapedText;
}

function getFormValue(formData, key) {
    return String(formData.get(key) || "").trim();
}

function isValidEmail(email = "") {
    const emailText = String(email);
    const atPosition = emailText.indexOf("@");

    if (atPosition <= 0 || atPosition !== emailText.lastIndexOf("@")) {
        return false;
    }

    const accountName = emailText.slice(0, atPosition);
    const domainName = emailText.slice(atPosition + 1);
    const dotPosition = domainName.indexOf(".");
    const hasCompleteDomain = dotPosition > 0 && dotPosition < domainName.length - 1;

    return hasCompleteDomain && !containsWhitespace(accountName) && !containsWhitespace(domainName);
}

function isValidRestaurantTime(time = "") {
    const timeParts = String(time).split(":");

    if (timeParts.length !== 2) {
        return false;
    }

    const [hoursText, minutesText] = timeParts;

    if (
        hoursText.length !== 2 ||
        minutesText.length !== 2 ||
        !containsOnlyDigits(hoursText) ||
        !containsOnlyDigits(minutesText)
    ) {
        return false;
    }

    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    return hours <= 23 && minutes <= 59;
}

function parseDisplayTimeTo24Hour(displayTime = "") {
    const normalizedTime = String(displayTime).trim().toUpperCase();
    let period = "";

    if (normalizedTime.endsWith("AM")) {
        period = "AM";
    } else if (normalizedTime.endsWith("PM")) {
        period = "PM";
    }

    if (!period) {
        return "";
    }

    const clockText = normalizedTime.slice(0, -2).trim();
    const clockParts = clockText.split(":");

    if (clockParts.length > 2) {
        return "";
    }

    const hoursText = clockParts[0];
    const minutesText = clockParts.length === 2 ? clockParts[1] : "00";

    if (
        hoursText.length < 1 ||
        hoursText.length > 2 ||
        minutesText.length !== 2 ||
        !containsOnlyDigits(hoursText) ||
        !containsOnlyDigits(minutesText)
    ) {
        return "";
    }

    let hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (hours < 1 || hours > 12 || minutes > 59) {
        return "";
    }

    if (period === "AM") {
        hours = hours === 12 ? 0 : hours;
    } else {
        hours = hours === 12 ? 12 : hours + 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutesText}`;
}

function getStructuredHoursFromDisplay(hours = "") {
    const hourParts = String(hours).split("-");
    const openingDisplay = hourParts[0]?.trim();
    const closingDisplay = hourParts[1]?.trim();
    const openingTime = parseDisplayTimeTo24Hour(openingDisplay);
    const closingTime = parseDisplayTimeTo24Hour(closingDisplay);

    if (!openingTime || !closingTime) {
        return null;
    }

    return { openingTime, closingTime };
}

function formatTimeForDisplay(time = "") {
    if (!isValidRestaurantTime(time)) {
        return "";
    }

    const [hourValue, minuteValue] = time.split(":").map(Number);
    const period = hourValue >= 12 ? "PM" : "AM";
    const displayHour = hourValue % 12 || 12;

    return `${displayHour}:${String(minuteValue).padStart(2, "0")} ${period}`;
}

function formatRestaurantHours(openingTime, closingTime) {
    return `${formatTimeForDisplay(openingTime)} - ${formatTimeForDisplay(closingTime)}`;
}

function formatTimeFromMinutes(totalMinutes = 0) {
    const minutesInDay = 24 * 60;
    const normalizedMinutes = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
    const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
    const minutes = String(normalizedMinutes % 60).padStart(2, "0");

    return `${hours}:${minutes}`;
}

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

function normalizeRestaurantHours(restaurant = {}) {
    const parsedHours = getStructuredHoursFromDisplay(restaurant.hours);
    const openingTime = isValidRestaurantTime(restaurant.openingTime)
        ? restaurant.openingTime
        : parsedHours?.openingTime || DEFAULT_OPENING_TIME;
    const closingTime = isValidRestaurantTime(restaurant.closingTime)
        ? restaurant.closingTime
        : parsedHours?.closingTime || DEFAULT_CLOSING_TIME;

    return {
        ...restaurant,
        openingTime,
        closingTime
    };
}

function normalizeTableExperience(experience, tableId = "") {
    if (TABLE_EXPERIENCE_NAMES.includes(experience)) {
        return experience;
    }

    return DEFAULT_TABLE_EXPERIENCE_BY_ID[String(tableId).trim().toUpperCase()] || "Regular";
}

function normalizeRestaurantTableLayout(tableLayout) {
    const hasSavedLayout = Array.isArray(tableLayout);
    const sourceLayout = hasSavedLayout ? tableLayout : DEFAULT_TABLE_LAYOUT;
    const seenTableIds = new Set();

    return sourceLayout.reduce(function (layout, table = {}) {
        const tableId = String(table.tableId || "").trim();
        const seats = Math.floor(Number(table.seats));
        const experience = normalizeTableExperience(table.experience, tableId);
        const normalizedTableId = tableId.toLowerCase();

        if (!tableId || !Number.isFinite(seats) || seats < 1 || seenTableIds.has(normalizedTableId)) {
            return layout;
        }

        seenTableIds.add(normalizedTableId);
        layout.push({ tableId, seats, experience });
        return layout;
    }, []);
}

function getRestaurants() {
    const savedRestaurants = getFromStorage(storageKeys.restaurants);
    const restaurants = Array.isArray(savedRestaurants) ? savedRestaurants : DEFAULT_RESTAURANTS;

    return restaurants.map(function (restaurant) {
        return {
            ...normalizeRestaurantHours(restaurant),
            distanceCategory: restaurant.distanceCategory || "Medium",
            sustainabilityBadges: restaurant.sustainabilityBadges || [],
            allergenBadges: restaurant.allergenBadges || [],
            tableLayout: normalizeRestaurantTableLayout(restaurant.tableLayout)
        };
    });
}

function saveRestaurants(restaurants) {
    saveToStorage(
        storageKeys.restaurants,
        restaurants.map(function (restaurant) {
            return {
                ...normalizeRestaurantHours(restaurant),
                tableLayout: normalizeRestaurantTableLayout(restaurant.tableLayout)
            };
        })
    );
}

function getPriceTiers() {
    const savedPriceTiers = getFromStorage(storageKeys.priceTiers) || {};

    return {
        ...DEFAULT_PRICE_TIERS,
        ...savedPriceTiers
    };
}

function savePriceTiers(priceTiers) {
    saveToStorage(storageKeys.priceTiers, priceTiers);
}

function getReservations() {
    const reservations = getFromStorage(storageKeys.reservations);
    return Array.isArray(reservations) ? reservations : [];
}

function saveReservations(reservations) {
    saveToStorage(storageKeys.reservations, reservations);
}

function getWaitlist() {
    const waitlist = getFromStorage(storageKeys.waitlist);
    return Array.isArray(waitlist) ? waitlist : [];
}

function getActiveReservations() {
    return getReservations().filter(function ({ status }) {
        return status === "active";
    });
}

function getWaitingEntries() {
    return getWaitlist().filter(function ({ status }) {
        return status === "waiting";
    });
}

function getAverageRestaurantRating() {
    const ratings = getRestaurants()
        .map(function ({ rating }) {
            return Number(rating);
        })
        .filter(function (rating) {
            return Number.isFinite(rating);
        });

    if (ratings.length === 0) {
        return "0.0";
    }

    const total = ratings.reduce(function (sum, rating) {
        return sum + rating;
    }, 0);
    return (total / ratings.length).toFixed(1);
}

function formatReservationDateTime(reservation = {}) {
    return [reservation.date, reservation.time].filter(Boolean).join(" at ") || "Time not set";
}

function formatReservationSeatIds(reservation = {}) {
    return Array.isArray(reservation.selectedSeatIds) && reservation.selectedSeatIds.length > 0
        ? reservation.selectedSeatIds.join(", ")
        : "Assigned at arrival";
}

function formatUSD(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount) || 0);
}

function getTodayDateValue() {
    const { year, month, day } = getUaeDateParts();
    return `${year}-${month}-${day}`;
}

function getReservationTimestamp(reservation = {}) {
    if (reservation.date && reservation.time) {
        const timestamp = new Date(`${reservation.date}T${reservation.time}`).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    return Number.MAX_SAFE_INTEGER;
}

function getReservationCreatedTimestamp(reservation = {}) {
    if (reservation.createdAt) {
        const timestamp = new Date(reservation.createdAt).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    const reservationId = String(reservation.reservationId || "");
    let digitSequence = "";

    for (const character of reservationId) {
        if (containsOnlyDigits(character)) {
            digitSequence += character;
        } else if (digitSequence.length >= 10) {
            return Number(digitSequence);
        } else {
            digitSequence = "";
        }
    }

    return digitSequence.length >= 10 ? Number(digitSequence) : 0;
}

function getReservationTotalAmount(reservation = {}) {
    return Number(reservation.splitBill?.totalAmount) || Number(reservation.pricing?.finalTotal) || 0;
}

function getAcceptedAttendeeCount(reservation = {}) {
    const acceptedGuests = Array.isArray(reservation.guests)
        ? reservation.guests.filter(function ({ rsvpStatus }) {
              return rsvpStatus === "accepted";
          }).length
        : 0;

    return 1 + acceptedGuests;
}

function getReservationStatus(reservation = {}) {
    return reservation.status || "unknown";
}

function getKnownReservationStatuses() {
    const statuses = getReservations().map(getReservationStatus).filter(Boolean);

    return [...new Set(["active", "confirmed", "completed", "cancelled", ...statuses])];
}

function getReservationRestaurantOptions() {
    return [
        ...new Set(
            getReservations()
                .map(function ({ restaurantName }) {
                    return restaurantName;
                })
                .filter(Boolean)
        )
    ].sort(function (firstName, secondName) {
        return firstName.localeCompare(secondName);
    });
}

function getReservationSummary() {
    const reservations = getReservations();
    const today = getTodayDateValue();

    return {
        total: reservations.length,
        active: reservations.filter(function ({ status }) {
            return status === "active";
        }).length,
        upcomingToday: reservations.filter(function (reservation) {
            return (
                reservation.date === today &&
                ["active", "confirmed"].includes(reservation.status) &&
                getReservationTimestamp(reservation) >= Date.now()
            );
        }).length,
        completedOrCancelled: reservations.filter(function ({ status }) {
            return ["completed", "cancelled"].includes(status);
        }).length
    };
}

function getFilteredReservations() {
    const cleanSearchTerm = adminReservationSearchTerm.trim().toLowerCase();

    return getReservations()
        .filter(function (reservation) {
            const searchableText = [
                reservation.guestName,
                reservation.guestEmail,
                reservation.restaurantName,
                reservation.reservationId
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            return searchableText.includes(cleanSearchTerm);
        })
        .filter(function (reservation) {
            return (
                adminReservationStatusFilter === "all" ||
                getReservationStatus(reservation) === adminReservationStatusFilter
            );
        })
        .filter(function (reservation) {
            return (
                adminReservationRestaurantFilter === "all" ||
                reservation.restaurantName === adminReservationRestaurantFilter
            );
        })
        .filter(function (reservation) {
            return !adminReservationDateFilter || reservation.date === adminReservationDateFilter;
        })
        .sort(function (firstReservation, secondReservation) {
            if (adminReservationSort === "newest") {
                return (
                    getReservationCreatedTimestamp(secondReservation) - getReservationCreatedTimestamp(firstReservation)
                );
            }

            if (adminReservationSort === "guest") {
                return String(firstReservation.guestName || "").localeCompare(
                    String(secondReservation.guestName || "")
                );
            }

            return getReservationTimestamp(firstReservation) - getReservationTimestamp(secondReservation);
        });
}

function getTimeMinutes(time = "") {
    const [hours = "0", minutes = "0"] = time.split(":");

    return Number(hours) * 60 + Number(minutes);
}

function getCurrentUaeTimeMinutes() {
    const { hour, minute } = getUaeDateParts();

    return Number(hour) * 60 + Number(minute);
}

function getRestaurantById(restaurantId) {
    return (
        getRestaurants().find(function ({ id }) {
            return String(id) === String(restaurantId);
        }) || null
    );
}

function getRestaurantTableLayout(restaurant = getRestaurantById(adminSelectedRestaurantId)) {
    if (!restaurant) {
        return [];
    }

    return normalizeRestaurantTableLayout(restaurant?.tableLayout);
}

function getAdminSelectedTableLayout() {
    return getRestaurantTableLayout();
}

function getRestaurantClosingMinutes(restaurant = null) {
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

function getRestaurantTimeSlots(restaurant = null) {
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

function isAdminTableDateToday(date = adminSelectedTableDate) {
    return date === getTodayDateValue();
}

function isAdminTableDateInPast(date = adminSelectedTableDate) {
    return Boolean(date) && date < getTodayDateValue();
}

function isAdminBookingTimeAvailable(
    time = adminSelectedTableTime,
    date = adminSelectedTableDate,
    restaurant = getRestaurantById(adminSelectedRestaurantId)
) {
    if (!date || !time || !restaurant || isAdminTableDateInPast(date)) {
        return false;
    }

    if (!getRestaurantTimeSlots(restaurant).includes(time)) {
        return false;
    }

    if (!isAdminTableDateToday(date)) {
        return true;
    }

    return getTimeMinutes(time) > getCurrentUaeTimeMinutes();
}

function getAvailableAdminTimeSlots(
    date = adminSelectedTableDate,
    restaurant = getRestaurantById(adminSelectedRestaurantId)
) {
    return getRestaurantTimeSlots(restaurant).filter(function (time) {
        return isAdminBookingTimeAvailable(time, date, restaurant);
    });
}

function ensureAdminTableSelection() {
    const restaurants = getRestaurants();

    if (restaurants.length === 0) {
        adminSelectedRestaurantId = null;
        adminSelectedTableDate = "";
        adminSelectedTableTime = "";
        return;
    }

    if (
        !adminSelectedRestaurantId ||
        !restaurants.some(function ({ id }) {
            return String(id) === String(adminSelectedRestaurantId);
        })
    ) {
        adminSelectedRestaurantId = restaurants[0].id;
    }

    if (!adminSelectedTableDate) {
        adminSelectedTableDate = getTodayDateValue();
    }

    const restaurant = getRestaurantById(adminSelectedRestaurantId);
    const availableSlots = getAvailableAdminTimeSlots(adminSelectedTableDate, restaurant);
    const allSlots = getRestaurantTimeSlots(restaurant);

    if (!adminSelectedTableTime || !allSlots.includes(adminSelectedTableTime)) {
        adminSelectedTableTime = availableSlots[0] || allSlots[0] || "";
    }
}

function getAdminTableStatus({ tableId }) {
    const restaurant = getRestaurantById(adminSelectedRestaurantId);

    if (
        !adminSelectedRestaurantId ||
        !adminSelectedTableDate ||
        !adminSelectedTableTime ||
        !isAdminBookingTimeAvailable(adminSelectedTableTime, adminSelectedTableDate, restaurant)
    ) {
        return "Disabled";
    }

    const isReserved = getReservations().some(function (reservation) {
        return (
            reservation.status === "active" &&
            Number(reservation.restaurantId) === Number(adminSelectedRestaurantId) &&
            reservation.date === adminSelectedTableDate &&
            reservation.time === adminSelectedTableTime &&
            reservation.tableId === tableId
        );
    });

    return isReserved ? "Reserved" : "Available";
}

function getAdminTableCounts() {
    const tableLayout = getAdminSelectedTableLayout();
    const statuses = tableLayout.map(getAdminTableStatus);

    return {
        total: tableLayout.length,
        available: statuses.filter(function (status) {
            return status === "Available";
        }).length,
        reserved: statuses.filter(function (status) {
            return status === "Reserved";
        }).length,
        seatCapacity: tableLayout.reduce(function (total, { seats }) {
            return total + seats;
        }, 0)
    };
}

function getTablesByCapacity() {
    const tableLayout = getAdminSelectedTableLayout();
    const capacities = [
        ...new Set(
            tableLayout
                .map(function ({ seats }) {
                    return Number(seats);
                })
                .filter(Number.isFinite)
        )
    ].sort(function (firstCapacity, secondCapacity) {
        return firstCapacity - secondCapacity;
    });

    return capacities.map(function (capacity) {
        return {
            capacity,

            tables: tableLayout.filter(function ({ seats }) {
                return Number(seats) === capacity;
            })
        };
    });
}
