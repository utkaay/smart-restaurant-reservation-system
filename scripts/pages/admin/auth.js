function showAdminLoginMessage(message) {
    const messageElement = document.querySelector("#adminLoginMessage");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.hidden = !message;
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

function handleAdminLoginSubmit(event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = getFormValue(formData, "email");
    const password = String(formData.get("password") || "");

    if (!email || !password || !isValidEmail(email)) {
        showAdminLoginMessage("Enter the admin email and password.");
        return;
    }

    const adminUser = findUserByEmail(email);

    if (normalizeEmail(email) !== ADMIN_EMAIL || !adminUser || adminUser.password !== password) {
        clearAdminSession();
        showAdminLoginMessage("Invalid admin credentials.");
        return;
    }

    saveAdminSession(adminUser);
    window.location.replace("./index.html");
}

function setupLoginPage() {
    const loginForm = document.querySelector("#adminLoginForm");
    const passwordToggle = document.querySelector("[data-admin-password-toggle]");

    if (hasValidAdminSession()) {
        window.location.replace("./index.html");
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleAdminLoginSubmit);
        loginForm.addEventListener("input", function () {
            return showAdminLoginMessage("");
        });
    }

    if (passwordToggle) {
        passwordToggle.addEventListener("click", handlePasswordToggle);
    }
}

function setupDashboardPage() {
    const logoutButton = document.querySelector("#adminLogoutButton");
    const viewCustomerSiteButton = document.querySelector("#viewCustomerSiteButton");
    const menuButton = document.querySelector("#adminMenuButton");
    const sidebar = document.querySelector("#adminSidebar");

    if (!hasValidAdminSession()) {
        window.location.replace("./login.html");
        return;
    }

    saveRestaurants(getRestaurants());
    savePriceTiers(getPriceTiers());
    renderActiveAdminSection();

    document.querySelectorAll("[data-admin-section]").forEach(function (button) {
        button.addEventListener("click", function () {
            return setActiveAdminSection(button.dataset.adminSection);
        });
    });

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function () {
            const isOpen = sidebar.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    if (viewCustomerSiteButton) {
        viewCustomerSiteButton.addEventListener("click", function () {
            window.location.href = "../../index.html";
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function () {
            clearAdminSession();
            window.location.replace("./login.html");
        });
    }
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
