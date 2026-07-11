const defaultRestaurants = [
    {
        id: 1,
        name: "Olive & Ember",
        cuisine: "Mediterranean",
        rating: 4.8,
        hours: "12:00 PM - 10:30 PM",
        openingTime: "12:00",
        closingTime: "22:30",
        priceLevel: "$$$",
        distanceCategory: "Nearby",
        location: "Harbor District",
        image: "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=900&q=80",
        badges: ["Patio", "Seafood", "Date night"],
        sustainabilityBadges: ["Eco Certified", "Locally Sourced"],
        allergenBadges: ["Shellfish", "Dairy"],
        menu: [
            { id: "olive-flatbread", name: "Herb Flatbread", price: 9, category: "Starter", tags: ["Vegetarian"] },
            { id: "olive-salmon", name: "Harbor Salmon", price: 24, category: "Main", tags: ["Seafood"] },
            { id: "olive-citrus-tart", name: "Citrus Tart", price: 8, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 2,
        name: "Noodle House",
        cuisine: "Japanese",
        rating: 4.7,
        hours: "11:30 AM - 11:00 PM",
        openingTime: "11:30",
        closingTime: "23:00",
        priceLevel: "$$",
        distanceCategory: "Nearby",
        location: "Midtown",
        image: "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?auto=format&fit=crop&w=900&q=80",
        badges: ["Ramen", "Quick seating", "Vegetarian"],
        sustainabilityBadges: ["Plastic Free"],
        allergenBadges: ["Soy", "Gluten"],
        menu: [
            { id: "noodle-edamame", name: "Sea Salt Edamame", price: 6, category: "Starter", tags: ["Vegetarian"] },
            { id: "noodle-tonkotsu", name: "Tonkotsu Ramen", price: 16, category: "Main", tags: ["Ramen"] },
            { id: "noodle-mochi", name: "Mochi Trio", price: 7, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 3,
        name: "The Garden Table",
        cuisine: "Modern American",
        rating: 4.6,
        hours: "9:00 AM - 9:00 PM",
        openingTime: "09:00",
        closingTime: "21:00",
        priceLevel: "$$",
        distanceCategory: "Medium",
        location: "Park Avenue",
        image: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=900&q=80",
        badges: ["Brunch", "Family friendly", "Organic"],
        sustainabilityBadges: ["Organic", "Locally Sourced"],
        allergenBadges: ["Dairy", "Eggs"],
        menu: [
            { id: "garden-salad", name: "Market Garden Salad", price: 12, category: "Starter", tags: ["Organic"] },
            { id: "garden-chicken", name: "Roast Chicken Plate", price: 21, category: "Main", tags: ["Family friendly"] },
            { id: "garden-cheesecake", name: "Honey Cheesecake", price: 8, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 4,
        name: "Saffron Lane",
        cuisine: "Indian",
        rating: 4.9,
        hours: "1:00 PM - 11:30 PM",
        openingTime: "13:00",
        closingTime: "23:30",
        priceLevel: "$$$",
        distanceCategory: "Medium",
        location: "Old Town",
        image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80",
        badges: ["Spicy", "Private dining", "Chef special"],
        sustainabilityBadges: ["Locally Sourced"],
        allergenBadges: ["Dairy", "Nuts"],
        menu: [
            { id: "saffron-samosa", name: "Spiced Samosa Chaat", price: 10, category: "Starter", tags: ["Spicy"] },
            { id: "saffron-biryani", name: "Saffron Biryani", price: 22, category: "Main", tags: ["Chef special"] },
            { id: "saffron-kulfi", name: "Pistachio Kulfi", price: 7, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 5,
        name: "Casa Verde",
        cuisine: "Mexican",
        rating: 4.5,
        hours: "12:00 PM - 12:00 AM",
        openingTime: "12:00",
        closingTime: "00:00",
        priceLevel: "$$",
        distanceCategory: "Far",
        location: "Riverside",
        image: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=900&q=80",
        badges: ["Tacos", "Rooftop", "Late night"],
        sustainabilityBadges: ["Plastic Free", "Locally Sourced"],
        allergenBadges: ["Gluten", "Dairy"],
        menu: [
            { id: "casa-elote", name: "Street Corn Elote", price: 7, category: "Starter", tags: ["Vegetarian"] },
            { id: "casa-tacos", name: "Birria Taco Plate", price: 17, category: "Main", tags: ["Tacos"] },
            { id: "casa-churros", name: "Cinnamon Churros", price: 8, category: "Dessert", tags: ["Sweet"] }
        ]
    },
    {
        id: 6,
        name: "Bistro Lumiere",
        cuisine: "French",
        rating: 4.8,
        hours: "5:00 PM - 11:00 PM",
        openingTime: "17:00",
        closingTime: "23:00",
        priceLevel: "$$$$",
        distanceCategory: "Far",
        location: "Arts Quarter",
        image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80",
        badges: ["Fine dining", "Wine list", "Anniversary"],
        sustainabilityBadges: ["Eco Certified"],
        allergenBadges: ["Dairy", "Eggs"],
        menu: [
            { id: "bistro-soup", name: "French Onion Soup", price: 11, category: "Starter", tags: ["Classic"] },
            { id: "bistro-duck", name: "Duck Confit", price: 29, category: "Main", tags: ["Fine dining"] },
            { id: "bistro-creme", name: "Creme Brulee", price: 9, category: "Dessert", tags: ["Classic"] }
        ]
    }
];

const ADMIN_EMAIL = "firezzutkay@gmail.com";
const USER_ROLES = {
    admin: "admin",
    guest: "guest"
};
const storageKeys = {
    users: "users",
    restaurants: "restaurants",
    priceTiers: "priceTiers",
    reservations: "reservations",
    waitlist: "waitlist",
    adminSession: "adminSession"
};
const defaultPriceTiers = {
    2: 0,
    4: 10,
    6: 20,
    8: 30
};
const defaultTableLayout = [
    { tableId: "A1", seats: 2 },
    { tableId: "A2", seats: 2 },
    { tableId: "A3", seats: 2 },
    { tableId: "A4", seats: 2 },
    { tableId: "B1", seats: 4 },
    { tableId: "B2", seats: 4 },
    { tableId: "B3", seats: 4 },
    { tableId: "B4", seats: 4 },
    { tableId: "C1", seats: 6 },
    { tableId: "C2", seats: 6 },
    { tableId: "D1", seats: 8 },
    { tableId: "D2", seats: 8 }
];
const sustainabilityBadgeOptions = ["Eco Certified", "Locally Sourced", "Plastic Free", "Organic"];
const allergenBadgeOptions = ["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy"];
const DEFAULT_OPENING_TIME = "11:00";
const DEFAULT_CLOSING_TIME = "22:00";

let editingRestaurantId = null;
let activeAdminSection = "dashboard";
let adminRestaurantSearchTerm = "";
let adminReservationSearchTerm = "";
let adminReservationStatusFilter = "all";
let adminReservationRestaurantFilter = "all";
let adminReservationDateFilter = "";
let adminReservationSort = "nearest";
let expandedReservationId = null;

const normalizeEmail = (email = "") => String(email).trim().toLowerCase();

const getRoleForEmail = (email = "") => {
    return normalizeEmail(email) === ADMIN_EMAIL
        ? USER_ROLES.admin
        : USER_ROLES.guest;
};

const withUserRole = (user) => ({
    ...user,
    role: getRoleForEmail(user.email)
});

const saveToStorage = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
};

const getFromStorage = (key) => {
    const savedValue = localStorage.getItem(key);

    try {
        return savedValue ? JSON.parse(savedValue) : null;
    } catch {
        return null;
    }
};

const removeFromStorage = (key) => {
    localStorage.removeItem(key);
};

const getUsers = () => {
    const users = getFromStorage(storageKeys.users);
    return Array.isArray(users) ? users.map(withUserRole) : [];
};

const findUserByEmail = (email) => {
    const normalizedEmail = normalizeEmail(email);
    return getUsers().find((user) => normalizeEmail(user.email) === normalizedEmail) || null;
};

const getAdminUser = () => findUserByEmail(ADMIN_EMAIL);

const getAdminSession = () => getFromStorage(storageKeys.adminSession);

const hasValidAdminSession = () => {
    const session = getAdminSession();
    const adminUser = getAdminUser();

    return Boolean(
        session
        && adminUser
        && session.userId === adminUser.id
        && normalizeEmail(session.email) === ADMIN_EMAIL
        && getRoleForEmail(adminUser.email) === USER_ROLES.admin
    );
};

const saveAdminSession = (adminUser) => {
    saveToStorage(storageKeys.adminSession, {
        userId: adminUser.id,
        email: adminUser.email,
        role: USER_ROLES.admin,
        createdAt: new Date().toISOString()
    });
};

const clearAdminSession = () => {
    removeFromStorage(storageKeys.adminSession);
};

const escapeHTML = (text = "") => {
    return String(text).replace(/[&<>"']/g, (character) => {
        const replacements = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        };

        return replacements[character];
    });
};

const getFormValue = (formData, key) => String(formData.get(key) || "").trim();

const isValidEmail = (email = "") => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

const isValidRestaurantTime = (time = "") => /^([01]\d|2[0-3]):[0-5]\d$/.test(time);

const parseDisplayTimeTo24Hour = (displayTime = "") => {
    const match = String(displayTime).trim().match(/^(\d{1,2})(?::([0-5]\d))?\s*(AM|PM)$/i);

    if (!match) {
        return "";
    }

    const period = match[3].toUpperCase();
    let hours = Number(match[1]);
    const minutes = match[2] || "00";

    if (hours < 1 || hours > 12) {
        return "";
    }

    if (period === "AM") {
        hours = hours === 12 ? 0 : hours;
    } else {
        hours = hours === 12 ? 12 : hours + 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutes}`;
};

const getStructuredHoursFromDisplay = (hours = "") => {
    const [openingDisplay, closingDisplay] = String(hours).split(/\s*-\s*/);
    const openingTime = parseDisplayTimeTo24Hour(openingDisplay);
    const closingTime = parseDisplayTimeTo24Hour(closingDisplay);

    if (!openingTime || !closingTime) {
        return null;
    }

    return { openingTime, closingTime };
};

const formatTimeForDisplay = (time = "") => {
    if (!isValidRestaurantTime(time)) {
        return "";
    }

    const [hourValue, minuteValue] = time.split(":").map(Number);
    const period = hourValue >= 12 ? "PM" : "AM";
    const displayHour = hourValue % 12 || 12;

    return `${displayHour}:${String(minuteValue).padStart(2, "0")} ${period}`;
};

const formatRestaurantHours = (openingTime, closingTime) => {
    return `${formatTimeForDisplay(openingTime)} - ${formatTimeForDisplay(closingTime)}`;
};

const normalizeRestaurantHours = (restaurant = {}) => {
    const parsedHours = getStructuredHoursFromDisplay(restaurant.hours);
    const openingTime = isValidRestaurantTime(restaurant.openingTime)
        ? restaurant.openingTime
        : parsedHours?.openingTime || DEFAULT_OPENING_TIME;
    const closingTime = isValidRestaurantTime(restaurant.closingTime)
        ? restaurant.closingTime
        : parsedHours?.closingTime || DEFAULT_CLOSING_TIME;

    return {
        ...restaurant,
        openingTime,
        closingTime
    };
};

const getRestaurants = () => {
    const savedRestaurants = getFromStorage(storageKeys.restaurants);
    const restaurants = Array.isArray(savedRestaurants)
        ? savedRestaurants
        : defaultRestaurants;

    return restaurants.map((restaurant) => ({
        ...normalizeRestaurantHours(restaurant),
        distanceCategory: restaurant.distanceCategory || "Medium",
        sustainabilityBadges: restaurant.sustainabilityBadges || [],
        allergenBadges: restaurant.allergenBadges || []
    }));
};

const saveRestaurants = (restaurants) => {
    saveToStorage(storageKeys.restaurants, restaurants.map(normalizeRestaurantHours));
};

const getPriceTiers = () => {
    const savedPriceTiers = getFromStorage(storageKeys.priceTiers) || {};

    return {
        ...defaultPriceTiers,
        ...savedPriceTiers
    };
};

const savePriceTiers = (priceTiers) => {
    saveToStorage(storageKeys.priceTiers, priceTiers);
};

const getReservations = () => {
    const reservations = getFromStorage(storageKeys.reservations);
    return Array.isArray(reservations) ? reservations : [];
};

const saveReservations = (reservations) => {
    saveToStorage(storageKeys.reservations, reservations);
};

const getWaitlist = () => {
    const waitlist = getFromStorage(storageKeys.waitlist);
    return Array.isArray(waitlist) ? waitlist : [];
};

const getActiveReservations = () => {
    return getReservations().filter(({ status }) => status === "active");
};

const getWaitingEntries = () => {
    return getWaitlist().filter(({ status }) => status === "waiting");
};

const getAverageRestaurantRating = () => {
    const ratings = getRestaurants()
        .map(({ rating }) => Number(rating))
        .filter((rating) => Number.isFinite(rating));

    if (ratings.length === 0) {
        return "0.0";
    }

    const total = ratings.reduce((sum, rating) => sum + rating, 0);
    return (total / ratings.length).toFixed(1);
};

const formatReservationDateTime = (reservation = {}) => {
    return [reservation.date, reservation.time].filter(Boolean).join(" at ") || "Time not set";
};

const formatUSD = (amount) => {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount) || 0);
};

const getTodayDateValue = () => {
    const today = new Date();
    return [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0")
    ].join("-");
};

const getReservationTimestamp = (reservation = {}) => {
    if (reservation.date && reservation.time) {
        const timestamp = new Date(`${reservation.date}T${reservation.time}`).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    return Number.MAX_SAFE_INTEGER;
};

const getReservationCreatedTimestamp = (reservation = {}) => {
    if (reservation.createdAt) {
        const timestamp = new Date(reservation.createdAt).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    const idTimestamp = String(reservation.reservationId || "").match(/(\d{10,})/);
    return idTimestamp ? Number(idTimestamp[1]) : 0;
};

const getReservationTotalAmount = (reservation = {}) => {
    return Number(reservation.splitBill?.totalAmount)
        || Number(reservation.pricing?.finalTotal)
        || 0;
};

const getAcceptedAttendeeCount = (reservation = {}) => {
    const acceptedGuests = Array.isArray(reservation.guests)
        ? reservation.guests.filter(({ rsvpStatus }) => rsvpStatus === "accepted").length
        : 0;

    return 1 + acceptedGuests;
};

const getReservationStatus = (reservation = {}) => reservation.status || "unknown";

const getKnownReservationStatuses = () => {
    const statuses = getReservations()
        .map(getReservationStatus)
        .filter(Boolean);

    return [...new Set(["active", "confirmed", "completed", "cancelled", ...statuses])];
};

const getReservationRestaurantOptions = () => {
    return [...new Set(getReservations()
        .map(({ restaurantName }) => restaurantName)
        .filter(Boolean))]
        .sort((firstName, secondName) => firstName.localeCompare(secondName));
};

const getReservationSummary = () => {
    const reservations = getReservations();
    const today = getTodayDateValue();

    return {
        total: reservations.length,
        active: reservations.filter(({ status }) => status === "active").length,
        upcomingToday: reservations.filter((reservation) => (
            reservation.date === today
            && ["active", "confirmed"].includes(reservation.status)
            && getReservationTimestamp(reservation) >= Date.now()
        )).length,
        completedOrCancelled: reservations.filter(({ status }) => (
            ["completed", "cancelled"].includes(status)
        )).length
    };
};

const getFilteredReservations = () => {
    const cleanSearchTerm = adminReservationSearchTerm.trim().toLowerCase();

    return getReservations()
        .filter((reservation) => {
            const searchableText = [
                reservation.guestName,
                reservation.guestEmail,
                reservation.restaurantName,
                reservation.reservationId
            ].filter(Boolean).join(" ").toLowerCase();

            return searchableText.includes(cleanSearchTerm);
        })
        .filter((reservation) => {
            return adminReservationStatusFilter === "all"
                || getReservationStatus(reservation) === adminReservationStatusFilter;
        })
        .filter((reservation) => {
            return adminReservationRestaurantFilter === "all"
                || reservation.restaurantName === adminReservationRestaurantFilter;
        })
        .filter((reservation) => {
            return !adminReservationDateFilter
                || reservation.date === adminReservationDateFilter;
        })
        .sort((firstReservation, secondReservation) => {
            if (adminReservationSort === "newest") {
                return getReservationCreatedTimestamp(secondReservation) - getReservationCreatedTimestamp(firstReservation);
            }

            if (adminReservationSort === "guest") {
                return String(firstReservation.guestName || "")
                    .localeCompare(String(secondReservation.guestName || ""));
            }

            return getReservationTimestamp(firstReservation) - getReservationTimestamp(secondReservation);
        });
};

const createCheckboxChoices = (options, selectedValues, inputName) => {
    return options.map((option) => `
        <label class="choice-chip">
            <input
                type="checkbox"
                name="${inputName}"
                value="${escapeHTML(option)}"
                ${selectedValues.includes(option) ? "checked" : ""}
            >
            <span>${escapeHTML(option)}</span>
        </label>
    `).join("");
};

const renderAdminRestaurantList = () => {
    const allRestaurants = getRestaurants();
    const cleanSearchTerm = adminRestaurantSearchTerm.trim().toLowerCase();
    const restaurants = allRestaurants.filter(({ name = "", cuisine = "", location = "" }) => {
        const searchableText = `${name} ${cuisine} ${location}`.toLowerCase();
        return searchableText.includes(cleanSearchTerm);
    });

    if (allRestaurants.length === 0) {
        return `
            <div class="empty-state">
                <h3>No restaurants found.</h3>
                <p>Add your first restaurant above.</p>
            </div>
        `;
    }

    if (restaurants.length === 0) {
        return `
            <div class="empty-state">
                <h3>No restaurants found.</h3>
                <p>Try a different restaurant name, cuisine, or location.</p>
            </div>
        `;
    }

    return restaurants.map(({ id, name, cuisine, location, rating, priceLevel }) => `
        <article class="admin-list-item restaurant-management-card">
            <div class="restaurant-management-main">
                <strong>${escapeHTML(name)}</strong>
                <span>${escapeHTML(cuisine)} in ${escapeHTML(location)}</span>
            </div>
            <div class="restaurant-management-meta">
                <span>Rating ${escapeHTML(rating)}</span>
                <span>${escapeHTML(priceLevel)}</span>
            </div>
            <div class="admin-list-actions">
                <button class="secondary-action" type="button" data-edit-restaurant-id="${id}">Edit</button>
                <button class="danger-action" type="button" data-delete-restaurant-id="${id}">Delete</button>
            </div>
        </article>
    `).join("");
};

const renderAdminTableLayout = () => {
    return defaultTableLayout.map(({ tableId, seats }) => `
        <span class="summary-chip">${escapeHTML(tableId)} &middot; ${seats} seats</span>
    `).join("");
};

const createRestaurantFormPanel = () => `
    <section class="profile-panel admin-panel" id="restaurantManagerPanel">
        <div class="form-heading">
            <p class="eyebrow">Restaurant manager</p>
            <h3>${editingRestaurantId ? "Edit restaurant" : "Add a restaurant"}</h3>
        </div>

        <form class="admin-form" id="addRestaurantForm">
            <fieldset class="admin-form-section">
                <legend>Basic Information</legend>
                <div class="admin-form-grid">
                    <label>
                        Restaurant Name
                        <input type="text" name="name" required>
                    </label>
                    <label>
                        Cuisine
                        <input type="text" name="cuisine" required>
                    </label>
                    <label>
                        Location
                        <input type="text" name="location" required>
                    </label>
                    <label>
                        Opening Time
                        <input type="time" name="openingTime" required>
                    </label>
                    <label>
                        Closing Time
                        <input type="time" name="closingTime" required>
                    </label>
                </div>
            </fieldset>

            <fieldset class="admin-form-section">
                <legend>Restaurant Details</legend>
                <div class="admin-form-grid">
                    <label>
                        Rating
                        <input type="number" name="rating" min="0" max="5" step="0.1" required>
                    </label>
                    <label>
                        Price Level
                        <select name="priceLevel" required>
                            ${["$", "$$", "$$$", "$$$$"].map((priceLevel) => `
                                <option value="${priceLevel}">${priceLevel}</option>
                            `).join("")}
                        </select>
                    </label>
                    <label>
                        Distance Category
                        <select name="distanceCategory" required>
                            ${["Nearby", "Medium", "Far"].map((distanceCategory) => `
                                <option value="${distanceCategory}">${distanceCategory}</option>
                            `).join("")}
                        </select>
                    </label>
                    <label>
                        Standard Badges
                        <input type="text" name="badges" placeholder="Patio, Seafood, Date night">
                    </label>
                </div>
            </fieldset>

            <fieldset class="admin-form-section">
                <legend>Sustainability and Allergens</legend>
                <div class="admin-form-grid">
                    <fieldset class="admin-checkbox-group">
                        <legend>Sustainability Badges</legend>
                        <div class="choice-grid compact">
                            ${createCheckboxChoices(sustainabilityBadgeOptions, [], "sustainabilityBadges")}
                        </div>
                    </fieldset>
                    <fieldset class="admin-checkbox-group">
                        <legend>Allergen Badges</legend>
                        <div class="choice-grid compact">
                            ${createCheckboxChoices(allergenBadgeOptions, [], "allergenBadges")}
                        </div>
                    </fieldset>
                </div>
            </fieldset>

            <fieldset class="admin-form-section">
                <legend>Media</legend>
                <div class="admin-form-grid media-form-grid">
                    <label>
                        Image URL
                        <input type="url" name="image" id="restaurantImageInput" required>
                    </label>
                    <div class="restaurant-image-preview" id="restaurantImagePreview" aria-live="polite">
                        <span>Image preview</span>
                    </div>
                </div>
            </fieldset>

            <div class="admin-form-actions">
                <button class="primary-action" type="submit" id="restaurantSubmitButton">
                    ${editingRestaurantId ? "Update Restaurant" : "Add Restaurant"}
                </button>
                <button class="secondary-action" type="button" id="cancelEditRestaurantButton" ${editingRestaurantId ? "" : "hidden"}>Cancel Edit</button>
            </div>
        </form>
    </section>
`;

const createPriceTiersPanel = () => {
    const priceTiers = getPriceTiers();

    return `
        <section class="profile-panel admin-panel">
            <div class="form-heading">
                <p class="eyebrow">Price tiers</p>
                <h3>Table fees</h3>
            </div>
            <div class="price-tier-grid">
                ${Object.keys(defaultPriceTiers).map((seats) => `
                    <label>
                        ${seats} seats
                        <input type="number" min="0" step="1" value="${priceTiers[seats]}" data-price-tier-seats="${seats}">
                    </label>
                `).join("")}
            </div>
        </section>
    `;
};

const createTableLayoutPanel = () => `
    <section class="profile-panel admin-panel">
        <div class="form-heading">
            <p class="eyebrow">Default layout</p>
            <h3>Table map reference</h3>
        </div>
        <div class="admin-table-layout">
            ${renderAdminTableLayout()}
        </div>
    </section>
`;

const createSavedRestaurantsPanel = () => `
    <section class="profile-panel admin-panel admin-panel-wide">
        <div class="restaurant-list-header">
            <div class="form-heading">
                <p class="eyebrow">Saved restaurants</p>
                <h3>${getRestaurants().length} restaurants</h3>
            </div>
            <label class="admin-search-field">
                <span>Search saved restaurants</span>
                <input
                    type="search"
                    id="adminRestaurantSearch"
                    value="${escapeHTML(adminRestaurantSearchTerm)}"
                    placeholder="Search by name, cuisine, or location"
                    autocomplete="off"
                >
            </label>
        </div>
        <div class="admin-list" id="adminRestaurantList">
            ${renderAdminRestaurantList()}
        </div>
        <button class="secondary-action" type="button" id="resetAdminDataButton">Reset Restaurants and Price Tiers</button>
    </section>
`;

const attachManagementHandlers = () => {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    const restaurantForm = adminView.querySelector("#addRestaurantForm");
    const cancelEditButton = adminView.querySelector("#cancelEditRestaurantButton");
    const resetButton = adminView.querySelector("#resetAdminDataButton");
    const restaurantSearch = adminView.querySelector("#adminRestaurantSearch");
    const imageInput = adminView.querySelector("#restaurantImageInput");
    const reservationSearch = adminView.querySelector("#reservationSearchInput");
    const reservationStatusFilter = adminView.querySelector("#reservationStatusFilter");
    const reservationRestaurantFilter = adminView.querySelector("#reservationRestaurantFilter");
    const reservationDateFilter = adminView.querySelector("#reservationDateFilter");
    const reservationSortSelect = adminView.querySelector("#reservationSortSelect");

    if (restaurantForm) {
        restaurantForm.addEventListener("submit", handleAddRestaurant);
    }

    adminView.querySelectorAll("[data-edit-restaurant-id]").forEach((button) => {
        button.addEventListener("click", () => startEditRestaurant(button.dataset.editRestaurantId));
    });
    adminView.querySelectorAll("[data-delete-restaurant-id]").forEach((button) => {
        button.addEventListener("click", handleDeleteRestaurant);
    });
    adminView.querySelectorAll("[data-price-tier-seats]").forEach((input) => {
        input.addEventListener("change", handlePriceTierUpdate);
    });

    if (cancelEditButton) {
        cancelEditButton.addEventListener("click", cancelRestaurantEdit);
    }

    if (resetButton) {
        resetButton.addEventListener("click", resetAdminData);
    }

    if (restaurantSearch) {
        restaurantSearch.addEventListener("input", (event) => {
            adminRestaurantSearchTerm = event.target.value;
            updateAdminRestaurantList();
        });
    }

    if (imageInput) {
        imageInput.addEventListener("input", () => updateRestaurantImagePreview(imageInput.value));
        updateRestaurantImagePreview(imageInput.value);
    }

    if (reservationSearch) {
        reservationSearch.addEventListener("input", (event) => {
            adminReservationSearchTerm = event.target.value;
            updateReservationManagementList();
        });
    }

    if (reservationStatusFilter) {
        reservationStatusFilter.addEventListener("change", (event) => {
            adminReservationStatusFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationRestaurantFilter) {
        reservationRestaurantFilter.addEventListener("change", (event) => {
            adminReservationRestaurantFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationDateFilter) {
        reservationDateFilter.addEventListener("change", (event) => {
            adminReservationDateFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationSortSelect) {
        reservationSortSelect.addEventListener("change", (event) => {
            adminReservationSort = event.target.value;
            renderActiveAdminSection();
        });
    }

    attachReservationListHandlers();

    if (editingRestaurantId && restaurantForm) {
        const restaurant = getRestaurants().find(({ id }) => String(id) === String(editingRestaurantId));

        if (restaurant) {
            fillRestaurantForm(restaurant);
        }
    }
};

const updateAdminRestaurantList = () => {
    const restaurantList = document.querySelector("#adminRestaurantList");

    if (restaurantList) {
        restaurantList.innerHTML = renderAdminRestaurantList();
    }
};

const attachReservationListHandlers = () => {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    adminView.querySelectorAll("[data-reservation-status-id]").forEach((select) => {
        select.addEventListener("change", handleReservationStatusChange);
    });

    adminView.querySelectorAll("[data-reservation-details-id]").forEach((button) => {
        button.addEventListener("click", () => {
            expandedReservationId = expandedReservationId === button.dataset.reservationDetailsId
                ? null
                : button.dataset.reservationDetailsId;
            updateReservationManagementList();
        });
    });
};

const updateReservationManagementList = () => {
    const reservationList = document.querySelector("#reservationManagementList");
    const reservationCount = document.querySelector("#reservationShownCount");

    if (reservationList) {
        reservationList.innerHTML = renderReservationList();
        attachReservationListHandlers();
    }

    if (reservationCount) {
        reservationCount.textContent = `${getFilteredReservations().length} shown`;
    }
};

const isPreviewableImageURL = (imageUrl = "") => {
    try {
        const parsedUrl = new URL(imageUrl);
        return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
};

const updateRestaurantImagePreview = (imageUrl = "") => {
    const preview = document.querySelector("#restaurantImagePreview");

    if (!preview) {
        return;
    }

    if (!isPreviewableImageURL(imageUrl)) {
        preview.innerHTML = "<span>Image preview</span>";
        preview.classList.remove("has-image");
        return;
    }

    preview.innerHTML = `<img src="${escapeHTML(imageUrl)}" alt="Restaurant image preview">`;
    preview.classList.add("has-image");

    const previewImage = preview.querySelector("img");

    if (previewImage) {
        previewImage.addEventListener("error", () => {
            preview.innerHTML = "<span>Image preview</span>";
            preview.classList.remove("has-image");
        });
    }
};

const getSectionMeta = (section = activeAdminSection) => {
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
            title: "Tables",
            subtitle: "Review table layout references and manage table fee tiers."
        },
        settings: {
            title: "Settings",
            subtitle: "Access reset actions and admin portal controls."
        }
    };

    return sectionMeta[section] || sectionMeta.dashboard;
};

const renderOverviewCards = () => {
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
};

const renderRecentReservations = (limit = 5) => {
    const reservations = getReservations()
        .slice()
        .sort((firstReservation, secondReservation) => {
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

    return reservations.map((reservation) => `
        <article class="reservation-list-item">
            <div>
                <strong>${escapeHTML(reservation.guestName || "Guest")}</strong>
                <p>${escapeHTML(reservation.restaurantName || "Restaurant not set")} &middot; ${escapeHTML(formatReservationDateTime(reservation))}</p>
            </div>
            <span class="reservation-meta">${escapeHTML(reservation.status || "unknown")}</span>
        </article>
    `).join("");
};

const renderReservationSummaryCards = () => {
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
};

const renderReservationControls = () => `
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
                    ${getKnownReservationStatuses().map((status) => `
                        <option value="${escapeHTML(status)}" ${adminReservationStatusFilter === status ? "selected" : ""}>
                            ${escapeHTML(status)}
                        </option>
                    `).join("")}
                </select>
            </label>
            <label>
                Restaurant
                <select id="reservationRestaurantFilter">
                    <option value="all">All restaurants</option>
                    ${getReservationRestaurantOptions().map((restaurantName) => `
                        <option value="${escapeHTML(restaurantName)}" ${adminReservationRestaurantFilter === restaurantName ? "selected" : ""}>
                            ${escapeHTML(restaurantName)}
                        </option>
                    `).join("")}
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

const renderStatusBadge = (status = "unknown") => {
    const normalizedStatus = String(status || "unknown").toLowerCase();
    return `<span class="reservation-status-badge status-${escapeHTML(normalizedStatus)}">${escapeHTML(normalizedStatus)}</span>`;
};

const renderReservationDetails = (reservation = {}) => {
    const guests = Array.isArray(reservation.guests) ? reservation.guests : [];
    const splitBill = reservation.splitBill || {};
    const preOrderItems = Array.isArray(reservation.preOrder?.items) ? reservation.preOrder.items : [];
    const pricing = reservation.pricing || {};

    return `
        <div class="reservation-details-panel">
            <section>
                <h3>Invited guests</h3>
                ${guests.length === 0 ? `<p class="summary-muted">No invited guests.</p>` : `
                    <div class="reservation-detail-list">
                        ${guests.map(({ name, email, rsvpStatus }) => `
                            <div>
                                <strong>${escapeHTML(name || "Guest")}</strong>
                                <span>${escapeHTML(email || "No email")} &middot; ${escapeHTML(rsvpStatus || "pending")}</span>
                            </div>
                        `).join("")}
                    </div>
                `}
            </section>
            <section>
                <h3>Split bill</h3>
                <div class="reservation-detail-list">
                    <div><span>Reservation total</span><strong>${formatUSD(splitBill.reservationTotal || pricing.finalTotal || 0)}</strong></div>
                    <div><span>Pre-order subtotal</span><strong>${formatUSD(splitBill.preOrderSubtotal || reservation.preOrder?.subtotal || 0)}</strong></div>
                    <div><span>Total amount</span><strong>${formatUSD(splitBill.totalAmount || getReservationTotalAmount(reservation))}</strong></div>
                    <div><span>Participants</span><strong>${escapeHTML(splitBill.participantCount || getAcceptedAttendeeCount(reservation))}</strong></div>
                    ${(splitBill.participants || []).map(({ name, email, share }) => `
                        <div>
                            <span>${escapeHTML(email || "No email")}</span>
                            <strong>${escapeHTML(name || "Participant")} &middot; ${formatUSD(share || 0)}</strong>
                        </div>
                    `).join("")}
                </div>
            </section>
            <section>
                <h3>Pre-order items</h3>
                ${preOrderItems.length === 0 ? `<p class="summary-muted">No pre-order items.</p>` : `
                    <div class="reservation-detail-list">
                        ${preOrderItems.map(({ name, quantity, price }) => `
                            <div>
                                <strong>${escapeHTML(name || "Item")}</strong>
                                <span>${escapeHTML(quantity || 0)} x ${formatUSD(price || 0)}</span>
                            </div>
                        `).join("")}
                    </div>
                `}
            </section>
            <section>
                <h3>Pricing breakdown</h3>
                <div class="reservation-detail-list">
                    <div><span>Table fee</span><strong>${formatUSD(pricing.tableFee || 0)}</strong></div>
                    <div><span>Time adjustment</span><strong>${formatUSD(pricing.timeAdjustment || 0)}</strong></div>
                    <div><span>Coupon discount</span><strong>${formatUSD(pricing.couponDiscount || 0)}</strong></div>
                    <div><span>Member discount</span><strong>${formatUSD(pricing.memberDiscount || 0)}</strong></div>
                    <div><span>Final total</span><strong>${formatUSD(pricing.finalTotal || 0)}</strong></div>
                </div>
            </section>
            <section>
                <h3>QR/check-in code</h3>
                <p class="profile-message">${escapeHTML(reservation.checkInCode || "No check-in code available")}</p>
            </section>
        </div>
    `;
};

const renderReservationList = () => {
    const reservations = getFilteredReservations();

    if (reservations.length === 0) {
        return `
            <div class="empty-state reservation-empty-state">
                <h3>No reservations match your filters.</h3>
                <p>Adjust search, status, restaurant, date, or sorting controls.</p>
            </div>
        `;
    }

    return reservations.map((reservation) => {
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
                            ${["active", "confirmed", "completed", "cancelled"].map((status) => `
                                <option value="${status}" ${getReservationStatus(reservation) === status ? "selected" : ""}>${status}</option>
                            `).join("")}
                        </select>
                    </label>
                    <button class="secondary-action" type="button" data-reservation-details-id="${escapeHTML(reservationId)}">
                        ${isExpanded ? "Hide Details" : "View Details"}
                    </button>
                </div>
                ${isExpanded ? renderReservationDetails(reservation) : ""}
            </article>
        `;
    }).join("");
};

const renderDashboardView = () => `
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

const renderRestaurantManagerView = () => `
    <section class="admin-section admin-view">
        ${createRestaurantFormPanel()}
        ${createSavedRestaurantsPanel()}
    </section>
`;

const renderReservationsView = () => `
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

const renderTablesView = () => `
    <section class="admin-section admin-view">
        ${createPriceTiersPanel()}
        ${createTableLayoutPanel()}
    </section>
`;

const renderSettingsView = () => `
    <section class="admin-section">
        <section class="profile-panel admin-panel">
            <div class="form-heading">
                <p class="eyebrow">Portal settings</p>
                <h2>Admin controls</h2>
            </div>
            <div class="settings-list">
                <article class="settings-row">
                    <span class="settings-detail">Shared restaurant storage</span>
                    <strong>${storageKeys.restaurants}</strong>
                    <p>Restaurant manager changes continue to use the existing customer-facing dataset.</p>
                </article>
                <article class="settings-row">
                    <span class="settings-detail">Shared pricing storage</span>
                    <strong>${storageKeys.priceTiers}</strong>
                    <p>Table fees continue to use the existing pricing data key.</p>
                </article>
            </div>
            <button class="secondary-action" type="button" id="resetAdminDataButton">Reset Restaurants and Price Tiers</button>
        </section>
    </section>
`;

const getSectionHTML = () => {
    const renderers = {
        dashboard: renderDashboardView,
        restaurants: renderRestaurantManagerView,
        reservations: renderReservationsView,
        tables: renderTablesView,
        settings: renderSettingsView
    };

    return (renderers[activeAdminSection] || renderDashboardView)();
};

const updateSectionNavigation = () => {
    document.querySelectorAll("[data-admin-section]").forEach((button) => {
        button.classList.toggle("is-active", button.dataset.adminSection === activeAdminSection);
    });
};

const updateAdminHeader = () => {
    const title = document.querySelector("#adminPageTitle");
    const subtitle = document.querySelector("#adminPageSubtitle");
    const meta = getSectionMeta();

    if (title) {
        title.textContent = meta.title;
    }

    if (subtitle) {
        subtitle.textContent = meta.subtitle;
    }
};

const renderActiveAdminSection = () => {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    updateAdminHeader();
    updateSectionNavigation();
    adminView.innerHTML = getSectionHTML();
    attachManagementHandlers();

    adminView.querySelectorAll("[data-admin-section-target]").forEach((button) => {
        button.addEventListener("click", () => setActiveAdminSection(button.dataset.adminSectionTarget));
    });
};

const setActiveAdminSection = (section) => {
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
};

const getRestaurantDataFromForm = (formData) => {
    const openingTime = isValidRestaurantTime(getFormValue(formData, "openingTime"))
        ? getFormValue(formData, "openingTime")
        : DEFAULT_OPENING_TIME;
    const closingTime = isValidRestaurantTime(getFormValue(formData, "closingTime"))
        ? getFormValue(formData, "closingTime")
        : DEFAULT_CLOSING_TIME;

    return {
        name: getFormValue(formData, "name"),
        cuisine: getFormValue(formData, "cuisine"),
        location: getFormValue(formData, "location"),
        hours: formatRestaurantHours(openingTime, closingTime),
        openingTime,
        closingTime,
        rating: Number(formData.get("rating")) || 0,
        priceLevel: formData.get("priceLevel") || "$$",
        distanceCategory: formData.get("distanceCategory") || "Medium",
        sustainabilityBadges: formData.getAll("sustainabilityBadges"),
        allergenBadges: formData.getAll("allergenBadges"),
        badges: getFormValue(formData, "badges")
            .split(",")
            .map((badge) => badge.trim())
            .filter(Boolean),
        image: getFormValue(formData, "image")
    };
};

const handleAddRestaurant = (event) => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const restaurantData = getRestaurantDataFromForm(formData);

    if (editingRestaurantId) {
        updateRestaurant(editingRestaurantId, restaurantData);
    } else {
        saveRestaurants([...getRestaurants(), {
            id: Date.now(),
            ...restaurantData,
            menu: []
        }]);
    }

    editingRestaurantId = null;
    renderActiveAdminSection();
};

const fillRestaurantForm = (restaurant) => {
    const form = document.querySelector("#addRestaurantForm");

    if (!form) {
        return;
    }

    form.elements.name.value = restaurant.name || "";
    form.elements.cuisine.value = restaurant.cuisine || "";
    form.elements.location.value = restaurant.location || "";
    form.elements.openingTime.value = restaurant.openingTime || DEFAULT_OPENING_TIME;
    form.elements.closingTime.value = restaurant.closingTime || DEFAULT_CLOSING_TIME;
    form.elements.rating.value = restaurant.rating || "";
    form.elements.priceLevel.value = restaurant.priceLevel || "$$";
    form.elements.distanceCategory.value = restaurant.distanceCategory || "Medium";
    form.elements.badges.value = (restaurant.badges || []).join(", ");
    form.querySelectorAll('input[name="sustainabilityBadges"]').forEach((input) => {
        input.checked = (restaurant.sustainabilityBadges || []).includes(input.value);
    });
    form.querySelectorAll('input[name="allergenBadges"]').forEach((input) => {
        input.checked = (restaurant.allergenBadges || []).includes(input.value);
    });
    form.elements.image.value = restaurant.image || "";
    updateRestaurantImagePreview(restaurant.image || "");
    form.scrollIntoView({ behavior: "smooth", block: "start" });
};

const startEditRestaurant = (restaurantId) => {
    const restaurant = getRestaurants().find(({ id }) => String(id) === String(restaurantId));

    if (!restaurant) {
        return;
    }

    editingRestaurantId = restaurant.id;
    renderActiveAdminSection();
};

const updateRestaurant = (restaurantId, updatedData) => {
    saveRestaurants(getRestaurants().map((restaurant) => {
        if (String(restaurant.id) !== String(restaurantId)) {
            return restaurant;
        }

        return {
            ...restaurant,
            ...updatedData,
            id: restaurant.id,
            menu: restaurant.menu || []
        };
    }));
};

const cancelRestaurantEdit = () => {
    editingRestaurantId = null;
    renderActiveAdminSection();
};

const handleDeleteRestaurant = (event) => {
    const restaurantId = event.currentTarget.dataset.deleteRestaurantId;

    saveRestaurants(getRestaurants().filter(({ id }) => String(id) !== String(restaurantId)));

    if (String(editingRestaurantId) === String(restaurantId)) {
        editingRestaurantId = null;
    }

    renderActiveAdminSection();
};

const handlePriceTierUpdate = (event) => {
    const seats = event.target.dataset.priceTierSeats;
    const nextPriceTiers = {
        ...getPriceTiers(),
        [seats]: Math.max(0, Number(event.target.value) || 0)
    };

    savePriceTiers(nextPriceTiers);
    event.target.value = nextPriceTiers[seats];
};

const handleReservationStatusChange = (event) => {
    const reservationId = event.target.dataset.reservationStatusId;
    const nextStatus = event.target.value;

    saveReservations(getReservations().map((reservation) => {
        if (String(reservation.reservationId) !== String(reservationId)) {
            return reservation;
        }

        return {
            ...reservation,
            status: nextStatus
        };
    }));

    renderActiveAdminSection();
};

const resetAdminData = () => {
    editingRestaurantId = null;
    saveRestaurants(defaultRestaurants);
    savePriceTiers(defaultPriceTiers);
    renderActiveAdminSection();
};

const showAdminLoginMessage = (message) => {
    const messageElement = document.querySelector("#adminLoginMessage");

    if (!messageElement) {
        return;
    }

    messageElement.textContent = message;
    messageElement.hidden = !message;
};

const handlePasswordToggle = (event) => {
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
};

const handleAdminLoginSubmit = (event) => {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = getFormValue(formData, "email");
    const password = String(formData.get("password") || "");

    if (!email || !password || !isValidEmail(email)) {
        showAdminLoginMessage("Enter the admin email and password.");
        return;
    }

    const adminUser = findUserByEmail(email);

    if (
        normalizeEmail(email) !== ADMIN_EMAIL
        || !adminUser
        || adminUser.password !== password
    ) {
        clearAdminSession();
        showAdminLoginMessage("Invalid admin credentials.");
        return;
    }

    saveAdminSession(adminUser);
    window.location.replace("./index.html");
};

const setupLoginPage = () => {
    const loginForm = document.querySelector("#adminLoginForm");
    const passwordToggle = document.querySelector("[data-admin-password-toggle]");

    if (hasValidAdminSession()) {
        window.location.replace("./index.html");
        return;
    }

    if (loginForm) {
        loginForm.addEventListener("submit", handleAdminLoginSubmit);
        loginForm.addEventListener("input", () => showAdminLoginMessage(""));
    }

    if (passwordToggle) {
        passwordToggle.addEventListener("click", handlePasswordToggle);
    }
};

const setupDashboardPage = () => {
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

    document.querySelectorAll("[data-admin-section]").forEach((button) => {
        button.addEventListener("click", () => setActiveAdminSection(button.dataset.adminSection));
    });

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", () => {
            const isOpen = sidebar.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    if (viewCustomerSiteButton) {
        viewCustomerSiteButton.addEventListener("click", () => {
            window.location.href = "../index.html";
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", () => {
            clearAdminSession();
            window.location.replace("./login.html");
        });
    }
};

const setupAdminPortal = () => {
    const page = document.body.dataset.adminPage;

    if (page === "login") {
        setupLoginPage();
        return;
    }

    if (page === "dashboard") {
        setupDashboardPage();
    }
};

setupAdminPortal();
