let bookingTableSelector3DModule = null;
let bookingTableSelector3DInitToken = 0;
const bookingTableSelector3DModuleUrl = new URL("../3d-booking/table-selector-3d.js", document.currentScript.src).href;
const bookingTableSelector3DModulePromise = import(bookingTableSelector3DModuleUrl)
    .then(function (module) {
        bookingTableSelector3DModule = module;
        return module;
    })
    .catch(function (error) {
        console.warn("Interactive 3D floor module unavailable; table cards will be shown.", error);
        return null;
    });

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
    bookingDraft: "bookingDraft",
    users: "users",
    reservations: "reservations",
    waitlist: "waitlist",
    restaurants: "restaurants",
    priceTiers: "priceTiers",
    contactMessages: "contactMessages",
    favoriteRestaurantIds: "favoriteRestaurantIds"
};
