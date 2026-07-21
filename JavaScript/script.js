let bookingTableSelector3DModule = null;
let bookingTableSelector3DInitToken = 0;
const bookingTableSelector3DModulePromise = import("./booking-table-selector-3d.js")
    .then(function(module) {
        bookingTableSelector3DModule = module;
        return module;
    })
    .catch(function(error) {
        console.warn("Interactive 3D floor module unavailable; table cards will be shown.", error);
        return null;
    });

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

const filters = ["Mediterranean", "Japanese", "Indian", "Mexican", "French", "Rooftop", "Family Friendly"];
const favoriteCuisineOptions = ["Mediterranean", "Japanese", "Indian", "Mexican", "French", "Modern American"];
const dietaryTagOptions = ["Vegetarian", "Vegan", "Gluten free", "Halal", "Seafood", "Organic"];
const contactPreferenceOptions = ["Email", "SMS", "Phone Call"];
const peakHours = ["18:00", "19:00", "20:00", "21:00"];
const offPeakHours = ["11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
const memberDiscountRates = {
    Standard: 0,
    Silver: 0.1,
    Gold: 0.2
};
const defaultPriceTiers = {
    2: 0,
    4: 10,
    6: 20,
    8: 30
};
const TABLE_EXPERIENCES = {
    Regular: {
        fee: 0,
        subtitle: "Classic seating · Included",
        benefits: "Classic restaurant seating"
    },
    Premium: {
        fee: 15,
        subtitle: "Preferred placement · +$15",
        benefits: "Enhanced location · Priority assistance"
    },
    VIP: {
        fee: 35,
        subtitle: "Exclusive service · +$35",
        benefits: "Priority seating · Welcome service"
    }
};
const DEFAULT_TABLE_EXPERIENCE_BY_ID = {
    A1: "Regular",
    A2: "Premium",
    A3: "Regular",
    A4: "VIP",
    B1: "Premium",
    B2: "Regular",
    B3: "Premium",
    B4: "Regular",
    C1: "Regular",
    C2: "Premium",
    D1: "VIP",
    D2: "Premium"
};
const defaultTableLayout = [
    { tableId: "A1", seats: 2, experience: "Regular" },
    { tableId: "A2", seats: 2, experience: "Premium" },
    { tableId: "A3", seats: 2, experience: "Regular" },
    { tableId: "A4", seats: 2, experience: "VIP" },
    { tableId: "B1", seats: 4, experience: "Premium" },
    { tableId: "B2", seats: 4, experience: "Regular" },
    { tableId: "B3", seats: 4, experience: "Premium" },
    { tableId: "B4", seats: 4, experience: "Regular" },
    { tableId: "C1", seats: 6, experience: "Regular" },
    { tableId: "C2", seats: 6, experience: "Premium" },
    { tableId: "D1", seats: 8, experience: "VIP" },
    { tableId: "D2", seats: 8, experience: "Premium" }
];
const MAX_ACTIVE_RESERVATIONS = 3;
const BOOKING_TIME_ZONE = "Asia/Dubai";
const TIME_SLOT_INTERVAL_MINUTES = 30;
const DEFAULT_OPENING_TIME = "11:00";
const DEFAULT_CLOSING_TIME = "22:00";
const ADMIN_EMAIL = "firezzutkay@gmail.com";
const USER_ROLES = {
    admin: "admin",
    guest: "guest"
};

const storageKeys = {
    searchTerm: "searchTerm",
    activeFilter: "activeFilter",
    authSession: "authSession",
    adminSession: "adminSession",
    currentUserId: "currentUserId",
    guestProfile: "guestProfile",
    pendingAction: "pendingAction",
    users: "users",
    reservations: "reservations",
    waitlist: "waitlist",
    restaurants: "restaurants",
    priceTiers: "priceTiers",
    contactMessages: "contactMessages"
};

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : null;
}

function removeFromStorage(key) {
    localStorage.removeItem(key);
}

function containsOnlyDigits(value) {
    const text = String(value);

    if (!text) {
        return false;
    }

    for (const character of text) {
        if (character < "0" || character > "9") {
            return false;
        }
    }

    return true;
}

function containsWhitespace(value) {
    for (const character of String(value)) {
        if (character.trim() === "") {
            return true;
        }
    }

    return false;
}

function isValidRestaurantTime(time = "") {
    const timeParts = String(time).split(":");

    if (timeParts.length !== 2) {
        return false;
    }

    const [hoursText, minutesText] = timeParts;

    if (
        hoursText.length !== 2
        || minutesText.length !== 2
        || !containsOnlyDigits(hoursText)
        || !containsOnlyDigits(minutesText)
    ) {
        return false;
    }

    const hours = Number(hoursText);
    const minutes = Number(minutesText);
    return hours <= 23 && minutes <= 59;
}

function formatTimeFromMinutes(totalMinutes = 0) {
    const minutesInDay = 24 * 60;
    const normalizedMinutes = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
    const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
    const minutes = String(normalizedMinutes % 60).padStart(2, "0");

    return `${hours}:${minutes}`;
}

function parseDisplayTimeTo24Hour(displayTime = "") {
    const normalizedTime = String(displayTime).trim().toUpperCase();
    let period = "";

    if (normalizedTime.endsWith("AM")) {
        period = "AM";
    } else if (normalizedTime.endsWith("PM")) {
        period = "PM";
    }

    if (!period) {
        return "";
    }

    const clockText = normalizedTime.slice(0, -2).trim();
    const clockParts = clockText.split(":");

    if (clockParts.length > 2) {
        return "";
    }

    const hoursText = clockParts[0];
    const minutesText = clockParts.length === 2 ? clockParts[1] : "00";

    if (
        hoursText.length < 1
        || hoursText.length > 2
        || minutesText.length !== 2
        || !containsOnlyDigits(hoursText)
        || !containsOnlyDigits(minutesText)
    ) {
        return "";
    }

    let hours = Number(hoursText);
    const minutes = Number(minutesText);

    if (hours < 1 || hours > 12 || minutes > 59) {
        return "";
    }

    if (period === "AM") {
        hours = hours === 12 ? 0 : hours;
    } else {
        hours = hours === 12 ? 12 : hours + 12;
    }

    return `${String(hours).padStart(2, "0")}:${minutesText}`;
}

function getStructuredHoursFromDisplay(hours = "") {
    const hourParts = String(hours).split("-");
    const openingDisplay = hourParts[0]?.trim();
    const closingDisplay = hourParts[1]?.trim();
    const openingTime = parseDisplayTimeTo24Hour(openingDisplay);
    const closingTime = parseDisplayTimeTo24Hour(closingDisplay);

    if (!openingTime || !closingTime) {
        return null;
    }

    return {
        openingTime,
        closingTime
    };
}

function normalizeRestaurantHours(restaurant = {}) {
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
}

function normalizeTableExperience(experience, tableId = "") {
    if (Object.hasOwn(TABLE_EXPERIENCES, experience)) {
        return experience;
    }

    return DEFAULT_TABLE_EXPERIENCE_BY_ID[String(tableId).trim().toUpperCase()] || "Regular";
}

function normalizeRestaurantTableLayout(tableLayout) {
    const hasSavedLayout = Array.isArray(tableLayout);
    const sourceLayout = hasSavedLayout ? tableLayout : defaultTableLayout;
    const seenTableIds = new Set();

    return sourceLayout.reduce(function(layout, table = {}) {
        const tableId = String(table.tableId || "").trim();
        const seats = Math.floor(Number(table.seats));
        const experience = normalizeTableExperience(table.experience, tableId);
        const normalizedTableId = tableId.toLowerCase();

        if (!tableId || !Number.isFinite(seats) || seats < 1 || seenTableIds.has(normalizedTableId)) {
            return layout;
        }

        seenTableIds.add(normalizedTableId);
        layout.push({ tableId, seats, experience });
        return layout;
    }, []);
}

function getRestaurants() {
    const savedRestaurants = getFromStorage(storageKeys.restaurants);
    const restaurants = Array.isArray(savedRestaurants)
        ? savedRestaurants
        : defaultRestaurants;

    return restaurants.map(function(restaurant) {
        return ({
            ...normalizeRestaurantHours(restaurant),
            distanceCategory: restaurant.distanceCategory || "Medium",
            sustainabilityBadges: restaurant.sustainabilityBadges || [],
            allergenBadges: restaurant.allergenBadges || [],
            tableLayout: normalizeRestaurantTableLayout(restaurant.tableLayout)
        });
    });
}

function saveRestaurants(restaurants) {
    saveToStorage(storageKeys.restaurants, restaurants.map(function(restaurant) {
        return ({
            ...normalizeRestaurantHours(restaurant),
            tableLayout: normalizeRestaurantTableLayout(restaurant.tableLayout)
        });
    }));
}

function getPriceTiers() {
    const savedPriceTiers = getFromStorage(storageKeys.priceTiers) || {};

    return {
        ...defaultPriceTiers,
        ...savedPriceTiers
    };
}

function savePriceTiers(priceTiers) {
    saveToStorage(storageKeys.priceTiers, priceTiers);
}

let activeFilter = getFromStorage(storageKeys.activeFilter) || "All";
let searchTerm = getFromStorage(storageKeys.searchTerm) || "";
let profileMessage = "";
let authMessage = "";
let authErrors = {};
let authFormValues = {};
let authMode = "login";
let bookingState = {
    restaurantId: null,
    date: "",
    time: "11:00",
    tableId: "",
    selectedSeatIds: [],
    experienceFilter: "Regular",
    couponCode: "",
    memberTier: "Standard",
    invitedGuests: [],
    preOrderItems: {},
    confirmedReservation: null
};
let bookingMessage = "";
let invitedGuestMessage = "";
let seatSelectionMessage = "";
let smartMatchFilters = {
    mood: "Date Night",
    budget: "$$",
    distance: "Nearby"
};

function formatUSD(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(amount);
}

function formatDiscountUSD(amount) {
    return amount > 0 ? `-${formatUSD(amount)}` : formatUSD(0);
}

function getMemberDiscountLabel({ tier, rate }) {
    if (rate === 0) {
        return `${tier}`;
    }

    return `${tier}`;
}

function roundCurrency(amount) {
    return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function escapeHTML(text = "") {
    const replacements = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#039;"
    };
    let escapedText = "";

    for (const character of String(text)) {
        escapedText += replacements[character] || character;
    }

    return escapedText;
}

function createBadgeMarkup(badges, type = "") {
    const badgeTypeClass = type ? ` ${type}` : "";

    return badges.map(function(badge) {
        return `<span class="badge${badgeTypeClass}">${escapeHTML(badge)}</span>`;
    }).join("");
}

function createRestaurantBadgeSections({ badges = [], sustainabilityBadges = [], allergenBadges = [] }) {
    return `
        <div class="badges">
            ${createBadgeMarkup(badges)}
            ${createBadgeMarkup(sustainabilityBadges, "sustainability")}
            ${createBadgeMarkup(allergenBadges, "allergen")}
        </div>
    `;
}

function filterRestaurants() {
    const cleanSearchTerm = searchTerm.toLowerCase();
    const cleanActiveFilter = activeFilter.toLowerCase();

    return getRestaurants().filter(function(restaurant) {
        const { name, cuisine, location } = restaurant;
        const restaurantTags = getRestaurantSearchTags(restaurant).join(" ");
        const searchableText = `${name} ${cuisine} ${location} ${restaurantTags}`.toLowerCase();
        const categoryText = `${cuisine} ${restaurantTags}`.toLowerCase();
        const matchesSearch = searchableText.includes(cleanSearchTerm);
        const matchesCategory = activeFilter === "All" || categoryText.includes(cleanActiveFilter);

        return matchesSearch && matchesCategory;
    });
}

function createRestaurantCard(restaurant) {
    const { id, name, cuisine, rating, hours, priceLevel, location, image } = restaurant;

    return `
        <article class="restaurant-card">
            <div class="card-image">
                <span class="card-image-media" style="background-image: linear-gradient(180deg, rgba(10, 15, 20, 0.03), rgba(10, 15, 20, 0.28)), url('${image}')"></span>
            </div>

            <div class="card-body">
                <div class="card-meta">
                    <span class="rating">Rating ${rating}</span>
                    <span class="price">${priceLevel}</span>
                    <span class="cuisine">${cuisine}</span>
                </div>

                <h3>${name}</h3>
                <p class="location">${location}</p>

                <div class="meta-row">
                    <span>Open ${hours}</span>
                </div>

                ${createRestaurantBadgeSections(restaurant)}

                <button class="book-button" type="button" data-restaurant-id="${id}">
                    Start Booking
                </button>
            </div>
        </article>
    `;
}

function renderRestaurants() {
    const restaurantGrid = document.querySelector("#restaurantGrid");
    const restaurantList = filterRestaurants();

    if (restaurantList.length === 0) {
        restaurantGrid.innerHTML = `
            <div class="empty-state">
                <h3>No restaurants found</h3>
                <p>Try a different restaurant name, cuisine, location, or badge.</p>
            </div>
        `;
        return;
    }

    restaurantGrid.innerHTML = restaurantList.map(createRestaurantCard).join("");
}

function createFilterButton(filterName) {
    const isActive = filterName === activeFilter;

    return `
        <button class="filter-pill ${isActive ? "active" : ""}" type="button" data-filter="${filterName}">
            ${filterName}
        </button>
    `;
}

function renderFilters() {
    const filterPills = document.querySelector("#filterPills");
    const allFilters = ["All", ...filters];
    filterPills.innerHTML = allFilters.map(createFilterButton).join("");
}

function updateRestaurantResults() {
    renderFilters();
    renderRestaurants();
}

function getRestaurantSearchTags(restaurant) {
    const menuTags = (restaurant.menu || []).flatMap(function({ tags = [] }) {
        return tags;
    });

    return [
        restaurant.cuisine,
        restaurant.location,
        ...(restaurant.badges || []),
        ...(restaurant.sustainabilityBadges || []),
        ...(restaurant.allergenBadges || []),
        ...menuTags
    ].filter(Boolean).map(function(tag) {
        return tag.toLowerCase();
    });
}

function getRestaurantDistanceCategory(restaurant) {
    return restaurant.distanceCategory || "Medium";
}

function getDistanceLevel(distanceCategory = "Nearby") {
    const distanceLevels = {
        Nearby: 1,
        Medium: 2,
        Far: 3
    };

    return distanceLevels[distanceCategory] || distanceLevels.Medium;
}

function isWithinSmartDistance(restaurant, distance) {
    return getDistanceLevel(getRestaurantDistanceCategory(restaurant)) <= getDistanceLevel(distance);
}

function getMoodKeywords(mood) {
    const moodKeywords = {
        "Date Night": ["date night", "anniversary", "fine dining", "private dining", "wine list"],
        "Family Friendly": ["family friendly", "brunch", "organic", "vegetarian"],
        "Quick Bite": ["quick seating", "ramen", "tacos", "late night"],
        "Fine Dining": ["fine dining", "chef special", "wine list", "private dining"],
        Casual: ["patio", "rooftop", "brunch", "quick seating", "tacos"]
    };

    return moodKeywords[mood] || [];
}

function getBudgetLevel(priceLevel = "$") {
    return String(priceLevel).length;
}

function isWithinSmartBudget(restaurant, budget) {
    return getBudgetLevel(restaurant.priceLevel) <= getBudgetLevel(budget);
}

function calculateRestaurantScore(restaurant, profile = getGuestProfile(), filters = smartMatchFilters) {
    const favoriteCuisines = profile?.favoriteCuisines || [];
    const dietaryTags = profile?.dietaryTags || [];
    const restaurantTags = getRestaurantSearchTags(restaurant);
    let score = 0;
    let maxScore = 0;

    maxScore += 25;
    if (favoriteCuisines.some(function(cuisine) {
        return cuisine.toLowerCase() === restaurant.cuisine.toLowerCase();
    })) {
        score += 25;
    }

    maxScore += 20;
    if (dietaryTags.some(function(tag) {
        return restaurantTags.includes(tag.toLowerCase());
    })) {
        score += 20;
    }

    maxScore += 15;
    if (restaurant.priceLevel === filters.budget) {
        score += 15;
    }

    maxScore += 20;
    if (getMoodKeywords(filters.mood).some(function(keyword) {
        return restaurantTags.includes(keyword);
    })) {
        score += 20;
    }

    maxScore += 10;
    if (getRestaurantDistanceCategory(restaurant) === filters.distance) {
        score += 10;
    }

    maxScore += 10;
    score += Math.min(10, (Number(restaurant.rating) || 0) * 2);

    return {
        score,
        maxScore,
        percentage: Math.round((score / maxScore) * 100)
    };
}

function getSmartRecommendations() {
    const profile = getGuestProfile();

    return getRestaurants()
        .filter(function(restaurant) {
        return isWithinSmartBudget(restaurant, smartMatchFilters.budget);
    })
        .filter(function(restaurant) {
        return isWithinSmartDistance(restaurant, smartMatchFilters.distance);
    })
        .map(function(restaurant) {
            const match = calculateRestaurantScore(restaurant, profile, smartMatchFilters);

            return { ...restaurant, match };
        })
        .sort(function(firstRestaurant, secondRestaurant) {
            return secondRestaurant.match.score - firstRestaurant.match.score
                || Number(secondRestaurant.rating) - Number(firstRestaurant.rating);
        })
        .slice(0, 3);
}

function renderSmartConcierge() {
    const smartConciergeView = document.querySelector("#smartConciergeView");
    const profile = getGuestProfile();
    const recommendations = getSmartRecommendations();

    smartConciergeView.innerHTML = `
        <section class="profile-panel smart-panel">
            <div class="form-heading">
                <p class="eyebrow">Local scoring</p>
                <h3>Smart match filters</h3>
            </div>

            <div class="smart-filter-grid">
                <label>
                    Mood
                    <select data-smart-filter="mood">
                        ${["Date Night", "Family Friendly", "Quick Bite", "Fine Dining", "Casual"].map(function(mood) {
        return `
                                <option value="${mood}" ${smartMatchFilters.mood === mood ? "selected" : ""}>${mood}</option>
                            `;
    }).join("")}
                    </select>
                </label>
                <label>
                    Budget
                    <select data-smart-filter="budget">
                        ${["$", "$$", "$$$", "$$$$"].map(function(budget) {
        return `
                                <option value="${budget}" ${smartMatchFilters.budget === budget ? "selected" : ""}>${budget}</option>
                            `;
    }).join("")}
                    </select>
                </label>
                <label>
                    Distance
                    <select data-smart-filter="distance">
                        ${["Nearby", "Medium", "Far"].map(function(distance) {
        return `
                                <option value="${distance}" ${smartMatchFilters.distance === distance ? "selected" : ""}>${distance}</option>
                            `;
    }).join("")}
                    </select>
                </label>
            </div>
        </section>

        <section class="profile-panel smart-panel">
            <div class="form-heading">
                <p class="eyebrow">Top 3 matches</p>
                <h3>${profile ? "Recommended from your profile" : "Recommended from filters"}</h3>
            </div>
            <div class="smart-recommendation-grid">
                ${recommendations.map(function(restaurant) {
        return `
                        <article class="smart-recommendation-card">
                            <div class="smart-card-image" style="background-image: linear-gradient(180deg, rgba(10, 15, 20, 0.08), rgba(10, 15, 20, 0.55)), url('${restaurant.image}')">
                                <span>${restaurant.match.percentage}% match</span>
                            </div>
                            <div class="smart-card-body">
                                <div>
                                    <p class="location">${escapeHTML(restaurant.location)}</p>
                                    <h3>${escapeHTML(restaurant.name)}</h3>
                                </div>
                                <p>${escapeHTML(restaurant.cuisine)} - ${escapeHTML(restaurant.priceLevel)} - Rating ${escapeHTML(restaurant.rating)}</p>
                                ${createRestaurantBadgeSections(restaurant)}
                                <button class="book-button" type="button" data-restaurant-id="${restaurant.id}">
                                    Start Booking
                                </button>
                            </div>
                        </article>
                    `;
    }).join("")}
            </div>
        </section>
    `;

    smartConciergeView.querySelectorAll("[data-smart-filter]").forEach(function(input) {
        input.addEventListener("change", handleSmartMatchChange);
    });
}

function handleSmartMatchChange(event) {
    smartMatchFilters = {
        ...smartMatchFilters,
        [event.target.dataset.smartFilter]: event.target.value
    };

    renderSmartConcierge();
}

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

    return hasCompleteDomain
        && !containsWhitespace(accountName)
        && !containsWhitespace(domainName);
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
    ["name", "email", "subject", "message"].forEach(function(fieldName) {
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
    return [...form.querySelectorAll(`input[name="${inputName}"]:checked`)]
        .map(function({ value }) {
        return value;
    });
}

function getGuestInitials(name = "Guest") {
    return name
        .split(" ")
        .filter(Boolean)
        .map(function(part) {
        return part[0];
    })
        .slice(0, 2)
        .join("")
        .toUpperCase() || "G";
}

function getGuestProfile() {
    return getFromStorage(storageKeys.guestProfile);
}

function getRoleForEmail(email = "") {
    return normalizeEmail(email) === ADMIN_EMAIL
        ? USER_ROLES.admin
        : USER_ROLES.guest;
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
    const {
        id,
        name,
        email,
        phone,
        favoriteCuisines = [],
        dietaryTags = [],
        contactPreference = "Email"
    } = user;

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

    return getUsers().find(function(user) {
        return normalizeEmail(user.email) === normalizedEmail;
    });
}

function getCurrentUser() {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
        return null;
    }

    return getUsers().find(function(user) {
        return user.id === currentUserId;
    }) || null;
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
        profile
        && session
        && currentUser
        && session.userId === currentUser.id
        && profile.id === currentUser.id
        && normalizeEmail(profile.email) === normalizeEmail(session.email)
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

    return getReservations().filter(function({ guestUserId, guestEmail, guestPhone, status }) {
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
    const {
        id,
        name,
        email,
        phone,
        favoriteCuisines = [],
        dietaryTags = [],
        contactPreference = "Email"
    } = profile;

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

    return items.map(function(item) {
        return `<span class="summary-chip">${escapeHTML(item)}</span>`;
    }).join("");
}

function createCheckboxChoices(options, selectedOptions, inputName) {
    return options.map(function(option) {
        const isChecked = selectedOptions.includes(option);

        return `
            <label class="choice-chip">
                <input type="checkbox" name="${inputName}" value="${option}" ${isChecked ? "checked" : ""}>
                <span>${option}</span>
            </label>
        `;
    }).join("");
}

function createRadioChoices(options, selectedOption, inputName) {
    return options.map(function(option) {
        const isChecked = selectedOption === option;

        return `
            <label class="choice-chip">
                <input type="radio" name="${inputName}" value="${option}" ${isChecked ? "checked" : ""}>
                <span>${option}</span>
            </label>
        `;
    }).join("");
}

function getPreferenceCount({ favoriteCuisines = [], dietaryTags = [], contactPreference = "" }) {
    return favoriteCuisines.length + dietaryTags.length + (contactPreference ? 1 : 0);
}

function updateProfileSummary(profile = getGuestProfile(), message = profileMessage) {
    const profileSummary = document.querySelector("#profileSummary");

    if (!profileSummary || !profile) {
        return;
    }

    const {
        name,
        email,
        phone,
        favoriteCuisines = [],
        dietaryTags = [],
        contactPreference = ""
    } = profile;

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

            ${hasReachedCap ? `
                <p class="booking-warning">You cannot create more active bookings until one is cleared or completed.</p>
            ` : ""}

            <div class="booking-actions">
                <button class="secondary-action" type="button" id="ClearReservationsButton" ${!hasProfile || activeReservationCount === 0 ? "disabled" : ""}>
                    Clear Reservations
                </button>
            </div>
        </section>
    `;
}

function getUaeDateParts(date = new Date()) {
    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: BOOKING_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23"
    }).formatToParts(date);
    const dateParts = {};

    parts.forEach(function({ type, value }) {
        if (type !== "literal") {
            dateParts[type] = value;
        }
    });

    return dateParts;
}

function getTodayDateValue() {
    const { year, month, day } = getUaeDateParts();

    return `${year}-${month}-${day}`;
}

function getTimeMinutes(time = "") {
    const [hours = "0", minutes = "0"] = time.split(":");

    return (Number(hours) * 60) + Number(minutes);
}

function getCurrentUaeTimeMinutes() {
    const { hour, minute } = getUaeDateParts();

    return (Number(hour) * 60) + Number(minute);
}

function getRestaurantClosingMinutes(restaurant = getSelectedRestaurant()) {
    if (!restaurant) {
        return 0;
    }

    const openingMinutes = getTimeMinutes(restaurant.openingTime);
    const closingMinutes = getTimeMinutes(restaurant.closingTime);

    if (closingMinutes === 0 && openingMinutes > 0) {
        return 24 * 60;
    }

    if (closingMinutes <= openingMinutes) {
        return closingMinutes + (24 * 60);
    }

    return closingMinutes;
}

function getRestaurantTimeSlots(restaurant = getSelectedRestaurant()) {
    if (!restaurant || !isValidRestaurantTime(restaurant.openingTime) || !isValidRestaurantTime(restaurant.closingTime)) {
        return [];
    }

    const openingMinutes = getTimeMinutes(restaurant.openingTime);
    const closingMinutes = getRestaurantClosingMinutes(restaurant);
    const slots = [];

    for (let minutes = openingMinutes; minutes < closingMinutes; minutes += TIME_SLOT_INTERVAL_MINUTES) {
        slots.push(formatTimeFromMinutes(minutes));
    }

    return slots;
}

function isBookingDateToday(date = bookingState.date) {
    return date === getTodayDateValue();
}

function isBookingDateInPast(date = bookingState.date) {
    return Boolean(date) && date < getTodayDateValue();
}

function isBookingTimeAvailable(
    time = bookingState.time,
    date = bookingState.date,
    restaurant = getSelectedRestaurant()
) {
    if (!date || !time || !restaurant || isBookingDateInPast(date)) {
        return false;
    }

    if (!getRestaurantTimeSlots(restaurant).includes(time)) {
        return false;
    }

    if (!isBookingDateToday(date)) {
        return true;
    }

    return getTimeMinutes(time) > getCurrentUaeTimeMinutes();
}

function getAvailableBookingTimeSlots(date = bookingState.date, restaurant = getSelectedRestaurant()) {
    return getRestaurantTimeSlots(restaurant).filter(function(time) {
        return isBookingTimeAvailable(time, date, restaurant);
    });
}

function getDefaultBookingTime(date = bookingState.date, restaurant = getSelectedRestaurant()) {
    return getAvailableBookingTimeSlots(date, restaurant)[0] || "";
}

function getSelectedRestaurant() {
    return getRestaurants().find(function({ id }) {
        return Number(id) === Number(bookingState.restaurantId);
    });
}

function getRestaurantTableLayout(restaurant = getSelectedRestaurant()) {
    if (!restaurant) {
        return [];
    }

    return normalizeRestaurantTableLayout(restaurant?.tableLayout);
}

function getTableBaseFee(seats = 0) {
    const tableFees = getPriceTiers();

    return tableFees[seats] || 0;
}

function getTableExperience(table = {}) {
    return normalizeTableExperience(table.experience);
}

function getExperienceFee(table = {}) {
    return TABLE_EXPERIENCES[getTableExperience(table)].fee;
}

function getTimePricingAdjustment(tableFee, time) {
    if (peakHours.includes(time)) {
        return {
            label: "Peak surcharge",
            rate: 0.25,
            amount: roundCurrency(tableFee * 0.25)
        };
    }

    if (offPeakHours.includes(time)) {
        return {
            label: "Off-peak discount",
            rate: -0.1,
            amount: roundCurrency(tableFee * -0.1)
        };
    }

    return {
        label: "Normal hours",
        rate: 0,
        amount: 0
    };
}

function getCouponDiscount(subtotal, couponCode = "") {
    const normalizedCouponCode = couponCode.trim().toUpperCase();

    if (normalizedCouponCode === "WELCOME10") {
        return {
            code: normalizedCouponCode,
            label: "WELCOME10",
            amount: roundCurrency(subtotal * 0.1)
        };
    }

    if (normalizedCouponCode === "SAVE5") {
        return {
            code: normalizedCouponCode,
            label: "SAVE5",
            amount: Math.min(5, subtotal)
        };
    }

    return {
        code: normalizedCouponCode,
        label: normalizedCouponCode ? "Invalid coupon" : "No coupon",
        amount: 0
    };
}

function getMemberDiscount(subtotal, memberTier = "Standard") {
    const safeMemberTier = memberDiscountRates[memberTier] === undefined ? "Standard" : memberTier;
    const rate = memberDiscountRates[safeMemberTier];

    return {
        tier: safeMemberTier,
        rate,
        amount: roundCurrency(subtotal * rate)
    };
}

function calculateReservationPrice({ table, time, couponCode, memberTier }) {
    const tableFee = getTableBaseFee(table?.seats);
    const tableExperience = getTableExperience(table);
    const experienceFee = getExperienceFee(table);
    const subtotalBeforeTime = roundCurrency(tableFee + experienceFee);
    const timeAdjustment = getTimePricingAdjustment(subtotalBeforeTime, time);
    const adjustedSubtotal = Math.max(0, roundCurrency(subtotalBeforeTime + timeAdjustment.amount));
    const couponDiscount = getCouponDiscount(adjustedSubtotal, couponCode);
    const afterCouponSubtotal = Math.max(0, roundCurrency(adjustedSubtotal - couponDiscount.amount));
    const memberDiscount = getMemberDiscount(afterCouponSubtotal, memberTier);
    const finalTotal = Math.max(0, roundCurrency(afterCouponSubtotal - memberDiscount.amount));

    return {
        currency: "USD",
        tableFee,
        tableExperience,
        experienceFee,
        timeAdjustment,
        couponDiscount,
        memberDiscount,
        finalTotal
    };
}

function renderPricingSummaryRows(pricing) {
    const { tableFee, tableExperience, experienceFee, timeAdjustment, couponDiscount, memberDiscount, finalTotal } = pricing;
    const timeAdjustmentClass = timeAdjustment.amount < 0 ? "discount" : "charge";

    return `
        <div>
            <span>Table fee</span>
            <strong>${formatUSD(tableFee)}</strong>
        </div>
        <div>
            <span>${escapeHTML(normalizeTableExperience(tableExperience))} experience</span>
            <strong>${formatUSD(experienceFee || 0)}</strong>
        </div>
        <div>
            <span>Time adjustment (${timeAdjustment.label})</span>
            <strong class="${timeAdjustmentClass}">${formatUSD(timeAdjustment.amount)}</strong>
        </div>
        <div>
            <span>Coupon discount (${couponDiscount.label})</span>
            <strong class="discount">${formatDiscountUSD(couponDiscount.amount)}</strong>
        </div>
        <div>
            <span> Member discount </span>
            <strong class="discount">${formatDiscountUSD(memberDiscount.amount)}</strong>
        </div>
        <div class="pricing-total">
            <span>Final total</span>
            <strong>${formatUSD(finalTotal)}</strong>
        </div>
    `;
}

function renderPricingSummary(selectedTable) {
    if (!selectedTable) {
        return `
        <section class="profile-panel pricing-panel">
            <div class="form-heading">
                <p class="eyebrow">Pricing summary</p>
                <h3>Select a table to calculate pricing</h3>
            </div>
            <p class="summary-muted">Pricing updates after a table and time are selected.</p>
            </section>
        `;
    }

    const pricing = calculateReservationPrice({
        table: selectedTable,
        time: bookingState.time,
        couponCode: bookingState.couponCode,
        memberTier: bookingState.memberTier
    });

    return `
        <section class="profile-panel pricing-panel">
            <div class="form-heading">
                <p class="eyebrow">Pricing summary</p>
                <h3>Reservation total</h3>
            </div>

            <div class="pricing-controls">
                <label>
                    Coupon code
                    <input
                        id="couponCodeInput"
                        type="text"
                        value="${escapeHTML(bookingState.couponCode)}"
                        placeholder="WELCOME10 or SAVE5"
                        autocomplete="off"
                    >
                </label>

                <label>
                    Member tier
                    <select id="memberTierSelect">
                        ${Object.keys(memberDiscountRates).map(function(tier) {
        return `
                                <option value="${tier}" ${bookingState.memberTier === tier ? "selected" : ""}>${getMemberDiscountLabel({
                                    tier,
                                    rate: memberDiscountRates[tier]
                                })}</option>
                            `;
    }).join("")}
                    </select>
                </label>
            </div>

            <div class="pricing-summary" id="pricingSummary">
                ${renderPricingSummaryRows(pricing)}
            </div>
        </section>
    `;
}

function getSelectedBookingTable() {
    return getRestaurantTableLayout().find(function({ tableId }) {
        return tableId === bookingState.tableId;
    });
}

function getSeatId(tableId, seatIndex) {
    return `${tableId}-S${seatIndex + 1}`;
}

function getRequiredSeatCount() {
    return 1 + getAcceptedInvitedGuestCount();
}

function getValidSelectedSeatIds(table = getSelectedBookingTable()) {
    if (!table || table.tableId !== bookingState.tableId) {
        return [];
    }

    const validSeatIds = new Set(Array.from(
        { length: Math.max(0, Number(table.seats) || 0) },
        function(_, seatIndex) {
            return getSeatId(table.tableId, seatIndex);
        }
    ));

    return bookingState.selectedSeatIds.filter(function(seatId) {
        return validSeatIds.has(seatId);
    });
}

function canConfirmSeatSelection(table = getSelectedBookingTable()) {
    if (!table || getTableStatus(table) !== "Selected" || !doesBookingFitTable(table)) {
        return false;
    }

    const validSelectedSeatIds = getValidSelectedSeatIds(table);
    return bookingState.selectedSeatIds.length === getRequiredSeatCount()
        && validSelectedSeatIds.length === bookingState.selectedSeatIds.length
        && new Set(validSelectedSeatIds).size === validSelectedSeatIds.length;
}

function getMaxInvitedGuests(selectedTable = getSelectedBookingTable()) {
    return selectedTable ? Math.max(0, selectedTable.seats - 1) : 0;
}

function getAcceptedInvitedGuests() {
    return bookingState.invitedGuests.filter(function({ rsvpStatus }) {
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
        invitedGuests: bookingState.invitedGuests.filter(function(guest) {
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
    const currentGuest = bookingState.invitedGuests.find(function(guest) {
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
        invitedGuests: bookingState.invitedGuests.map(function(guest) {
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
    const inviteLimitMessage = invitedGuestMessage
        || (isGuestLimitReached ? `${getInviteCapacityMessage(selectedTable)} New guests can be added as pending.` : "");
    const disabledAttribute = isInviteDisabled ? "disabled" : "";

    return `
        <section class="profile-panel invited-guests-panel">
            <div class="form-heading">
                <p class="eyebrow">Invite guests</p>
                <h3>Add guests to this booking</h3>
            </div>
            <p class="summary-muted">
                ${selectedTable
                    ? `${acceptedGuestCount} of ${maxInvitedGuests} accepted invited guest seats used. Pending and declined guests do not hold seats.`
                    : "Select a table before adding invited guests."}
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
                ${guests.length === 0 ? `
                    <p class="summary-muted">No invited guests added yet.</p>
                ` : `
                    <div class="invited-guests-list">
                        ${guests.map(function({ guestId, name, email, rsvpStatus }) {
        return `
                                <article class="invited-guest-card">
                                    <div>
                                        <strong>${escapeHTML(name)}</strong>
                                        <span>${escapeHTML(email)}</span>
                                    </div>
                                    <label>
                                        RSVP
                                        <select data-guest-id="${guestId}">
                                            ${["pending", "accepted", "declined"].map(function(status) {
            return `
                                                    <option value="${status}" ${rsvpStatus === status ? "selected" : ""}>${status}</option>
                                                `;
        }).join("")}
                                        </select>
                                    </label>
                                    <button class="secondary-action" type="button" data-remove-guest-id="${guestId}">
                                        Remove
                                    </button>
                                </article>
                            `;
    }).join("")}
                    </div>
                `}
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
    const acceptedGuests = getAcceptedInvitedGuests()
        .map(function({ name, email }) {
            return { name, email };
        });

    return [mainGuest, ...acceptedGuests];
}

function calculateSplitBill(
    reservationTotal = 0,
    preOrderSubtotal = 0,
    participants = getBillParticipants()
) {
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
        participants: participants.map(function(participant, index) {
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
            ${splitBill.participants.map(function({ name, email, share }) {
        return `
                    <div class="split-bill-row">
                        <span>
                            <strong>${escapeHTML(name)}</strong>
                            <em>${escapeHTML(email)}</em>
                        </span>
                        <strong>${formatUSD(share)}</strong>
                    </div>
                `;
    }).join("")}
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
    const restaurant = getRestaurants().find(function({ id }) {
        return Number(id) === Number(restaurantId);
    });

    return restaurant?.menu || [];
}

function updatePreOrderItem(itemId, quantity) {
    const safeQuantity = Math.max(0, Math.floor(Number(quantity) || 0));
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
    return roundCurrency(menuItems.reduce(function(subtotal, { id, price }) {
        const quantity = bookingState.preOrderItems[id] || 0;

        return subtotal + (price * quantity);
    }, 0));
}

function getSelectedPreOrderItems(menuItems = getRestaurantMenu()) {
    return menuItems
        .map(function({ id, name, price }) {
            const quantity = bookingState.preOrderItems[id] || 0;

            return {
                itemId: id,
                name,
                price,
                quantity,
                lineTotal: roundCurrency(price * quantity)
            };
        })
        .filter(function({ quantity }) {
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

            ${menuItems.length === 0 ? `
                <p class="summary-muted">No pre-order menu is available for this restaurant.</p>
            ` : `
                <div class="pre-order-list">
                    ${menuItems.map(function({ id, name, price, category, tags }) {
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
                                        step="1"
                                        value="${quantity}"
                                        data-pre-order-item-id="${id}"
                                    >
                                </label>
                                <strong>${formatUSD(lineTotal)}</strong>
                            </article>
                        `;
                    }).join("")}
                </div>

                <div class="pre-order-total">
                    <span>Pre-order subtotal</span>
                    <strong>${formatUSD(subtotal)}</strong>
                </div>
            `}
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

function redirectToLoginForBooking(restaurantId = bookingState.restaurantId) {
    if (restaurantId) {
        savePendingAction({
            type: "booking",
            restaurantId
        });
    }

    bookingState = {
        ...bookingState,
        restaurantId: null,
        tableId: "",
        selectedSeatIds: [],
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: null
    };
    bookingMessage = "";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    authMode = "login";
    authErrors = {};
    authFormValues = {};
    authMessage = "Please log in or create an account before booking.";
    showLoginPage();
}

function startBooking(restaurantId) {
    const profile = getCurrentUserProfile();

    if (!profile) {
        redirectToLoginForBooking(restaurantId);
        return;
    }

    const restaurant = getRestaurants().find(function({ id }) {
        return Number(id) === Number(restaurantId);
    });
    const date = getTodayDateValue();

    bookingState = {
        restaurantId,
        date,
        time: getDefaultBookingTime(date, restaurant),
        tableId: "",
        selectedSeatIds: [],
        experienceFilter: "Regular",
        couponCode: "",
        memberTier: "Standard",
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: null
    };
    bookingMessage = "";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    renderBookingView();
    showBookingPage();
}

function renderTimeSlots() {
    const restaurant = getSelectedRestaurant();
    const slots = getRestaurantTimeSlots(restaurant);
    const availableSlots = getAvailableBookingTimeSlots(bookingState.date, restaurant);

    if (!restaurant) {
        return `<p class="booking-warning">Select a restaurant before choosing a time.</p>`;
    }

    if (slots.length === 0) {
        return `<p class="booking-warning">No booking slots are configured for this restaurant.</p>`;
    }

    return `
        ${isBookingDateToday() && availableSlots.length === 0 ? `
            <p class="booking-warning">No more slots available today.</p>
        ` : ""}
        ${slots.map(function(time) {
        const isActive = bookingState.time === time;
        const isDisabled = !isBookingTimeAvailable(time);

        return `
            <button
                class="time-slot ${isActive ? "active" : ""} ${isDisabled ? "disabled" : ""}"
                type="button"
                data-time="${time}"
                ${isDisabled ? "disabled" : ""}
            >
                ${time}
            </button>
        `;
    }).join("")}
    `;
}

function getTableStatus({ tableId }) {
    const { restaurantId, date, time } = bookingState;

    if (!date || !time || !isBookingTimeAvailable(time)) {
        return "Disabled";
    }

    const isReserved = getReservations().some(function(reservation) {
        return reservation.status === "active"
            && Number(reservation.restaurantId) === Number(restaurantId)
            && reservation.date === date
            && reservation.time === time
            && reservation.tableId === tableId;
    });

    if (isReserved) {
        return "Reserved";
    }

    if (bookingState.tableId === tableId) {
        return "Selected";
    }

    return "Available";
}

function getReservedTableCountForSlot() {
    const { restaurantId, date, time } = bookingState;
    const tableIds = new Set(getRestaurantTableLayout().map(function({ tableId }) {
        return tableId;
    }));

    if (!restaurantId || !date || !time || !isBookingTimeAvailable(time)) {
        return 0;
    }

    return getReservations().filter(function(reservation) {
        return reservation.status === "active"
            && Number(reservation.restaurantId) === Number(restaurantId)
            && reservation.date === date
            && reservation.time === time;
    }).filter(function({ tableId }) {
        return tableIds.has(tableId);
    }).length;
}

function isSlotFull() {
    const tableLayout = getRestaurantTableLayout();

    if (!isBookingTimeAvailable()) {
        return false;
    }

    return tableLayout.length > 0 && getReservedTableCountForSlot() >= tableLayout.length;
}

function getSlotAvailabilityStatus() {
    const tableLayout = getRestaurantTableLayout();

    if (!isBookingTimeAvailable()) {
        return "Select an available time";
    }

    if (tableLayout.length === 0) {
        return "No tables configured";
    }

    const reservedTableCount = getReservedTableCountForSlot();

    if (reservedTableCount >= tableLayout.length) {
        return "Full / Waitlist open";
    }

    if (reservedTableCount >= Math.ceil(tableLayout.length * 0.6)) {
        return "Limited availability";
    }

    return "Available";
}

function hasGuestJoinedWaitlist(profile = getGuestProfile()) {
    if (!profile) {
        return false;
    }

    return getWaitlist().some(function(entry) {
        return Number(entry.restaurantId) === Number(bookingState.restaurantId)
            && entry.date === bookingState.date
            && entry.time === bookingState.time
            && entry.guestEmail === profile.email
            && entry.status === "waiting";
    });
}

function joinWaitlist() {
    const profile = getCurrentUserProfile();
    const restaurant = getSelectedRestaurant();

    if (!profile || !restaurant || !isBookingTimeAvailable() || !isSlotFull() || hasGuestJoinedWaitlist(profile)) {
        return;
    }

    saveWaitlist([
        ...getWaitlist(),
        {
            waitlistId: `waitlist-${Date.now()}`,
            guestName: profile.name,
            guestEmail: profile.email,
            guestPhone: profile.phone,
            restaurantId: restaurant.id,
            restaurantName: restaurant.name,
            date: bookingState.date,
            time: bookingState.time,
            status: "waiting"
        }
    ]);

    bookingMessage = "You joined the waitlist for this slot.";
    renderBookingView();
}

function renderWaitlistStatus() {
    const profile = getCurrentUserProfile();
    const hasAvailableTime = isBookingTimeAvailable();
    const availabilityStatus = getSlotAvailabilityStatus();
    const slotFull = isSlotFull();
    const alreadyJoined = hasGuestJoinedWaitlist(profile);
    const tableLayout = getRestaurantTableLayout();

    return `
        <div class="waitlist-status-panel">
            <div class="form-heading">
                <p class="eyebrow">Live status</p>
                <h3>${availabilityStatus}</h3>
            </div>
            <p class="summary-muted">
                ${hasAvailableTime
                    ? (tableLayout.length === 0
                        ? "No tables are configured for this restaurant."
                        : (slotFull ? "All tables are reserved for this date and time." : `${tableLayout.length - getReservedTableCountForSlot()} tables remain for this slot.`))
                    : "Choose a future slot within this restaurant's operating hours."}
            </p>
            ${hasAvailableTime && slotFull ? `
                <button class="primary-action" type="button" id="joinWaitlistButton" ${alreadyJoined ? "disabled" : ""}>
                    ${alreadyJoined ? "Waitlist Joined" : "Join Waitlist"}
                </button>
            ` : ""}
        </div>
    `;
}

function renderTableMap() {
    const tableLayout = getRestaurantTableLayout();

    if (tableLayout.length === 0) {
        return `
            <div class="empty-state">
                <h3>No tables configured</h3>
                <p>This restaurant is not accepting table bookings yet.</p>
            </div>
        `;
    }

    return tableLayout.map(function(table) {
        const { tableId, seats, experience } = table;
        const status = getTableStatus(table);
        const matchesExperience = experience === bookingState.experienceFilter;
        const isDisabled = status === "Reserved" || status === "Disabled" || !matchesExperience;

        return `
            <button
                class="table-tile ${status.toLowerCase()}"
                type="button"
                data-table-id="${tableId}"
                ${isDisabled ? "disabled" : ""}
                aria-label="Table ${escapeHTML(tableId)}, ${escapeHTML(experience)}, ${seats} seats, ${status}${matchesExperience ? "" : `, choose ${escapeHTML(experience)} experience to select` }"
            >
                <strong>${tableId}</strong>
                <span>${seats} seats</span>
                <em>${experience} &middot; ${status}</em>
            </button>
        `;
    }).join("");
}

function renderTableExperienceControls() {
    return `
        <div class="table-experience-heading">Table experience</div>
        <div class="table-experience-controls" role="radiogroup" aria-label="Table experience">
            ${Object.entries(TABLE_EXPERIENCES).map(function([experience, details]) {
        return `
                    <button
                        class="table-experience-control ${bookingState.experienceFilter === experience ? "is-active" : ""}"
                        type="button"
                        role="radio"
                        aria-checked="${bookingState.experienceFilter === experience}"
                        data-experience-filter="${experience}"
                    >
                        <span class="table-experience-icon" aria-hidden="true">${experience === "Regular" ? "♧" : experience === "Premium" ? "♕" : "◇"}</span>
                        <span>
                            <strong>${experience}</strong>
                            <small>${details.subtitle}</small>
                        </span>
                        <span class="table-experience-check" aria-hidden="true">✓</span>
                    </button>
                `;
    }).join("")}
        </div>
    `;
}

function renderTableInformationStrip(selectedTable) {
    const experience = selectedTable
        ? getTableExperience(selectedTable)
        : normalizeTableExperience(bookingState.experienceFilter);
    const details = TABLE_EXPERIENCES[experience];
    const selectedSeatIds = selectedTable ? getValidSelectedSeatIds(selectedTable) : [];
    const requiredSeatCount = getRequiredSeatCount();
    const remainingSeatCount = Math.max(0, requiredSeatCount - selectedSeatIds.length);
    const message = !selectedTable
        ? `Choose a ${experience} table · ${details.subtitle}`
        : selectedSeatIds.length === 0
            ? `Table ${selectedTable.tableId} · ${experience} · Select exactly ${requiredSeatCount} ${requiredSeatCount === 1 ? "seat" : "seats"}`
            : `Table ${selectedTable.tableId} · ${experience} · ${selectedSeatIds.length} of ${requiredSeatCount} seats · ${selectedSeatIds.join(", ")}`;
    const status = !selectedTable
        ? details.benefits
        : remainingSeatCount === 0
            ? "Ready to reserve"
            : selectedSeatIds.length === 0
                ? "Choose your seats"
                : `${remainingSeatCount} more ${remainingSeatCount === 1 ? "seat" : "seats"} required`;

    return `
        <div class="table-information-strip" id="tableInformationStrip" aria-live="polite">
            <span class="table-information-main"><span class="table-information-icon" aria-hidden="true">i</span>${escapeHTML(message)}</span>
            <span class="table-information-seat-state">
                <strong>${escapeHTML(status)}</strong>
                ${seatSelectionMessage ? `<small>${escapeHTML(seatSelectionMessage)}</small>` : ""}
            </span>
        </div>
    `;
}

function renderSeatFallbackContent(selectedTable) {
    if (!selectedTable) {
        return "";
    }

    const selectedSeatIds = getValidSelectedSeatIds(selectedTable);
    const requiredSeatCount = getRequiredSeatCount();
    const selectionComplete = selectedSeatIds.length >= requiredSeatCount;

    return `
        <div class="seat-fallback-heading">
            <strong>Seats for table ${escapeHTML(selectedTable.tableId)}</strong>
            <span>Select exactly ${requiredSeatCount}</span>
        </div>
        <div class="seat-fallback-grid">
            ${Array.from({ length: selectedTable.seats }, function(_, seatIndex) {
                const seatId = getSeatId(selectedTable.tableId, seatIndex);
                const isSelected = selectedSeatIds.includes(seatId);
                const isUnavailable = getTableStatus(selectedTable) !== "Selected" || (selectionComplete && !isSelected);
                return `
                    <button
                        class="seat-fallback-button ${isSelected ? "is-selected" : ""} ${isUnavailable ? "is-unavailable" : ""}"
                        type="button"
                        data-seat-id="${escapeHTML(seatId)}"
                        aria-pressed="${isSelected}"
                        aria-label="Table ${escapeHTML(selectedTable.tableId)}, seat ${seatIndex + 1}, ${isSelected ? "selected" : isUnavailable ? "unavailable" : "available"}"
                        ${isUnavailable ? "disabled" : ""}
                    >
                        <strong>Seat ${seatIndex + 1}</strong>
                        <span>${escapeHTML(seatId)}</span>
                    </button>
                `;
            }).join("")}
        </div>
    `;
}

function renderConfirmationSummary(selectedTable) {
    if (!selectedTable) {
        return "Select an available table to continue.";
    }

    const selectedSeatIds = getValidSelectedSeatIds(selectedTable);
    const seatSummary = selectedSeatIds.length > 0
        ? selectedSeatIds.join(", ")
        : "Select your exact seats.";
    return `Table ${selectedTable.tableId} · Seats ${seatSummary}`;
}

function revealBookingTableFallback(bookingView) {
    const fallback = bookingView?.querySelector("#bookingTableFallback");
    const stage = bookingView?.querySelector("#bookingTable3DStage");
    if (fallback) {
        fallback.classList.add("is-fallback-visible");
        fallback.setAttribute("aria-label", "Table selector");
    }
    const seatFallback = bookingView?.querySelector("#bookingSeatFallback");
    if (seatFallback) {
        seatFallback.classList.add("is-fallback-visible");
    }
    if (stage) {
        stage.hidden = true;
    }
}

function destroyBookingTableSelector() {
    bookingTableSelector3DInitToken += 1;
    bookingTableSelector3DModule?.destroyBookingTableSelector3D();
}

function initializeBookingTableSelector(bookingView) {
    const container = bookingView.querySelector("#bookingTable3D");
    const returnButton = bookingView.querySelector("#returnToFloorButton");
    const token = ++bookingTableSelector3DInitToken;

    if (!container) {
        return;
    }

    bookingTableSelector3DModulePromise.then(function(module) {
        if (token !== bookingTableSelector3DInitToken || !container.isConnected) {
            return;
        }

        if (!module || !module.isBookingTableSelector3DSupported()) {
            revealBookingTableFallback(bookingView);
            return;
        }

        const initialized = module.initBookingTableSelector3D({
            container,
            returnButton,
            tables: getRestaurantTableLayout(),
            experienceFilter: bookingState.experienceFilter,
            selectedTableId: bookingState.tableId,
            selectedSeatIds: [...bookingState.selectedSeatIds],
            requiredSeatCount: getRequiredSeatCount(),
            getTableStatus,
            onTableSelect: handleTableSelect,
            onSeatToggle: handleSeatToggle,
            onFailure: function() {
                return revealBookingTableFallback(bookingView);
            }
        });

        if (!initialized) {
            revealBookingTableFallback(bookingView);
        }
    });
}

function renderBookingView() {
    const bookingView = document.querySelector("#bookingView");
    const profile = getCurrentUserProfile();

    destroyBookingTableSelector();

    if (!profile) {
        if (bookingView) {
            bookingView.innerHTML = "";
        }

        redirectToLoginForBooking();
        return;
    }

    const restaurant = getSelectedRestaurant();

    if (!restaurant) {
        bookingView.innerHTML = `
            <section class="profile-panel">
                <h3>Select a restaurant first.</h3>
            </section>
        `;
        return;
    }

    const { name, cuisine, rating, priceLevel, image } = restaurant;
    bookingState.experienceFilter = normalizeTableExperience(bookingState.experienceFilter);
    let selectedTable = getSelectedBookingTable();
    if (selectedTable && getTableStatus(selectedTable) !== "Selected") {
        bookingState = { ...bookingState, tableId: "", selectedSeatIds: [] };
        selectedTable = null;
        seatSelectionMessage = "That table is no longer available. Choose another table.";
    } else if (selectedTable) {
        bookingState.selectedSeatIds = getValidSelectedSeatIds(selectedTable);
    }
    const isOverTableCapacity = Boolean(selectedTable) && !doesBookingFitTable(selectedTable);
    const isSelectedTimeAvailable = isBookingTimeAvailable();
    const canConfirm = Boolean(
        profile
            && selectedTable
            && canGuestBook(profile)
            && getTableStatus(selectedTable) === "Selected"
            && isSelectedTimeAvailable
            && !isOverTableCapacity
            && canConfirmSeatSelection(selectedTable)
    );

    bookingView.innerHTML = `
        <section class="profile-panel booking-restaurant-panel">
            <div class="booking-summary-image">
                <span style="background-image: linear-gradient(180deg, rgba(10, 15, 20, 0.02), rgba(10, 15, 20, 0.34)), url('${image}')"></span>
            </div>
            <div class="booking-summary-content">
                <div class="form-heading">
                    <p class="eyebrow">Restaurant summary</p>
                    <h3>${escapeHTML(name)}</h3>
                </div>
                <div class="booking-restaurant-meta">
                    <span class="summary-chip">${escapeHTML(cuisine)}</span>
                    <span class="summary-chip">Rating ${escapeHTML(rating)}</span>
                    <span class="summary-chip">${escapeHTML(priceLevel)}</span>
                </div>
                ${createRestaurantBadgeSections(restaurant)}
                ${bookingMessage ? `<p class="profile-message">${escapeHTML(bookingMessage)}</p>` : ""}
            </div>
        </section>

        <section class="profile-panel booking-controls-panel">
            <div class="form-heading">
                <p class="eyebrow">Select date & time</p>
                <h3>Choose your reservation slot</h3>
            </div>

            <div class="booking-slot-layout">
                <label class="booking-date-field">
                    Date
                    <input id="bookingDateInput" type="date" value="${bookingState.date}" min="${getTodayDateValue()}">
                </label>

                <div>
                    <p class="booking-control-label">Time</p>
                    <div class="time-slot-grid">
                        ${renderTimeSlots()}
                    </div>
                </div>
            </div>
        </section>

        <section class="profile-panel booking-table-panel">
            <div class="form-heading">
                <p class="eyebrow">Choose table</p>
                <h3>Choose one available table</h3>
            </div>
            ${renderWaitlistStatus()}
            ${renderTableExperienceControls()}
            <div class="table-status-legend">
                <span class="legend-dot available"></span> Available
                <span class="legend-dot selected"></span> Selected
                <span class="legend-dot reserved"></span> Reserved
                <span class="legend-dot disabled"></span> Disabled
            </div>
            <div class="booking-3d-stage" id="bookingTable3DStage">
                <div class="booking-3d-toolbar">
                    <button class="booking-floor-return" type="button" id="returnToFloorButton"><span aria-hidden="true">←</span> Return to Floor</button>
                </div>
                <div class="booking-table-3d" id="bookingTable3D"></div>
                ${renderTableInformationStrip(selectedTable)}
            </div>
            <div class="table-map table-map-accessible" id="bookingTableFallback" aria-label="Mirrored accessible table selector">
                ${renderTableMap()}
            </div>
            <div class="seat-map-accessible" id="bookingSeatFallback" aria-label="Mirrored accessible seat selector">
                ${renderSeatFallbackContent(selectedTable)}
            </div>
        </section>

        ${renderInvitedGuests()}

        ${renderSplitBill(selectedTable, profile)}

        ${renderPreOrder()}

        ${renderPricingSummary(selectedTable)}

        <section class="profile-panel booking-confirm-panel">
            <div class="form-heading">
                <p class="eyebrow">Confirm booking</p>
                <h3>Review and reserve</h3>
            </div>
            <p class="summary-muted" id="bookingConfirmationSummary">
                ${escapeHTML(renderConfirmationSummary(selectedTable))}
            </p>
            ${profile && !canGuestBook(profile) ? `
                <p class="booking-warning">This guest has reached ${MAX_ACTIVE_RESERVATIONS} active reservations.</p>
            ` : ""}
            ${!isSelectedTimeAvailable ? `
                <p class="booking-warning">Select a future time within this restaurant's operating hours before confirming.</p>
            ` : ""}
            ${isOverTableCapacity ? `
                <p class="booking-warning">${escapeHTML(getInviteCapacityMessage(selectedTable))} Update RSVPs before confirming.</p>
            ` : ""}
            <button class="primary-action" type="button" id="confirmTestBookingButton" ${canConfirm ? "" : "disabled"}>
                Confirm Booking
            </button>
        </section>

        ${renderCheckInCard(bookingState.confirmedReservation)}
    `;

    bookingView.querySelector("#bookingDateInput").addEventListener("change", function(event) {
        const nextDate = event.target.value;
        const nextTime = isBookingTimeAvailable(bookingState.time, nextDate, restaurant)
            ? bookingState.time
            : getDefaultBookingTime(nextDate, restaurant);

        bookingState = {
            ...bookingState,
            date: nextDate,
            time: nextTime,
            tableId: "",
            selectedSeatIds: [],
            confirmedReservation: null
        };
        bookingMessage = "";
        invitedGuestMessage = "";
        seatSelectionMessage = "";
        renderBookingView();
    });

    bookingView.querySelectorAll(".time-slot").forEach(function(button) {
        button.addEventListener("click", function() {
            if (button.disabled || !isBookingTimeAvailable(button.dataset.time)) {
                return;
            }

            bookingState = { ...bookingState, time: button.dataset.time, tableId: "", selectedSeatIds: [], confirmedReservation: null };
            bookingMessage = "";
            invitedGuestMessage = "";
            seatSelectionMessage = "";
            renderBookingView();
        });
    });

    bookingView.querySelectorAll("[data-experience-filter]").forEach(function(button) {
        button.addEventListener("click", function() {
            const experienceFilter = normalizeTableExperience(button.dataset.experienceFilter);
            const experienceChanged = experienceFilter !== bookingState.experienceFilter;
            const currentTable = getSelectedBookingTable();
            bookingState = {
                ...bookingState,
                experienceFilter,
                tableId: currentTable && getTableExperience(currentTable) !== experienceFilter ? "" : bookingState.tableId,
                selectedSeatIds: experienceChanged ? [] : bookingState.selectedSeatIds
            };
            bookingMessage = "";
            invitedGuestMessage = "";
            if (experienceChanged) {
                seatSelectionMessage = "";
            }
            renderBookingView();
        });
    });

    const couponCodeInput = bookingView.querySelector("#couponCodeInput");
    const memberTierSelect = bookingView.querySelector("#memberTierSelect");
    const joinWaitlistButton = bookingView.querySelector("#joinWaitlistButton");

    function updateRenderedBookingTotals() {
        const pricingSummary = bookingView.querySelector("#pricingSummary");
        const splitBillSummary = bookingView.querySelector("#splitBillSummary");
        const currentSelectedTable = getSelectedBookingTable();

        if (!currentSelectedTable) {
            return;
        }

        const pricing = calculateReservationPrice({
            table: currentSelectedTable,
            time: bookingState.time,
            couponCode: bookingState.couponCode,
            memberTier: bookingState.memberTier
        });

        if (pricingSummary) {
            pricingSummary.innerHTML = renderPricingSummaryRows(pricing);
        }

        if (splitBillSummary) {
            const preOrderSubtotal = calculatePreOrderSubtotal(getRestaurantMenu());

            splitBillSummary.innerHTML = renderSplitBillRows(calculateSplitBill(
                pricing.finalTotal,
                preOrderSubtotal,
                getBillParticipants(profile)
            ));
        }
    }

    if (couponCodeInput) {
        couponCodeInput.addEventListener("input", function(event) {
            bookingState = { ...bookingState, couponCode: event.target.value };
            updateRenderedBookingTotals();
        });
    }

    if (memberTierSelect) {
        memberTierSelect.addEventListener("change", function(event) {
            bookingState = { ...bookingState, memberTier: event.target.value };
            updateRenderedBookingTotals();
        });
    }

    if (joinWaitlistButton) {
        joinWaitlistButton.addEventListener("click", joinWaitlist);
    }

    const invitedGuestForm = bookingView.querySelector("#invitedGuestForm");

    invitedGuestForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const formData = new FormData(event.target);
        addInvitedGuest(formData.get("guestName"), formData.get("guestEmail"));
        renderBookingView();
    });

    bookingView.querySelectorAll("[data-remove-guest-id]").forEach(function(button) {
        button.addEventListener("click", function() {
            removeInvitedGuest(button.dataset.removeGuestId);
            renderBookingView();
        });
    });

    bookingView.querySelectorAll(".invited-guest-card select").forEach(function(select) {
        select.addEventListener("change", function() {
            updateGuestRsvp(select.dataset.guestId, select.value);
            renderBookingView();
        });
    });

    bookingView.querySelectorAll("[data-pre-order-item-id]").forEach(function(input) {
        input.addEventListener("change", function() {
            updatePreOrderItem(input.dataset.preOrderItemId, input.value);
            renderBookingView();
        });
    });

    bookingView.querySelectorAll(".table-tile").forEach(function(button) {
        button.addEventListener("click", handleTableSelect);
    });

    attachSeatFallbackHandlers(bookingView);

    bookingView.querySelector("#confirmTestBookingButton").addEventListener("click", confirmTestBooking);

    initializeBookingTableSelector(bookingView);

    if (bookingState.confirmedReservation) {
        requestAnimationFrame(function() {
            return renderRealQRCode(bookingState.confirmedReservation);
        });
    }
}

function attachSeatFallbackHandlers(bookingView = document.querySelector("#bookingView")) {
    bookingView?.querySelectorAll("[data-seat-id]").forEach(function(button) {
        button.addEventListener("click", function() {
            return handleSeatToggle(button.dataset.seatId);
        });
    });
}

function updateBookingSeatSelectionUI() {
    const bookingView = document.querySelector("#bookingView");
    const selectedTable = getSelectedBookingTable();
    if (!bookingView || !selectedTable) {
        return;
    }

    const informationStrip = bookingView.querySelector("#tableInformationStrip");
    if (informationStrip) {
        informationStrip.outerHTML = renderTableInformationStrip(selectedTable);
    }

    const confirmationSummary = bookingView.querySelector("#bookingConfirmationSummary");
    if (confirmationSummary) {
        confirmationSummary.textContent = renderConfirmationSummary(selectedTable);
    }

    const seatFallback = bookingView.querySelector("#bookingSeatFallback");
    if (seatFallback) {
        seatFallback.innerHTML = renderSeatFallbackContent(selectedTable);
        attachSeatFallbackHandlers(bookingView);
    }

    const confirmButton = bookingView.querySelector("#confirmTestBookingButton");
    if (confirmButton) {
        confirmButton.disabled = !(
            canGuestBook(getCurrentUserProfile())
            && isBookingTimeAvailable()
            && canConfirmSeatSelection(selectedTable)
        );
    }

    bookingTableSelector3DModule?.updateBookingTableSelector3D({
        selectedTableId: bookingState.tableId,
        selectedSeatIds: [...bookingState.selectedSeatIds],
        requiredSeatCount: getRequiredSeatCount()
    });
}

function handleSeatToggle(seatId) {
    const table = getSelectedBookingTable();
    if (!table || getTableStatus(table) !== "Selected") {
        return;
    }

    const validSeatIds = new Set(Array.from(
        { length: table.seats },
        function(_, seatIndex) {
            return getSeatId(table.tableId, seatIndex);
        }
    ));
    if (!validSeatIds.has(seatId)) {
        return;
    }

    const selectedSeatIds = getValidSelectedSeatIds(table);
    if (selectedSeatIds.includes(seatId)) {
        bookingState = {
            ...bookingState,
            selectedSeatIds: selectedSeatIds.filter(function(selectedSeatId) {
                return selectedSeatId !== seatId;
            })
        };
        seatSelectionMessage = "";
        updateBookingSeatSelectionUI();
        return;
    }

    if (selectedSeatIds.length >= getRequiredSeatCount()) {
        seatSelectionMessage = "You have selected all required seats.";
        updateBookingSeatSelectionUI();
        return;
    }

    bookingState = {
        ...bookingState,
        selectedSeatIds: [...selectedSeatIds, seatId]
    };
    seatSelectionMessage = bookingState.selectedSeatIds.length === getRequiredSeatCount()
        ? "You have selected all required seats."
        : "";
    updateBookingSeatSelectionUI();
}

function handleTableSelect(eventOrTableId) {
    const tableId = typeof eventOrTableId === "string"
        ? eventOrTableId
        : eventOrTableId.currentTarget.dataset.tableId;
    const table = getRestaurantTableLayout().find(function(item) {
        return item.tableId === tableId;
    });

    if (!table || getTableExperience(table) !== bookingState.experienceFilter || getTableStatus(table) !== "Available") {
        return;
    }

    bookingState = {
        ...bookingState,
        tableId,
        selectedSeatIds: bookingState.tableId === tableId ? bookingState.selectedSeatIds : [],
        confirmedReservation: null
    };
    bookingMessage = "";
    seatSelectionMessage = "";
    syncInvitedGuestCapacityMessage(table);
    renderBookingView();
}

function confirmTestBooking() {
    const profile = getCurrentUserProfile();
    const restaurant = getSelectedRestaurant();
    const table = getRestaurantTableLayout(restaurant).find(function({ tableId }) {
        return tableId === bookingState.tableId;
    });

    if (!profile) {
        redirectToLoginForBooking();
        return;
    }

    if (!restaurant || !isBookingTimeAvailable()) {
        bookingMessage = "Select a future time within this restaurant's operating hours before confirming.";
        renderBookingView();
        return;
    }

    if (!table || !canGuestBook(profile) || getTableStatus(table) !== "Selected" || !canConfirmSeatSelection(table)) {
        bookingMessage = "Unable to save this test booking. Check the booking cap and table status.";
        renderBookingView();
        return;
    }

    if (!doesBookingFitTable(table)) {
        invitedGuestMessage = `${getInviteCapacityMessage(table)} Update RSVPs before confirming.`;
        renderBookingView();
        return;
    }

    const { name, email, phone } = profile;
    const pricing = calculateReservationPrice({
        table,
        time: bookingState.time,
        couponCode: bookingState.couponCode,
        memberTier: bookingState.memberTier
    });
    const guests = bookingState.invitedGuests.map(function({ name, email, rsvpStatus }) {
        return { name, email, rsvpStatus };
    });
    const menuItems = getRestaurantMenu(restaurant.id);
    const preOrder = {
        items: getSelectedPreOrderItems(menuItems),
        subtotal: calculatePreOrderSubtotal(menuItems)
    };
    const splitBill = calculateSplitBill(pricing.finalTotal, preOrder.subtotal, getBillParticipants(profile));
    const reservationId = `reservation-${Date.now()}`;
    const reservation = {
        reservationId,
        checkInCode: generateCheckInCode(reservationId),
        guestUserId: profile.id,
        guestName: name,
        guestEmail: email,
        guestPhone: phone,
        restaurantId: restaurant.id,
        restaurantName: restaurant.name,
        tableId: table.tableId,
        seats: table.seats,
        selectedSeatIds: [...getValidSelectedSeatIds(table)],
        tableExperience: getTableExperience(table),
        experienceFee: pricing.experienceFee,
        date: bookingState.date,
        time: bookingState.time,
        pricing,
        guests,
        splitBill,
        preOrder,
        status: "active"
    };

    saveReservations([...getReservations(), reservation]);
    bookingState = {
        ...bookingState,
        tableId: "",
        selectedSeatIds: [],
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: reservation
    };
    bookingMessage = "Your booking has been confirmed!";
    invitedGuestMessage = "";
    seatSelectionMessage = "";
    renderBookingView();
}

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

    authSection.innerHTML = authMode === "signup"
        ? createSignUpForm()
        : createLoginForm();

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
        showSignUpButton.addEventListener("click", function() {
            authMode = "signup";
            authMessage = "";
            authErrors = {};
            authFormValues = {};
            renderAuthPage();
        });
    }

    if (showLoginButton) {
        showLoginButton.addEventListener("click", function() {
            authMode = "login";
            authMessage = "";
            authErrors = {};
            authFormValues = {};
            renderAuthPage();
        });
    }

    passwordToggleButtons.forEach(function(button) {
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
    saveUsers(getUsers().map(function(savedUser) {
        return (savedUser.id === user.id ? userWithRole : savedUser);
    }));
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
        saveUsers(getUsers().map(function(user) {
            if (user.id !== currentUserId) {
                return user;
            }

            return {
                ...user,
                ...guestProfile,
                role: getRoleForEmail(guestProfile.email)
            };
        }));
    }

    saveAuthSession(guestProfile, currentUserId);
    updateAuthNavigation();
    renderGuestProfile();
}

function handleLogout() {
    const guestSection = document.querySelector("#guestSection");

    clearAuthSession();
    bookingState = {
        restaurantId: null,
        date: "",
        time: "11:00",
        tableId: "",
        selectedSeatIds: [],
        experienceFilter: "Regular",
        couponCode: "",
        memberTier: "Standard",
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: null
    };
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

function updateAuthNavigation() {
    const authNavLink = document.querySelector("#authNavLink");
    const logoutButton = document.querySelector("#logoutButton");
    const loggedIn = isGuestLoggedIn();

    authNavLink.textContent = loggedIn ? "Profile" : "Login";
    authNavLink.href = loggedIn ? "#guest" : "#login";

    logoutButton.hidden = !loggedIn;
    logoutButton.classList.toggle("is-hidden", !loggedIn);
}

function showPage(visiblePage) {
    if (visiblePage?.id !== "bookingPage") {
        destroyBookingTableSelector();
    }

    document.querySelectorAll(".page-view").forEach(function(page) {
        const isVisible = page === visiblePage;
        page.hidden = !isVisible;
        page.classList.toggle("is-hidden", !isVisible);
    });
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

function updatePageHash(sectionId) {
    window.history.pushState(null, "", `#${sectionId}`);
}

function getRouteFromHash() {
    const hashParts = window.location.hash
        .split("#")
        .map(function(part) {
        return part.trim();
    })
        .filter(Boolean);

    return hashParts[hashParts.length - 1] || "";
}

function showDiscoveryPage(sectionId = "home") {
    const discoveryPage = document.querySelector("#discoveryPage");

    showPage(discoveryPage);
    updatePageHash(sectionId);
    scrollToSection(sectionId);
}

function showLoginPage() {
    if (isGuestLoggedIn()) {
        showProfilePage();
        return;
    }

    const loginPage = document.querySelector("#login");

    authMode = "login";
    authErrors = {};
    authFormValues = {};
    renderAuthPage();
    showPage(loginPage);
    updatePageHash("login");
    loginPage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showProfilePage() {
    if (!isGuestLoggedIn()) {
        if (!authMessage) {
            authMessage = getGuestProfile()
                ? "Login to view your guest profile."
                : profileMessage || "Login or sign up to view your guest profile.";
        }

        showLoginPage();
        return;
    }

    const profilePage = document.querySelector("#guest");

    renderGuestProfile();
    showPage(profilePage);
    updatePageHash("guest");
    profilePage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showBookingPage() {
    if (!getCurrentUserProfile()) {
        redirectToLoginForBooking();
        return;
    }

    const bookingPage = document.querySelector("#bookingPage");

    showPage(bookingPage);
    updatePageHash("booking");
    bookingPage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showSmartConciergePage() {
    const smartConciergePage = document.querySelector("#concierge");

    renderSmartConcierge();
    showPage(smartConciergePage);
    updatePageHash("concierge");
    smartConciergePage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function showContactPage() {
    const contactPage = document.querySelector("#contact");

    showPage(contactPage);
    updatePageHash("contact");
    contactPage.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleNavigation(event) {
    const link = event.target.closest("a");

    if (!link) {
        return;
    }

    const sectionId = link.hash.replace("#", "");
    const discoverySections = ["home", "restaurants"];

    if (sectionId === "guest") {
        event.preventDefault();
        showProfilePage();
        return;
    }

    if (sectionId === "login") {
        event.preventDefault();
        showLoginPage();
        return;
    }

    if (sectionId === "concierge") {
        event.preventDefault();
        showSmartConciergePage();
        return;
    }

    if (sectionId === "contact") {
        event.preventDefault();
        showContactPage();
        return;
    }

    if (discoverySections.includes(sectionId)) {
        event.preventDefault();
        showDiscoveryPage(sectionId);
    }
}

function setupEventListeners() {
    const restaurantGrid = document.querySelector("#restaurantGrid");
    const filterPills = document.querySelector("#filterPills");
    const searchForm = document.querySelector("#searchForm");
    const searchInput = document.querySelector("#searchInput");
    const nav = document.querySelector(".nav");
    const backToDiscoveryButton = document.querySelector("#backToDiscoveryButton");
    const backFromLoginButton = document.querySelector("#backFromLoginButton");
    const backFromBookingButton = document.querySelector("#backFromBookingButton");
    const backFromConciergeButton = document.querySelector("#backFromConciergeButton");
    const smartConciergeView = document.querySelector("#smartConciergeView");
    const logoutButton = document.querySelector("#logoutButton");
    const contactForm = document.querySelector("#contactForm");

    searchInput.value = searchTerm;
    restaurantGrid.addEventListener("click", handleRestaurantBookingClick);
    smartConciergeView.addEventListener("click", handleRestaurantBookingClick);
    filterPills.addEventListener("click", handleCategoryFilter);
    searchForm.addEventListener("submit", handleSearch);
    searchInput.addEventListener("input", handleSearch);
    nav.addEventListener("click", handleNavigation);
    backToDiscoveryButton.addEventListener("click", function() {
        return showDiscoveryPage("restaurants");
    });
    backFromLoginButton.addEventListener("click", function() {
        return showDiscoveryPage("restaurants");
    });
    backFromBookingButton.addEventListener("click", function() {
        return showDiscoveryPage("restaurants");
    });
    backFromConciergeButton.addEventListener("click", function() {
        return showDiscoveryPage("restaurants");
    });
    logoutButton.addEventListener("click", handleLogout);
    contactForm.addEventListener("submit", handleContactSubmit);
}

saveRestaurants(getRestaurants());
savePriceTiers(getPriceTiers());
saveReservations(getReservations());
saveWaitlist(getWaitlist());
updateRestaurantResults();

if (isGuestLoggedIn()) {
    renderGuestProfile();
}

renderAuthPage();
updateAuthNavigation();
setupEventListeners();

const initialRoute = getRouteFromHash();

if (initialRoute === "guest") {
    showProfilePage();
} else if (initialRoute === "login") {
    showLoginPage();
} else if (initialRoute === "concierge") {
    showSmartConciergePage();
} else if (initialRoute === "contact") {
    showContactPage();
}

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

    window.QRCode.toCanvas(qrCanvas, qrData, {
        width: 180,
        margin: 2
    }, function(error) {
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
    });
}
