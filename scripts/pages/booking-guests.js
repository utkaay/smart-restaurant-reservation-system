function getSelectedBookingTable() {
    return getRestaurantTableLayout().find(function ({ tableId }) {
        return tableId === bookingState.tableId;
    });
}

function getSeatId(tableId, seatIndex) {
    return `${tableId}-S${seatIndex + 1}`;
}

function getRequiredSeatCount() {
    return Math.max(normalizeBookingPartySize(bookingState.partySize), 1 + getAcceptedInvitedGuestCount());
}

function getValidSelectedSeatIds(table = getSelectedBookingTable()) {
    if (!table || table.tableId !== bookingState.tableId) {
        return [];
    }

    const validSeatIds = new Set(
        Array.from({ length: Math.max(0, Number(table.seats) || 0) }, function (_, seatIndex) {
            return getSeatId(table.tableId, seatIndex);
        })
    );

    return bookingState.selectedSeatIds.filter(function (seatId) {
        return validSeatIds.has(seatId);
    });
}

function canConfirmSeatSelection(table = getSelectedBookingTable()) {
    if (!table || getTableStatus(table) !== "Selected" || !doesBookingFitTable(table)) {
        return false;
    }

    const validSelectedSeatIds = getValidSelectedSeatIds(table);
    return (
        bookingState.selectedSeatIds.length === getRequiredSeatCount() &&
        validSelectedSeatIds.length === bookingState.selectedSeatIds.length &&
        new Set(validSelectedSeatIds).size === validSelectedSeatIds.length
    );
}

function getMaxInvitedGuests(selectedTable = getSelectedBookingTable()) {
    return selectedTable ? Math.max(0, selectedTable.seats - 1) : 0;
}

function getAcceptedInvitedGuests() {
    return bookingState.invitedGuests.filter(function ({ rsvpStatus }) {
        return rsvpStatus === "accepted";
    });
}

function getAcceptedInvitedGuestCount() {
    return getAcceptedInvitedGuests().length;
}

function getOccupiedSeatCount() {
    return getRequiredSeatCount();
}

function doesBookingFitTable(selectedTable = getSelectedBookingTable()) {
    return Boolean(selectedTable) && getOccupiedSeatCount() <= selectedTable.seats;
}

function getInviteCapacityMessage(selectedTable = getSelectedBookingTable()) {
    if (!selectedTable) {
        return "Select a table before adding invited guests.";
    }

    const maxInvitedGuests = getMaxInvitedGuests(selectedTable);
    const guestLabel = maxInvitedGuests === 1 ? "guest" : "guests";

    return `This table seats ${selectedTable.seats}. You can accept up to ${maxInvitedGuests} invited ${guestLabel}.`;
}

function syncInvitedGuestCapacityMessage(selectedTable = getSelectedBookingTable()) {
    if (!selectedTable) {
        invitedGuestMessage = "";
        return;
    }

    if (doesBookingFitTable(selectedTable)) {
        invitedGuestMessage = "";
        return;
    }

    invitedGuestMessage = `${getInviteCapacityMessage(selectedTable)} Update RSVPs before confirming.`;
}

function addInvitedGuest(name, email) {
    const selectedTable = getSelectedBookingTable();

    if (!selectedTable) {
        invitedGuestMessage = getInviteCapacityMessage(selectedTable);
        return;
    }

    const cleanName = String(name || "").trim();
    const cleanEmail = String(email || "").trim();

    if (!cleanName || !cleanEmail) {
        return;
    }

    bookingState = {
        ...bookingState,
        invitedGuests: [
            ...bookingState.invitedGuests,
            {
                guestId: `guest-${Date.now()}`,
                name: cleanName,
                email: cleanEmail,
                rsvpStatus: "pending"
            }
        ]
    };
    invitedGuestMessage = "";
}

function removeInvitedGuest(guestId) {
    const requiredSeatCount = getRequiredSeatCount();
    bookingState = {
        ...bookingState,
        invitedGuests: bookingState.invitedGuests.filter(function (guest) {
            return guest.guestId !== guestId;
        })
    };
    invitedGuestMessage = "";
    if (getRequiredSeatCount() !== requiredSeatCount) {
        bookingState = { ...bookingState, selectedSeatIds: [] };
        seatSelectionMessage = "Party size changed. Select your seats again.";
    }
}

function updateGuestRsvp(guestId, rsvpStatus) {
    const requiredSeatCount = getRequiredSeatCount();
    const selectedTable = getSelectedBookingTable();
    const currentGuest = bookingState.invitedGuests.find(function (guest) {
        return guest.guestId === guestId;
    });
    const isAcceptingGuest = rsvpStatus === "accepted" && currentGuest?.rsvpStatus !== "accepted";

    if (isAcceptingGuest) {
        if (!selectedTable) {
            invitedGuestMessage = "Select a table before accepting invited guests.";
            return;
        }

        if (getAcceptedInvitedGuestCount() >= getMaxInvitedGuests(selectedTable)) {
            invitedGuestMessage = `${getInviteCapacityMessage(selectedTable)} The main guest always uses 1 seat.`;
            return;
        }
    }

    bookingState = {
        ...bookingState,
        invitedGuests: bookingState.invitedGuests.map(function (guest) {
            if (guest.guestId !== guestId) {
                return guest;
            }

            return { ...guest, rsvpStatus };
        })
    };
    if (getRequiredSeatCount() !== requiredSeatCount) {
        bookingState = { ...bookingState, selectedSeatIds: [] };
        seatSelectionMessage = "Party size changed. Select your seats again.";
    }
    syncInvitedGuestCapacityMessage(selectedTable);
}

function renderInvitedGuests() {
    const guests = bookingState.invitedGuests;
    const selectedTable = getSelectedBookingTable();
    const maxInvitedGuests = getMaxInvitedGuests(selectedTable);
    const acceptedGuestCount = getAcceptedInvitedGuestCount();
    const isGuestLimitReached = Boolean(selectedTable) && acceptedGuestCount >= maxInvitedGuests;
    const isInviteDisabled = !selectedTable;
    const inviteLimitMessage =
        invitedGuestMessage ||
        (isGuestLimitReached ? `${getInviteCapacityMessage(selectedTable)} New guests can be added as pending.` : "");
    const disabledAttribute = isInviteDisabled ? "disabled" : "";

    return `
        <section class="profile-panel invited-guests-panel">
            <div class="form-heading">
                <p class="eyebrow">Invite guests</p>
                <h3>Add guests to this booking</h3>
            </div>
            <p class="summary-muted">
                ${
                    selectedTable
                        ? `${acceptedGuestCount} of ${maxInvitedGuests} accepted invited guest seats used. Pending and declined guests do not hold seats.`
                        : "Select a table before adding invited guests."
                }
            </p>
            ${inviteLimitMessage ? `<p class="booking-warning">${escapeHTML(inviteLimitMessage)}</p>` : ""}

            <form class="invited-guest-form" id="invitedGuestForm">
                <label>
                    Name
                    <input type="text" name="guestName" placeholder="Guest name" ${disabledAttribute} required>
                </label>
                <label>
                    Email
                    <input type="email" name="guestEmail" placeholder="guest@example.com" ${disabledAttribute} required>
                </label>
                <button class="secondary-action" type="submit" ${disabledAttribute}>Add Guest</button>
            </form>

            <div class="invited-guests-summary">
                <p class="booking-control-label">Invited guests</p>
                ${
                    guests.length === 0
                        ? `
                    <p class="summary-muted">No invited guests added yet.</p>
                `
                        : `
                    <div class="invited-guests-list">
                        ${guests
                            .map(function ({ guestId, name, email, rsvpStatus }) {
                                return `
                                <article class="invited-guest-card">
                                    <div>
                                        <strong>${escapeHTML(name)}</strong>
                                        <span>${escapeHTML(email)}</span>
                                    </div>
                                    <label>
                                        RSVP
                                        <select data-guest-id="${guestId}">
                                            ${["pending", "accepted", "declined"]
                                                .map(function (status) {
                                                    return `
                                                    <option value="${status}" ${rsvpStatus === status ? "selected" : ""}>${status}</option>
                                                `;
                                                })
                                                .join("")}
                                        </select>
                                    </label>
                                    <button class="secondary-action" type="button" data-remove-guest-id="${guestId}">
                                        Remove
                                    </button>
                                </article>
                            `;
                            })
                            .join("")}
                    </div>
                `
                }
            </div>
        </section>
    `;
}

function getBillParticipants(profile = getGuestProfile()) {
    if (!profile) {
        return [];
    }

    const mainGuest = {
        name: profile.name,
        email: profile.email
    };
    const acceptedGuests = getAcceptedInvitedGuests().map(function ({ name, email }) {
        return { name, email };
    });

    return [mainGuest, ...acceptedGuests];
}

function calculateSplitBill(reservationTotal = 0, preOrderSubtotal = 0, participants = getBillParticipants()) {
    const safeReservationTotal = roundCurrency(reservationTotal || 0);
    const safePreOrderSubtotal = roundCurrency(preOrderSubtotal || 0);
    const grandTotal = roundCurrency(safeReservationTotal + safePreOrderSubtotal);
    const participantCount = participants.length;

    if (participantCount === 0) {
        return {
            reservationTotal: safeReservationTotal,
            preOrderSubtotal: safePreOrderSubtotal,
            totalAmount: grandTotal,
            participantCount,
            participants: []
        };
    }

    const totalCents = Math.round(grandTotal * 100);
    const baseShareCents = Math.floor(totalCents / participantCount);
    const remainderCents = totalCents % participantCount;

    return {
        reservationTotal: safeReservationTotal,
        preOrderSubtotal: safePreOrderSubtotal,
        totalAmount: grandTotal,
        participantCount,
        participants: participants.map(function (participant, index) {
            const shareCents = baseShareCents + (index < remainderCents ? 1 : 0);

            return {
                ...participant,
                share: roundCurrency(shareCents / 100)
            };
        })
    };
}

function renderSplitBillRows(splitBill) {
    if (splitBill.participantCount === 0) {
        return `<p class="summary-muted">No bill participants available yet.</p>`;
    }

    const firstShare = splitBill.participants[0]?.share || 0;

    return `
        <div class="split-bill-breakdown">
            <div>
                <span>Reservation total</span>
                <strong>${formatUSD(splitBill.reservationTotal)}</strong>
            </div>
            <div>
                <span>Pre-order subtotal</span>
                <strong>${formatUSD(splitBill.preOrderSubtotal)}</strong>
            </div>
            <div>
                <span>Grand total</span>
                <strong>${formatUSD(splitBill.totalAmount)}</strong>
            </div>
            <div>
                <span>Participant count</span>
                <strong>${splitBill.participantCount}</strong>
            </div>
            <div>
                <span>Each pays</span>
                <strong>${formatUSD(firstShare)}</strong>
            </div>
        </div>
        <div class="split-bill-list">
            ${splitBill.participants
                .map(function ({ name, email, share }) {
                    return `
                    <div class="split-bill-row">
                        <span>
                            <strong>${escapeHTML(name)}</strong>
                            <em>${escapeHTML(email)}</em>
                        </span>
                        <strong>${formatUSD(share)}</strong>
                    </div>
                `;
                })
                .join("")}
        </div>
    `;
}

function renderSplitBill(selectedTable, profile = getGuestProfile()) {
    if (!selectedTable) {
        return `
        <section class="profile-panel split-bill-panel">
            <div class="form-heading">
                <p class="eyebrow">Split bill</p>
                <h3>Select a table to preview shares</h3>
            </div>
            <p class="summary-muted">Accepted invited guests will be included with the main guest.</p>
            </section>
        `;
    }

    const pricing = calculateReservationPrice({
        table: selectedTable,
        time: bookingState.time,
        couponCode: bookingState.couponCode,
        memberTier: bookingState.memberTier
    });
    const preOrderSubtotal = calculatePreOrderSubtotal(getRestaurantMenu());
    const splitBill = calculateSplitBill(pricing.finalTotal, preOrderSubtotal, getBillParticipants(profile));

    return `
        <section class="profile-panel split-bill-panel">
            <div class="form-heading">
                <p class="eyebrow">Split bill</p>
                <h3>Guest payment preview</h3>
            </div>
            <div id="splitBillSummary">
                ${renderSplitBillRows(splitBill)}
            </div>
        </section>
    `;
}

function getRestaurantMenu(restaurantId = bookingState.restaurantId) {
    const restaurant = getRestaurants().find(function ({ id }) {
        return Number(id) === Number(restaurantId);
    });

    return Array.isArray(restaurant?.menu) ? restaurant.menu : [];
}

function updatePreOrderItem(itemId, quantity) {
    const safeQuantity = Math.min(20, Math.max(0, Math.floor(Number(quantity) || 0)));
    const nextPreOrderItems = { ...bookingState.preOrderItems };

    if (safeQuantity === 0) {
        delete nextPreOrderItems[itemId];
    } else {
        nextPreOrderItems[itemId] = safeQuantity;
    }

    bookingState = {
        ...bookingState,
        preOrderItems: nextPreOrderItems
    };
}

function calculatePreOrderSubtotal(menuItems = getRestaurantMenu()) {
    return roundCurrency(
        menuItems.reduce(function (subtotal, { id, price }) {
            const quantity = bookingState.preOrderItems[id] || 0;

            return subtotal + price * quantity;
        }, 0)
    );
}

function getSelectedPreOrderItems(menuItems = getRestaurantMenu()) {
    return menuItems
        .map(function ({ id, name, price }) {
            const quantity = bookingState.preOrderItems[id] || 0;

            return {
                itemId: id,
                name,
                price,
                quantity,
                lineTotal: roundCurrency(price * quantity)
            };
        })
        .filter(function ({ quantity }) {
            return quantity > 0;
        });
}

function renderPreOrder() {
    const menuItems = getRestaurantMenu();
    const subtotal = calculatePreOrderSubtotal(menuItems);

    return `
        <section class="profile-panel pre-order-panel">
            <div class="form-heading">
                <p class="eyebrow">Pre-order</p>
                <h3>Pre-order menu</h3>
            </div>

            ${
                menuItems.length === 0
                    ? `
                <p class="summary-muted">No pre-order menu is available for this restaurant.</p>
            `
                    : `
                <div class="pre-order-list">
                    ${menuItems
                        .map(function ({ id, name, price, category, tags }) {
                            const quantity = bookingState.preOrderItems[id] || 0;
                            const lineTotal = roundCurrency(price * quantity);

                            return `
                            <article class="pre-order-item">
                                <div>
                                    <p class="pre-order-category">${escapeHTML(category)}</p>
                                    <h4>${escapeHTML(name)}</h4>
                                    <p>${escapeHTML(tags.join(", "))}</p>
                                </div>
                                <strong>${formatUSD(price)}</strong>
                                <label>
                                    Qty
                                    <input
                                        type="number"
                                        min="0"
                                        max="20"
                                        step="1"
                                        value="${quantity}"
                                        data-pre-order-item-id="${id}"
                                    >
                                </label>
                                <strong>${formatUSD(lineTotal)}</strong>
                            </article>
                        `;
                        })
                        .join("")}
                </div>

                <div class="pre-order-total">
                    <span>Pre-order subtotal</span>
                    <strong>${formatUSD(subtotal)}</strong>
                </div>
            `
            }
        </section>
    `;
}

function generateCheckInCode(reservationId) {
    return `CHECKIN-${reservationId}`;
}

function renderCheckInCard(reservation) {
    if (!reservation) {
        return "";
    }

    return `
        <section class="profile-panel check-in-panel">
            <div class="form-heading">
                <p class="eyebrow">QR check-in</p>
                <h3>Arrival check-in</h3>
            </div>
            <div class="check-in-card">
                <div class="qr-code">
                    <canvas id="qr-code" width="180" height="180" aria-label="QR check-in code"></canvas>
                    <p class="qr-code-error" id="qrCodeError" hidden>QR code unavailable.</p>
                </div>
                <div class="check-in-details">
                    <p class="profile-message">${escapeHTML(reservation.checkInCode)}</p>
                    <div class="summary-group">
                        <span>Reservation ID</span>
                        <div><span class="summary-chip">${escapeHTML(reservation.reservationId)}</span></div>
                    </div>
                    <div class="summary-group">
                        <span>Guest</span>
                        <div><span class="summary-chip">${escapeHTML(reservation.guestName)}</span></div>
                    </div>
                    <div class="summary-group">
                        <span>Restaurant</span>
                        <div><span class="summary-chip">${escapeHTML(reservation.restaurantName)}</span></div>
                    </div>
                    <div class="summary-group">
                        <span>Date and time</span>
                        <div><span class="summary-chip">${escapeHTML(reservation.date)} ${escapeHTML(reservation.time)}</span></div>
                    </div>
                    <div class="summary-group">
                        <span>Table</span>
                        <div><span class="summary-chip">${escapeHTML(reservation.tableId)}</span></div>
                    </div>
                    <div class="summary-group">
                        <span>Seats</span>
                        <div><span class="summary-chip">${escapeHTML(
                            Array.isArray(reservation.selectedSeatIds) && reservation.selectedSeatIds.length > 0
                                ? reservation.selectedSeatIds.join(", ")
                                : "Seats assigned at arrival"
                        )}</span></div>
                    </div>
                    <div class="summary-group">
                        <span>Table experience</span>
                        <div><span class="summary-chip">${escapeHTML(normalizeTableExperience(reservation.tableExperience))} &middot; ${formatUSD(Number(reservation.experienceFee) || 0)}</span></div>
                    </div>
                </div>
            </div>
        </section>
    `;
}
