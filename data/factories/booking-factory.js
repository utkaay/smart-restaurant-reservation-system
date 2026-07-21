const DEFAULT_PRICE_TIERS = {
    2: 0,
    4: 10,
    6: 20,
    8: 30
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

const DEFAULT_TABLE_LAYOUT = [
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

const DEFAULT_RESERVATIONS = [];
const DEFAULT_WAITLIST = [];
