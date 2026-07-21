function redirectToLoginForBooking(restaurantId = bookingState.restaurantId) {
    if (restaurantId) {
        savePendingAction({
            type: "booking",
            restaurantId
        });
    }

    bookingState = createEmptyBookingState();
    clearBookingDraft();
    bookingMessage = "";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    authMode = "login";
    authErrors = {};
    authFormValues = {};
    authMessage = "Please log in or create an account before booking.";
    showLoginPage();
}

function startBooking(restaurantId) {
    const profile = getCurrentUserProfile();

    if (!profile) {
        redirectToLoginForBooking(restaurantId);
        return;
    }

    const restaurant = getRestaurants().find(function ({ id }) {
        return Number(id) === Number(restaurantId);
    });
    const date = getTodayDateValue();

    bookingState = {
        restaurantId: Number(restaurantId),
        date,
        time: getDefaultBookingTime(date, restaurant),
        tableId: "",
        selectedSeatIds: [],
        experienceFilter: "Regular",
        couponCode: "",
        memberTier: "Standard",
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: null
    };
    bookingMessage = "";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    saveBookingDraft();
    showBookingPage();
}

function renderTimeSlots() {
    const restaurant = getSelectedRestaurant();
    const slots = getRestaurantTimeSlots(restaurant);
    const availableSlots = getAvailableBookingTimeSlots(bookingState.date, restaurant);

    if (!restaurant) {
        return `<p class="booking-warning">Select a restaurant before choosing a time.</p>`;
    }

    if (slots.length === 0) {
        return `<p class="booking-warning">No booking slots are configured for this restaurant.</p>`;
    }

    return `
        ${
            isBookingDateToday() && availableSlots.length === 0
                ? `
            <p class="booking-warning">No more slots available today.</p>
        `
                : ""
        }
        ${slots
            .map(function (time) {
                const isActive = bookingState.time === time;
                const isDisabled = !isBookingTimeAvailable(time);

                return `
            <button
                class="time-slot ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}"
                type="button"
                data-time="${time}"
                ${isDisabled ? "disabled" : ""}
            >
                ${time}
            </button>
        `;
            })
            .join("")}
    `;
}

function getTableStatus({ tableId }) {
    const { restaurantId, date, time } = bookingState;

    if (!date || !time || !isBookingTimeAvailable(time)) {
        return "Disabled";
    }

    const isReserved = getReservations().some(function (reservation) {
        return (
            reservation.status === "active" &&
            Number(reservation.restaurantId) === Number(restaurantId) &&
            reservation.date === date &&
            reservation.time === time &&
            reservation.tableId === tableId
        );
    });

    if (isReserved) {
        return "Reserved";
    }

    if (bookingState.tableId === tableId) {
        return "Selected";
    }

    return "Available";
}

function getReservedTableCountForSlot() {
    const { restaurantId, date, time } = bookingState;
    const tableIds = new Set(
        getRestaurantTableLayout().map(function ({ tableId }) {
            return tableId;
        })
    );

    if (!restaurantId || !date || !time || !isBookingTimeAvailable(time)) {
        return 0;
    }

    return getReservations()
        .filter(function (reservation) {
            return (
                reservation.status === "active" &&
                Number(reservation.restaurantId) === Number(restaurantId) &&
                reservation.date === date &&
                reservation.time === time
            );
        })
        .filter(function ({ tableId }) {
            return tableIds.has(tableId);
        }).length;
}

function isSlotFull() {
    const tableLayout = getRestaurantTableLayout();

    if (!isBookingTimeAvailable()) {
        return false;
    }

    return tableLayout.length > 0 && getReservedTableCountForSlot() >= tableLayout.length;
}

function getSlotAvailabilityStatus() {
    const tableLayout = getRestaurantTableLayout();

    if (!isBookingTimeAvailable()) {
        return "Select an available time";
    }

    if (tableLayout.length === 0) {
        return "No tables configured";
    }

    const reservedTableCount = getReservedTableCountForSlot();

    if (reservedTableCount >= tableLayout.length) {
        return "Full / Waitlist open";
    }

    if (reservedTableCount >= Math.ceil(tableLayout.length * 0.6)) {
        return "Limited availability";
    }

    return "Available";
}

function hasGuestJoinedWaitlist(profile = getGuestProfile()) {
    if (!profile) {
        return false;
    }

    return getWaitlist().some(function (entry) {
        return (
            Number(entry.restaurantId) === Number(bookingState.restaurantId) &&
            entry.date === bookingState.date &&
            entry.time === bookingState.time &&
            entry.guestEmail === profile.email &&
            entry.status === "waiting"
        );
    });
}

function joinWaitlist() {
    const profile = getCurrentUserProfile();
    const restaurant = getSelectedRestaurant();

    if (!profile || !restaurant || !isBookingTimeAvailable() || !isSlotFull() || hasGuestJoinedWaitlist(profile)) {
        return;
    }

    saveWaitlist([
        ...getWaitlist(),
        {
            waitlistId: `waitlist-${Date.now()}`,
            guestName: profile.name,
            guestEmail: profile.email,
            guestPhone: profile.phone,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            date: bookingState.date,
            time: bookingState.time,
            status: "waiting"
        }
    ]);

    bookingMessage = "You joined the waitlist for this slot.";
    renderBookingView();
}

function renderWaitlistStatus() {
    const profile = getCurrentUserProfile();
    const hasAvailableTime = isBookingTimeAvailable();
    const availabilityStatus = getSlotAvailabilityStatus();
    const slotFull = isSlotFull();
    const alreadyJoined = hasGuestJoinedWaitlist(profile);
    const tableLayout = getRestaurantTableLayout();

    return `
        <div class="waitlist-status-panel">
            <div class="form-heading">
                <p class="eyebrow">Live status</p>
                <h3>${availabilityStatus}</h3>
            </div>
            <p class="summary-muted">
                ${
                    hasAvailableTime
                        ? tableLayout.length === 0
                            ? "No tables are configured for this restaurant."
                            : slotFull
                              ? "All tables are reserved for this date and time."
                              : `${tableLayout.length - getReservedTableCountForSlot()} tables remain for this slot.`
                        : "Choose a future slot within this restaurant's operating hours."
                }
            </p>
            ${
                hasAvailableTime && slotFull
                    ? `
                <button class="primary-action" type="button" id="joinWaitlistButton" ${alreadyJoined ? "disabled" : ""}>
                    ${alreadyJoined ? "Waitlist Joined" : "Join Waitlist"}
                </button>
            `
                    : ""
            }
        </div>
    `;
}

function renderTableMap() {
    const tableLayout = getRestaurantTableLayout();

    if (tableLayout.length === 0) {
        return `
            <div class="empty-state">
                <h3>No tables configured</h3>
                <p>This restaurant is not accepting table bookings yet.</p>
            </div>
        `;
    }

    return tableLayout
        .map(function (table) {
            const { tableId, seats, experience } = table;
            const status = getTableStatus(table);
            const matchesExperience = experience === bookingState.experienceFilter;
            const isDisabled = status === "Reserved" || status === "Disabled" || !matchesExperience;

            return `
            <button
                class="table-tile ${status.toLowerCase()}"
                type="button"
                data-table-id="${tableId}"
                ${isDisabled ? "disabled" : ""}
                aria-label="Table ${escapeHTML(tableId)}, ${escapeHTML(experience)}, ${seats} seats, ${status}${matchesExperience ? "" : `, choose ${escapeHTML(experience)} experience to select`}"
            >
                <strong>${tableId}</strong>
                <span>${seats} seats</span>
                <em>${experience} &middot; ${status}</em>
            </button>
        `;
        })
        .join("");
}

function renderTableExperienceControls() {
    return `
        <div class="table-experience-heading">Table experience</div>
        <div class="table-experience-controls" role="radiogroup" aria-label="Table experience">
            ${Object.entries(TABLE_EXPERIENCES)
                .map(function ([experience, details]) {
                    return `
                    <button
                        class="table-experience-control ${bookingState.experienceFilter === experience ? "is-active" : ""}"
                        type="button"
                        role="radio"
                        aria-checked="${bookingState.experienceFilter === experience}"
                        data-experience-filter="${experience}"
                    >
                        <span class="table-experience-icon" aria-hidden="true">${experience === "Regular" ? "♧" : experience === "Premium" ? "♕" : "◇"}</span>
                        <span>
                            <strong>${experience}</strong>
                            <small>${details.subtitle}</small>
                        </span>
                        <span class="table-experience-check" aria-hidden="true">✓</span>
                    </button>
                `;
                })
                .join("")}
        </div>
    `;
}

function renderTableInformationStrip(selectedTable) {
    const experience = selectedTable
        ? getTableExperience(selectedTable)
        : normalizeTableExperience(bookingState.experienceFilter);
    const details = TABLE_EXPERIENCES[experience];
    const selectedSeatIds = selectedTable ? getValidSelectedSeatIds(selectedTable) : [];
    const requiredSeatCount = getRequiredSeatCount();
    const remainingSeatCount = Math.max(0, requiredSeatCount - selectedSeatIds.length);
    const message = !selectedTable
        ? `Choose a ${experience} table · ${details.subtitle}`
        : selectedSeatIds.length === 0
          ? `Table ${selectedTable.tableId} · ${experience} · Select exactly ${requiredSeatCount} ${requiredSeatCount === 1 ? "seat" : "seats"}`
          : `Table ${selectedTable.tableId} · ${experience} · ${selectedSeatIds.length} of ${requiredSeatCount} seats · ${selectedSeatIds.join(", ")}`;
    const status = !selectedTable
        ? details.benefits
        : remainingSeatCount === 0
          ? "Ready to reserve"
          : selectedSeatIds.length === 0
            ? "Choose your seats"
            : `${remainingSeatCount} more ${remainingSeatCount === 1 ? "seat" : "seats"} required`;

    return `
        <div class="table-information-strip" id="tableInformationStrip" aria-live="polite">
            <span class="table-information-main"><span class="table-information-icon" aria-hidden="true">i</span>${escapeHTML(message)}</span>
            <span class="table-information-seat-state">
                <strong>${escapeHTML(status)}</strong>
                ${seatSelectionMessage ? `<small>${escapeHTML(seatSelectionMessage)}</small>` : ""}
            </span>
        </div>
    `;
}

function renderSeatFallbackContent(selectedTable) {
    if (!selectedTable) {
        return "";
    }

    const selectedSeatIds = getValidSelectedSeatIds(selectedTable);
    const requiredSeatCount = getRequiredSeatCount();
    const selectionComplete = selectedSeatIds.length >= requiredSeatCount;

    return `
        <div class="seat-fallback-heading">
            <strong>Seats for table ${escapeHTML(selectedTable.tableId)}</strong>
            <span>Select exactly ${requiredSeatCount}</span>
        </div>
        <div class="seat-fallback-grid">
            ${Array.from({ length: selectedTable.seats }, function (_, seatIndex) {
                const seatId = getSeatId(selectedTable.tableId, seatIndex);
                const isSelected = selectedSeatIds.includes(seatId);
                const isUnavailable =
                    getTableStatus(selectedTable) !== "Selected" || (selectionComplete && !isSelected);
                return `
                    <button
                        class="seat-fallback-button ${isSelected ? "is-selected" : ""} ${isUnavailable ? "is-unavailable" : ""}"
                        type="button"
                        data-seat-id="${escapeHTML(seatId)}"
                        aria-pressed="${isSelected}"
                        aria-label="Table ${escapeHTML(selectedTable.tableId)}, seat ${seatIndex + 1}, ${isSelected ? "selected" : isUnavailable ? "unavailable" : "available"}"
                        ${isUnavailable ? "disabled" : ""}
                    >
                        <strong>Seat ${seatIndex + 1}</strong>
                        <span>${escapeHTML(seatId)}</span>
                    </button>
                `;
            }).join("")}
        </div>
    `;
}

function renderConfirmationSummary(selectedTable) {
    if (!selectedTable) {
        return "Select an available table to continue.";
    }

    const selectedSeatIds = getValidSelectedSeatIds(selectedTable);
    const seatSummary = selectedSeatIds.length > 0 ? selectedSeatIds.join(", ") : "Select your exact seats.";
    return `Table ${selectedTable.tableId} · Seats ${seatSummary}`;
}

function revealBookingTableFallback(bookingView) {
    const fallback = bookingView?.querySelector("#bookingTableFallback");
    const stage = bookingView?.querySelector("#bookingTable3DStage");
    if (fallback) {
        fallback.classList.add("is-fallback-visible");
        fallback.setAttribute("aria-label", "Table selector");
    }
    const seatFallback = bookingView?.querySelector("#bookingSeatFallback");
    if (seatFallback) {
        seatFallback.classList.add("is-fallback-visible");
    }
    if (stage) {
        stage.hidden = true;
    }
}

function destroyBookingTableSelector() {
    bookingTableSelector3DInitToken += 1;
    bookingTableSelector3DModule?.destroyBookingTableSelector3D();
}

function initializeBookingTableSelector(bookingView) {
    const container = bookingView.querySelector("#bookingTable3D");
    const returnButton = bookingView.querySelector("#returnToFloorButton");
    const token = ++bookingTableSelector3DInitToken;

    if (!container) {
        return;
    }

    bookingTableSelector3DModulePromise.then(function (module) {
        if (token !== bookingTableSelector3DInitToken || !container.isConnected) {
            return;
        }

        if (!module || !module.isBookingTableSelector3DSupported()) {
            revealBookingTableFallback(bookingView);
            return;
        }

        const initialized = module.initBookingTableSelector3D({
            container,
            returnButton,
            tables: getRestaurantTableLayout(),
            experienceFilter: bookingState.experienceFilter,
            selectedTableId: bookingState.tableId,
            selectedSeatIds: [...bookingState.selectedSeatIds],
            requiredSeatCount: getRequiredSeatCount(),
            getTableStatus,
            onTableSelect: handleTableSelect,
            onSeatToggle: handleSeatToggle,
            onFailure: function () {
                return revealBookingTableFallback(bookingView);
            }
        });

        if (!initialized) {
            revealBookingTableFallback(bookingView);
        }
    });
}

function renderBookingView() {
    const bookingView = document.querySelector("#bookingView");
    const profile = getCurrentUserProfile();

    destroyBookingTableSelector();

    if (!profile) {
        if (bookingView) {
            bookingView.innerHTML = "";
        }

        redirectToLoginForBooking();
        return;
    }

    const restaurant = getSelectedRestaurant();

    if (!restaurant) {
        bookingView.innerHTML = `
            <section class="profile-panel">
                <h3>Select a restaurant first.</h3>
            </section>
        `;
        return;
    }

    const { name, cuisine, rating, priceLevel, image } = restaurant;
    bookingState.experienceFilter = normalizeTableExperience(bookingState.experienceFilter);
    let selectedTable = getSelectedBookingTable();
    if (selectedTable && getTableStatus(selectedTable) !== "Selected") {
        bookingState = { ...bookingState, tableId: "", selectedSeatIds: [] };
        selectedTable = null;
        seatSelectionMessage = "That table is no longer available. Choose another table.";
    } else if (selectedTable) {
        bookingState.selectedSeatIds = getValidSelectedSeatIds(selectedTable);
    }
    saveBookingDraft();
    const isOverTableCapacity = Boolean(selectedTable) && !doesBookingFitTable(selectedTable);
    const isSelectedTimeAvailable = isBookingTimeAvailable();
    const canConfirm = Boolean(
        profile &&
        selectedTable &&
        canGuestBook(profile) &&
        getTableStatus(selectedTable) === "Selected" &&
        isSelectedTimeAvailable &&
        !isOverTableCapacity &&
        canConfirmSeatSelection(selectedTable)
    );

    bookingView.innerHTML = `
        <section class="profile-panel booking-restaurant-panel">
            <div class="booking-summary-image">
                <span style="background-image: linear-gradient(180deg, rgba(10, 15, 20, 0.02), rgba(10, 15, 20, 0.34)), url('${image}')"></span>
            </div>
            <div class="booking-summary-content">
                <div class="form-heading">
                    <p class="eyebrow">Restaurant summary</p>
                    <h3>${escapeHTML(name)}</h3>
                </div>
                <div class="booking-restaurant-meta">
                    <span class="summary-chip">${escapeHTML(cuisine)}</span>
                    <span class="summary-chip">Rating ${escapeHTML(rating)}</span>
                    <span class="summary-chip">${escapeHTML(priceLevel)}</span>
                </div>
                ${createRestaurantBadgeSections(restaurant)}
                ${bookingMessage ? `<p class="profile-message">${escapeHTML(bookingMessage)}</p>` : ""}
            </div>
        </section>

        <section class="profile-panel booking-controls-panel">
            <div class="form-heading">
                <p class="eyebrow">Select date & time</p>
                <h3>Choose your reservation slot</h3>
            </div>

            <div class="booking-slot-layout">
                <label class="booking-date-field">
                    Date
                    <input id="bookingDateInput" type="date" value="${bookingState.date}" min="${getTodayDateValue()}">
                </label>

                <div>
                    <p class="booking-control-label">Time</p>
                    <div class="time-slot-grid">
                        ${renderTimeSlots()}
                    </div>
                </div>
            </div>
        </section>

        <section class="profile-panel booking-table-panel">
            <div class="form-heading">
                <p class="eyebrow">Choose table</p>
                <h3>Choose one available table</h3>
            </div>
            ${renderWaitlistStatus()}
            ${renderTableExperienceControls()}
            <div class="table-status-legend">
                <span class="legend-dot available"></span> Available
                <span class="legend-dot selected"></span> Selected
                <span class="legend-dot reserved"></span> Reserved
                <span class="legend-dot disabled"></span> Disabled
            </div>
            <div class="booking-3d-stage" id="bookingTable3DStage">
                <div class="booking-3d-toolbar">
                    <button class="booking-floor-return" type="button" id="returnToFloorButton"><span aria-hidden="true">←</span> Return to Floor</button>
                </div>
                <div class="booking-table-3d" id="bookingTable3D"></div>
                ${renderTableInformationStrip(selectedTable)}
            </div>
            <div class="table-map table-map-accessible" id="bookingTableFallback" aria-label="Mirrored accessible table selector">
                ${renderTableMap()}
            </div>
            <div class="seat-map-accessible" id="bookingSeatFallback" aria-label="Mirrored accessible seat selector">
                ${renderSeatFallbackContent(selectedTable)}
            </div>
        </section>

        ${renderInvitedGuests()}

        ${renderSplitBill(selectedTable, profile)}

        ${renderPreOrder()}

        ${renderPricingSummary(selectedTable)}

        <section class="profile-panel booking-confirm-panel">
            <div class="form-heading">
                <p class="eyebrow">Confirm booking</p>
                <h3>Review and reserve</h3>
            </div>
            <p class="summary-muted" id="bookingConfirmationSummary">
                ${escapeHTML(renderConfirmationSummary(selectedTable))}
            </p>
            ${
                profile && !canGuestBook(profile)
                    ? `
                <p class="booking-warning">This guest has reached ${MAX_ACTIVE_RESERVATIONS} active reservations.</p>
            `
                    : ""
            }
            ${
                !isSelectedTimeAvailable
                    ? `
                <p class="booking-warning">Select a future time within this restaurant's operating hours before confirming.</p>
            `
                    : ""
            }
            ${
                isOverTableCapacity
                    ? `
                <p class="booking-warning">${escapeHTML(getInviteCapacityMessage(selectedTable))} Update RSVPs before confirming.</p>
            `
                    : ""
            }
            <button class="primary-action" type="button" id="confirmBookingButton" ${canConfirm ? "" : "disabled"}>
                Confirm Booking
            </button>
        </section>

        ${renderCheckInCard(bookingState.confirmedReservation)}
    `;

    bookingView.querySelector("#bookingDateInput").addEventListener("change", function (event) {
        const nextDate = event.target.value;
        const nextTime = isBookingTimeAvailable(bookingState.time, nextDate, restaurant)
            ? bookingState.time
            : getDefaultBookingTime(nextDate, restaurant);

        bookingState = {
            ...bookingState,
            date: nextDate,
            time: nextTime,
            tableId: "",
            selectedSeatIds: [],
            confirmedReservation: null
        };
        bookingMessage = "";
        invitedGuestMessage = "";
        seatSelectionMessage = "";
        renderBookingView();
    });

    bookingView.querySelectorAll(".time-slot").forEach(function (button) {
        button.addEventListener("click", function () {
            if (button.disabled || !isBookingTimeAvailable(button.dataset.time)) {
                return;
            }

            bookingState = {
                ...bookingState,
                time: button.dataset.time,
                tableId: "",
                selectedSeatIds: [],
                confirmedReservation: null
            };
            bookingMessage = "";
            invitedGuestMessage = "";
            seatSelectionMessage = "";
            renderBookingView();
        });
    });

    bookingView.querySelectorAll("[data-experience-filter]").forEach(function (button) {
        button.addEventListener("click", function () {
            const experienceFilter = normalizeTableExperience(button.dataset.experienceFilter);
            const experienceChanged = experienceFilter !== bookingState.experienceFilter;
            const currentTable = getSelectedBookingTable();
            bookingState = {
                ...bookingState,
                experienceFilter,
                tableId:
                    currentTable && getTableExperience(currentTable) !== experienceFilter ? "" : bookingState.tableId,
                selectedSeatIds: experienceChanged ? [] : bookingState.selectedSeatIds
            };
            bookingMessage = "";
            invitedGuestMessage = "";
            if (experienceChanged) {
                seatSelectionMessage = "";
            }
            renderBookingView();
        });
    });

    const couponCodeInput = bookingView.querySelector("#couponCodeInput");
    const memberTierSelect = bookingView.querySelector("#memberTierSelect");
    const joinWaitlistButton = bookingView.querySelector("#joinWaitlistButton");

    function updateRenderedBookingTotals() {
        const pricingSummary = bookingView.querySelector("#pricingSummary");
        const splitBillSummary = bookingView.querySelector("#splitBillSummary");
        const currentSelectedTable = getSelectedBookingTable();

        if (!currentSelectedTable) {
            return;
        }

        const pricing = calculateReservationPrice({
            table: currentSelectedTable,
            time: bookingState.time,
            couponCode: bookingState.couponCode,
            memberTier: bookingState.memberTier
        });

        if (pricingSummary) {
            pricingSummary.innerHTML = renderPricingSummaryRows(pricing);
        }

        if (splitBillSummary) {
            const preOrderSubtotal = calculatePreOrderSubtotal(getRestaurantMenu());

            splitBillSummary.innerHTML = renderSplitBillRows(
                calculateSplitBill(pricing.finalTotal, preOrderSubtotal, getBillParticipants(profile))
            );
        }
    }

    if (couponCodeInput) {
        couponCodeInput.addEventListener("input", function (event) {
            bookingState = { ...bookingState, couponCode: event.target.value };
            saveBookingDraft();
            updateRenderedBookingTotals();
        });
    }

    if (memberTierSelect) {
        memberTierSelect.addEventListener("change", function (event) {
            bookingState = { ...bookingState, memberTier: event.target.value };
            saveBookingDraft();
            updateRenderedBookingTotals();
        });
    }

    if (joinWaitlistButton) {
        joinWaitlistButton.addEventListener("click", joinWaitlist);
    }

    const invitedGuestForm = bookingView.querySelector("#invitedGuestForm");

    invitedGuestForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        addInvitedGuest(formData.get("guestName"), formData.get("guestEmail"));
        renderBookingView();
    });

    bookingView.querySelectorAll("[data-remove-guest-id]").forEach(function (button) {
        button.addEventListener("click", function () {
            removeInvitedGuest(button.dataset.removeGuestId);
            renderBookingView();
        });
    });

    bookingView.querySelectorAll(".invited-guest-card select").forEach(function (select) {
        select.addEventListener("change", function () {
            updateGuestRsvp(select.dataset.guestId, select.value);
            renderBookingView();
        });
    });

    bookingView.querySelectorAll("[data-pre-order-item-id]").forEach(function (input) {
        input.addEventListener("change", function () {
            updatePreOrderItem(input.dataset.preOrderItemId, input.value);
            renderBookingView();
        });
    });

    bookingView.querySelectorAll(".table-tile").forEach(function (button) {
        button.addEventListener("click", handleTableSelect);
    });

    attachSeatFallbackHandlers(bookingView);

    bookingView.querySelector("#confirmBookingButton").addEventListener("click", confirmBooking);

    initializeBookingTableSelector(bookingView);

    if (bookingState.confirmedReservation) {
        requestAnimationFrame(function () {
            return renderRealQRCode(bookingState.confirmedReservation);
        });
    }
}

function attachSeatFallbackHandlers(bookingView = document.querySelector("#bookingView")) {
    bookingView?.querySelectorAll("[data-seat-id]").forEach(function (button) {
        button.addEventListener("click", function () {
            return handleSeatToggle(button.dataset.seatId);
        });
    });
}

function updateBookingSeatSelectionUI() {
    const bookingView = document.querySelector("#bookingView");
    const selectedTable = getSelectedBookingTable();
    if (!bookingView || !selectedTable) {
        return;
    }

    saveBookingDraft();

    const informationStrip = bookingView.querySelector("#tableInformationStrip");
    if (informationStrip) {
        informationStrip.outerHTML = renderTableInformationStrip(selectedTable);
    }

    const confirmationSummary = bookingView.querySelector("#bookingConfirmationSummary");
    if (confirmationSummary) {
        confirmationSummary.textContent = renderConfirmationSummary(selectedTable);
    }

    const seatFallback = bookingView.querySelector("#bookingSeatFallback");
    if (seatFallback) {
        seatFallback.innerHTML = renderSeatFallbackContent(selectedTable);
        attachSeatFallbackHandlers(bookingView);
    }

    const confirmButton = bookingView.querySelector("#confirmBookingButton");
    if (confirmButton) {
        confirmButton.disabled = !(
            canGuestBook(getCurrentUserProfile()) &&
            isBookingTimeAvailable() &&
            canConfirmSeatSelection(selectedTable)
        );
    }

    bookingTableSelector3DModule?.updateBookingTableSelector3D({
        selectedTableId: bookingState.tableId,
        selectedSeatIds: [...bookingState.selectedSeatIds],
        requiredSeatCount: getRequiredSeatCount()
    });
}

function handleSeatToggle(seatId) {
    const table = getSelectedBookingTable();
    if (!table || getTableStatus(table) !== "Selected") {
        return;
    }

    const validSeatIds = new Set(
        Array.from({ length: table.seats }, function (_, seatIndex) {
            return getSeatId(table.tableId, seatIndex);
        })
    );
    if (!validSeatIds.has(seatId)) {
        return;
    }

    const selectedSeatIds = getValidSelectedSeatIds(table);
    if (selectedSeatIds.includes(seatId)) {
        bookingState = {
            ...bookingState,
            selectedSeatIds: selectedSeatIds.filter(function (selectedSeatId) {
                return selectedSeatId !== seatId;
            })
        };
        seatSelectionMessage = "";
        updateBookingSeatSelectionUI();
        return;
    }

    if (selectedSeatIds.length >= getRequiredSeatCount()) {
        seatSelectionMessage = "You have selected all required seats.";
        updateBookingSeatSelectionUI();
        return;
    }

    bookingState = {
        ...bookingState,
        selectedSeatIds: [...selectedSeatIds, seatId]
    };
    seatSelectionMessage =
        bookingState.selectedSeatIds.length === getRequiredSeatCount() ? "You have selected all required seats." : "";
    updateBookingSeatSelectionUI();
}

function handleTableSelect(eventOrTableId) {
    const tableId = typeof eventOrTableId === "string" ? eventOrTableId : eventOrTableId.currentTarget.dataset.tableId;
    const table = getRestaurantTableLayout().find(function (item) {
        return item.tableId === tableId;
    });

    if (
        !table ||
        getTableExperience(table) !== bookingState.experienceFilter ||
        getTableStatus(table) !== "Available"
    ) {
        return;
    }

    bookingState = {
        ...bookingState,
        tableId,
        selectedSeatIds: bookingState.tableId === tableId ? bookingState.selectedSeatIds : [],
        confirmedReservation: null
    };
    bookingMessage = "";
    seatSelectionMessage = "";
    syncInvitedGuestCapacityMessage(table);
    renderBookingView();
}

function confirmBooking() {
    const profile = getCurrentUserProfile();
    const restaurant = getSelectedRestaurant();
    const table = getRestaurantTableLayout(restaurant).find(function ({ tableId }) {
        return tableId === bookingState.tableId;
    });

    if (!profile) {
        redirectToLoginForBooking();
        return;
    }

    if (!restaurant || !isBookingTimeAvailable()) {
        bookingMessage = "Select a future time within this restaurant's operating hours before confirming.";
        renderBookingView();
        return;
    }

    if (!table || !canGuestBook(profile) || getTableStatus(table) !== "Selected" || !canConfirmSeatSelection(table)) {
        bookingMessage = "Unable to save this booking. Check the booking cap and table status.";
        renderBookingView();
        return;
    }

    if (!doesBookingFitTable(table)) {
        invitedGuestMessage = `${getInviteCapacityMessage(table)} Update RSVPs before confirming.`;
        renderBookingView();
        return;
    }

    const { name, email, phone } = profile;
    const pricing = calculateReservationPrice({
        table,
        time: bookingState.time,
        couponCode: bookingState.couponCode,
        memberTier: bookingState.memberTier
    });
    const guests = bookingState.invitedGuests.map(function ({ name, email, rsvpStatus }) {
        return { name, email, rsvpStatus };
    });
    const menuItems = getRestaurantMenu(restaurant.id);
    const preOrder = {
        items: getSelectedPreOrderItems(menuItems),
        subtotal: calculatePreOrderSubtotal(menuItems)
    };
    const splitBill = calculateSplitBill(pricing.finalTotal, preOrder.subtotal, getBillParticipants(profile));
    const reservationId = `reservation-${Date.now()}`;
    const reservation = {
        reservationId,
        checkInCode: generateCheckInCode(reservationId),
        guestUserId: profile.id,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        tableId: table.tableId,
        seats: table.seats,
        selectedSeatIds: [...getValidSelectedSeatIds(table)],
        tableExperience: getTableExperience(table),
        experienceFee: pricing.experienceFee,
        date: bookingState.date,
        time: bookingState.time,
        pricing,
        guests,
        splitBill,
        preOrder,
        status: "active"
    };

    saveReservations([...getReservations(), reservation]);
    bookingState = {
        ...bookingState,
        tableId: "",
        selectedSeatIds: [],
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: reservation
    };
    bookingMessage = "Your booking has been confirmed!";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    clearBookingDraft();
    renderBookingView();
}
