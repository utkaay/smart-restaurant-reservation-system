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
    supportRequests: "jacksSupportRequests",
    adminSession: "adminSession"
};

const TABLE_EXPERIENCE_NAMES = ["Regular", "Premium", "VIP"];

const sustainabilityBadgeOptions = ["Eco Certified", "Locally Sourced", "Plastic Free", "Organic"];
const allergenBadgeOptions = ["Nuts", "Dairy", "Gluten", "Shellfish", "Eggs", "Soy"];
const DEFAULT_OPENING_TIME = "11:00";
const DEFAULT_CLOSING_TIME = "22:00";
const BOOKING_TIME_ZONE = "Asia/Dubai";
const TIME_SLOT_INTERVAL_MINUTES = 30;
const MAX_RESTAURANT_IMAGE_UPLOAD_BYTES = 2 * 1024 * 1024;
const SUPPORT_REQUEST_TOPICS = [
    "Reservation Help",
    "Table Selection",
    "Account",
    "Cancellation",
    "Technical Problem",
    "Other"
];
const SUPPORT_REQUEST_STATUSES = ["new", "in-progress", "resolved"];

let editingRestaurantId = null;
let activeAdminSection = "dashboard";
let adminRestaurantSearchTerm = "";
let adminRestaurantPriceFilter = "all";
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
let adminSupportSearchTerm = "";
let adminSupportTopicFilter = "all";
let adminSupportStatusFilter = "all";
let adminSelectedSupportRequestId = null;
let adminActionInProgress = false;

function normalizeEmail(email = "") {
    return String(email).trim().toLowerCase();
}

function getRoleForEmail(email = "") {
    return normalizeEmail(email) === ADMIN_EMAIL ? USER_ROLES.admin : USER_ROLES.guest;
}

function withUserRole(user) {
    return {
        ...user,
        role: getRoleForEmail(user.email)
    };
}
