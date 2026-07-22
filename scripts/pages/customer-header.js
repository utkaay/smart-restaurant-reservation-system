(function initializeCustomerHeader() {
    "use strict";

    const header = document.querySelector("[data-customer-header]");
    if (!header) return;

    const authLink = header.querySelector("#authNavLink");
    const logoutButton = header.querySelector("#logoutButton");
    const menuButton = header.querySelector("[data-customer-menu-button]");
    const memberElements = header.querySelectorAll("[data-customer-member]");
    const routeLinks = header.querySelectorAll("[data-header-route]");
    const mobileQuery = window.matchMedia("(max-width: 1180px)");
    let scrollFrame = 0;

    function safelyReadProfile() {
        if (typeof window.getCurrentUserProfile === "function") {
            try {
                const profile = window.getCurrentUserProfile();
                if (profile) return profile;
            } catch {
                // Fall through to the existing persisted profile shape.
            }
        }

        try {
            const profile = JSON.parse(window.localStorage.getItem("guestProfile") || "null");
            return profile && typeof profile === "object" ? profile : null;
        } catch {
            return null;
        }
    }

    function getInitials(name) {
        const words = String(name || "Guest")
            .trim()
            .split(/\s+/)
            .filter(Boolean);
        return (words.length > 1 ? `${words[0][0]}${words.at(-1)[0]}` : words[0]?.slice(0, 2) || "G").toUpperCase();
    }

    function isLoggedInFromExistingHeader() {
        const label = authLink?.textContent.trim().toLowerCase();
        return Boolean((logoutButton && !logoutButton.hidden) || (label && label !== "login"));
    }

    function syncAuthenticationPresentation() {
        if (!authLink || !logoutButton) return;

        const loggedIn = isLoggedInFromExistingHeader();
        const profile = loggedIn ? safelyReadProfile() : null;
        memberElements.forEach(function (element) {
            element.hidden = !loggedIn;
        });
        header.dataset.authenticated = String(loggedIn);
        authLink.classList.toggle("is-avatar", loggedIn);

        if (loggedIn) {
            const profileName = String(profile?.name || "Guest").trim();
            authLink.textContent = getInitials(profileName);
            authLink.setAttribute("aria-label", `${profileName} profile`);
        } else {
            authLink.textContent = "Login";
            authLink.setAttribute("aria-label", "Login");
        }
    }

    function getActiveRoute() {
        const page = document.body.dataset.customerPage || "home";
        if (page === "home") {
            const hash = window.location.hash;
            const restaurants = document.querySelector("#restaurants");
            if (hash === "#restaurants" || hash === "#searchForm") return "restaurants";
            if (restaurants && window.scrollY >= restaurants.offsetTop - 150) return "restaurants";
            return "discover";
        }

        return {
            concierge: "concierge",
            profile: "bookings",
            contact: "contact",
            booking: "find-table",
            login: "account",
            signup: "account"
        }[page] || "";
    }

    function updateActiveRoute() {
        const activeRoute = getActiveRoute();
        routeLinks.forEach(function (link) {
            if (link.dataset.headerRoute === activeRoute) {
                link.setAttribute("aria-current", "page");
            } else {
                link.removeAttribute("aria-current");
            }
        });
    }

    function setMenuOpen(open) {
        const shouldOpen = Boolean(open && mobileQuery.matches);
        header.dataset.menuOpen = String(shouldOpen);
        menuButton?.setAttribute("aria-expanded", String(shouldOpen));
        menuButton?.setAttribute("aria-label", shouldOpen ? "Close navigation menu" : "Open navigation menu");
    }

    function updateScrolledState() {
        if (scrollFrame) return;
        scrollFrame = window.requestAnimationFrame(function () {
            scrollFrame = 0;
            header.classList.toggle("is-scrolled", window.scrollY > 12);
            updateActiveRoute();
        });
    }

    menuButton?.addEventListener("click", function () {
        setMenuOpen(header.dataset.menuOpen !== "true");
    });
    header.addEventListener("click", function (event) {
        if (event.target.closest("a")) setMenuOpen(false);
    });
    logoutButton?.addEventListener("click", function () {
        window.setTimeout(syncAuthenticationPresentation, 0);
    });
    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape") {
            setMenuOpen(false);
            menuButton?.focus();
        }
    });
    document.addEventListener("click", function (event) {
        if (header.dataset.menuOpen === "true" && !header.contains(event.target)) setMenuOpen(false);
    });
    window.addEventListener("hashchange", updateActiveRoute);
    window.addEventListener("scroll", updateScrolledState, { passive: true });
    window.addEventListener("storage", syncAuthenticationPresentation);
    mobileQuery.addEventListener?.("change", function () {
        setMenuOpen(false);
    });

    syncAuthenticationPresentation();
    updateActiveRoute();
    updateScrolledState();
})();
