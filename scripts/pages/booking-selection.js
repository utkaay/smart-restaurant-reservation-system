let bookingConfirmationInProgress = false;

function getSafeBookingReservations() {
    return getReservations().filter(function (reservation) {
        return reservation && typeof reservation === "object" && !Array.isArray(reservation);
    });
}

function isBlockingReservation(reservation = {}) {
    const status = String(reservation.status || "active").toLowerCase();
    return status === "active" || status === "confirmed";
}

function hasBookingCapacity(profile = getCurrentUserProfile()) {
    if (!profile) {
        return false;
    }

    return (
        getSafeBookingReservations().filter(function (reservation) {
            if (!isBlockingReservation(reservation)) {
                return false;
            }

            if (profile.id && reservation.guestUserId) {
                return String(reservation.guestUserId) === String(profile.id);
            }

            return (
                normalizeEmail(reservation.guestEmail || "") === normalizeEmail(profile.email || "") &&
                String(reservation.guestPhone || "") === String(profile.phone || "")
            );
        }).length < MAX_ACTIVE_RESERVATIONS
    );
}

function normalizeBookingPreferences(preferences = {}) {
    const safePreferences = preferences && typeof preferences === "object" && !Array.isArray(preferences) ? preferences : {};

    return {
        date: normalizeBookingDate(safePreferences.date) || getTodayDateValue(),
        time: isValidRestaurantTime(safePreferences.time) ? safePreferences.time : "",
        partySize: normalizeBookingPartySize(safePreferences.partySize ?? safePreferences.guests),
        mood: normalizeBookingMood(safePreferences.mood)
    };
}

function redirectToLoginForBooking(restaurantId = bookingState.restaurantId, preferences = bookingState) {
    const bookingPreferences = normalizeBookingPreferences(preferences);

    if (restaurantId) {
        savePendingAction({
            type: "booking",
            restaurantId,
            ...bookingPreferences
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

function startBooking(restaurantId, preferences = {}) {
    const bookingPreferences = normalizeBookingPreferences(preferences);
    const profile = getCurrentUserProfile();

    if (!profile) {
        redirectToLoginForBooking(restaurantId, bookingPreferences);
        return;
    }

    const restaurant = getRestaurants().find(function ({ id }) {
        return Number(id) === Number(restaurantId);
    });
    const date = bookingPreferences.date;
    const requestedTime = bookingPreferences.time;
    const time =
        restaurant && getRestaurantTimeSlots(restaurant).includes(requestedTime)
            ? requestedTime
            : getDefaultBookingTime(date, restaurant);

    bookingState = {
        restaurantId: Number(restaurantId),
        date,
        time,
        partySize: bookingPreferences.partySize,
        mood: bookingPreferences.mood,
        tableId: "",
        selectedSeatIds: [],
        experienceFilter: "Regular",
        couponCode: "",
        memberTier: "Standard",
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: null
    };
    bookingConfirmationInProgress = false;
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
                ${escapeHTML(formatBookingTimeDisplay(time))}
            </button>
        `;
            })
            .join("")}
    `;
}

function getTableStatus({ tableId, seats }) {
    const { restaurantId, date, time } = bookingState;

    if (!date || !time || !isBookingTimeAvailable(time)) {
        return "Unavailable";
    }

    const isReserved = getSafeBookingReservations().some(function (reservation) {
        return (
            isBlockingReservation(reservation) &&
            Number(reservation.restaurantId) === Number(restaurantId) &&
            reservation.date === date &&
            reservation.time === time &&
            String(reservation.tableId || "") === String(tableId)
        );
    });

    if (isReserved) {
        return "Reserved";
    }

    if (Math.max(0, Number(seats) || 0) < getRequiredSeatCount()) {
        return "Unavailable";
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
            return String(tableId);
        })
    );

    if (!restaurantId || !date || !time || !isBookingTimeAvailable(time)) {
        return 0;
    }

    return new Set(
        getSafeBookingReservations()
        .filter(function (reservation) {
            return (
                isBlockingReservation(reservation) &&
                Number(reservation.restaurantId) === Number(restaurantId) &&
                reservation.date === date &&
                reservation.time === time
            );
        })
        .filter(function ({ tableId }) {
            return tableIds.has(String(tableId));
        })
        .map(function ({ tableId }) {
            return String(tableId);
        })
    ).size;
}

function getAvailableTableCountForSlot() {
    if (!isBookingTimeAvailable()) {
        return 0;
    }

    return getRestaurantTableLayout().filter(function (table) {
        const status = getTableStatus(table);
        return status === "Available" || status === "Selected";
    }).length;
}

function isSlotFull() {
    const tableLayout = getRestaurantTableLayout();

    if (!isBookingTimeAvailable()) {
        return false;
    }

    return tableLayout.length > 0 && getAvailableTableCountForSlot() === 0;
}

function getSlotAvailabilityStatus() {
    const tableLayout = getRestaurantTableLayout();

    if (!isBookingTimeAvailable()) {
        return "Select an available time";
    }

    if (tableLayout.length === 0) {
        return "No tables configured";
    }

    const availableTableCount = getAvailableTableCountForSlot();

    if (availableTableCount === 0) {
        return "Full / Waitlist open";
    }

    if (availableTableCount <= Math.max(2, Math.floor(tableLayout.length * 0.4))) {
        return "Limited availability";
    }

    return "Available";
}

function hasGuestJoinedWaitlist(profile = getGuestProfile()) {
    if (!profile) {
        return false;
    }

    return getWaitlist().some(function (entry) {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            return false;
        }

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
        ...getWaitlist().filter(function (entry) {
            return entry && typeof entry === "object" && !Array.isArray(entry);
        }),
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
                              ? "No remaining table can accommodate this party for the selected slot."
                              : `${getAvailableTableCountForSlot()} ${getAvailableTableCountForSlot() === 1 ? "table fits" : "tables fit"} this party for the selected slot.`
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
            const isDisabled = status === "Reserved" || status === "Unavailable" || !matchesExperience;

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
                        <span class="table-experience-icon" aria-hidden="true">${experience.slice(0, 1)}</span>
                        <span>
                            <strong>${experience}</strong>
                            <small>${details.subtitle}</small>
                        </span>
                        <span class="table-experience-check" aria-hidden="true">Active</span>
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

function renderPartySizeControl(selectedTable) {
    const minimumPartySize = Math.max(1, 1 + getAcceptedInvitedGuestCount());
    const partySize = normalizeBookingPartySize(bookingState.partySize);
    const capacityMessage = selectedTable
        ? `${selectedTable.seats}-seat capacity`
        : `${getAvailableTableCountForSlot()} matching ${getAvailableTableCountForSlot() === 1 ? "table" : "tables"}`;

    return `
        <div class="booking-party-control">
            <div>
                <span class="booking-control-label">Guests</span>
                <small>${escapeHTML(capacityMessage)}</small>
            </div>
            <div class="booking-stepper" role="group" aria-label="Party size">
                <button type="button" data-party-size-action="decrease" aria-label="Decrease party size" ${partySize <= minimumPartySize ? "disabled" : ""}>−</button>
                <output id="bookingPartySizeValue" aria-live="polite">${partySize}</output>
                <button type="button" data-party-size-action="increase" aria-label="Increase party size" ${partySize >= 8 ? "disabled" : ""}>+</button>
            </div>
        </div>
    `;
}

function renderBookingSelectionSummary(selectedTable, restaurant = getSelectedRestaurant()) {
    const validSeatIds = selectedTable ? getValidSelectedSeatIds(selectedTable) : [];
    const pricing = selectedTable
        ? calculateReservationPrice({
              table: selectedTable,
              time: bookingState.time,
              couponCode: bookingState.couponCode,
              memberTier: bookingState.memberTier
          })
        : null;

    return `
        <div class="booking-selection-summary" id="bookingSelectionSummary" aria-live="polite">
            <div><span>Restaurant</span><strong>${escapeHTML(restaurant?.name || "Not selected")}</strong></div>
            <div><span>Table</span><strong>${escapeHTML(selectedTable ? `${selectedTable.tableId} · ${getTableExperience(selectedTable)}` : "Choose in 3D")}</strong></div>
            <div><span>Seats</span><strong>${escapeHTML(validSeatIds.length > 0 ? validSeatIds.join(", ") : `${getRequiredSeatCount()} required`)}</strong></div>
            <div><span>Price</span><strong>${pricing ? formatUSD(pricing.finalTotal) : "After table"}</strong></div>
        </div>
    `;
}

function getBookingValidationMessage(profile, selectedTable) {
    if (!isBookingTimeAvailable()) {
        return "Choose a future date and an available restaurant time.";
    }

    if (!selectedTable) {
        return "Choose an available table in the 3D floor plan.";
    }

    if (getTableStatus(selectedTable) !== "Selected") {
        return "That table is no longer available for this slot. Choose another table.";
    }

    if (!doesBookingFitTable(selectedTable)) {
        return `${getInviteCapacityMessage(selectedTable)} Choose a larger table or reduce the party size.`;
    }

    if (!canConfirmSeatSelection(selectedTable)) {
        const selectedCount = getValidSelectedSeatIds(selectedTable).length;
        return `Select exactly ${getRequiredSeatCount()} ${getRequiredSeatCount() === 1 ? "seat" : "seats"}. ${selectedCount} selected.`;
    }

    if (!hasBookingCapacity(profile)) {
        return `This guest has reached ${MAX_ACTIVE_RESERVATIONS} active reservations.`;
    }

    return "Everything is ready. Confirm once to reserve this table.";
}

function syncBookingProgress() {
    const progress = document.querySelector("#bookingProgress");
    if (!progress) {
        return;
    }

    const selectedTable = getSelectedBookingTable();
    const seatSelectionComplete = Boolean(selectedTable && canConfirmSeatSelection(selectedTable));
    const currentStep = !getSelectedRestaurant()
        ? "details"
        : bookingState.confirmedReservation
          ? "confirm"
          : seatSelectionComplete
            ? "confirm"
            : "table";
    const stepOrder = ["details", "table", "extras", "confirm"];
    const currentIndex = stepOrder.indexOf(currentStep);

    progress.querySelectorAll("[data-booking-progress-step]").forEach(function (step) {
        const stepIndex = stepOrder.indexOf(step.dataset.bookingProgressStep);
        const isCurrent = stepIndex === currentIndex;
        const isComplete = stepIndex < currentIndex || Boolean(bookingState.confirmedReservation && stepIndex <= currentIndex);
        step.classList.toggle("is-current", isCurrent);
        step.classList.toggle("is-complete", isComplete);
        if (isCurrent) {
            step.setAttribute("aria-current", "step");
        } else {
            step.removeAttribute("aria-current");
        }
    });
}

function renderBookingSuccess(reservation) {
    const seats = Array.isArray(reservation.selectedSeatIds) ? reservation.selectedSeatIds : [];

    return `
        <section class="profile-panel booking-success-panel">
            <p class="eyebrow">Reservation confirmed</p>
            <h2>Your table is ready.</h2>
            <p>We saved exactly one reservation. Your check-in details are ready below and in My Bookings.</p>
            <div class="booking-success-facts">
                <div><span>Restaurant</span><strong>${escapeHTML(reservation.restaurantName)}</strong></div>
                <div><span>Date &amp; time</span><strong>${escapeHTML(reservation.date)} · ${escapeHTML(formatBookingTimeDisplay(reservation.time))}</strong></div>
                <div><span>Table</span><strong>${escapeHTML(`${reservation.tableId} · ${normalizeTableExperience(reservation.tableExperience)}`)}</strong></div>
                <div><span>Seats</span><strong>${escapeHTML(seats.join(", ") || "Assigned at arrival")}</strong></div>
            </div>
            <div class="booking-actions">
                <button class="primary-action" type="button" id="viewMyBookingsButton">View My Bookings</button>
                <button class="secondary-action" type="button" id="startAnotherBookingButton">Book another table</button>
                <button class="secondary-action" type="button" id="successBackToRestaurantsButton">Back to restaurants</button>
            </div>
        </section>
        ${renderCheckInCard(reservation)}
    `;
}

function resetBookingForRestaurant() {
    const restaurant = getSelectedRestaurant();
    if (!restaurant) {
        return;
    }

    const date = getTodayDateValue();
    bookingState = {
        ...createEmptyBookingState(),
        restaurantId: restaurant.id,
        date,
        time: getDefaultBookingTime(date, restaurant)
    };
    bookingConfirmationInProgress = false;
    bookingMessage = "Booking options reset.";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    renderBookingView();
}

function updateBookingPartySize(nextPartySize) {
    const minimumPartySize = Math.max(1, 1 + getAcceptedInvitedGuestCount());
    const partySize = Math.min(8, Math.max(minimumPartySize, normalizeBookingPartySize(nextPartySize)));
    const selectedTable = getSelectedBookingTable();
    const tableStillFits = selectedTable && Number(selectedTable.seats) >= partySize;

    bookingState = {
        ...bookingState,
        partySize,
        tableId: tableStillFits ? bookingState.tableId : "",
        selectedSeatIds: [],
        confirmedReservation: null
    };
    bookingMessage = "";
    invitedGuestMessage = "";
    seatSelectionMessage = selectedTable
        ? tableStillFits
            ? "Party size changed. Select your seats again."
            : "Party size changed. Choose a table with enough seats."
        : "";
    renderBookingView();
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
    const resetButton = bookingView.querySelector("#reset3DViewButton");
    const zoomInButton = bookingView.querySelector("#zoomIn3DButton");
    const zoomOutButton = bookingView.querySelector("#zoomOut3DButton");
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
            resetButton,
            zoomInButton,
            zoomOutButton,
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
        bookingView.classList.remove("is-confirmed");
        bookingView.innerHTML = `
            <section class="profile-panel booking-empty-panel">
                <p class="eyebrow">No restaurant selected</p>
                <h3>Choose a restaurant to open its floor plan.</h3>
                <p>Your date, time, and party preferences will carry into this page from Explore.</p>
                <button class="primary-action" type="button" id="emptyBackToRestaurantsButton">Explore restaurants</button>
            </section>
        `;
        bookingView.querySelector("#emptyBackToRestaurantsButton")?.addEventListener("click", function () {
            return showDiscoveryPage("restaurants");
        });
        syncBookingProgress();
        return;
    }

    if (bookingState.confirmedReservation) {
        const confirmedReservation = bookingState.confirmedReservation;
        bookingView.classList.add("is-confirmed");
        bookingView.innerHTML = renderBookingSuccess(confirmedReservation);
        bookingView.querySelector("#viewMyBookingsButton")?.addEventListener("click", showProfilePage);
        bookingView.querySelector("#startAnotherBookingButton")?.addEventListener("click", function () {
            startBooking(confirmedReservation.restaurantId, {
                date: confirmedReservation.date,
                time: confirmedReservation.time,
                partySize: confirmedReservation.partySize,
                mood: confirmedReservation.mood
            });
        });
        bookingView.querySelector("#successBackToRestaurantsButton")?.addEventListener("click", function () {
            return showDiscoveryPage("restaurants");
        });
        syncBookingProgress();
        requestAnimationFrame(function () {
            return renderRealQRCode(confirmedReservation);
        });
        return;
    }

    bookingView.classList.remove("is-confirmed");

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
        hasBookingCapacity(profile) &&
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
                    <span class="summary-chip">${bookingState.partySize} ${bookingState.partySize === 1 ? "guest" : "guests"}</span>
                </div>
                ${createRestaurantBadgeSections(restaurant)}
                ${bookingMessage ? `<p class="profile-message">${escapeHTML(bookingMessage)}</p>` : ""}
            </div>
        </section>

        <section class="profile-panel booking-controls-panel">
            <div class="form-heading">
                <p class="eyebrow">Reservation controls</p>
                <h3>Set your visit</h3>
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
            ${renderPartySizeControl(selectedTable)}
            ${renderBookingSelectionSummary(selectedTable, restaurant)}
            <button class="booking-reset-action" type="button" id="resetBookingButton">Reset booking options</button>
        </section>

        <section class="profile-panel booking-table-panel">
            <div class="booking-table-heading">
                <div class="form-heading">
                    <p class="eyebrow">Interactive floor plan</p>
                    <h2>${selectedTable ? `Table ${escapeHTML(selectedTable.tableId)} selected` : "Choose your exact table"}</h2>
                    <p class="summary-muted">Drag to rotate, scroll or use the controls to zoom, then select exact chairs.</p>
                </div>
                ${
                    selectedTable
                        ? `<button class="secondary-action booking-change-table" type="button" id="changeTableButton">Change table</button>`
                        : ""
                }
            </div>
            ${renderWaitlistStatus()}
            <div class="booking-3d-stage" id="bookingTable3DStage">
                <div class="booking-3d-toolbar">
                    <button class="booking-floor-return" type="button" id="returnToFloorButton">Full floor</button>
                    <div class="booking-3d-actions" aria-label="3D view controls">
                        <span class="booking-3d-hint">Drag to rotate · Scroll to zoom</span>
                        <button type="button" id="reset3DViewButton">Reset view</button>
                        <button type="button" id="zoomOut3DButton" aria-label="Zoom out">−</button>
                        <button type="button" id="zoomIn3DButton" aria-label="Zoom in">+</button>
                    </div>
                </div>
                <div class="booking-3d-filterbar">
                    ${renderTableExperienceControls()}
                </div>
                <div class="booking-table-3d" id="bookingTable3D">
                    <div class="booking-3d-loading" role="status">
                        <strong>Preparing the dining room…</strong>
                    </div>
                </div>
                <div class="booking-3d-legend-overlay table-status-legend" aria-label="Table status legend">
                    <span><i class="legend-dot available"></i> Available</span>
                    <span><i class="legend-dot selected"></i> Selected</span>
                    <span><i class="legend-dot reserved"></i> Reserved</span>
                    <span><i class="legend-dot unavailable"></i> Unavailable</span>
                </div>
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
            <p class="booking-validation ${canConfirm ? "is-ready" : ""}" id="bookingValidationMessage">
                ${escapeHTML(getBookingValidationMessage(profile, selectedTable))}
            </p>
            <button class="primary-action" type="button" id="confirmBookingButton" ${canConfirm ? "" : "disabled"}>
                ${canConfirm ? "Confirm reservation" : "Complete table & seat selection"}
            </button>
        </section>
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

    bookingView.querySelectorAll("[data-party-size-action]").forEach(function (button) {
        button.addEventListener("click", function () {
            const adjustment = button.dataset.partySizeAction === "increase" ? 1 : -1;
            updateBookingPartySize(normalizeBookingPartySize(bookingState.partySize) + adjustment);
        });
    });

    bookingView.querySelector("#resetBookingButton")?.addEventListener("click", resetBookingForRestaurant);
    bookingView.querySelector("#changeTableButton")?.addEventListener("click", function () {
        bookingState = {
            ...bookingState,
            tableId: "",
            selectedSeatIds: [],
            confirmedReservation: null
        };
        bookingMessage = "";
        invitedGuestMessage = "";
        seatSelectionMessage = "Choose another available table.";
        renderBookingView();
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
    syncBookingProgress();
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

    const selectionSummary = bookingView.querySelector("#bookingSelectionSummary");
    if (selectionSummary) {
        selectionSummary.outerHTML = renderBookingSelectionSummary(selectedTable);
    }

    const seatFallback = bookingView.querySelector("#bookingSeatFallback");
    if (seatFallback) {
        seatFallback.innerHTML = renderSeatFallbackContent(selectedTable);
        attachSeatFallbackHandlers(bookingView);
    }

    const confirmButton = bookingView.querySelector("#confirmBookingButton");
    const canConfirm = Boolean(
        hasBookingCapacity(getCurrentUserProfile()) &&
            isBookingTimeAvailable() &&
            doesBookingFitTable(selectedTable) &&
            canConfirmSeatSelection(selectedTable)
    );
    if (confirmButton) {
        confirmButton.disabled = !canConfirm;
        confirmButton.textContent = canConfirm ? "Confirm reservation" : "Complete table & seat selection";
    }

    const validationMessage = bookingView.querySelector("#bookingValidationMessage");
    if (validationMessage) {
        validationMessage.textContent = getBookingValidationMessage(getCurrentUserProfile(), selectedTable);
        validationMessage.classList.toggle("is-ready", canConfirm);
    }

    bookingTableSelector3DModule?.updateBookingTableSelector3D({
        selectedTableId: bookingState.tableId,
        selectedSeatIds: [...bookingState.selectedSeatIds],
        requiredSeatCount: getRequiredSeatCount()
    });
    syncBookingProgress();
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
    if (bookingConfirmationInProgress || bookingState.confirmedReservation) {
        return;
    }

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

    if (!table || !hasBookingCapacity(profile) || getTableStatus(table) !== "Selected" || !canConfirmSeatSelection(table)) {
        bookingMessage = getBookingValidationMessage(profile, table);
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
    bookingConfirmationInProgress = true;
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
        partySize: getRequiredSeatCount(),
        mood: bookingState.mood,
        pricing,
        guests,
        splitBill,
        preOrder,
        status: "active"
    };

    try {
        saveReservations([...getSafeBookingReservations(), reservation]);
    } catch {
        bookingConfirmationInProgress = false;
        bookingMessage = "This reservation could not be saved in this browser. Check storage access and try again.";
        renderBookingView();
        return;
    }
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
