(function initializeMyBookingsPage() {
    const page = document.body;

    if (!page || page.dataset.customerPage !== "profile") {
        return;
    }

    const viewState = {
        activeTab: "upcoming",
        expandedReservationId: "",
        expandedMode: "details",
        profileEditing: false
    };

    function isObject(value) {
        return Boolean(value) && typeof value === "object" && !Array.isArray(value);
    }

    function toFiniteNumber(value) {
        const candidate = isObject(value) ? value.amount : value;
        const number = Number(candidate);
        return Number.isFinite(number) ? number : 0;
    }

    function getSafeProfile() {
        const profile = getGuestProfile();

        if (!isObject(profile)) {
            return null;
        }

        return {
            ...profile,
            id: String(profile.id || getCurrentUserId() || ""),
            name: String(profile.name || "Guest").trim() || "Guest",
            email: String(profile.email || "").trim(),
            phone: String(profile.phone || "").trim(),
            favoriteCuisines: Array.isArray(profile.favoriteCuisines)
                ? profile.favoriteCuisines.filter(function (item) {
                      return typeof item === "string" && item.trim();
                  })
                : [],
            dietaryTags: Array.isArray(profile.dietaryTags)
                ? profile.dietaryTags.filter(function (item) {
                      return typeof item === "string" && item.trim();
                  })
                : [],
            contactPreference: String(profile.contactPreference || "Email")
        };
    }

    function getStoredReservations() {
        const reservations = getReservations();
        return Array.isArray(reservations) ? reservations : [];
    }

    function getValidReservations() {
        return getStoredReservations().filter(isObject);
    }

    function getReservationIdentity(reservation = {}, index = 0) {
        if (!isObject(reservation)) {
            return "";
        }

        const existingId = reservation.reservationId || reservation.id;
        if (existingId) {
            return String(existingId);
        }

        return [
            "legacy",
            reservation.restaurantId || reservation.restaurantName || "restaurant",
            reservation.date || "date",
            reservation.time || "time",
            reservation.tableId || "table",
            index
        ]
            .map(function (part) {
                return String(part).replace(/[^a-z0-9_-]+/gi, "-");
            })
            .join("-");
    }

    function isReservationForProfile(reservation, profile) {
        if (!isObject(reservation) || !profile) {
            return false;
        }

        if (profile.id && reservation.guestUserId) {
            return String(profile.id) === String(reservation.guestUserId);
        }

        const reservationEmail = normalizeEmail(String(reservation.guestEmail || ""));
        const profileEmail = normalizeEmail(String(profile.email || ""));
        const sameEmail = reservationEmail && profileEmail && reservationEmail === profileEmail;
        const samePhone =
            String(reservation.guestPhone || "").trim() === String(profile.phone || "").trim();

        return Boolean(sameEmail && samePhone);
    }

    function getProfileReservations(profile) {
        return getStoredReservations()
            .map(function (reservation, index) {
                return { reservation, identity: getReservationIdentity(reservation, index) };
            })
            .filter(function (entry) {
                return isObject(entry.reservation) && isReservationForProfile(entry.reservation, profile);
            });
    }

    function getReservationDateValue(reservation = {}) {
        if (!reservation.date) {
            return Number.MAX_SAFE_INTEGER;
        }

        const time = reservation.time || "23:59";
        const timestamp = new Date(`${reservation.date}T${time}:00`).getTime();
        return Number.isFinite(timestamp) ? timestamp : Number.MAX_SAFE_INTEGER;
    }

    function getReservationDisplayState(reservation = {}) {
        const status = String(reservation.status || "active").toLowerCase();

        if (status === "cancelled" || status === "canceled") {
            return "cancelled";
        }

        if (status === "completed" || getReservationDateValue(reservation) < Date.now()) {
            return "completed";
        }

        return "upcoming";
    }

    function getGroupedReservations(profile) {
        const grouped = { upcoming: [], completed: [], cancelled: [] };

        getProfileReservations(profile).forEach(function (entry) {
            grouped[getReservationDisplayState(entry.reservation)].push(entry);
        });

        grouped.upcoming.sort(function (first, second) {
            return getReservationDateValue(first.reservation) - getReservationDateValue(second.reservation);
        });
        grouped.completed.sort(function (first, second) {
            return getReservationDateValue(second.reservation) - getReservationDateValue(first.reservation);
        });
        grouped.cancelled.sort(function (first, second) {
            return getReservationDateValue(second.reservation) - getReservationDateValue(first.reservation);
        });

        return grouped;
    }

    function getSafeRestaurants() {
        try {
            return getRestaurants().filter(isObject);
        } catch (error) {
            console.warn("Restaurant details could not be read for My Bookings.", error);
            return [];
        }
    }

    function getRestaurantForReservation(reservation = {}) {
        return getSafeRestaurants().find(function (restaurant) {
            return String(restaurant.id) === String(reservation.restaurantId);
        });
    }

    function getReservationImage(reservation = {}) {
        const restaurant = getRestaurantForReservation(reservation);
        return String(reservation.restaurantImage || restaurant?.image || "");
    }

    function getRestaurantLocation(reservation = {}) {
        return String(getRestaurantForReservation(reservation)?.location || reservation.location || "Jack’s collection");
    }

    function formatBookingDate(dateValue) {
        if (!dateValue) {
            return "Date pending";
        }

        const date = new Date(`${dateValue}T12:00:00`);
        if (!Number.isFinite(date.getTime())) {
            return String(dateValue);
        }

        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short",
            year: "numeric"
        }).format(date);
    }

    function formatCompactBookingDate(dateValue) {
        if (!dateValue) {
            return "Date pending";
        }

        const date = new Date(`${dateValue}T12:00:00`);
        if (!Number.isFinite(date.getTime())) {
            return String(dateValue);
        }

        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            day: "numeric",
            month: "short"
        }).format(date);
    }

    function formatBookingTime(timeValue) {
        if (!timeValue) {
            return "Time pending";
        }

        const parts = String(timeValue).split(":");
        const hour = Number(parts[0]);
        const minute = Number(parts[1] || 0);

        if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
            return String(timeValue);
        }

        return new Intl.DateTimeFormat("en-US", {
            hour: "numeric",
            minute: "2-digit"
        }).format(new Date(2026, 0, 1, hour, minute));
    }

    function getGuestCount(reservation = {}) {
        const partySize = Math.floor(Number(reservation.partySize));
        if (Number.isFinite(partySize) && partySize > 0) {
            return partySize;
        }

        const acceptedGuests = Array.isArray(reservation.guests)
            ? reservation.guests.filter(function (guest) {
                  return isObject(guest) && String(guest.rsvpStatus || "").toLowerCase() === "accepted";
              }).length
            : 0;

        return 1 + acceptedGuests;
    }

    function getExperienceLabel(reservation = {}) {
        const experience = String(reservation.tableExperience || reservation.experience || "Regular").trim();
        return experience || "Regular";
    }

    function getPricingLabel(baseLabel, value) {
        const label = isObject(value) ? String(value.label || "").trim() : "";
        return label ? `${baseLabel} (${label})` : baseLabel;
    }

    function getPreOrderSubtotal(reservation = {}) {
        const preOrder = isObject(reservation.preOrder) ? reservation.preOrder : {};
        const storedSubtotal = toFiniteNumber(preOrder.subtotal);
        if (storedSubtotal) {
            return storedSubtotal;
        }

        return Array.isArray(preOrder.items)
            ? preOrder.items.reduce(function (total, item) {
                  if (!isObject(item)) {
                      return total;
                  }
                  return total + toFiniteNumber(item.price) * Math.max(0, toFiniteNumber(item.quantity));
              }, 0)
            : 0;
    }

    function getPricingRows(reservation = {}) {
        const pricing = isObject(reservation.pricing) ? reservation.pricing : {};
        const preOrderSubtotal = getPreOrderSubtotal(reservation);
        const rows = [
            { label: "Table fee", amount: toFiniteNumber(pricing.tableFee) },
            {
                label: "Experience fee",
                amount: toFiniteNumber(reservation.experienceFee ?? pricing.experienceFee)
            },
            {
                label: getPricingLabel("Time adjustment", pricing.timeAdjustment),
                amount: toFiniteNumber(pricing.timeAdjustment)
            },
            {
                label: getPricingLabel("Coupon discount", pricing.couponDiscount),
                amount: -Math.abs(toFiniteNumber(pricing.couponDiscount))
            },
            {
                label: getPricingLabel("Member discount", pricing.memberDiscount),
                amount: -Math.abs(toFiniteNumber(pricing.memberDiscount))
            },
            { label: "Pre-order", amount: preOrderSubtotal }
        ];
        const knownTotal = rows.reduce(function (total, row) {
            return total + row.amount;
        }, 0);
        const splitBill = isObject(reservation.splitBill) ? reservation.splitBill : {};
        const splitTotal = toFiniteNumber(splitBill.totalAmount);
        const pricingTotal = toFiniteNumber(pricing.finalTotal);
        const storedTotal = splitTotal || (pricingTotal ? pricingTotal + preOrderSubtotal : 0);
        const difference = storedTotal ? storedTotal - knownTotal : 0;

        if (Math.abs(difference) >= 0.005) {
            rows.push({ label: "Stored adjustment", amount: difference });
        }

        return {
            rows: rows.filter(function (row) {
                return Math.abs(row.amount) >= 0.005 || row.label === "Table fee";
            }),
            total: storedTotal || knownTotal
        };
    }

    function formatMoney(amount) {
        const safeAmount = Number.isFinite(amount) ? amount : 0;
        return safeAmount < 0 ? `-${formatUSD(Math.abs(safeAmount))}` : formatUSD(safeAmount);
    }

    function getProfilePreferenceCount(profile) {
        return (
            profile.favoriteCuisines.length +
            profile.dietaryTags.length +
            (profile.contactPreference ? 1 : 0)
        );
    }

    function getProfileCompletion(profile) {
        const checkpoints = [
            profile.name && profile.name !== "Guest",
            profile.email,
            profile.phone,
            profile.contactPreference,
            profile.favoriteCuisines.length > 0,
            profile.dietaryTags.length > 0
        ];
        const completed = checkpoints.filter(Boolean).length;
        return Math.round((completed / checkpoints.length) * 100);
    }

    function renderProfileCard(profile) {
        return `
            <aside class="account-card profile-identity-card" aria-label="Profile summary">
                <span class="account-avatar">${escapeHTML(getGuestInitials(profile.name))}</span>
                <h2>${escapeHTML(profile.name)}</h2>
                <div class="profile-contact-list">
                    <div class="account-detail">
                        <span>Email</span>
                        <strong>${escapeHTML(profile.email || "Not added")}</strong>
                    </div>
                    <div class="account-detail">
                        <span>Phone</span>
                        <strong>${escapeHTML(profile.phone || "Not added")}</strong>
                    </div>
                    <div class="account-detail">
                        <span>Contact preference</span>
                        <strong>${escapeHTML(profile.contactPreference || "Not selected")}</strong>
                    </div>
                </div>
                <button class="profile-edit-button" type="button" data-profile-action="edit">Edit profile</button>
            </aside>
        `;
    }

    function renderStatCard(label, value, detail, className) {
        return `
            <article class="dashboard-card ${className}">
                <span>${escapeHTML(label)}</span>
                <strong>${escapeHTML(String(value))}</strong>
                <p>${escapeHTML(detail)}</p>
            </article>
        `;
    }

    function renderDashboardCards(profile, grouped) {
        const savedRestaurantCount = Array.isArray(profile.savedRestaurantIds)
            ? new Set(profile.savedRestaurantIds.map(String)).size
            : 0;

        return `
            <div class="dashboard-card-grid" aria-label="Profile statistics">
                ${renderStatCard("Saved Restaurants", savedRestaurantCount, "Restaurants saved to your profile", "is-saved")}
                ${renderStatCard(
                    "Upcoming Bookings",
                    grouped.upcoming.length,
                    `${grouped.upcoming.length} of ${MAX_ACTIVE_RESERVATIONS} active reservations`,
                    "is-upcoming"
                )}
                ${renderStatCard(
                    "Dining Preferences",
                    getProfilePreferenceCount(profile),
                    "Cuisine, dietary and contact choices",
                    "is-preferences"
                )}
            </div>
        `;
    }

    function renderBookingTabs(grouped) {
        return ["upcoming", "completed", "cancelled"]
            .map(function (tab) {
                const isActive = viewState.activeTab === tab;
                const label = tab[0].toUpperCase() + tab.slice(1);

                return `
                    <button
                        class="my-bookings-tab ${isActive ? "is-active" : ""}"
                        type="button"
                        role="tab"
                        aria-selected="${isActive}"
                        data-bookings-tab="${tab}"
                    >
                        ${label}<span>${grouped[tab].length}</span>
                    </button>
                `;
            })
            .join("");
    }

    function renderBookingEmptyState(hasAnyBookings) {
        const stateCopy = {
            upcoming: {
                title: hasAnyBookings ? "No upcoming reservations" : "Your table is waiting",
                message: hasAnyBookings
                    ? "Your next confirmed reservation will appear here."
                    : "Discover a restaurant and make your first reservation."
            },
            completed: {
                title: "No completed reservations yet",
                message: "Your dining history will appear here after a reservation is completed."
            },
            cancelled: {
                title: "No cancelled reservations",
                message: "Cancelled reservations remain here for your records."
            }
        };
        const copy = stateCopy[viewState.activeTab];

        return `
            <div class="my-bookings-empty">
                <h3>${copy.title}</h3>
                <p>${copy.message}</p>
                ${
                    viewState.activeTab === "upcoming"
                        ? '<a class="primary-action" href="../index.html#restaurants">Explore restaurants</a>'
                        : ""
                }
            </div>
        `;
    }

    function renderInvitedGuests(reservation = {}) {
        const guests = Array.isArray(reservation.guests) ? reservation.guests.filter(isObject) : [];

        if (guests.length === 0) {
            return '<p class="my-bookings-muted">No invited guests.</p>';
        }

        return `
            <div class="my-bookings-guest-list">
                ${guests
                    .map(function (guest) {
                        return `
                            <div>
                                <span>${escapeHTML(String(guest.name || "Invited guest"))}</span>
                                <strong>${escapeHTML(String(guest.rsvpStatus || "pending"))}</strong>
                            </div>
                        `;
                    })
                    .join("")}
            </div>
        `;
    }

    function renderPricingDetails(reservation = {}) {
        const pricing = getPricingRows(reservation);

        return `
            <div class="my-bookings-price-list">
                ${pricing.rows
                    .map(function (row) {
                        const className = row.amount < 0 ? "is-discount" : "";
                        return `<div class="${className}"><span>${escapeHTML(row.label)}</span><strong>${formatMoney(row.amount)}</strong></div>`;
                    })
                    .join("")}
                <div class="is-total"><span>Total</span><strong>${formatMoney(pricing.total)}</strong></div>
            </div>
        `;
    }

    function renderBookingDetails(entry, state) {
        const reservation = entry.reservation;
        const reservationId = entry.identity;
        const seatIds = Array.isArray(reservation.selectedSeatIds)
            ? reservation.selectedSeatIds.map(String).filter(Boolean)
            : [];
        const showCheckIn = viewState.expandedMode === "checkin";

        return `
            <div class="my-booking-details" id="booking-details-${escapeHTML(reservationId)}">
                <div class="my-booking-details-grid">
                    <section>
                        <p class="eyebrow">Booking details</p>
                        <dl>
                            <div><dt>Reservation ID</dt><dd>${escapeHTML(String(reservation.reservationId || reservation.id || "Legacy reservation"))}</dd></div>
                            <div><dt>Table</dt><dd>${escapeHTML(String(reservation.tableId || "Assigned at arrival"))}</dd></div>
                            <div><dt>Seats</dt><dd>${escapeHTML(seatIds.length ? seatIds.join(", ") : "Assigned at arrival")}</dd></div>
                            <div><dt>Experience</dt><dd>${escapeHTML(getExperienceLabel(reservation))}</dd></div>
                        </dl>
                    </section>
                    <section>
                        <p class="eyebrow">Invited guests</p>
                        ${renderInvitedGuests(reservation)}
                    </section>
                    <section>
                        <p class="eyebrow">Pricing</p>
                        ${renderPricingDetails(reservation)}
                    </section>
                    <section class="my-booking-checkin ${showCheckIn ? "is-highlighted" : ""}">
                        <p class="eyebrow">Check-in</p>
                        <div class="my-booking-qr" data-booking-qr-container>
                            ${
                                showCheckIn
                                    ? `<canvas data-booking-qr="${escapeHTML(reservationId)}" width="150" height="150" aria-label="QR check-in code"></canvas>`
                                    : ""
                            }
                            <div>
                                <span>Check-in code</span>
                                <strong>${escapeHTML(String(reservation.checkInCode || "Not available"))}</strong>
                                <p data-booking-qr-error hidden>QR preview is unavailable. Use the check-in code above.</p>
                            </div>
                        </div>
                    </section>
                </div>
                ${
                    state === "upcoming"
                        ? `
                            <div class="my-booking-cancel-row">
                                <p>Cancelling keeps this reservation in your booking history.</p>
                                <button class="my-booking-cancel" type="button" data-booking-action="cancel" data-reservation-id="${escapeHTML(reservationId)}">Cancel reservation</button>
                            </div>
                        `
                        : ""
                }
            </div>
        `;
    }

    function getStateLabel(state) {
        if (state === "cancelled") {
            return "Cancelled";
        }
        if (state === "completed") {
            return "Completed";
        }
        return "Confirmed";
    }

    function renderBookingCard(entry) {
        const reservation = entry.reservation;
        const reservationId = entry.identity;
        const state = getReservationDisplayState(reservation);
        const image = getReservationImage(reservation);
        const isExpanded = viewState.expandedReservationId === reservationId;
        const guestCount = getGuestCount(reservation);
        const guestLabel = guestCount === 1 ? "guest" : "guests";
        const detailsId = `booking-details-${reservationId}`;

        return `
            <article class="my-booking-card is-${state}" data-reservation-card="${escapeHTML(reservationId)}">
                <div class="my-booking-media">
                    ${
                        image
                            ? `<img class="my-booking-image" src="${escapeHTML(image)}" alt="${escapeHTML(String(reservation.restaurantName || "Restaurant"))} dining room" loading="lazy">`
                            : '<div class="my-booking-image-fallback" aria-label="Restaurant image unavailable"></div>'
                    }
                </div>
                <div class="my-booking-summary">
                    <div class="my-booking-title-row">
                        <div>
                            <p class="my-booking-location">${escapeHTML(getRestaurantLocation(reservation))}</p>
                            <h3>${escapeHTML(String(reservation.restaurantName || "Restaurant reservation"))}</h3>
                        </div>
                        <span class="my-booking-status">${getStateLabel(state)}</span>
                    </div>
                    <div class="my-booking-facts">
                        <div><span>Date</span><strong title="${escapeHTML(formatBookingDate(reservation.date))}">${escapeHTML(formatCompactBookingDate(reservation.date))}</strong></div>
                        <div><span>Time</span><strong>${escapeHTML(formatBookingTime(reservation.time))}</strong></div>
                        <div><span>Table</span><strong>${escapeHTML(String(reservation.tableId || "Pending"))}</strong></div>
                        <div><span>Experience</span><strong>${escapeHTML(getExperienceLabel(reservation))}</strong></div>
                        <div><span>Party</span><strong>${guestCount} ${guestLabel}</strong></div>
                    </div>
                    <div class="my-booking-actions">
                        ${
                            state === "upcoming" && reservation.checkInCode
                                ? `<button class="secondary-action" type="button" data-booking-action="checkin" data-reservation-id="${escapeHTML(reservationId)}" aria-controls="${escapeHTML(detailsId)}" aria-expanded="${isExpanded && viewState.expandedMode === "checkin"}">View QR</button>`
                                : ""
                        }
                        <button class="secondary-action" type="button" data-booking-action="details" data-reservation-id="${escapeHTML(reservationId)}" aria-controls="${escapeHTML(detailsId)}" aria-expanded="${isExpanded}">${isExpanded ? "Close" : "Manage"}</button>
                    </div>
                </div>
                ${isExpanded ? renderBookingDetails(entry, state) : ""}
            </article>
        `;
    }

    function renderMyBookings(profile, grouped) {
        const visibleReservations = grouped[viewState.activeTab];
        const totalCount = grouped.upcoming.length + grouped.completed.length + grouped.cancelled.length;

        return `
            <section class="my-bookings-section" id="myBookingsSection" aria-labelledby="myBookingsTitle">
                <div class="my-bookings-heading">
                    <div>
                        <h2 id="myBookingsTitle">Upcoming reservations</h2>
                        <p>${grouped.upcoming.length} of ${MAX_ACTIVE_RESERVATIONS} active reservations</p>
                    </div>
                    <button class="clear-reservations-button" type="button" data-profile-action="clear-reservations" ${totalCount === 0 ? "disabled" : ""}>Clear reservations</button>
                </div>
                <div class="my-bookings-tabs" role="tablist" aria-label="Booking status">
                    ${renderBookingTabs(grouped)}
                </div>
                <div class="my-bookings-list" role="tabpanel" aria-live="polite">
                    ${
                        visibleReservations.length
                            ? visibleReservations.map(renderBookingCard).join("")
                            : renderBookingEmptyState(totalCount > 0)
                    }
                </div>
            </section>
        `;
    }

    function renderTasteProfile(profile) {
        const preferences = [
            ...profile.favoriteCuisines,
            ...profile.dietaryTags,
            profile.contactPreference ? `${profile.contactPreference} updates` : ""
        ].filter(Boolean);
        const completion = getProfileCompletion(profile);

        return `
            <section class="taste-profile" aria-labelledby="tasteProfileTitle">
                <div class="taste-profile-heading">
                    <div>
                        <p class="eyebrow">Personalization</p>
                        <h2 id="tasteProfileTitle">Your taste profile</h2>
                    </div>
                    <button type="button" data-profile-action="edit">Edit</button>
                </div>
                <div class="taste-profile-chips">
                    ${
                        preferences.length
                            ? preferences
                                  .map(function (preference) {
                                      return `<span>${escapeHTML(preference)}</span>`;
                                  })
                                  .join("")
                            : '<p class="my-bookings-muted">No dining preferences saved yet.</p>'
                    }
                </div>
                <div class="taste-profile-progress">
                    <span>Profile ${completion}% complete</span>
                    <div role="progressbar" aria-label="Profile completion" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${completion}">
                        <span style="width: ${completion}%"></span>
                    </div>
                    <strong>${completion}%</strong>
                </div>
            </section>
        `;
    }

    function renderProfileEditor(profile) {
        if (!viewState.profileEditing) {
            return "";
        }

        return `
            <section class="profile-editor" id="profileEditor" aria-labelledby="profileEditorTitle">
                <div class="profile-editor-heading">
                    <div>
                        <p class="eyebrow">Profile details</p>
                        <h2 id="profileEditorTitle">Edit your profile</h2>
                    </div>
                    <button type="button" data-profile-action="close-editor" aria-label="Close profile editor">Close</button>
                </div>
                <div data-profile-form-host>
                    ${createProfileForm(profile, { heading: "Contact and dining preferences", submitLabel: "Save changes" })}
                </div>
            </section>
        `;
    }

    function updatePageHeading(profile) {
        const heading = document.querySelector(".profile-page-heading");
        const title = heading?.querySelector("h1");
        const subtitle = heading?.querySelector(".profile-page-subtitle");
        const hour = new Date().getHours();
        const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
        const firstName = profile.name.split(/\s+/)[0] || "Guest";

        if (title) {
            title.textContent = `${greeting}, ${firstName}.`;
        }
        if (subtitle) {
            subtitle.textContent = "Your reservations and dining preferences, all in one place.";
        }

        const navInitials = document.querySelector("[data-profile-nav-initials]");
        if (navInitials) {
            navInitials.textContent = getGuestInitials(profile.name);
            navInitials.setAttribute("aria-label", `${profile.name} profile`);
        }
    }

    function enhanceRenderedProfile(guestSection, profile) {
        const form = guestSection.querySelector("#guestProfileForm");
        if (form) {
            const submitButton = form.querySelector('button[type="submit"]');
            submitButton?.insertAdjacentHTML(
                "afterend",
                '<button class="secondary-action profile-editor-cancel" type="button" data-profile-action="close-editor">Cancel</button>'
            );
            form.addEventListener("submit", function (event) {
                viewState.profileEditing = false;
                handleProfileSubmit(event);
            });
        }

        guestSection.querySelectorAll(".my-booking-image").forEach(function (image) {
            image.addEventListener("error", function () {
                const media = image.closest(".my-booking-media");
                if (media) {
                    media.innerHTML = '<div class="my-booking-image-fallback" aria-label="Restaurant image unavailable"></div>';
                }
            });
        });

        renderQRCodeForExpandedReservation(profile);
    }

    function renderProfileDashboard() {
        const guestSection = document.querySelector("#guestSection");
        const profile = getSafeProfile();

        if (!guestSection) {
            return;
        }

        if (!profile) {
            guestSection.innerHTML = `
                <div class="profile-data-empty">
                    <h2>Profile unavailable</h2>
                    <p>Your saved profile could not be read. Sign in again to restore your account view.</p>
                    <a class="primary-action" href="login.html">Go to login</a>
                </div>
            `;
            return;
        }

        const grouped = getGroupedReservations(profile);
        guestSection.innerHTML = `
            ${renderProfileCard(profile)}
            <div class="profile-main-column">
                ${renderDashboardCards(profile, grouped)}
                ${renderMyBookings(profile, grouped)}
                ${renderTasteProfile(profile)}
                ${renderProfileEditor(profile)}
            </div>
        `;

        updatePageHeading(profile);
        enhanceRenderedProfile(guestSection, profile);
    }

    function refreshProfileDashboard(options = {}) {
        renderProfileDashboard();

        if (options.focusEditor) {
            requestAnimationFrame(function () {
                document.querySelector("#profileEditor")?.scrollIntoView({ behavior: "smooth", block: "start" });
                document.querySelector("#guestProfileForm input")?.focus({ preventScroll: true });
            });
        }
    }

    function renderQRCodeForExpandedReservation(profile) {
        if (viewState.expandedMode !== "checkin" || !viewState.expandedReservationId) {
            return;
        }

        const entry = getProfileReservations(profile).find(function (item) {
            return item.identity === viewState.expandedReservationId;
        });
        const canvas = document.querySelector("[data-booking-qr]");

        if (!entry || !canvas) {
            return;
        }

        const reservation = entry.reservation;
        const errorMessage = canvas.parentElement?.querySelector("[data-booking-qr-error]");
        if (!window.QRCode || typeof window.QRCode.toCanvas !== "function") {
            canvas.hidden = true;
            if (errorMessage) {
                errorMessage.hidden = false;
            }
            return;
        }

        window.QRCode.toCanvas(
            canvas,
            JSON.stringify({
                reservationId: reservation.reservationId || reservation.id || entry.identity,
                checkInCode: reservation.checkInCode,
                restaurantName: reservation.restaurantName,
                date: reservation.date,
                time: reservation.time,
                tableId: reservation.tableId,
                selectedSeatIds: Array.isArray(reservation.selectedSeatIds) ? reservation.selectedSeatIds : []
            }),
            { width: 150, margin: 1, color: { dark: "#002e23", light: "#fffdf7" } },
            function (error) {
                canvas.hidden = Boolean(error);
                if (errorMessage) {
                    errorMessage.hidden = !error;
                }
            }
        );
    }

    function cancelReservation(reservationId) {
        const profile = getSafeProfile();
        const entry = profile
            ? getProfileReservations(profile).find(function (item) {
                  return item.identity === reservationId;
              })
            : null;

        if (!entry || getReservationDisplayState(entry.reservation) !== "upcoming") {
            return;
        }

        const restaurantName = String(entry.reservation.restaurantName || "this restaurant");
        if (!window.confirm(`Cancel your reservation at ${restaurantName}?`)) {
            return;
        }

        saveReservations(
            getStoredReservations().map(function (reservation, index) {
                if (!isObject(reservation) || getReservationIdentity(reservation, index) !== reservationId) {
                    return reservation;
                }

                return { ...reservation, status: "cancelled" };
            })
        );

        viewState.activeTab = "cancelled";
        viewState.expandedReservationId = reservationId;
        viewState.expandedMode = "details";
        refreshProfileDashboard();
    }

    function clearReservations() {
        if (getValidReservations().length === 0) {
            return;
        }

        if (!window.confirm("Clear all reservation records? This cannot be undone.")) {
            return;
        }

        saveReservations([]);
        viewState.activeTab = "upcoming";
        viewState.expandedReservationId = "";
        refreshProfileDashboard();
    }

    document.addEventListener("click", function handleMyBookingsClick(event) {
        const tab = event.target.closest("[data-bookings-tab]");
        if (tab) {
            viewState.activeTab = tab.dataset.bookingsTab;
            viewState.expandedReservationId = "";
            refreshProfileDashboard();
            return;
        }

        const profileAction = event.target.closest("[data-profile-action]");
        if (profileAction) {
            const actionName = profileAction.dataset.profileAction;

            if (actionName === "edit") {
                viewState.profileEditing = true;
                refreshProfileDashboard({ focusEditor: true });
                return;
            }
            if (actionName === "close-editor") {
                viewState.profileEditing = false;
                refreshProfileDashboard();
                return;
            }
            if (actionName === "clear-reservations") {
                clearReservations();
                return;
            }
        }

        const bookingAction = event.target.closest("[data-booking-action]");
        if (!bookingAction) {
            return;
        }

        const reservationId = bookingAction.dataset.reservationId || "";
        const actionName = bookingAction.dataset.bookingAction;
        if (actionName === "cancel") {
            cancelReservation(reservationId);
            return;
        }

        const isSameReservation = viewState.expandedReservationId === reservationId;
        const isSameMode = viewState.expandedMode === actionName;
        viewState.expandedReservationId = isSameReservation && isSameMode ? "" : reservationId;
        viewState.expandedMode = actionName;
        refreshProfileDashboard();
    });

    window.renderGuestProfile = renderProfileDashboard;
})();
