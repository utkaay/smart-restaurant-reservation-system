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
        hoursText.length !== 2 ||
        minutesText.length !== 2 ||
        !containsOnlyDigits(hoursText) ||
        !containsOnlyDigits(minutesText)
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
        hoursText.length < 1 ||
        hoursText.length > 2 ||
        minutesText.length !== 2 ||
        !containsOnlyDigits(hoursText) ||
        !containsOnlyDigits(minutesText)
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
    const sourceLayout = hasSavedLayout ? tableLayout : DEFAULT_TABLE_LAYOUT;
    const seenTableIds = new Set();

    return sourceLayout.reduce(function (layout, table = {}) {
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
    const restaurants = Array.isArray(savedRestaurants) ? savedRestaurants : DEFAULT_RESTAURANTS;

    return restaurants.map(function (restaurant) {
        return {
            ...normalizeRestaurantHours(restaurant),
            distanceCategory: restaurant.distanceCategory || "Medium",
            sustainabilityBadges: restaurant.sustainabilityBadges || [],
            allergenBadges: restaurant.allergenBadges || [],
            tableLayout: normalizeRestaurantTableLayout(restaurant.tableLayout)
        };
    });
}

function saveRestaurants(restaurants) {
    saveToStorage(
        storageKeys.restaurants,
        restaurants.map(function (restaurant) {
            return {
                ...normalizeRestaurantHours(restaurant),
                tableLayout: normalizeRestaurantTableLayout(restaurant.tableLayout)
            };
        })
    );
}

function getPriceTiers() {
    const savedPriceTiers = getFromStorage(storageKeys.priceTiers) || {};

    return {
        ...DEFAULT_PRICE_TIERS,
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

function createEmptyBookingState() {
    return {
        restaurantId: null,
        date: "",
        time: DEFAULT_OPENING_TIME,
        partySize: 1,
        mood: "",
        tableId: "",
        selectedSeatIds: [],
        experienceFilter: "Regular",
        couponCode: "",
        memberTier: "Standard",
        invitedGuests: [],
        preOrderItems: {},
        confirmedReservation: null
    };
}

function normalizeBookingDate(value) {
    const dateText = typeof value === "string" ? value.trim() : "";
    const dateParts = dateText.split("-");

    if (
        dateParts.length !== 3 ||
        dateParts[0].length !== 4 ||
        dateParts[1].length !== 2 ||
        dateParts[2].length !== 2 ||
        !containsOnlyDigits(dateParts[0]) ||
        !containsOnlyDigits(dateParts[1]) ||
        !containsOnlyDigits(dateParts[2])
    ) {
        return "";
    }

    const year = Number(dateParts[0]);
    const month = Number(dateParts[1]);
    const day = Number(dateParts[2]);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
        return "";
    }

    return dateText;
}

function normalizeBookingText(value, maximumLength = 100) {
    return typeof value === "string" ? value.trim().slice(0, maximumLength) : "";
}

function normalizeBookingPartySize(value, fallback = 1) {
    const partySize = Math.trunc(Number(value));

    if (!Number.isFinite(partySize) || partySize < 1 || partySize > 8) {
        return fallback;
    }

    return partySize;
}

function normalizeBookingMood(value) {
    const allowedMoods = ["Date night", "Family friendly", "Quick bite", "Fine dining", "Casual"];
    const normalizedValue = normalizeBookingText(value, 40).toLowerCase();

    return (
        allowedMoods.find(function (mood) {
            return mood.toLowerCase() === normalizedValue;
        }) || ""
    );
}

function normalizeBookingSeatIds(seatIds) {
    if (!Array.isArray(seatIds)) {
        return [];
    }

    return Array.from(
        new Set(
            seatIds
                .map(function (seatId) {
                    return normalizeBookingText(seatId, 30);
                })
                .filter(Boolean)
        )
    ).slice(0, 20);
}

function normalizeInvitedGuests(invitedGuests) {
    if (!Array.isArray(invitedGuests)) {
        return [];
    }

    return invitedGuests
        .reduce(function (guests, guest) {
            if (!guest || typeof guest !== "object" || Array.isArray(guest)) {
                return guests;
            }

            const name = normalizeBookingText(guest.name, 80);
            const email = normalizeBookingText(guest.email, 120);

            if (!name || !email) {
                return guests;
            }

            const rsvpStatuses = ["pending", "accepted", "declined"];
            const rsvpStatus = rsvpStatuses.includes(guest.rsvpStatus) ? guest.rsvpStatus : "pending";

            guests.push({
                guestId: normalizeBookingText(guest.guestId, 50) || `guest-${Date.now()}-${guests.length + 1}`,
                name,
                email,
                rsvpStatus
            });
            return guests;
        }, [])
        .slice(0, 20);
}

function normalizePreOrderItems(preOrderItems) {
    if (!preOrderItems || typeof preOrderItems !== "object" || Array.isArray(preOrderItems)) {
        return {};
    }

    return Object.entries(preOrderItems).reduce(function (items, entry) {
        const itemId = normalizeBookingText(entry[0], 80);
        const quantity = Math.floor(Number(entry[1]));
        const isUnsafeItemId = itemId === "__proto__" || itemId === "constructor" || itemId === "prototype";

        if (itemId && !isUnsafeItemId && Number.isFinite(quantity) && quantity > 0 && quantity <= 99) {
            items[itemId] = quantity;
        }

        return items;
    }, {});
}

function normalizeBookingDraft(savedDraft) {
    const emptyState = createEmptyBookingState();

    if (!savedDraft || typeof savedDraft !== "object" || Array.isArray(savedDraft)) {
        return emptyState;
    }

    const restaurantId = Number(savedDraft.restaurantId);
    const hasValidRestaurantId = Number.isSafeInteger(restaurantId) && restaurantId > 0;

    if (!hasValidRestaurantId) {
        return emptyState;
    }

    return {
        restaurantId,
        date: normalizeBookingDate(savedDraft.date),
        time: isValidRestaurantTime(savedDraft.time) ? savedDraft.time : DEFAULT_OPENING_TIME,
        partySize: normalizeBookingPartySize(savedDraft.partySize),
        mood: normalizeBookingMood(savedDraft.mood),
        tableId: normalizeBookingText(savedDraft.tableId, 30),
        selectedSeatIds: normalizeBookingSeatIds(savedDraft.selectedSeatIds),
        experienceFilter: normalizeTableExperience(savedDraft.experienceFilter),
        couponCode: normalizeBookingText(savedDraft.couponCode, 40),
        memberTier: Object.hasOwn(memberDiscountRates, savedDraft.memberTier) ? savedDraft.memberTier : "Standard",
        invitedGuests: normalizeInvitedGuests(savedDraft.invitedGuests),
        preOrderItems: normalizePreOrderItems(savedDraft.preOrderItems),
        confirmedReservation: null
    };
}

function loadBookingDraft() {
    return normalizeBookingDraft(getFromStorage(storageKeys.bookingDraft));
}

function saveBookingDraft() {
    if (!bookingState.restaurantId || bookingState.confirmedReservation) {
        clearBookingDraft();
        return;
    }

    saveToStorage(storageKeys.bookingDraft, normalizeBookingDraft(bookingState));
}

function clearBookingDraft() {
    removeFromStorage(storageKeys.bookingDraft);
}

let bookingState = loadBookingDraft();
let bookingMessage = "";
let invitedGuestMessage = "";
let seatSelectionMessage = "";
let smartMatchFilters = {
    mood: "Date Night",
    budget: "$$",
    distance: "Nearby"
};

window.addEventListener("pagehide", saveBookingDraft);
