function getSectionMeta(section = activeAdminSection) {
    const sectionMeta = {
        dashboard: {
            title: "Dashboard",
            subtitle: "Manage restaurants, reservations, pricing, and table availability."
        },
        restaurants: {
            title: "Restaurant Manager",
            subtitle: "Add, edit, and maintain restaurant listings."
        },
        reservations: {
            title: "Reservations",
            subtitle: "Review and manage customer bookings."
        },
        tables: {
            title: "Table Management",
            subtitle: "Monitor table capacity and reservation availability."
        },
        settings: {
            title: "Settings",
            subtitle: "Configure pricing, defaults, and demo data."
        }
    };

    return sectionMeta[section] || sectionMeta.dashboard;
}

function renderOverviewCards() {
    const restaurants = getRestaurants();
    const activeReservations = getActiveReservations();
    const waitingEntries = getWaitingEntries();

    return `
        <section class="dashboard-overview-grid" aria-label="Dashboard overview">
            <article class="overview-card">
                <span>Total Restaurants</span>
                <strong>${restaurants.length}</strong>
                <p>Saved in localStorage</p>
            </article>
            <article class="overview-card">
                <span>Active Reservations</span>
                <strong>${activeReservations.length}</strong>
                <p>Reservations marked active</p>
            </article>
            <article class="overview-card">
                <span>Waitlist Entries</span>
                <strong>${waitingEntries.length}</strong>
                <p>Entries marked waiting</p>
            </article>
            <article class="overview-card">
                <span>Average Restaurant Rating</span>
                <strong>${getAverageRestaurantRating()}</strong>
                <p>Calculated from restaurant ratings</p>
            </article>
        </section>
    `;
}

function renderRecentReservations(limit = 5) {
    const reservations = getReservations()
        .slice()
        .sort(function (firstReservation, secondReservation) {
            const firstValue = String(firstReservation.reservationId || firstReservation.createdAt || "");
            const secondValue = String(secondReservation.reservationId || secondReservation.createdAt || "");
            return secondValue.localeCompare(firstValue);
        })
        .slice(0, limit);

    if (reservations.length === 0) {
        return `
            <div class="empty-state">
                <h3>No reservations yet</h3>
                <p>Reservations created through the customer booking flow will appear here.</p>
            </div>
        `;
    }

    return reservations
        .map(function (reservation) {
            return `
            <article class="reservation-list-item">
                <div>
                    <strong>${escapeHTML(reservation.guestName || "Guest")}</strong>
                    <p>${escapeHTML(reservation.restaurantName || "Restaurant not set")} &middot; ${escapeHTML(formatReservationDateTime(reservation))}</p>
                </div>
                <span class="reservation-meta">${escapeHTML(reservation.status || "unknown")}</span>
            </article>
        `;
        })
        .join("");
}

function renderReservationSummaryCards() {
    const summary = getReservationSummary();

    return `
        <section class="dashboard-overview-grid" aria-label="Reservation overview">
            <article class="overview-card">
                <span>Total Reservations</span>
                <strong>${summary.total}</strong>
                <p>All saved booking records</p>
            </article>
            <article class="overview-card">
                <span>Active Reservations</span>
                <strong>${summary.active}</strong>
                <p>Status is active</p>
            </article>
            <article class="overview-card">
                <span>Upcoming Today</span>
                <strong>${summary.upcomingToday}</strong>
                <p>Active or confirmed today</p>
            </article>
            <article class="overview-card">
                <span>Completed or Cancelled</span>
                <strong>${summary.completedOrCancelled}</strong>
                <p>Status is completed or cancelled</p>
            </article>
        </section>
    `;
}

function renderReservationControls() {
    return `
        <section class="profile-panel admin-panel reservation-controls-panel">
            <div class="reservation-controls-grid">
                <label>
                    Search reservations
                    <input
                        type="search"
                        id="reservationSearchInput"
                        value="${escapeHTML(adminReservationSearchTerm)}"
                        placeholder="Guest, email, restaurant, or reservation ID"
                        autocomplete="off"
                    >
                </label>
                <label>
                    Status
                    <select id="reservationStatusFilter">
                        <option value="all">All statuses</option>
                        ${getKnownReservationStatuses()
                            .map(function (status) {
                                return `
                                <option value="${escapeHTML(status)}" ${adminReservationStatusFilter === status ? "selected" : ""}>
                                    ${escapeHTML(status)}
                                </option>
                            `;
                            })
                            .join("")}
                    </select>
                </label>
                <label>
                    Restaurant
                    <select id="reservationRestaurantFilter">
                        <option value="all">All restaurants</option>
                        ${getReservationRestaurantOptions()
                            .map(function (restaurantName) {
                                return `
                                <option value="${escapeHTML(restaurantName)}" ${adminReservationRestaurantFilter === restaurantName ? "selected" : ""}>
                                    ${escapeHTML(restaurantName)}
                                </option>
                            `;
                            })
                            .join("")}
                    </select>
                </label>
                <label>
                    Date
                    <input type="date" id="reservationDateFilter" value="${escapeHTML(adminReservationDateFilter)}">
                </label>
                <label>
                    Sort
                    <select id="reservationSortSelect">
                        <option value="nearest" ${adminReservationSort === "nearest" ? "selected" : ""}>Nearest upcoming</option>
                        <option value="newest" ${adminReservationSort === "newest" ? "selected" : ""}>Newest created</option>
                        <option value="guest" ${adminReservationSort === "guest" ? "selected" : ""}>Guest name</option>
                    </select>
                </label>
            </div>
        </section>
    `;
}

function renderStatusBadge(status = "unknown") {
    const normalizedStatus = String(status || "unknown").toLowerCase();
    return `<span class="reservation-status-badge status-${escapeHTML(normalizedStatus)}">${escapeHTML(normalizedStatus)}</span>`;
}

function renderReservationDetails(reservation = {}) {
    const guests = Array.isArray(reservation.guests) ? reservation.guests : [];
    const splitBill = reservation.splitBill || {};
    const preOrderItems = Array.isArray(reservation.preOrder?.items) ? reservation.preOrder.items : [];
    const pricing = reservation.pricing || {};

    return `
        <div class="reservation-details-panel">
            <section>
                <h3>Table and seats</h3>
                <div class="reservation-detail-list">
                    <div><span>Table</span><strong>${escapeHTML(reservation.tableId || "Not set")}</strong></div>
                    <div><span>Selected seats</span><strong>${escapeHTML(formatReservationSeatIds(reservation))}</strong></div>
                </div>
            </section>
            <section>
                <h3>Invited guests</h3>
                ${
                    guests.length === 0
                        ? `<p class="summary-muted">No invited guests.</p>`
                        : `
                    <div class="reservation-detail-list">
                        ${guests
                            .map(function ({ name, email, rsvpStatus }) {
                                return `
                                <div>
                                    <strong>${escapeHTML(name || "Guest")}</strong>
                                    <span>${escapeHTML(email || "No email")} &middot; ${escapeHTML(rsvpStatus || "pending")}</span>
                                </div>
                            `;
                            })
                            .join("")}
                    </div>
                `
                }
            </section>
            <section>
                <h3>Split bill</h3>
                <div class="reservation-detail-list">
                    <div><span>Reservation total</span><strong>${formatUSD(splitBill.reservationTotal || pricing.finalTotal || 0)}</strong></div>
                    <div><span>Pre-order subtotal</span><strong>${formatUSD(splitBill.preOrderSubtotal || reservation.preOrder?.subtotal || 0)}</strong></div>
                    <div><span>Total amount</span><strong>${formatUSD(splitBill.totalAmount || getReservationTotalAmount(reservation))}</strong></div>
                    <div><span>Participants</span><strong>${escapeHTML(splitBill.participantCount || getAcceptedAttendeeCount(reservation))}</strong></div>
                    ${(splitBill.participants || [])
                        .map(function ({ name, email, share }) {
                            return `
                            <div>
                                <span>${escapeHTML(email || "No email")}</span>
                                <strong>${escapeHTML(name || "Participant")} &middot; ${formatUSD(share || 0)}</strong>
                            </div>
                        `;
                        })
                        .join("")}
                </div>
            </section>
            <section>
                <h3>Pre-order items</h3>
                ${
                    preOrderItems.length === 0
                        ? `<p class="summary-muted">No pre-order items.</p>`
                        : `
                    <div class="reservation-detail-list">
                        ${preOrderItems
                            .map(function ({ name, quantity, price }) {
                                return `
                                <div>
                                    <strong>${escapeHTML(name || "Item")}</strong>
                                    <span>${escapeHTML(quantity || 0)} x ${formatUSD(price || 0)}</span>
                                </div>
                            `;
                            })
                            .join("")}
                    </div>
                `
                }
            </section>
            <section>
                <h3>Pricing breakdown</h3>
                <div class="reservation-detail-list">
                    <div><span>Table fee</span><strong>${formatUSD(pricing.tableFee || 0)}</strong></div>
                    <div><span>${escapeHTML(normalizeTableExperience(reservation.tableExperience))} experience</span><strong>${formatUSD(Number(reservation.experienceFee) || 0)}</strong></div>
                    <div><span>Time adjustment</span><strong>${formatUSD(pricing.timeAdjustment?.amount ?? pricing.timeAdjustment ?? 0)}</strong></div>
                    <div><span>Coupon discount</span><strong>${formatUSD(pricing.couponDiscount?.amount ?? pricing.couponDiscount ?? 0)}</strong></div>
                    <div><span>Member discount</span><strong>${formatUSD(pricing.memberDiscount?.amount ?? pricing.memberDiscount ?? 0)}</strong></div>
                    <div><span>Final total</span><strong>${formatUSD(pricing.finalTotal || 0)}</strong></div>
                </div>
            </section>
            <section>
                <h3>QR/check-in code</h3>
                <p class="profile-message">${escapeHTML(reservation.checkInCode || "No check-in code available")}</p>
            </section>
        </div>
    `;
}

function renderReservationList() {
    const reservations = getFilteredReservations();

    if (reservations.length === 0) {
        return `
            <div class="empty-state reservation-empty-state">
                <h3>No reservations match your filters.</h3>
                <p>Adjust search, status, restaurant, date, or sorting controls.</p>
            </div>
        `;
    }

    return reservations
        .map(function (reservation) {
            const reservationId = reservation.reservationId || "";
            const isExpanded = expandedReservationId === reservationId;

            return `
            <article class="reservation-management-card">
                <div class="reservation-card-main">
                    <div>
                        <strong>${escapeHTML(reservation.guestName || "Guest")}</strong>
                        <span>${escapeHTML(reservation.guestEmail || "No email")}</span>
                    </div>
                    <div>
                        <strong>${escapeHTML(reservation.restaurantName || "Restaurant not set")}</strong>
                        <span>${escapeHTML(formatReservationDateTime(reservation))}</span>
                    </div>
                    <div>
                        <span>Table</span>
                        <strong>${escapeHTML(reservation.tableId || "Not set")}</strong>
                        <span>${escapeHTML(normalizeTableExperience(reservation.tableExperience))} &middot; ${formatUSD(Number(reservation.experienceFee) || 0)}</span>
                        <span>Selected seats: ${escapeHTML(formatReservationSeatIds(reservation))}</span>
                    </div>
                    <div>
                        <span>Accepted attendees</span>
                        <strong>${getAcceptedAttendeeCount(reservation)}</strong>
                    </div>
                    <div>
                        <span>Total amount</span>
                        <strong>${formatUSD(getReservationTotalAmount(reservation))}</strong>
                    </div>
                    <div>
                        <span>Check-in</span>
                        <strong>${escapeHTML(reservation.checkInCode || "Not available")}</strong>
                    </div>
                </div>
                <div class="reservation-card-actions">
                    ${renderStatusBadge(getReservationStatus(reservation))}
                    <label>
                        Status
                        <select data-reservation-status-id="${escapeHTML(reservationId)}">
                            ${["active", "confirmed", "completed", "cancelled"]
                                .map(function (status) {
                                    return `
                                    <option value="${status}" ${getReservationStatus(reservation) === status ? "selected" : ""}>${status}</option>
                                `;
                                })
                                .join("")}
                        </select>
                    </label>
                    <button class="secondary-action" type="button" data-reservation-details-id="${escapeHTML(reservationId)}">
                        ${isExpanded ? "Hide Details" : "View Details"}
                    </button>
                </div>
                ${isExpanded ? renderReservationDetails(reservation) : ""}
            </article>
        `;
        })
        .join("");
}

function renderDashboardView() {
    return `
        <section class="admin-section">
            ${renderOverviewCards()}
            <div class="dashboard-grid">
                <section class="profile-panel admin-panel">
                    <div class="form-heading">
                        <p class="eyebrow">Recent Reservations</p>
                        <h2>Latest booking activity</h2>
                    </div>
                    <div class="reservation-list">
                        ${renderRecentReservations()}
                    </div>
                </section>

                <section class="profile-panel admin-panel">
                    <div class="form-heading">
                        <p class="eyebrow">Quick Actions</p>
                        <h2>Common tasks</h2>
                    </div>
                    <div class="quick-action-list">
                        <button class="quick-action-button" type="button" data-admin-section-target="restaurants">Add Restaurant</button>
                        <button class="quick-action-button" type="button" data-admin-section-target="reservations">View Reservations</button>
                        <button class="quick-action-button" type="button" data-admin-section-target="tables">Manage Tables</button>
                    </div>
                </section>
            </div>
        </section>
    `;
}

function renderRestaurantManagerView() {
    return `
        <section class="admin-section admin-view">
            ${createRestaurantFormPanel()}
            ${createSavedRestaurantsPanel()}
        </section>
    `;
}

function renderReservationsView() {
    return `
        <section class="admin-section">
            ${renderReservationSummaryCards()}
            ${renderReservationControls()}
            <section class="profile-panel admin-panel">
                <div class="form-heading">
                    <p class="eyebrow">Reservations</p>
                    <h2 id="reservationShownCount">${getFilteredReservations().length} shown</h2>
                </div>
                <div class="reservation-management-list" id="reservationManagementList">
                    ${renderReservationList()}
                </div>
            </section>
        </section>
    `;
}

function renderTableControls() {
    const restaurants = getRestaurants();
    const selectedRestaurant = getRestaurantById(adminSelectedRestaurantId);
    const slots = getRestaurantTimeSlots(selectedRestaurant);

    return `
        <section class="profile-panel admin-panel table-controls-panel">
            <div class="table-controls-grid">
                <label>
                    Restaurant
                    <select id="tableRestaurantSelect" ${restaurants.length === 0 ? "disabled" : ""}>
                        ${restaurants
                            .map(function ({ id, name }) {
                                return `
                                <option value="${escapeHTML(id)}" ${String(adminSelectedRestaurantId) === String(id) ? "selected" : ""}>
                                    ${escapeHTML(name)}
                                </option>
                            `;
                            })
                            .join("")}
                    </select>
                </label>
                <label>
                    Date
                    <input type="date" id="tableDateInput" value="${escapeHTML(adminSelectedTableDate)}">
                </label>
                <label>
                    Time
                    <select id="tableTimeSelect" ${slots.length === 0 ? "disabled" : ""}>
                        ${
                            slots.length === 0
                                ? `<option value="">No slots configured</option>`
                                : slots
                                      .map(function (time) {
                                          return `
                                <option value="${time}" ${adminSelectedTableTime === time ? "selected" : ""} ${isAdminBookingTimeAvailable(time, adminSelectedTableDate, selectedRestaurant) ? "" : "disabled"}>
                                    ${time}
                                </option>
                            `;
                                      })
                                      .join("")
                        }
                    </select>
                </label>
            </div>
        </section>
    `;
}

function renderTableSummaryCards() {
    const counts = getAdminTableCounts();

    return `
        <section class="dashboard-overview-grid" aria-label="Table availability overview">
            <article class="overview-card">
                <span>Total Tables</span>
                <strong>${counts.total}</strong>
                <p>Saved for selected restaurant</p>
            </article>
            <article class="overview-card">
                <span>Available</span>
                <strong>${counts.available}</strong>
                <p>Open for selected slot</p>
            </article>
            <article class="overview-card">
                <span>Reserved</span>
                <strong>${counts.reserved}</strong>
                <p>Active reservations only</p>
            </article>
            <article class="overview-card">
                <span>Total Seat Capacity</span>
                <strong>${counts.seatCapacity}</strong>
                <p>Across all tables</p>
            </article>
        </section>
    `;
}

function renderAdminTableCard(table) {
    const status = getAdminTableStatus(table);
    const shapeMarkup = table.shape ? `<span>Shape ${escapeHTML(table.shape)}</span>` : "";

    return `
        <article class="admin-table-card status-${status.toLowerCase()}">
            <div>
                <strong>${escapeHTML(table.tableId)}</strong>
                <span>${table.seats} seats</span>
                <span>${escapeHTML(normalizeTableExperience(table.experience))}</span>
                ${shapeMarkup}
            </div>
            <em>${status}</em>
        </article>
    `;
}

function renderTableCapacityGroups() {
    const priceTiers = getPriceTiers();
    const tableLayout = getAdminSelectedTableLayout();

    if (tableLayout.length === 0) {
        return `
            <div class="empty-state">
                <h3>No table data available.</h3>
                <p>Add tables to this restaurant to monitor availability.</p>
            </div>
        `;
    }

    return getTablesByCapacity()
        .map(function ({ capacity, tables }) {
            return `
            <section class="profile-panel admin-panel table-capacity-group">
                <div class="table-group-header">
                    <div class="form-heading">
                        <p class="eyebrow">${capacity} seats</p>
                        <h2>${tables.length} tables</h2>
                    </div>
                    <span class="pricing-badge">Price tier ${formatUSD(priceTiers[capacity] || 0)}</span>
                </div>
                <div class="admin-table-grid">
                    ${tables.map(renderAdminTableCard).join("")}
                </div>
            </section>
        `;
        })
        .join("");
}

function renderTablesView() {
    ensureAdminTableSelection();

    return `
        <section class="admin-section">
            ${renderTableControls()}
            ${renderTableLayoutEditor()}
            ${renderTableSummaryCards()}
            <section class="profile-panel admin-panel table-legend-panel">
                <div class="table-status-legend">
                    <span><span class="legend-dot available"></span> Available</span>
                    <span><span class="legend-dot reserved"></span> Reserved</span>
                    <span><span class="legend-dot disabled"></span> Disabled</span>
                </div>
            </section>
            ${renderTableCapacityGroups()}
        </section>
    `;
}

function renderSettingsView() {
    return `
        <section class="admin-section">
            ${createPriceTiersPanel()}
            ${createSettingsTableLayoutPanel()}
            ${renderDataToolsPanel()}
            ${renderDataOverview()}
        </section>
    `;
}

function getSectionHTML() {
    const renderers = {
        dashboard: renderDashboardView,
        restaurants: renderRestaurantManagerView,
        reservations: renderReservationsView,
        tables: renderTablesView,
        settings: renderSettingsView
    };

    return (renderers[activeAdminSection] || renderDashboardView)();
}

function setAdminActionMessage(message, type = "success") {
    adminActionMessage = message;
    adminActionMessageType = type;
}

function renderAdminActionMessage() {
    if (!adminActionMessage) {
        return "";
    }

    return `
        <p class="admin-feedback-message ${adminActionMessageType}" id="adminActionMessage" aria-live="polite">
            ${escapeHTML(adminActionMessage)}
        </p>
    `;
}

function updateAdminActionMessage() {
    const messageElement = document.querySelector("#adminActionMessage");

    if (messageElement) {
        messageElement.textContent = adminActionMessage;
        messageElement.className = `admin-feedback-message ${adminActionMessageType}`;
        return;
    }

    const adminView = document.querySelector("#adminDashboard");

    if (adminView && adminActionMessage) {
        adminView.insertAdjacentHTML("afterbegin", renderAdminActionMessage());
    }
}

function updateSectionNavigation() {
    document.querySelectorAll("[data-admin-section]").forEach(function (button) {
        const isActive = button.dataset.adminSection === activeAdminSection;

        button.classList.toggle("is-active", isActive);

        if (isActive) {
            button.setAttribute("aria-current", "page");
        } else {
            button.removeAttribute("aria-current");
        }
    });
}

function updateAdminHeader() {
    const title = document.querySelector("#adminPageTitle");
    const subtitle = document.querySelector("#adminPageSubtitle");
    const meta = getSectionMeta();

    if (title) {
        title.textContent = meta.title;
    }

    if (subtitle) {
        subtitle.textContent = meta.subtitle;
    }
}

function renderActiveAdminSection() {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    updateAdminHeader();
    updateSectionNavigation();
    adminView.innerHTML = `${renderAdminActionMessage()}${getSectionHTML()}`;
    attachManagementHandlers();

    adminView.querySelectorAll("[data-admin-section-target]").forEach(function (button) {
        button.addEventListener("click", function () {
            return setActiveAdminSection(button.dataset.adminSectionTarget);
        });
    });
}

function setActiveAdminSection(section) {
    activeAdminSection = section || "dashboard";
    renderActiveAdminSection();

    const sidebar = document.querySelector("#adminSidebar");
    const menuButton = document.querySelector("#adminMenuButton");

    if (sidebar) {
        sidebar.classList.remove("is-open");
    }

    if (menuButton) {
        menuButton.setAttribute("aria-expanded", "false");
    }
}
