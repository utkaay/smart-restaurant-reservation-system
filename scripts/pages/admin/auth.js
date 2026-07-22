let adminLoginInProgress = false;

function showAdminLoginMessage(message, type = "error") {
    const messageElement = document.querySelector("#adminLoginMessage");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.hidden = !message;
    messageElement.className = `admin-message ${type}`;
}

function setAdminLoginLoading(isLoading) {
    const form = document.querySelector("#adminLoginForm");
    const button = document.querySelector("#adminLoginSubmit");
    const label = document.querySelector("[data-admin-login-label]");

    adminLoginInProgress = isLoading;

    if (form) {
        Array.from(form.elements).forEach(function (control) {
            control.disabled = isLoading;
        });
        form.setAttribute("aria-busy", String(isLoading));
    }

    if (button) {
        button.disabled = isLoading;
    }

    if (label) {
        label.textContent = isLoading ? "Signing in…" : "Sign in to dashboard";
    }
}

function handlePasswordToggle(event) {
    const toggleButton = event.currentTarget;
    const passwordField = toggleButton.closest(".password-field");
    const passwordInput = passwordField ? passwordField.querySelector('input[name="password"]') : null;
    const icon = toggleButton.querySelector(".material-symbols-outlined");

    if (!passwordInput || adminLoginInProgress) {
        return;
    }

    const shouldShowPassword = passwordInput.type === "password";
    passwordInput.type = shouldShowPassword ? "text" : "password";
    toggleButton.classList.toggle("is-visible", shouldShowPassword);
    toggleButton.setAttribute("aria-label", shouldShowPassword ? "Hide password" : "Show password");

    if (icon) {
        icon.textContent = shouldShowPassword ? "visibility_off" : "visibility";
    }
}

function handleAdminLoginSubmit(event) {
    event.preventDefault();

    if (adminLoginInProgress) {
        return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = getFormValue(formData, "email");
    const password = String(formData.get("password") || "");
    const emailInput = form.elements.email;
    const passwordInput = form.elements.password;

    emailInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");

    if (!email || !password || !isValidEmail(email)) {
        showAdminLoginMessage("Enter a valid Admin email and password.");
        (!email || !isValidEmail(email) ? emailInput : passwordInput).setAttribute("aria-invalid", "true");
        (!email || !isValidEmail(email) ? emailInput : passwordInput).focus();
        return;
    }

    const adminUser = getAdminUser();

    if (!adminUser) {
        clearAdminSession();
        showAdminLoginMessage("Admin access has not been initialized in this browser. Use the approved Admin account data for this demo.");
        return;
    }

    if (normalizeEmail(email) !== ADMIN_EMAIL || adminUser.password !== password) {
        clearAdminSession();
        emailInput.setAttribute("aria-invalid", "true");
        passwordInput.setAttribute("aria-invalid", "true");
        showAdminLoginMessage("Invalid Admin credentials. Check the email and password and try again.");
        passwordInput.focus();
        return;
    }

    setAdminLoginLoading(true);
    showAdminLoginMessage("Credentials verified. Opening the dashboard…", "success");

    window.setTimeout(function () {
        saveAdminSession(adminUser);
        window.location.replace("./index.html");
    }, 300);
}

function renderAdminLoginSummary() {
    const restaurantCount = document.querySelector("#adminLoginRestaurantCount");
    const tableCount = document.querySelector("#adminLoginTableCount");
    const bookingCount = document.querySelector("#adminLoginBookingCount");
    const restaurants = getRestaurants();
    const tables = restaurants.reduce(function (total, restaurant) {
        return total + getRestaurantTableLayout(restaurant).length;
    }, 0);

    if (restaurantCount) {
        restaurantCount.textContent = restaurants.length;
    }
    if (tableCount) {
        tableCount.textContent = tables;
    }
    if (bookingCount) {
        bookingCount.textContent = getActiveReservations().length;
    }
}

function setupLoginPage() {
    const loginForm = document.querySelector("#adminLoginForm");
    const passwordToggle = document.querySelector("[data-admin-password-toggle]");

    if (hasValidAdminSession()) {
        window.location.replace("./index.html");
        return;
    }

    clearAdminSession();
    renderAdminLoginSummary();

    loginForm?.addEventListener("submit", handleAdminLoginSubmit);
    loginForm?.addEventListener("input", function (event) {
        event.target.removeAttribute("aria-invalid");
        showAdminLoginMessage("");
    });
    passwordToggle?.addEventListener("click", handlePasswordToggle);
}

function closeAdminSidebar() {
    const sidebar = document.querySelector("#adminSidebar");
    const menuButton = document.querySelector("#adminMenuButton");
    const backdrop = document.querySelector("#adminSidebarBackdrop");

    sidebar?.classList.remove("is-open");
    menuButton?.setAttribute("aria-expanded", "false");

    if (backdrop) {
        backdrop.hidden = true;
    }
}

function toggleAdminSidebar() {
    const sidebar = document.querySelector("#adminSidebar");
    const menuButton = document.querySelector("#adminMenuButton");
    const backdrop = document.querySelector("#adminSidebarBackdrop");

    if (!sidebar || !menuButton) {
        return;
    }

    const isOpen = sidebar.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));

    if (backdrop) {
        backdrop.hidden = !isOpen;
    }
}

function renderAdminIdentity() {
    const adminUser = getAdminUser();
    const name = String(adminUser?.name || "Administrator").trim() || "Administrator";
    const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map(function (part) {
            return part.charAt(0).toUpperCase();
        })
        .join("") || "A";
    const nameElement = document.querySelector("#adminIdentityName");
    const initialsElement = document.querySelector("#adminIdentityInitials");
    const dateElement = document.querySelector("#adminPageDate");

    if (nameElement) {
        nameElement.textContent = name;
    }
    if (initialsElement) {
        initialsElement.textContent = initials;
    }
    if (dateElement) {
        dateElement.textContent = new Intl.DateTimeFormat("en-AE", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            timeZone: BOOKING_TIME_ZONE
        }).format(new Date());
    }
}

function setupDashboardPage() {
    const logoutButton = document.querySelector("#adminLogoutButton");
    const viewCustomerSiteButton = document.querySelector("#viewCustomerSiteButton");
    const menuButton = document.querySelector("#adminMenuButton");
    const backdrop = document.querySelector("#adminSidebarBackdrop");

    if (!hasValidAdminSession()) {
        clearAdminSession();
        window.location.replace("./login.html");
        return;
    }

    saveRestaurants(getRestaurants());
    savePriceTiers(getPriceTiers());
    renderAdminIdentity();
    renderActiveAdminSection();

    document.querySelectorAll("[data-admin-section]").forEach(function (button) {
        button.addEventListener("click", function () {
            return setActiveAdminSection(button.dataset.adminSection);
        });
    });

    menuButton?.addEventListener("click", toggleAdminSidebar);
    backdrop?.addEventListener("click", closeAdminSidebar);
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            closeAdminSidebar();
        }
    });

    viewCustomerSiteButton?.addEventListener("click", function () {
        window.location.href = "../../index.html";
    });

    logoutButton?.addEventListener("click", function () {
        clearAdminSession();
        window.location.replace("./login.html");
    });
}

function setupAdminPortal() {
    const page = document.body.dataset.adminPage;

    if (page === "login") {
        setupLoginPage();
        return;
    }

    if (page === "dashboard") {
        setupDashboardPage();
    }
}

setupAdminPortal();
