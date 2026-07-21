function getFormValue(formData, key) {
    return formData.get(key).trim();
}

function normalizeEmail(email = "") {
    return email.trim().toLowerCase();
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

function getContactMessages() {
    const messages = getFromStorage(storageKeys.contactMessages);
    return Array.isArray(messages) ? messages : [];
}

function saveContactMessages(messages) {
    saveToStorage(storageKeys.contactMessages, messages);
}

function createContactMessageId() {
    return `message-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getContactValidationErrors({ name, email, subject, message }) {
    const errors = {};

    if (!name) {
        errors.name = "Name is required.";
    }

    if (!email) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!subject) {
        errors.subject = "Subject is required.";
    }

    if (!message) {
        errors.message = "Message is required.";
    }

    return errors;
}

function setContactFormErrors(form, errors = {}) {
    ["name", "email", "subject", "message"].forEach(function (fieldName) {
        const field = form.elements[fieldName];
        const error = form.querySelector(`[data-contact-error="${fieldName}"]`);
        const errorMessage = errors[fieldName] || "";

        if (field) {
            if (errorMessage) {
                field.setAttribute("aria-invalid", "true");
            } else {
                field.removeAttribute("aria-invalid");
            }
        }

        if (error) {
            error.textContent = errorMessage;
        }
    });
}

function isValidPassword(password = "") {
    return password.length >= 8;
}

function getCheckedValues(form, inputName) {
    return [...form.querySelectorAll(`input[name="${inputName}"]:checked`)].map(function ({ value }) {
        return value;
    });
}

function getGuestInitials(name = "Guest") {
    return (
        name
            .split(" ")
            .filter(Boolean)
            .map(function (part) {
                return part[0];
            })
            .slice(0, 2)
            .join("")
            .toUpperCase() || "G"
    );
}

function getGuestProfile() {
    return getFromStorage(storageKeys.guestProfile);
}

function getRoleForEmail(email = "") {
    return normalizeEmail(email) === ADMIN_EMAIL ? USER_ROLES.admin : USER_ROLES.guest;
}

function getUserRole(user = {}) {
    return getRoleForEmail(user.email);
}

function withUserRole(user) {
    return {
        ...user,
        role: getUserRole(user)
    };
}

function getUsers() {
    const users = getFromStorage(storageKeys.users);
    return Array.isArray(users) ? users.map(withUserRole) : [];
}

function saveUsers(users) {
    saveToStorage(storageKeys.users, users);
}

function getCurrentUserId() {
    return getFromStorage(storageKeys.currentUserId);
}

function saveCurrentUserId(userId) {
    saveToStorage(storageKeys.currentUserId, userId);
}

function clearCurrentUserId() {
    removeFromStorage(storageKeys.currentUserId);
}

function getPendingAction() {
    return getFromStorage(storageKeys.pendingAction);
}

function savePendingAction(pendingAction) {
    saveToStorage(storageKeys.pendingAction, pendingAction);
}

function clearPendingAction() {
    removeFromStorage(storageKeys.pendingAction);
}

function createUserId() {
    return `user-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function getUserProfile(user) {
    const { id, name, email, phone, favoriteCuisines = [], dietaryTags = [], contactPreference = "Email" } = user;

    return {
        id,
        name,
        email,
        phone,
        role: getUserRole(user),
        favoriteCuisines,
        dietaryTags,
        contactPreference
    };
}

function findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);

    return getUsers().find(function (user) {
        return normalizeEmail(user.email) === normalizedEmail;
    });
}

function getCurrentUser() {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
        return null;
    }

    return (
        getUsers().find(function (user) {
            return user.id === currentUserId;
        }) || null
    );
}

function getCurrentUserProfile() {
    const currentUser = getCurrentUser();

    return currentUser ? getUserProfile(currentUser) : null;
}

function getAuthSession() {
    return getFromStorage(storageKeys.authSession);
}

function saveAuthSession(profile, userId = profile.id || getCurrentUserId()) {
    if (userId) {
        saveCurrentUserId(userId);
    }

    saveToStorage(storageKeys.authSession, {
        userId,
        email: profile.email,
        role: getRoleForEmail(profile.email)
    });
}

function clearAuthSession() {
    removeFromStorage(storageKeys.authSession);
    removeFromStorage(storageKeys.adminSession);
    clearCurrentUserId();
}

function isGuestLoggedIn() {
    const profile = getGuestProfile();
    const session = getAuthSession();
    const currentUser = getCurrentUser();

    return Boolean(
        profile &&
        session &&
        currentUser &&
        session.userId === currentUser.id &&
        profile.id === currentUser.id &&
        normalizeEmail(profile.email) === normalizeEmail(session.email)
    );
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

function saveWaitlist(waitlist) {
    saveToStorage(storageKeys.waitlist, waitlist);
}

function getActiveReservationsForGuest(profile = getCurrentUserProfile()) {
    if (!profile) {
        return [];
    }

    const { id, email, phone } = profile;

    return getReservations().filter(function ({ guestUserId, guestEmail, guestPhone, status }) {
        if (id) {
            return status === "active" && guestUserId === id;
        }

        return status === "active" && guestEmail === email && guestPhone === phone;
    });
}

function canGuestBook(profile = getCurrentUserProfile()) {
    return getActiveReservationsForGuest(profile).length < MAX_ACTIVE_RESERVATIONS;
}

function saveGuestProfile(profile) {
    const { id, name, email, phone, favoriteCuisines = [], dietaryTags = [], contactPreference = "Email" } = profile;

    saveToStorage(storageKeys.guestProfile, {
        id,
        name,
        email,
        phone,
        favoriteCuisines,
        dietaryTags,
        contactPreference
    });
}

function createSummaryChips(items, emptyText) {
    if (items.length === 0) {
        return `<span class="summary-muted">${emptyText}</span>`;
    }

    return items
        .map(function (item) {
            return `<span class="summary-chip">${escapeHTML(item)}</span>`;
        })
        .join("");
}

function createCheckboxChoices(options, selectedOptions, inputName) {
    return options
        .map(function (option) {
            const isChecked = selectedOptions.includes(option);

            return `
            <label class="choice-chip">
                <input type="checkbox" name="${inputName}" value="${option}" ${isChecked ? "checked" : ""}>
                <span>${option}</span>
            </label>
        `;
        })
        .join("");
}

function createRadioChoices(options, selectedOption, inputName) {
    return options
        .map(function (option) {
            const isChecked = selectedOption === option;

            return `
            <label class="choice-chip">
                <input type="radio" name="${inputName}" value="${option}" ${isChecked ? "checked" : ""}>
                <span>${option}</span>
            </label>
        `;
        })
        .join("");
}

function getPreferenceCount({ favoriteCuisines = [], dietaryTags = [], contactPreference = "" }) {
    return favoriteCuisines.length + dietaryTags.length + (contactPreference ? 1 : 0);
}

function updateProfileSummary(profile = getGuestProfile(), message = profileMessage) {
    const profileSummary = document.querySelector("#profileSummary");

    if (!profileSummary || !profile) {
        return;
    }

    const { name, email, phone, favoriteCuisines = [], dietaryTags = [], contactPreference = "" } = profile;

    profileSummary.innerHTML = `
        ${message ? `<p class="profile-message">${escapeHTML(message)}</p>` : ""}
        <h3>Saved profile summary</h3>
        <p>Welcome, ${escapeHTML(name)}. Your guest account details are saved on this device.</p>

        <div class="summary-group">
            <span>Name</span>
            <div><span class="summary-chip">${escapeHTML(name)}</span></div>
        </div>

        <div class="summary-group">
            <span>Email</span>
            <div><span class="summary-chip">${escapeHTML(email)}</span></div>
        </div>

        <div class="summary-group">
            <span>Phone</span>
            <div><span class="summary-chip">${escapeHTML(phone)}</span></div>
        </div>

        <div class="summary-group">
            <span>Favorite cuisines</span>
            <div>${createSummaryChips(favoriteCuisines, "No favorite cuisines selected")}</div>
        </div>

        <div class="summary-group">
            <span>Dietary tags</span>
            <div>${createSummaryChips(dietaryTags, "No dietary tags selected")}</div>
        </div>

        <div class="summary-group">
            <span>Contact preference</span>
            <div><span class="summary-chip">${escapeHTML(contactPreference || "Not selected")}</span></div>
        </div>
    `;
}

function createAccountCard(profile) {
    if (!profile) {
        return `
            <aside class="account-card">
                <span class="account-avatar">G</span>
                <p class="eyebrow">Guest account</p>
                <h2>Create your profile</h2>
                <p class="account-copy">Add your contact details for future account features.</p>
                <div class="account-detail">
                    <span>Email</span>
                    <strong>Not added yet</strong>
                </div>
                <div class="account-detail">
                    <span>Phone</span>
                    <strong>Not added yet</strong>
                </div>
            </aside>
        `;
    }

    const { name, email, phone } = profile;

    return `
        <aside class="account-card">
            <span class="account-avatar">${escapeHTML(getGuestInitials(name))}</span>
            <p class="eyebrow">Guest account</p>
            <h2>${escapeHTML(name)}</h2>
            <div class="account-detail">
                <span>Email</span>
                <strong>${escapeHTML(email)}</strong>
            </div>
            <div class="account-detail">
                <span>Phone</span>
                <strong>${escapeHTML(phone)}</strong>
            </div>
        </aside>
    `;
}

function createDashboardCard({ title, value, detail }) {
    return `
        <article class="dashboard-card">
            <span>${escapeHTML(title)}</span>
            <strong>${escapeHTML(value)}</strong>
            <p>${escapeHTML(detail)}</p>
        </article>
    `;
}

function createDashboardCards(profile) {
    const preferenceCount = profile ? getPreferenceCount(profile) : 0;
    const activeReservationCount = getActiveReservationsForGuest(profile).length;
    const cards = [
        {
            title: "Saved restaurants",
            value: "0",
            detail: "Placeholder for saved places in a later phase."
        },
        {
            title: "Upcoming bookings",
            value: `${activeReservationCount}`,
            detail: `Active reservation cap is ${MAX_ACTIVE_RESERVATIONS}.`
        },
        {
            title: "Dining preferences",
            value: `${preferenceCount}`,
            detail: "Saved cuisine, dietary, and contact choices."
        }
    ];

    return cards.map(createDashboardCard).join("");
}

function renderBookingCapStatus(profile = getGuestProfile()) {
    const activeReservationCount = getActiveReservationsForGuest(profile).length;
    const hasReachedCap = activeReservationCount >= MAX_ACTIVE_RESERVATIONS;
    const hasProfile = Boolean(profile);

    return `
        <section class="profile-panel booking-cap-status" id="bookingCapStatus">
            <div class="form-heading">
                <p class="eyebrow">Booking cap</p>
                <h3>Active reservations: ${activeReservationCount} / ${MAX_ACTIVE_RESERVATIONS}</h3>
            </div>

            ${
                hasReachedCap
                    ? `
                <p class="booking-warning">You cannot create more active bookings until one is cleared or completed.</p>
            `
                    : ""
            }

            <div class="booking-actions">
                <button class="secondary-action" type="button" id="ClearReservationsButton" ${!hasProfile || activeReservationCount === 0 ? "disabled" : ""}>
                    Clear Reservations
                </button>
            </div>
        </section>
    `;
}
