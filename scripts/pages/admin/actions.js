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
            .map(function (badge) {
                return badge.trim();
            })
            .filter(Boolean),
        image
    };
}

function handleAddRestaurant(event) {
    event.preventDefault();

    if (adminActionInProgress) {
        return;
    }

    const formData = new FormData(event.target);
    const restaurantData = getRestaurantDataFromForm(formData);
    const normalizedName = restaurantData.name.toLowerCase();
    const normalizedLocation = restaurantData.location.toLowerCase();
    const duplicateRestaurant = getRestaurants().find(function (restaurant) {
        return (
            String(restaurant.id) !== String(editingRestaurantId) &&
            String(restaurant.name || "").trim().toLowerCase() === normalizedName &&
            String(restaurant.location || "").trim().toLowerCase() === normalizedLocation
        );
    });

    if (!restaurantData.name || !restaurantData.cuisine || !restaurantData.location) {
        setAdminActionMessage("Enter the restaurant name, cuisine, and location.", "error");
        updateAdminActionMessage();
        return;
    }

    if (!Number.isFinite(restaurantData.rating) || restaurantData.rating < 0 || restaurantData.rating > 5) {
        setAdminActionMessage("Enter a restaurant rating from 0 to 5.", "error");
        updateAdminActionMessage();
        return;
    }

    if (duplicateRestaurant) {
        setAdminActionMessage("A restaurant with this name and location already exists.", "error");
        updateAdminActionMessage();
        return;
    }

    if (!isPreviewableImageSource(restaurantData.image)) {
        showRestaurantImageError("Add an image URL or upload an image file.");
        updateRestaurantImagePreview("");
        return;
    }

    adminActionInProgress = true;

    try {
        if (editingRestaurantId) {
            updateRestaurant(editingRestaurantId, restaurantData);
        } else {
            const restaurants = getRestaurants();
            let restaurantId = Date.now();

            while (restaurants.some(function ({ id }) {
                return String(id) === String(restaurantId);
            })) {
                restaurantId += 1;
            }

            saveRestaurants([
                ...restaurants,
                {
                    id: restaurantId,
                    ...restaurantData,
                    menu: []
                }
            ]);
        }
    } finally {
        adminActionInProgress = false;
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
    form.querySelectorAll('input[name="sustainabilityBadges"]').forEach(function (input) {
        input.checked = (restaurant.sustainabilityBadges || []).includes(input.value);
    });
    form.querySelectorAll('input[name="allergenBadges"]').forEach(function (input) {
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
    const restaurant = getRestaurants().find(function ({ id }) {
        return String(id) === String(restaurantId);
    });

    if (!restaurant) {
        return;
    }

    editingRestaurantId = restaurant.id;
    renderActiveAdminSection();
}

function updateRestaurant(restaurantId, updatedData) {
    saveRestaurants(
        getRestaurants().map(function (restaurant) {
            if (String(restaurant.id) !== String(restaurantId)) {
                return restaurant;
            }

            return {
                ...restaurant,
                ...updatedData,
                id: restaurant.id,
                menu: restaurant.menu || []
            };
        })
    );
}

function updateRestaurantTableLayout(restaurantId, tableLayout) {
    saveRestaurants(
        getRestaurants().map(function (restaurant) {
            if (String(restaurant.id) !== String(restaurantId)) {
                return restaurant;
            }

            return {
                ...restaurant,
                tableLayout: normalizeRestaurantTableLayout(tableLayout)
            };
        })
    );
}

function handleAddTable(event) {
    event.preventDefault();

    if (adminActionInProgress) {
        return;
    }

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
    const hasDuplicateTableId = tableLayout.some(function (table) {
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

    adminActionInProgress = true;
    updateRestaurantTableLayout(restaurant.id, [...tableLayout, { tableId, seats, experience }]);
    adminActionInProgress = false;
    setAdminActionMessage(`Table ${tableId} added.`);
    renderActiveAdminSection();
}

function handleDeleteTable(event) {
    const tableId = event.currentTarget.dataset.deleteTableId;
    const restaurant = getRestaurantById(adminSelectedRestaurantId);

    if (!restaurant || !tableId) {
        return;
    }

    const status = getAdminTableStatus({ tableId });
    const warning =
        status === "Reserved"
            ? `Table ${tableId} is reserved for the selected slot. Delete it from ${restaurant.name} anyway? Existing reservation history will remain.`
            : `Delete table ${tableId} from ${restaurant.name}?`;

    if (!window.confirm(warning)) {
        return;
    }

    updateRestaurantTableLayout(
        restaurant.id,
        getRestaurantTableLayout(restaurant).filter(function (table) {
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
    const restaurant = getRestaurants().find(function ({ id }) {
        return String(id) === String(restaurantId);
    });
    const restaurantName = restaurant?.name || "this restaurant";

    if (!window.confirm(`Delete ${restaurantName}? This removes it from the shared restaurant listings.`)) {
        return;
    }

    saveRestaurants(
        getRestaurants().filter(function ({ id }) {
            return String(id) !== String(restaurantId);
        })
    );

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

function handlePriceTierFormSubmit(event) {
    event.preventDefault();

    if (adminActionInProgress) {
        return;
    }

    const inputs = Array.from(event.currentTarget.querySelectorAll("[data-price-tier-seats]"));
    const invalidInput = inputs.find(function (input) {
        const amount = Number(input.value);
        return !Number.isFinite(amount) || amount < 0;
    });
    const errorElement = document.querySelector("#priceTierError");

    if (invalidInput) {
        if (errorElement) {
            errorElement.textContent = "Enter a non-negative amount for every table fee.";
            errorElement.hidden = false;
        }
        invalidInput.focus();
        return;
    }

    const nextPriceTiers = inputs.reduce(function (tiers, input) {
        tiers[input.dataset.priceTierSeats] = Number(input.value);
        return tiers;
    }, {});

    adminActionInProgress = true;
    savePriceTiers(nextPriceTiers);
    adminActionInProgress = false;

    if (errorElement) {
        errorElement.textContent = "";
        errorElement.hidden = true;
    }

    setAdminActionMessage("Pricing settings saved.");
    updateAdminActionMessage();
}

function handleReservationStatusChange(event) {
    const reservationId = event.target.dataset.reservationStatusId;
    const nextStatus = event.target.value;
    const reservation = getReservations().find(function (entry) {
        return String(entry.reservationId) === String(reservationId);
    });

    if (!reservation || adminActionInProgress || !["active", "confirmed", "completed", "cancelled"].includes(nextStatus)) {
        renderActiveAdminSection();
        return;
    }

    if (
        nextStatus === "cancelled" &&
        getReservationStatus(reservation) !== "cancelled" &&
        !window.confirm(`Cancel reservation ${reservationId}? The reservation will remain in history.`)
    ) {
        renderActiveAdminSection();
        return;
    }

    adminActionInProgress = true;
    saveReservations(
        getReservations().map(function (reservation) {
            if (String(reservation.reservationId) !== String(reservationId)) {
                return reservation;
            }

            return {
                ...reservation,
                status: nextStatus
            };
        })
    );
    adminActionInProgress = false;

    setAdminActionMessage("Reservation status updated.");
    renderActiveAdminSection();
}

function resetRestaurantsData() {
    if (
        !window.confirm(
            "Reset restaurants to the default demo listings? Current custom restaurant listings will be replaced."
        )
    ) {
        return;
    }

    editingRestaurantId = null;
    saveFactoryDataToStorage("restaurants");
    setAdminActionMessage("Restaurants reset to default demo listings.");
    renderActiveAdminSection();
}

function resetPriceTiersData() {
    if (!window.confirm("Reset price tiers to the default table fees? Current custom fees will be replaced.")) {
        return;
    }

    saveFactoryDataToStorage("priceTiers");
    setAdminActionMessage("Price tiers reset to defaults.");
    renderActiveAdminSection();
}
