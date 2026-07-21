function createProfileForm(profile = {}, options = {}) {
    const {
        name = "",
        email = "",
        phone = "",
        favoriteCuisines = [],
        dietaryTags = [],
        contactPreference = "Email"
    } = profile;
    const {
        formId = "guestProfileForm",
        heading = profile.name ? "Edit profile details" : "Start your guest profile",
        submitLabel = profile.name ? "Save Profile" : "Create Profile",
        showProfileMessage = true,
        showPasswordField = false,
        panelClass = "profile-panel",
        afterSubmitHTML = "",
        noValidate = false
    } = options;
    const formAttributes = noValidate ? " novalidate" : "";

    return `
        <section class="${panelClass}">
            <form class="guest-form" id="${formId}"${formAttributes}>
                <div class="form-heading">
                    <p class="eyebrow">Guest details</p>
                    <h3>${escapeHTML(heading)}</h3>
                </div>

                ${showProfileMessage && !profile.name && profileMessage ? `<p class="profile-message">${escapeHTML(profileMessage)}</p>` : ""}

                <div class="form-grid">
                    <label>
                        Name
                        <input type="text" name="name" value="${escapeHTML(name)}" aria-invalid="${Boolean(authErrors.name)}" required>
                        ${showPasswordField ? createFieldError("name") : ""}
                    </label>

                    <label>
                        Email
                        <input type="email" name="email" value="${escapeHTML(email)}" autocomplete="email" aria-invalid="${Boolean(authErrors.email)}" required>
                        ${showPasswordField ? createFieldError("email") : ""}
                    </label>
                </div>

                <label>
                    Phone
                    <input type="tel" name="phone" value="${escapeHTML(phone)}" autocomplete="tel" aria-invalid="${Boolean(authErrors.phone)}" required>
                    ${showPasswordField ? createFieldError("phone") : ""}
                </label>

                ${showPasswordField ? createPasswordField({ autocomplete: "new-password" }) : ""}

                <fieldset>
                    <legend>Favorite cuisines</legend>
                    <div class="choice-grid">
                        ${createCheckboxChoices(favoriteCuisineOptions, favoriteCuisines, "favoriteCuisines")}
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Dietary tags</legend>
                    <div class="choice-grid">
                        ${createCheckboxChoices(dietaryTagOptions, dietaryTags, "dietaryTags")}
                    </div>
                </fieldset>

                <fieldset>
                    <legend>Contact preference</legend>
                    <div class="choice-grid compact">
                        ${createRadioChoices(contactPreferenceOptions, contactPreference, "contactPreference")}
                    </div>
                </fieldset>

                <button class="primary-action" type="submit">${escapeHTML(submitLabel)}</button>
                ${afterSubmitHTML}
            </form>
        </section>
    `;
}

function createProfileSummaryPanel() {
    return `<section class="profile-panel profile-summary" id="profileSummary"></section>`;
}

function createFieldError(fieldName) {
    return authErrors[fieldName]
        ? `<p class="field-error auth-field-error">${escapeHTML(authErrors[fieldName])}</p>`
        : "";
}

function createPasswordField({ autocomplete = "current-password" } = {}) {
    const hasError = Boolean(authErrors.password);

    return `
        <label>
            Password
            <span class="password-field">
                <input
                    type="password"
                    name="password"
                    autocomplete="${autocomplete}"
                    aria-invalid="${hasError}"
                    required
                >
                <button class="password-toggle" type="button" aria-label="Show password" data-password-toggle>
                    <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
                        <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </span>
            ${createFieldError("password")}
        </label>
    `;
}

function createLoginForm() {
    const savedProfile = getGuestProfile();
    const savedEmail = authFormValues.email || (savedProfile ? savedProfile.email : "");

    return `
        <section class="profile-panel auth-card fade-slide">
            <form class="guest-form" id="loginForm" novalidate>
                <div class="form-heading">
                    <p class="eyebrow">Login</p>
                    <h3>Welcome Back</h3>
                </div>

                ${authMessage ? `<p class="profile-message">${escapeHTML(authMessage)}</p>` : ""}

                <label>
                    Email
                    <input type="email" name="email" value="${escapeHTML(savedEmail)}" autocomplete="email" aria-invalid="${Boolean(authErrors.email)}" required>
                    ${createFieldError("email")}
                </label>

                ${createPasswordField({ autocomplete: "current-password" })}

                <button class="primary-action" type="submit">Login</button>

                <div class="auth-divider"><span>or</span></div>

                <button class="auth-switch-button" type="button" id="showSignUpButton">
                    Create an account
                </button>
            </form>
        </section>
    `;
}

function createSignUpForm() {
    return createProfileForm(authFormValues, {
        formId: "signUpForm",
        heading: "Create your guest account",
        submitLabel: "Sign Up",
        showProfileMessage: false,
        showPasswordField: true,
        noValidate: true,
        panelClass: "profile-panel auth-card fade-slide",
        afterSubmitHTML: `
            <button class="auth-switch-button" type="button" id="showLoginButton">
                Already have an account? Login
            </button>
        `
    });
}

function handlePasswordToggle(event) {
    const toggleButton = event.currentTarget;
    const passwordField = toggleButton.closest(".password-field");
    const passwordInput = passwordField ? passwordField.querySelector('input[name="password"]') : null;

    if (!passwordInput) {
        return;
    }

    const shouldShowPassword = passwordInput.type === "password";
    passwordInput.type = shouldShowPassword ? "text" : "password";
    toggleButton.classList.toggle("is-visible", shouldShowPassword);
    toggleButton.setAttribute("aria-label", shouldShowPassword ? "Hide password" : "Show password");
}

function renderAuthPage() {
    const authSection = document.querySelector("#authSection");

    authSection.innerHTML = authMode === "signup" ? createSignUpForm() : createLoginForm();

    const loginForm = authSection.querySelector("#loginForm");
    const signUpForm = authSection.querySelector("#signUpForm");
    const showSignUpButton = authSection.querySelector("#showSignUpButton");
    const showLoginButton = authSection.querySelector("#showLoginButton");
    const passwordToggleButtons = authSection.querySelectorAll("[data-password-toggle]");

    if (loginForm) {
        loginForm.addEventListener("submit", handleLoginSubmit);
    }

    if (signUpForm) {
        signUpForm.addEventListener("submit", handleSignUpSubmit);
    }

    if (showSignUpButton) {
        showSignUpButton.addEventListener("click", function () {
            authMessage = "";
            showSignUpPage();
        });
    }

    if (showLoginButton) {
        showLoginButton.addEventListener("click", function () {
            authMessage = "";
            showLoginPage();
        });
    }

    passwordToggleButtons.forEach(function (button) {
        button.addEventListener("click", handlePasswordToggle);
    });
}

function renderGuestProfile() {
    const guestSection = document.querySelector("#guestSection");
    const profile = getGuestProfile();

    guestSection.innerHTML = `
        ${createAccountCard(profile)}
        <div class="profile-main-column">
            <div class="dashboard-card-grid">
                ${createDashboardCards(profile)}
            </div>
            ${renderBookingCapStatus(profile)}
            ${createProfileForm(profile || {})}
            ${profile ? createProfileSummaryPanel() : ""}
        </div>
    `;

    const profileForm = guestSection.querySelector("#guestProfileForm");
    const ClearReservationsButton = guestSection.querySelector("#ClearReservationsButton");

    if (profileForm) {
        profileForm.addEventListener("submit", handleProfileSubmit);
    }

    if (ClearReservationsButton) {
        ClearReservationsButton.addEventListener("click", handleClearReservations);
    }

    updateProfileSummary(profile);
}

function handleClearReservations() {
    saveReservations([]);
    renderGuestProfile();
}

function getGuestProfileFromForm(form) {
    const formData = new FormData(form);

    return {
        id: getCurrentUserId(),
        name: getFormValue(formData, "name"),
        email: getFormValue(formData, "email"),
        phone: getFormValue(formData, "phone"),
        favoriteCuisines: getCheckedValues(form, "favoriteCuisines"),
        dietaryTags: getCheckedValues(form, "dietaryTags"),
        contactPreference: formData.get("contactPreference") || "Email"
    };
}

function getAuthFormValues(form) {
    const formData = new FormData(form);

    return {
        name: getFormValue(formData, "name"),
        email: getFormValue(formData, "email"),
        phone: getFormValue(formData, "phone"),
        password: String(formData.get("password") || ""),
        favoriteCuisines: getCheckedValues(form, "favoriteCuisines"),
        dietaryTags: getCheckedValues(form, "dietaryTags"),
        contactPreference: formData.get("contactPreference") || "Email"
    };
}

function getLoginValidationErrors({ email, password }) {
    const errors = {};

    if (!email) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
        errors.email = "Enter a valid email address.";
    }

    if (!password) {
        errors.password = "Password is required.";
    }

    return errors;
}

function getSignUpValidationErrors({ name, email, phone, password }) {
    const errors = {};

    if (!name) {
        errors.name = "Name is required.";
    }

    if (!email) {
        errors.email = "Email is required.";
    } else if (!isValidEmail(email)) {
        errors.email = "Enter a valid email address.";
    } else if (findUserByEmail(email)) {
        errors.email = "An account with this email already exists.";
    }

    if (!phone) {
        errors.phone = "Phone is required.";
    }

    if (!password) {
        errors.password = "Password is required.";
    } else if (!isValidPassword(password)) {
        errors.password = "Password must be at least 8 characters.";
    }

    return errors;
}

function createUserFromAuthValues(values) {
    return {
        id: createUserId(),
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
        role: getRoleForEmail(values.email),
        favoriteCuisines: values.favoriteCuisines,
        dietaryTags: values.dietaryTags,
        contactPreference: values.contactPreference,
        createdAt: new Date().toISOString()
    };
}

function continueAfterAuth() {
    const pendingAction = getPendingAction();

    if (pendingAction && pendingAction.type === "booking" && pendingAction.restaurantId) {
        const restaurantId = pendingAction.restaurantId;

        clearPendingAction();
        startBooking(Number(restaurantId));
        return;
    }

    if (pendingAction) {
        clearPendingAction();
    }

    showProfilePage();
}

function handleLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const email = getFormValue(formData, "email");
    const password = String(formData.get("password") || "");
    const errors = getLoginValidationErrors({ email, password });

    authFormValues = { email };

    if (Object.keys(errors).length > 0) {
        authErrors = errors;
        authMessage = "";
        renderAuthPage();
        return;
    }

    const user = findUserByEmail(email);

    if (!user || user.password !== password) {
        authErrors = {
            password: "Email or password is incorrect."
        };
        authMessage = "";
        renderAuthPage();
        return;
    }

    const userWithRole = withUserRole(user);
    const profile = getUserProfile(userWithRole);

    authErrors = {};
    authFormValues = {};
    authMessage = "";
    profileMessage = "Logged in.";
    saveUsers(
        getUsers().map(function (savedUser) {
            return savedUser.id === user.id ? userWithRole : savedUser;
        })
    );
    saveGuestProfile(profile);
    saveAuthSession(profile, user.id);
    updateAuthNavigation();
    continueAfterAuth();
}

function handleSignUpSubmit(event) {
    event.preventDefault();

    const authValues = getAuthFormValues(event.target);
    const errors = getSignUpValidationErrors(authValues);

    authFormValues = {
        name: authValues.name,
        email: authValues.email,
        phone: authValues.phone,
        favoriteCuisines: authValues.favoriteCuisines,
        dietaryTags: authValues.dietaryTags,
        contactPreference: authValues.contactPreference
    };

    if (Object.keys(errors).length > 0) {
        authErrors = errors;
        authMessage = "";
        renderAuthPage();
        return;
    }

    const user = createUserFromAuthValues(authValues);
    const guestProfile = getUserProfile(user);

    profileMessage = "Profile saved.";
    authErrors = {};
    authFormValues = {};
    authMessage = "";
    saveUsers([...getUsers(), user]);
    saveGuestProfile(guestProfile);
    saveAuthSession(guestProfile, user.id);
    updateAuthNavigation();
    continueAfterAuth();
}

function handleProfileSubmit(event) {
    event.preventDefault();

    const nextGuestProfile = getGuestProfileFromForm(event.target);
    const guestProfile = {
        ...nextGuestProfile,
        role: getRoleForEmail(nextGuestProfile.email)
    };
    const currentUserId = getCurrentUserId();

    profileMessage = "Profile saved.";
    saveGuestProfile(guestProfile);

    if (currentUserId) {
        saveUsers(
            getUsers().map(function (user) {
                if (user.id !== currentUserId) {
                    return user;
                }

                return {
                    ...user,
                    ...guestProfile,
                    role: getRoleForEmail(guestProfile.email)
                };
            })
        );
    }

    saveAuthSession(guestProfile, currentUserId);
    updateAuthNavigation();
    renderGuestProfile();
}

function handleLogout() {
    const guestSection = document.querySelector("#guestSection");

    clearAuthSession();
    clearPendingAction();
    clearBookingDraft();
    bookingState = createEmptyBookingState();
    profileMessage = "";
    bookingMessage = "";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    authMessage = "You have been logged out.";
    authErrors = {};
    authFormValues = {};
    authMode = "login";

    if (guestSection) {
        guestSection.innerHTML = "";
    }

    updateAuthNavigation();
    showDiscoveryPage("home");
}
