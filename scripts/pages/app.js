function handleSearch(event) {
    event.preventDefault();

    const searchInput = document.querySelector("#searchInput");
    searchTerm = searchInput.value.trim();
    saveToStorage(storageKeys.searchTerm, searchTerm);
    updateRestaurantResults();

    if (event.type === "submit") {
        scrollToRestaurantResults();
    }
}

function handleContactSubmit(event) {
    event.preventDefault();

    const form = event.currentTarget;
    const successMessage = document.querySelector("#contactSuccess");
    const formData = new FormData(form);
    const values = {
        name: getFormValue(formData, "name"),
        email: getFormValue(formData, "email"),
        subject: getFormValue(formData, "subject"),
        message: getFormValue(formData, "message")
    };
    const errors = getContactValidationErrors(values);

    if (successMessage) {
        successMessage.hidden = true;
        successMessage.textContent = "";
    }

    setContactFormErrors(form, errors);

    if (Object.keys(errors).length > 0) {
        return;
    }

    saveContactMessages([
        ...getContactMessages(),
        {
            messageId: createContactMessageId(),
            ...values,
            submittedAt: new Date().toISOString(),
            status: "new"
        }
    ]);

    form.reset();
    setContactFormErrors(form);

    if (successMessage) {
        successMessage.textContent = "Your message has been sent. Our support team will respond as soon as possible.";
        successMessage.hidden = false;
    }
}

function handleCategoryFilter(event) {
    const filterButton = event.target.closest(".filter-pill");

    if (!filterButton) {
        return;
    }

    activeFilter = filterButton.dataset.filter;
    saveToStorage(storageKeys.activeFilter, activeFilter);
    updateRestaurantResults();
}

function handleRestaurantBookingClick(event) {
    const button = event.target.closest(".book-button");

    if (!button) {
        return;
    }

    startBooking(Number(button.dataset.restaurantId));
}

function handleRestaurantsNavigation(event) {
    if (
        getCustomerPageName() !== "home" ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
    ) {
        return;
    }

    event.preventDefault();
    showDiscoveryPage("restaurants");
}

function updateAuthNavigation() {
    const authNavLink = document.querySelector("#authNavLink");
    const logoutButton = document.querySelector("#logoutButton");
    const loggedIn = isGuestLoggedIn();

    if (!authNavLink || !logoutButton) {
        return;
    }

    authNavLink.textContent = loggedIn ? "Profile" : "Login";
    authNavLink.href = loggedIn ? getCustomerPageUrl("profile") : getCustomerPageUrl("login");

    logoutButton.hidden = !loggedIn;
    logoutButton.classList.toggle("is-hidden", !loggedIn);
}

function getCustomerPageName() {
    return document.body.dataset.customerPage || "home";
}

function getCustomerPageUrl(pageName, sectionId = "") {
    const currentPage = getCustomerPageName();
    if (pageName === "home") {
        const homePath = currentPage === "home" ? "index.html" : "../index.html";
        return sectionId ? `${homePath}#${sectionId}` : homePath;
    }

    const pageFiles = {
        booking: "booking.html",
        concierge: "concierge.html",
        contact: "contact.html",
        login: "login.html",
        profile: "profile.html",
        signup: "signup.html"
    };
    const fileName = pageFiles[pageName];
    if (!fileName) {
        return getCustomerPageUrl("home");
    }
    return currentPage === "home" ? `pages/${fileName}` : `./${fileName}`;
}

function navigateToCustomerPage(pageName, sectionId = "") {
    window.location.href = getCustomerPageUrl(pageName, sectionId);
}

function scrollToSection(sectionId) {
    const section = document.querySelector(`#${sectionId}`);

    if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function scrollToRestaurantResults() {
    const restaurantGrid = document.querySelector("#restaurantGrid");
    const restaurantsSection = document.querySelector("#restaurants");
    const scrollTarget = restaurantGrid || restaurantsSection;

    if (scrollTarget) {
        scrollTarget.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

function getRouteFromHash() {
    const hashParts = window.location.hash
        .split("#")
        .map(function (part) {
            return part.trim();
        })
        .filter(Boolean);

    return hashParts[hashParts.length - 1] || "";
}

function showDiscoveryPage(sectionId = "home") {
    if (getCustomerPageName() !== "home") {
        navigateToCustomerPage("home", sectionId);
        return;
    }
    window.history.pushState(null, "", `#${sectionId}`);
    scrollToSection(sectionId);
}

function showLoginPage() {
    if (isGuestLoggedIn()) {
        showProfilePage();
        return;
    }

    authMode = "login";
    authErrors = {};
    authFormValues = {};
    if (getCustomerPageName() !== "login") {
        navigateToCustomerPage("login");
        return;
    }
    renderAuthPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSignUpPage() {
    if (isGuestLoggedIn()) {
        showProfilePage();
        return;
    }

    authMode = "signup";
    authErrors = {};
    authFormValues = {};
    if (getCustomerPageName() !== "signup") {
        navigateToCustomerPage("signup");
        return;
    }
    renderAuthPage();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showProfilePage() {
    if (!isGuestLoggedIn()) {
        savePendingAction({ type: "profile" });

        if (!authMessage) {
            authMessage = getGuestProfile()
                ? "Login to view your guest profile."
                : profileMessage || "Login or sign up to view your guest profile.";
        }

        showLoginPage();
        return;
    }

    if (getCustomerPageName() !== "profile") {
        navigateToCustomerPage("profile");
        return;
    }
    renderGuestProfile();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showBookingPage() {
    if (!getCurrentUserProfile()) {
        redirectToLoginForBooking();
        return;
    }

    if (getCustomerPageName() !== "booking") {
        navigateToCustomerPage("booking");
        return;
    }
    renderBookingView();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showSmartConciergePage() {
    if (getCustomerPageName() !== "concierge") {
        navigateToCustomerPage("concierge");
        return;
    }
    renderSmartConcierge();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function showContactPage() {
    if (getCustomerPageName() !== "contact") {
        navigateToCustomerPage("contact");
        return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function setAuthMessageFromPendingAction() {
    const pendingAction = getPendingAction();

    if (!pendingAction || authMessage) {
        return;
    }

    if (pendingAction.type === "booking") {
        authMessage = "Please log in or create an account before booking.";
    } else if (pendingAction.type === "profile") {
        authMessage = getGuestProfile()
            ? "Login to view your guest profile."
            : "Login or sign up to view your guest profile.";
    }
}

function setupEventListeners() {
    const restaurantGrid = document.querySelector("#restaurantGrid");
    const filterPills = document.querySelector("#filterPills");
    const searchForm = document.querySelector("#searchForm");
    const searchInput = document.querySelector("#searchInput");
    const backToDiscoveryButton = document.querySelector("#backToDiscoveryButton");
    const backFromLoginButton = document.querySelector("#backFromLoginButton");
    const backFromBookingButton = document.querySelector("#backFromBookingButton");
    const backFromConciergeButton = document.querySelector("#backFromConciergeButton");
    const smartConciergeView = document.querySelector("#smartConciergeView");
    const logoutButton = document.querySelector("#logoutButton");
    const contactForm = document.querySelector("#contactForm");
    const restaurantsNavLink = document.querySelector("#restaurantsNavLink");

    if (searchInput) {
        searchInput.value = searchTerm;
        searchInput.addEventListener("input", handleSearch);
    }
    restaurantGrid?.addEventListener("click", handleRestaurantBookingClick);
    smartConciergeView?.addEventListener("click", handleRestaurantBookingClick);
    filterPills?.addEventListener("click", handleCategoryFilter);
    searchForm?.addEventListener("submit", handleSearch);
    backToDiscoveryButton?.addEventListener("click", function () {
        return showDiscoveryPage("restaurants");
    });
    backFromLoginButton?.addEventListener("click", function () {
        clearPendingAction();
        authMessage = "";
        showDiscoveryPage("restaurants");
    });
    backFromBookingButton?.addEventListener("click", function () {
        return showDiscoveryPage("restaurants");
    });
    backFromConciergeButton?.addEventListener("click", function () {
        return showDiscoveryPage("restaurants");
    });
    logoutButton?.addEventListener("click", handleLogout);
    contactForm?.addEventListener("submit", handleContactSubmit);
    restaurantsNavLink?.addEventListener("click", handleRestaurantsNavigation);
}

function initializeCustomerPage() {
    const pageName = getCustomerPageName();

    if (pageName !== "login" && pageName !== "signup") {
        clearPendingAction();
    }

    if (pageName === "home") {
        updateRestaurantResults();
        const initialRoute = getRouteFromHash();
        if (initialRoute === "guest") {
            showProfilePage();
        } else if (initialRoute === "login") {
            showLoginPage();
        } else if (initialRoute === "signup") {
            showSignUpPage();
        } else if (initialRoute === "concierge") {
            showSmartConciergePage();
        } else if (initialRoute === "contact") {
            showContactPage();
        } else if (initialRoute === "booking") {
            showBookingPage();
        }
        return;
    }

    if (pageName === "profile") {
        showProfilePage();
    } else if (pageName === "login") {
        setAuthMessageFromPendingAction();
        showLoginPage();
    } else if (pageName === "signup") {
        setAuthMessageFromPendingAction();
        showSignUpPage();
    } else if (pageName === "booking") {
        showBookingPage();
    } else if (pageName === "concierge") {
        showSmartConciergePage();
    } else if (pageName === "contact") {
        showContactPage();
    }
}

saveRestaurants(getRestaurants());
savePriceTiers(getPriceTiers());
saveReservations(getReservations());
saveWaitlist(getWaitlist());
updateAuthNavigation();
setupEventListeners();
initializeCustomerPage();

function renderRealQRCode(reservation) {
    const qrCanvas = document.getElementById("qr-code");
    const qrCodeError = document.getElementById("qrCodeError");

    if (!qrCanvas) {
        return;
    }

    if (!window.QRCode || typeof window.QRCode.toCanvas !== "function") {
        qrCanvas.hidden = true;
        if (qrCodeError) {
            qrCodeError.hidden = false;
        }

        console.warn("QRCode library is unavailable.");
        return;
    }

    const qrData = JSON.stringify({
        reservationId: reservation.reservationId,
        checkInCode: reservation.checkInCode,
        restaurantName: reservation.restaurantName,
        date: reservation.date,
        time: reservation.time,
        tableId: reservation.tableId,
        selectedSeatIds: Array.isArray(reservation.selectedSeatIds) ? reservation.selectedSeatIds : [],
        tableExperience: normalizeTableExperience(reservation.tableExperience),
        experienceFee: Number(reservation.experienceFee) || 0
    });

    window.QRCode.toCanvas(
        qrCanvas,
        qrData,
        {
            width: 180,
            margin: 2
        },
        function (error) {
            if (error) {
                qrCanvas.hidden = true;
                if (qrCodeError) {
                    qrCodeError.hidden = false;
                }

                console.warn("Unable to render check-in QR code.", error);
                return;
            }

            if (qrCodeError) {
                qrCodeError.hidden = true;
            }
            qrCanvas.hidden = false;
        }
    );
}
