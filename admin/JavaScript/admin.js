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
    contactMessages: "contactMessages",
    adminSession: "adminSession"
};
const defaultPriceTiers = {
    2: 0,
    4: 10,
    6: 20,
    8: 30
};
const TABLE_EXPERIENCE_NAMES = ["Regular", "Premium", "VIP"];
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
const sustainabilityBadgeOptions = ["Eco Certified", "Locally Sourced", "Plastic Free", "Organic"];
const allergenBadgeOptions = ["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy"];
const DEFAULT_OPENING_TIME = "11:00";
const DEFAULT_CLOSING_TIME = "22:00";
const BOOKING_TIME_ZONE = "Asia/Dubai";
const TIME_SLOT_INTERVAL_MINUTES = 30;
const MAX_RESTAURANT_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;

let editingRestaurantId = null;
let activeAdminSection = "dashboard";
let adminRestaurantSearchTerm = "";
let adminReservationSearchTerm = "";
let adminReservationStatusFilter = "all";
let adminReservationRestaurantFilter = "all";
let adminReservationDateFilter = "";
let adminReservationSort = "nearest";
let expandedReservationId = null;
let adminSelectedRestaurantId = null;
let adminSelectedTableDate = "";
let adminSelectedTableTime = "";
let adminActionMessage = "";
let adminActionMessageType = "success";
let pendingRestaurantImageDataUrl = "";

function normalizeEmail(email = "") {
    return String(email).trim().toLowerCase();
}

function getRoleForEmail(email = "") {
    return normalizeEmail(email) === ADMIN_EMAIL
        ? USER_ROLES.admin
        : USER_ROLES.guest;
}

function withUserRole(user) {
    return ({
        ...user,
        role: getRoleForEmail(user.email)
    });
}

function saveToStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getFromStorage(key) {
    const savedValue = localStorage.getItem(key);

    try {
        return savedValue ? JSON.parse(savedValue) : null;
    } catch {
        return null;
    }
}

function removeFromStorage(key) {
    localStorage.removeItem(key);
}

function getUsers() {
    const users = getFromStorage(storageKeys.users);
    return Array.isArray(users) ? users.map(withUserRole) : [];
}

function getStoredRecordCount(key) {
    const records = getFromStorage(key);
    return Array.isArray(records) ? records.length : 0;
}

function findUserByEmail(email) {
    const normalizedEmail = normalizeEmail(email);
    return getUsers().find(function(user) {
        return normalizeEmail(user.email) === normalizedEmail;
    }) || null;
}

function getAdminUser() {
    return findUserByEmail(ADMIN_EMAIL);
}

function getAdminSession() {
    return getFromStorage(storageKeys.adminSession);
}

function hasValidAdminSession() {
    const session = getAdminSession();
    const adminUser = getAdminUser();

    return Boolean(
        session
        && adminUser
        && session.userId === adminUser.id
        && normalizeEmail(session.email) === ADMIN_EMAIL
        && getRoleForEmail(adminUser.email) === USER_ROLES.admin
    );
}

function saveAdminSession(adminUser) {
    saveToStorage(storageKeys.adminSession, {
        userId: adminUser.id,
        email: adminUser.email,
        role: USER_ROLES.admin,
        createdAt: new Date().toISOString()
    });
}

function clearAdminSession() {
    removeFromStorage(storageKeys.adminSession);
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

function getFormValue(formData, key) {
    return String(formData.get(key) || "").trim();
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

    return { openingTime, closingTime };
}

function formatTimeForDisplay(time = "") {
    if (!isValidRestaurantTime(time)) {
        return "";
    }

    const [hourValue, minuteValue] = time.split(":").map(Number);
    const period = hourValue >= 12 ? "PM" : "AM";
    const displayHour = hourValue % 12 || 12;

    return `${displayHour}:${String(minuteValue).padStart(2, "0")} ${period}`;
}

function formatRestaurantHours(openingTime, closingTime) {
    return `${formatTimeForDisplay(openingTime)} - ${formatTimeForDisplay(closingTime)}`;
}

function formatTimeFromMinutes(totalMinutes = 0) {
    const minutesInDay = 24 * 60;
    const normalizedMinutes = ((totalMinutes % minutesInDay) + minutesInDay) % minutesInDay;
    const hours = String(Math.floor(normalizedMinutes / 60)).padStart(2, "0");
    const minutes = String(normalizedMinutes % 60).padStart(2, "0");

    return `${hours}:${minutes}`;
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
    if (TABLE_EXPERIENCE_NAMES.includes(experience)) {
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

function getActiveReservations() {
    return getReservations().filter(function({ status }) {
        return status === "active";
    });
}

function getWaitingEntries() {
    return getWaitlist().filter(function({ status }) {
        return status === "waiting";
    });
}

function getAverageRestaurantRating() {
    const ratings = getRestaurants()
        .map(function({ rating }) {
        return Number(rating);
    })
        .filter(function(rating) {
        return Number.isFinite(rating);
    });

    if (ratings.length === 0) {
        return "0.0";
    }

    const total = ratings.reduce(function(sum, rating) {
        return sum + rating;
    }, 0);
    return (total / ratings.length).toFixed(1);
}

function formatReservationDateTime(reservation = {}) {
    return [reservation.date, reservation.time].filter(Boolean).join(" at ") || "Time not set";
}

function formatReservationSeatIds(reservation = {}) {
    return (Array.isArray(reservation.selectedSeatIds) && reservation.selectedSeatIds.length > 0 ? reservation.selectedSeatIds.join(", ") : "Assigned at arrival");
}

function formatUSD(amount) {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD"
    }).format(Number(amount) || 0);
}

function getTodayDateValue() {
    const { year, month, day } = getUaeDateParts();
    return `${year}-${month}-${day}`;
}

function getReservationTimestamp(reservation = {}) {
    if (reservation.date && reservation.time) {
        const timestamp = new Date(`${reservation.date}T${reservation.time}`).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    return Number.MAX_SAFE_INTEGER;
}

function getReservationCreatedTimestamp(reservation = {}) {
    if (reservation.createdAt) {
        const timestamp = new Date(reservation.createdAt).getTime();

        if (Number.isFinite(timestamp)) {
            return timestamp;
        }
    }

    const reservationId = String(reservation.reservationId || "");
    let digitSequence = "";

    for (const character of reservationId) {
        if (containsOnlyDigits(character)) {
            digitSequence += character;
        } else if (digitSequence.length >= 10) {
            return Number(digitSequence);
        } else {
            digitSequence = "";
        }
    }

    return digitSequence.length >= 10 ? Number(digitSequence) : 0;
}

function getReservationTotalAmount(reservation = {}) {
    return Number(reservation.splitBill?.totalAmount)
        || Number(reservation.pricing?.finalTotal)
        || 0;
}

function getAcceptedAttendeeCount(reservation = {}) {
    const acceptedGuests = Array.isArray(reservation.guests)
        ? reservation.guests.filter(function({ rsvpStatus }) {
        return rsvpStatus === "accepted";
    }).length
        : 0;

    return 1 + acceptedGuests;
}

function getReservationStatus(reservation = {}) {
    return reservation.status || "unknown";
}

function getKnownReservationStatuses() {
    const statuses = getReservations()
        .map(getReservationStatus)
        .filter(Boolean);

    return [...new Set(["active", "confirmed", "completed", "cancelled", ...statuses])];
}

function getReservationRestaurantOptions() {
    return [...new Set(getReservations()
        .map(function({ restaurantName }) {
        return restaurantName;
    })
        .filter(Boolean))]
        .sort(function(firstName, secondName) {
        return firstName.localeCompare(secondName);
    });
}

function getReservationSummary() {
    const reservations = getReservations();
    const today = getTodayDateValue();

    return {
        total: reservations.length,
        active: reservations.filter(function({ status }) {
            return status === "active";
        }).length,
        upcomingToday: reservations.filter(function(reservation) {
            return (reservation.date === today
            && ["active", "confirmed"].includes(reservation.status) && getReservationTimestamp(reservation) >= Date.now());
        }).length,
        completedOrCancelled: reservations.filter(function({ status }) {
            return (["completed", "cancelled"].includes(status));
        }).length
    };
}

function getFilteredReservations() {
    const cleanSearchTerm = adminReservationSearchTerm.trim().toLowerCase();

    return getReservations()
        .filter(function(reservation) {
            const searchableText = [
                reservation.guestName,
                reservation.guestEmail,
                reservation.restaurantName,
                reservation.reservationId
            ].filter(Boolean).join(" ").toLowerCase();

            return searchableText.includes(cleanSearchTerm);
        })
        .filter(function(reservation) {
            return adminReservationStatusFilter === "all"
                || getReservationStatus(reservation) === adminReservationStatusFilter;
        })
        .filter(function(reservation) {
            return adminReservationRestaurantFilter === "all"
                || reservation.restaurantName === adminReservationRestaurantFilter;
        })
        .filter(function(reservation) {
            return !adminReservationDateFilter
                || reservation.date === adminReservationDateFilter;
        })
        .sort(function(firstReservation, secondReservation) {
            if (adminReservationSort === "newest") {
                return getReservationCreatedTimestamp(secondReservation) - getReservationCreatedTimestamp(firstReservation);
            }

            if (adminReservationSort === "guest") {
                return String(firstReservation.guestName || "")
                    .localeCompare(String(secondReservation.guestName || ""));
            }

            return getReservationTimestamp(firstReservation) - getReservationTimestamp(secondReservation);
        });
}

function getTimeMinutes(time = "") {
    const [hours = "0", minutes = "0"] = time.split(":");

    return (Number(hours) * 60) + Number(minutes);
}

function getCurrentUaeTimeMinutes() {
    const { hour, minute } = getUaeDateParts();

    return (Number(hour) * 60) + Number(minute);
}

function getRestaurantById(restaurantId) {
    return getRestaurants().find(function({ id }) {
        return String(id) === String(restaurantId);
    }) || null;
}

function getRestaurantTableLayout(restaurant = getRestaurantById(adminSelectedRestaurantId)) {
    if (!restaurant) {
        return [];
    }

    return normalizeRestaurantTableLayout(restaurant?.tableLayout);
}

function getAdminSelectedTableLayout() {
    return getRestaurantTableLayout();
}

function getRestaurantClosingMinutes(restaurant = null) {
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

function getRestaurantTimeSlots(restaurant = null) {
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

function isAdminTableDateToday(date = adminSelectedTableDate) {
    return date === getTodayDateValue();
}

function isAdminTableDateInPast(date = adminSelectedTableDate) {
    return Boolean(date) && date < getTodayDateValue();
}

function isAdminBookingTimeAvailable(
    time = adminSelectedTableTime,
    date = adminSelectedTableDate,
    restaurant = getRestaurantById(adminSelectedRestaurantId)
) {
    if (!date || !time || !restaurant || isAdminTableDateInPast(date)) {
        return false;
    }

    if (!getRestaurantTimeSlots(restaurant).includes(time)) {
        return false;
    }

    if (!isAdminTableDateToday(date)) {
        return true;
    }

    return getTimeMinutes(time) > getCurrentUaeTimeMinutes();
}

function getAvailableAdminTimeSlots(
    date = adminSelectedTableDate,
    restaurant = getRestaurantById(adminSelectedRestaurantId)
) {
    return getRestaurantTimeSlots(restaurant).filter(function(time) {
        return isAdminBookingTimeAvailable(time, date, restaurant);
    });
}

function ensureAdminTableSelection() {
    const restaurants = getRestaurants();

    if (restaurants.length === 0) {
        adminSelectedRestaurantId = null;
        adminSelectedTableDate = "";
        adminSelectedTableTime = "";
        return;
    }

    if (!adminSelectedRestaurantId || !restaurants.some(function({ id }) {
        return String(id) === String(adminSelectedRestaurantId);
    })) {
        adminSelectedRestaurantId = restaurants[0].id;
    }

    if (!adminSelectedTableDate) {
        adminSelectedTableDate = getTodayDateValue();
    }

    const restaurant = getRestaurantById(adminSelectedRestaurantId);
    const availableSlots = getAvailableAdminTimeSlots(adminSelectedTableDate, restaurant);
    const allSlots = getRestaurantTimeSlots(restaurant);

    if (!adminSelectedTableTime || !allSlots.includes(adminSelectedTableTime)) {
        adminSelectedTableTime = availableSlots[0] || allSlots[0] || "";
    }
}

function getAdminTableStatus({ tableId }) {
    const restaurant = getRestaurantById(adminSelectedRestaurantId);

    if (!adminSelectedRestaurantId || !adminSelectedTableDate || !adminSelectedTableTime || !isAdminBookingTimeAvailable(adminSelectedTableTime, adminSelectedTableDate, restaurant)) {
        return "Disabled";
    }

    const isReserved = getReservations().some(function(reservation) {
        return reservation.status === "active"
            && Number(reservation.restaurantId) === Number(adminSelectedRestaurantId)
            && reservation.date === adminSelectedTableDate
            && reservation.time === adminSelectedTableTime
            && reservation.tableId === tableId;
    });

    return isReserved ? "Reserved" : "Available";
}

function getAdminTableCounts() {
    const tableLayout = getAdminSelectedTableLayout();
    const statuses = tableLayout.map(getAdminTableStatus);

    return {
        total: tableLayout.length,
        available: statuses.filter(function(status) {
            return status === "Available";
        }).length,
        reserved: statuses.filter(function(status) {
            return status === "Reserved";
        }).length,
        seatCapacity: tableLayout.reduce(function(total, { seats }) {
            return total + seats;
        }, 0)
    };
}

function getTablesByCapacity() {
    const tableLayout = getAdminSelectedTableLayout();
    const capacities = [...new Set(tableLayout.map(function({ seats }) {
        return Number(seats);
    }).filter(Number.isFinite))]
        .sort(function(firstCapacity, secondCapacity) {
        return firstCapacity - secondCapacity;
    });

    return capacities.map(function(capacity) {
        return ({
            capacity,

            tables: tableLayout.filter(function({ seats }) {
                return Number(seats) === capacity;
            })
        });
    });
}

function createCheckboxChoices(options, selectedValues, inputName) {
    return options.map(function(option) {
        return `
            <label class="choice-chip">
                <input
                    type="checkbox"
                    name="${inputName}"
                    value="${escapeHTML(option)}"
                    ${selectedValues.includes(option) ? "checked" : ""}
                >
                <span>${escapeHTML(option)}</span>
            </label>
        `;
    }).join("");
}

function renderAdminRestaurantList() {
    const allRestaurants = getRestaurants();
    const cleanSearchTerm = adminRestaurantSearchTerm.trim().toLowerCase();
    const restaurants = allRestaurants.filter(function({ name = "", cuisine = "", location = "" }) {
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

    return restaurants.map(function({ id, name, cuisine, location, rating, priceLevel }) {
        return `
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
        `;
    }).join("");
}

function renderAdminTableLayout() {
    return defaultTableLayout.map(function({ tableId, seats, experience }) {
        return `
            <span class="summary-chip">${escapeHTML(tableId)} &middot; ${seats} seats &middot; ${escapeHTML(experience)}</span>
        `;
    }).join("");
}

function renderTableLayoutEditor() {
    const selectedRestaurant = getRestaurantById(adminSelectedRestaurantId);
    const tableLayout = getAdminSelectedTableLayout();

    return `
        <section class="profile-panel admin-panel table-layout-editor">
            <div class="form-heading">
                <p class="eyebrow">Table layout</p>
                <h2>${selectedRestaurant ? escapeHTML(selectedRestaurant.name) : "No restaurant selected"}</h2>
                <p>Add, remove, and monitor the saved table layout for this restaurant.</p>
            </div>

            <form class="admin-form table-layout-form" id="addTableForm" novalidate>
                <div class="table-layout-form-grid">
                    <label>
                        Table ID
                        <input type="text" name="tableId" placeholder="A1" autocomplete="off" ${selectedRestaurant ? "" : "disabled"}>
                    </label>
                    <label>
                        Seating Capacity
                        <input type="number" name="seats" min="1" step="1" placeholder="4" ${selectedRestaurant ? "" : "disabled"}>
                    </label>
                    <label>
                        Experience
                        <select name="experience" ${selectedRestaurant ? "" : "disabled"}>
                            ${TABLE_EXPERIENCE_NAMES.map(function(experience) {
        return `<option value="${experience}">${experience}</option>`;
    }).join("")}
                        </select>
                    </label>
                    <button class="primary-action" type="submit" ${selectedRestaurant ? "" : "disabled"}>Add Table</button>
                </div>
            </form>

            ${tableLayout.length === 0 ? `
                <div class="empty-state">
                    <h3>No tables configured.</h3>
                    <p>Add a table before customers can book this restaurant.</p>
                </div>
            ` : `
                <div class="table-layout-list" aria-label="Editable table layout">
                    ${tableLayout.map(function({ tableId, seats, experience }) {
        return `
                            <article class="table-layout-row">
                                <div>
                                    <strong>${escapeHTML(tableId)}</strong>
                                    <span>${seats} seats &middot; ${escapeHTML(experience)}</span>
                                </div>
                                <button class="danger-action" type="button" data-delete-table-id="${escapeHTML(tableId)}">Delete</button>
                            </article>
                        `;
    }).join("")}
                </div>
            `}
        </section>
    `;
}

function createRestaurantFormPanel() {
    return `
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
                                ${["$", "$$", "$$$", "$$$$"].map(function(priceLevel) {
        return `
                                        <option value="${priceLevel}">${priceLevel}</option>
                                    `;
    }).join("")}
                            </select>
                        </label>
                        <label>
                            Distance Category
                            <select name="distanceCategory" required>
                                ${["Nearby", "Medium", "Far"].map(function(distanceCategory) {
        return `
                                        <option value="${distanceCategory}">${distanceCategory}</option>
                                    `;
    }).join("")}
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
                        <div class="media-controls">
                            <label>
                                Image URL
                                <input type="url" name="image" id="restaurantImageInput" autocomplete="off">
                            </label>
                            <div class="media-separator" aria-hidden="true"><span>OR</span></div>
                            <label class="upload-image-control" for="restaurantImageUpload">
                                <span>Upload Image</span>
                                <input type="file" id="restaurantImageUpload" accept="image/*">
                            </label>
                            <p class="admin-inline-error" id="restaurantImageError" aria-live="polite" hidden></p>
                        </div>
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
}

function createPriceTiersPanel() {
    const priceTiers = getPriceTiers();

    return `
        <section class="profile-panel admin-panel settings-card">
            <div class="form-heading">
                <p class="eyebrow">Price tiers</p>
                <h3>Booking table fees</h3>
                <p>Changes are saved to the existing price tier configuration used by customer booking pricing.</p>
            </div>
            <div class="price-tier-grid">
                ${Object.keys(defaultPriceTiers).map(function(seats) {
        return `
                        <label>
                            ${seats}-seat fee
                            <input type="number" min="0" step="1" value="${priceTiers[seats]}" data-price-tier-seats="${seats}">
                        </label>
                    `;
    }).join("")}
            </div>
        </section>
    `;
}

function createSettingsTableLayoutPanel() {
    return `
        <section class="profile-panel admin-panel settings-card">
            <div class="form-heading">
                <p class="eyebrow">Fallback table layout</p>
                <h2>New restaurant starting map</h2>
                <p>Read-only fallback used when an older restaurant record does not have a saved table layout yet.</p>
            </div>
            <div class="admin-table-layout">
                ${renderAdminTableLayout()}
            </div>
        </section>
    `;
}

function renderDataOverview() {
    const overviewItems = [
        ["users", storageKeys.users],
        ["restaurants", storageKeys.restaurants],
        ["reservations", storageKeys.reservations],
        ["waitlist entries", storageKeys.waitlist],
        ["contact messages", storageKeys.contactMessages]
    ];

    return `
        <section class="profile-panel admin-panel settings-card">
            <div class="form-heading">
                <p class="eyebrow">Data overview</p>
                <h2>Local storage records</h2>
                <p>Read-only counts for existing application records. User credentials are not displayed.</p>
            </div>
            <div class="settings-count-grid">
                ${overviewItems.map(function([label, key]) {
        return `
                        <article class="settings-count-card">
                            <span>${escapeHTML(label)}</span>
                            <strong>${getStoredRecordCount(key)}</strong>
                        </article>
                    `;
    }).join("")}
            </div>
        </section>
    `;
}

function renderDataToolsPanel() {
    return `
        <section class="profile-panel admin-panel settings-card">
            <div class="form-heading">
                <p class="eyebrow">Data tools</p>
                <h2>Demo resets</h2>
            </div>
            <div class="settings-tools-grid">
                <article class="settings-tool-card">
                    <div>
                        <h3>Reset Restaurants</h3>
                        <p>Restores the default restaurant listings. Existing price tiers are preserved.</p>
                    </div>
                    <button class="secondary-action" type="button" id="resetRestaurantsButton">Reset Restaurants</button>
                </article>
                <article class="settings-tool-card">
                    <div>
                        <h3>Reset Price Tiers</h3>
                        <p>Restores the default 2-seat, 4-seat, 6-seat, and 8-seat table fees.</p>
                    </div>
                    <button class="secondary-action" type="button" id="resetPriceTiersButton">Reset Price Tiers</button>
                </article>
            </div>
        </section>
    `;
}

function createSavedRestaurantsPanel() {
    return `
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
        </section>
    `;
}

function attachManagementHandlers() {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    const restaurantForm = adminView.querySelector("#addRestaurantForm");
    const cancelEditButton = adminView.querySelector("#cancelEditRestaurantButton");
    const resetRestaurantsButton = adminView.querySelector("#resetRestaurantsButton");
    const resetPriceTiersButton = adminView.querySelector("#resetPriceTiersButton");
    const restaurantSearch = adminView.querySelector("#adminRestaurantSearch");
    const imageInput = adminView.querySelector("#restaurantImageInput");
    const imageUploadInput = adminView.querySelector("#restaurantImageUpload");
    const reservationSearch = adminView.querySelector("#reservationSearchInput");
    const reservationStatusFilter = adminView.querySelector("#reservationStatusFilter");
    const reservationRestaurantFilter = adminView.querySelector("#reservationRestaurantFilter");
    const reservationDateFilter = adminView.querySelector("#reservationDateFilter");
    const reservationSortSelect = adminView.querySelector("#reservationSortSelect");
    const tableRestaurantSelect = adminView.querySelector("#tableRestaurantSelect");
    const tableDateInput = adminView.querySelector("#tableDateInput");
    const tableTimeSelect = adminView.querySelector("#tableTimeSelect");
    const addTableForm = adminView.querySelector("#addTableForm");

    if (restaurantForm) {
        restaurantForm.addEventListener("submit", handleAddRestaurant);
    }

    adminView.querySelectorAll("[data-edit-restaurant-id]").forEach(function(button) {
        button.addEventListener("click", function() {
            return startEditRestaurant(button.dataset.editRestaurantId);
        });
    });
    adminView.querySelectorAll("[data-delete-restaurant-id]").forEach(function(button) {
        button.addEventListener("click", handleDeleteRestaurant);
    });
    adminView.querySelectorAll("[data-price-tier-seats]").forEach(function(input) {
        input.addEventListener("change", handlePriceTierUpdate);
    });
    adminView.querySelectorAll("[data-delete-table-id]").forEach(function(button) {
        button.addEventListener("click", handleDeleteTable);
    });

    if (cancelEditButton) {
        cancelEditButton.addEventListener("click", cancelRestaurantEdit);
    }

    if (resetRestaurantsButton) {
        resetRestaurantsButton.addEventListener("click", resetRestaurantsData);
    }

    if (resetPriceTiersButton) {
        resetPriceTiersButton.addEventListener("click", resetPriceTiersData);
    }

    if (restaurantSearch) {
        restaurantSearch.addEventListener("input", function(event) {
            adminRestaurantSearchTerm = event.target.value;
            updateAdminRestaurantList();
        });
    }

    if (imageInput) {
        if (!editingRestaurantId) {
            pendingRestaurantImageDataUrl = "";
        }

        imageInput.addEventListener("input", function() {
            return handleRestaurantImageUrlInput(imageInput);
        });
        updateRestaurantImagePreview(imageInput.value);
    }

    if (imageUploadInput) {
        imageUploadInput.addEventListener("change", handleRestaurantImageUpload);
    }

    if (reservationSearch) {
        reservationSearch.addEventListener("input", function(event) {
            adminReservationSearchTerm = event.target.value;
            updateReservationManagementList();
        });
    }

    if (reservationStatusFilter) {
        reservationStatusFilter.addEventListener("change", function(event) {
            adminReservationStatusFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationRestaurantFilter) {
        reservationRestaurantFilter.addEventListener("change", function(event) {
            adminReservationRestaurantFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationDateFilter) {
        reservationDateFilter.addEventListener("change", function(event) {
            adminReservationDateFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationSortSelect) {
        reservationSortSelect.addEventListener("change", function(event) {
            adminReservationSort = event.target.value;
            renderActiveAdminSection();
        });
    }

    attachReservationListHandlers();

    if (tableRestaurantSelect) {
        tableRestaurantSelect.addEventListener("change", function(event) {
            adminSelectedRestaurantId = event.target.value;
            adminSelectedTableTime = "";
            ensureAdminTableSelection();
            renderActiveAdminSection();
        });
    }

    if (tableDateInput) {
        tableDateInput.addEventListener("change", function(event) {
            adminSelectedTableDate = event.target.value;
            adminSelectedTableTime = "";
            ensureAdminTableSelection();
            renderActiveAdminSection();
        });
    }

    if (tableTimeSelect) {
        tableTimeSelect.addEventListener("change", function(event) {
            adminSelectedTableTime = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (addTableForm) {
        addTableForm.addEventListener("submit", handleAddTable);
    }

    if (editingRestaurantId && restaurantForm) {
        const restaurant = getRestaurants().find(function({ id }) {
            return String(id) === String(editingRestaurantId);
        });

        if (restaurant) {
            fillRestaurantForm(restaurant);
        }
    }
}

function updateAdminRestaurantList() {
    const restaurantList = document.querySelector("#adminRestaurantList");

    if (restaurantList) {
        restaurantList.innerHTML = renderAdminRestaurantList();
    }
}

function attachReservationListHandlers() {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    adminView.querySelectorAll("[data-reservation-status-id]").forEach(function(select) {
        select.addEventListener("change", handleReservationStatusChange);
    });

    adminView.querySelectorAll("[data-reservation-details-id]").forEach(function(button) {
        button.addEventListener("click", function() {
            expandedReservationId = expandedReservationId === button.dataset.reservationDetailsId
                ? null
                : button.dataset.reservationDetailsId;
            updateReservationManagementList();
        });
    });
}

function updateReservationManagementList() {
    const reservationList = document.querySelector("#reservationManagementList");
    const reservationCount = document.querySelector("#reservationShownCount");

    if (reservationList) {
        reservationList.innerHTML = renderReservationList();
        attachReservationListHandlers();
    }

    if (reservationCount) {
        reservationCount.textContent = `${getFilteredReservations().length} shown`;
    }
}

function isPreviewableImageURL(imageUrl = "") {
    try {
        const parsedUrl = new URL(imageUrl);
        return ["http:", "https:"].includes(parsedUrl.protocol);
    } catch {
        return false;
    }
}

function isPreviewableImageSource(imageSource = "") {
    return isPreviewableImageURL(imageSource)
        || String(imageSource).startsWith("data:image/");
}

function showRestaurantImageError(message = "") {
    const errorElement = document.querySelector("#restaurantImageError");

    if (!errorElement) {
        return;
    }

    errorElement.textContent = message;
    errorElement.hidden = !message;
}

function updateRestaurantImagePreview(imageUrl = "") {
    const preview = document.querySelector("#restaurantImagePreview");

    if (!preview) {
        return;
    }

    if (!isPreviewableImageSource(imageUrl)) {
        preview.innerHTML = "<span>Image preview</span>";
        preview.classList.remove("has-image");
        return;
    }

    preview.innerHTML = `<img src="${escapeHTML(imageUrl)}" alt="Restaurant image preview">`;
    preview.classList.add("has-image");

    const previewImage = preview.querySelector("img");

    if (previewImage) {
        previewImage.addEventListener("error", function() {
            preview.innerHTML = "<span>Image preview</span>";
            preview.classList.remove("has-image");
        });
    }
}

function clearRestaurantImageUploadInput() {
    const uploadInput = document.querySelector("#restaurantImageUpload");

    if (uploadInput) {
        uploadInput.value = "";
    }
}

function getCurrentRestaurantImageSource() {
    const imageInput = document.querySelector("#restaurantImageInput");
    return pendingRestaurantImageDataUrl || (imageInput ? imageInput.value : "");
}

function handleRestaurantImageUrlInput(imageInput) {
    pendingRestaurantImageDataUrl = "";
    clearRestaurantImageUploadInput();
    showRestaurantImageError("");
    updateRestaurantImagePreview(imageInput.value);
}

function handleRestaurantImageUpload(event) {
    const uploadInput = event.currentTarget;
    const [file] = uploadInput.files || [];

    showRestaurantImageError("");

    if (!file) {
        updateRestaurantImagePreview(getCurrentRestaurantImageSource());
        return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
        uploadInput.value = "";
        updateRestaurantImagePreview(getCurrentRestaurantImageSource());
        showRestaurantImageError("Choose a valid image file.");
        return;
    }

    if (file.size > MAX_RESTAURANT_IMAGE_UPLOAD_BYTES) {
        uploadInput.value = "";
        updateRestaurantImagePreview(getCurrentRestaurantImageSource());
        showRestaurantImageError("Image uploads must be 3 MB or smaller. Compress large images before uploading.");
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", function() {
        const dataUrl = String(reader.result || "");

        if (!dataUrl.startsWith("data:image/")) {
            uploadInput.value = "";
            updateRestaurantImagePreview(getCurrentRestaurantImageSource());
            showRestaurantImageError("Choose a valid image file.");
            return;
        }

        const imageInput = document.querySelector("#restaurantImageInput");

        if (imageInput) {
            imageInput.value = "";
        }

        pendingRestaurantImageDataUrl = dataUrl;
        updateRestaurantImagePreview(dataUrl);
    });

    reader.addEventListener("error", function() {
        uploadInput.value = "";
        updateRestaurantImagePreview(getCurrentRestaurantImageSource());
        showRestaurantImageError("The image could not be read. Try a different file.");
    });

    reader.readAsDataURL(file);
}

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
        .sort(function(firstReservation, secondReservation) {
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

    return reservations.map(function(reservation) {
        return `
            <article class="reservation-list-item">
                <div>
                    <strong>${escapeHTML(reservation.guestName || "Guest")}</strong>
                    <p>${escapeHTML(reservation.restaurantName || "Restaurant not set")} &middot; ${escapeHTML(formatReservationDateTime(reservation))}</p>
                </div>
                <span class="reservation-meta">${escapeHTML(reservation.status || "unknown")}</span>
            </article>
        `;
    }).join("");
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
                        ${getKnownReservationStatuses().map(function(status) {
        return `
                                <option value="${escapeHTML(status)}" ${adminReservationStatusFilter === status ? "selected" : ""}>
                                    ${escapeHTML(status)}
                                </option>
                            `;
    }).join("")}
                    </select>
                </label>
                <label>
                    Restaurant
                    <select id="reservationRestaurantFilter">
                        <option value="all">All restaurants</option>
                        ${getReservationRestaurantOptions().map(function(restaurantName) {
        return `
                                <option value="${escapeHTML(restaurantName)}" ${adminReservationRestaurantFilter === restaurantName ? "selected" : ""}>
                                    ${escapeHTML(restaurantName)}
                                </option>
                            `;
    }).join("")}
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
                ${guests.length === 0 ? `<p class="summary-muted">No invited guests.</p>` : `
                    <div class="reservation-detail-list">
                        ${guests.map(function({ name, email, rsvpStatus }) {
        return `
                                <div>
                                    <strong>${escapeHTML(name || "Guest")}</strong>
                                    <span>${escapeHTML(email || "No email")} &middot; ${escapeHTML(rsvpStatus || "pending")}</span>
                                </div>
                            `;
    }).join("")}
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
                    ${(splitBill.participants || []).map(function({ name, email, share }) {
        return `
                            <div>
                                <span>${escapeHTML(email || "No email")}</span>
                                <strong>${escapeHTML(name || "Participant")} &middot; ${formatUSD(share || 0)}</strong>
                            </div>
                        `;
    }).join("")}
                </div>
            </section>
            <section>
                <h3>Pre-order items</h3>
                ${preOrderItems.length === 0 ? `<p class="summary-muted">No pre-order items.</p>` : `
                    <div class="reservation-detail-list">
                        ${preOrderItems.map(function({ name, quantity, price }) {
        return `
                                <div>
                                    <strong>${escapeHTML(name || "Item")}</strong>
                                    <span>${escapeHTML(quantity || 0)} x ${formatUSD(price || 0)}</span>
                                </div>
                            `;
    }).join("")}
                    </div>
                `}
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

    return reservations.map(function(reservation) {
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
                            ${["active", "confirmed", "completed", "cancelled"].map(function(status) {
            return `
                                    <option value="${status}" ${getReservationStatus(reservation) === status ? "selected" : ""}>${status}</option>
                                `;
        }).join("")}
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
                        ${restaurants.map(function({ id, name }) {
        return `
                                <option value="${escapeHTML(id)}" ${String(adminSelectedRestaurantId) === String(id) ? "selected" : ""}>
                                    ${escapeHTML(name)}
                                </option>
                            `;
    }).join("")}
                    </select>
                </label>
                <label>
                    Date
                    <input type="date" id="tableDateInput" value="${escapeHTML(adminSelectedTableDate)}">
                </label>
                <label>
                    Time
                    <select id="tableTimeSelect" ${slots.length === 0 ? "disabled" : ""}>
                        ${slots.length === 0 ? `<option value="">No slots configured</option>` : slots.map(function(time) {
        return `
                                <option value="${time}" ${adminSelectedTableTime === time ? "selected" : ""} ${isAdminBookingTimeAvailable(time, adminSelectedTableDate, selectedRestaurant) ? "" : "disabled"}>
                                    ${time}
                                </option>
                            `;
    }).join("")}
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
    const shapeMarkup = table.shape
        ? `<span>Shape ${escapeHTML(table.shape)}</span>`
        : "";

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

    return getTablesByCapacity().map(function({ capacity, tables }) {
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
    }).join("");
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
    document.querySelectorAll("[data-admin-section]").forEach(function(button) {
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

    adminView.querySelectorAll("[data-admin-section-target]").forEach(function(button) {
        button.addEventListener("click", function() {
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

function getRestaurantDataFromForm(formData) {
    const openingTime = isValidRestaurantTime(getFormValue(formData, "openingTime"))
        ? getFormValue(formData, "openingTime")
        : DEFAULT_OPENING_TIME;
    const closingTime = isValidRestaurantTime(getFormValue(formData, "closingTime"))
        ? getFormValue(formData, "closingTime")
        : DEFAULT_CLOSING_TIME;
    const image = pendingRestaurantImageDataUrl || getFormValue(formData, "image");

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
            .map(function(badge) {
            return badge.trim();
        })
            .filter(Boolean),
        image
    };
}

function handleAddRestaurant(event) {
    event.preventDefault();

    const formData = new FormData(event.target);
    const restaurantData = getRestaurantDataFromForm(formData);

    if (!isPreviewableImageSource(restaurantData.image)) {
        showRestaurantImageError("Add an image URL or upload an image file.");
        updateRestaurantImagePreview("");
        return;
    }

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
    pendingRestaurantImageDataUrl = "";
    setAdminActionMessage("Restaurant saved.");
    renderActiveAdminSection();
}

function fillRestaurantForm(restaurant) {
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
    form.querySelectorAll('input[name="sustainabilityBadges"]').forEach(function(input) {
        input.checked = (restaurant.sustainabilityBadges || []).includes(input.value);
    });
    form.querySelectorAll('input[name="allergenBadges"]').forEach(function(input) {
        input.checked = (restaurant.allergenBadges || []).includes(input.value);
    });

    const restaurantImage = restaurant.image || "";
    pendingRestaurantImageDataUrl = restaurantImage.startsWith("data:image/") ? restaurantImage : "";
    form.elements.image.value = pendingRestaurantImageDataUrl ? "" : restaurantImage;
    clearRestaurantImageUploadInput();
    showRestaurantImageError("");
    updateRestaurantImagePreview(restaurantImage);
    form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function startEditRestaurant(restaurantId) {
    const restaurant = getRestaurants().find(function({ id }) {
        return String(id) === String(restaurantId);
    });

    if (!restaurant) {
        return;
    }

    editingRestaurantId = restaurant.id;
    renderActiveAdminSection();
}

function updateRestaurant(restaurantId, updatedData) {
    saveRestaurants(getRestaurants().map(function(restaurant) {
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
}

function updateRestaurantTableLayout(restaurantId, tableLayout) {
    saveRestaurants(getRestaurants().map(function(restaurant) {
        if (String(restaurant.id) !== String(restaurantId)) {
            return restaurant;
        }

        return {
            ...restaurant,
            tableLayout: normalizeRestaurantTableLayout(tableLayout)
        };
    }));
}

function handleAddTable(event) {
    event.preventDefault();

    const restaurant = getRestaurantById(adminSelectedRestaurantId);

    if (!restaurant) {
        setAdminActionMessage("Select a restaurant before adding a table.", "error");
        renderActiveAdminSection();
        return;
    }

    const formData = new FormData(event.currentTarget);
    const tableId = getFormValue(formData, "tableId");
    const seats = Math.floor(Number(formData.get("seats")));
    const experience = normalizeTableExperience(getFormValue(formData, "experience"));
    const tableLayout = getRestaurantTableLayout(restaurant);
    const hasDuplicateTableId = tableLayout.some(function(table) {
        return table.tableId.toLowerCase() === tableId.toLowerCase();
    });

    if (!tableId) {
        setAdminActionMessage("Enter a table ID before adding a table.", "error");
        renderActiveAdminSection();
        return;
    }

    if (hasDuplicateTableId) {
        setAdminActionMessage(`Table ID ${tableId} already exists for this restaurant.`, "error");
        renderActiveAdminSection();
        return;
    }

    if (!Number.isFinite(seats) || seats < 1) {
        setAdminActionMessage("Enter a seating capacity of at least 1.", "error");
        renderActiveAdminSection();
        return;
    }

    updateRestaurantTableLayout(restaurant.id, [
        ...tableLayout,
        { tableId, seats, experience }
    ]);
    setAdminActionMessage(`Table ${tableId} added.`);
    renderActiveAdminSection();
}

function handleDeleteTable(event) {
    const tableId = event.currentTarget.dataset.deleteTableId;
    const restaurant = getRestaurantById(adminSelectedRestaurantId);

    if (!restaurant || !tableId) {
        return;
    }

    updateRestaurantTableLayout(
        restaurant.id,
        getRestaurantTableLayout(restaurant).filter(function(table) {
            return table.tableId !== tableId;
        })
    );
    setAdminActionMessage(`Table ${tableId} deleted.`);
    renderActiveAdminSection();
}

function cancelRestaurantEdit() {
    editingRestaurantId = null;
    pendingRestaurantImageDataUrl = "";
    setAdminActionMessage("Restaurant edit cancelled.");
    renderActiveAdminSection();
}

function handleDeleteRestaurant(event) {
    const restaurantId = event.currentTarget.dataset.deleteRestaurantId;
    const restaurant = getRestaurants().find(function({ id }) {
        return String(id) === String(restaurantId);
    });
    const restaurantName = restaurant?.name || "this restaurant";

    if (!window.confirm(`Delete ${restaurantName}? This removes it from the shared restaurant listings.`)) {
        return;
    }

    saveRestaurants(getRestaurants().filter(function({ id }) {
        return String(id) !== String(restaurantId);
    }));

    if (String(editingRestaurantId) === String(restaurantId)) {
        editingRestaurantId = null;
        pendingRestaurantImageDataUrl = "";
    }

    setAdminActionMessage("Restaurant deleted.");
    renderActiveAdminSection();
}

function handlePriceTierUpdate(event) {
    const seats = event.target.dataset.priceTierSeats;
    const nextPriceTiers = {
        ...getPriceTiers(),
        [seats]: Math.max(0, Number(event.target.value) || 0)
    };

    savePriceTiers(nextPriceTiers);
    event.target.value = nextPriceTiers[seats];
    setAdminActionMessage(`${seats}-seat fee updated.`);
    updateAdminActionMessage();
}

function handleReservationStatusChange(event) {
    const reservationId = event.target.dataset.reservationStatusId;
    const nextStatus = event.target.value;

    saveReservations(getReservations().map(function(reservation) {
        if (String(reservation.reservationId) !== String(reservationId)) {
            return reservation;
        }

        return {
            ...reservation,
            status: nextStatus
        };
    }));

    setAdminActionMessage("Reservation status updated.");
    renderActiveAdminSection();
}

function resetRestaurantsData() {
    if (!window.confirm("Reset restaurants to the default demo listings? Current custom restaurant listings will be replaced.")) {
        return;
    }

    editingRestaurantId = null;
    saveRestaurants(defaultRestaurants);
    setAdminActionMessage("Restaurants reset to default demo listings.");
    renderActiveAdminSection();
}

function resetPriceTiersData() {
    if (!window.confirm("Reset price tiers to the default table fees? Current custom fees will be replaced.")) {
        return;
    }

    savePriceTiers(defaultPriceTiers);
    setAdminActionMessage("Price tiers reset to defaults.");
    renderActiveAdminSection();
}

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
        loginForm.addEventListener("input", function() {
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

    document.querySelectorAll("[data-admin-section]").forEach(function(button) {
        button.addEventListener("click", function() {
            return setActiveAdminSection(button.dataset.adminSection);
        });
    });

    if (menuButton && sidebar) {
        menuButton.addEventListener("click", function() {
            const isOpen = sidebar.classList.toggle("is-open");
            menuButton.setAttribute("aria-expanded", String(isOpen));
        });
    }

    if (viewCustomerSiteButton) {
        viewCustomerSiteButton.addEventListener("click", function() {
            window.location.href = "../index.html";
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener("click", function() {
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
