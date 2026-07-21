function createCheckboxChoices(options, selectedValues, inputName) {
    return options
        .map(function (option) {
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
        })
        .join("");
}

function renderAdminRestaurantList() {
    const allRestaurants = getRestaurants();
    const cleanSearchTerm = adminRestaurantSearchTerm.trim().toLowerCase();
    const restaurants = allRestaurants.filter(function ({ name = "", cuisine = "", location = "" }) {
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

    return restaurants
        .map(function ({ id, name, cuisine, location, rating, priceLevel }) {
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
        })
        .join("");
}

function renderAdminTableLayout() {
    return DEFAULT_TABLE_LAYOUT.map(function ({ tableId, seats, experience }) {
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
                            ${TABLE_EXPERIENCE_NAMES.map(function (experience) {
                                return `<option value="${experience}">${experience}</option>`;
                            }).join("")}
                        </select>
                    </label>
                    <button class="primary-action" type="submit" ${selectedRestaurant ? "" : "disabled"}>Add Table</button>
                </div>
            </form>

            ${
                tableLayout.length === 0
                    ? `
                <div class="empty-state">
                    <h3>No tables configured.</h3>
                    <p>Add a table before customers can book this restaurant.</p>
                </div>
            `
                    : `
                <div class="table-layout-list" aria-label="Editable table layout">
                    ${tableLayout
                        .map(function ({ tableId, seats, experience }) {
                            return `
                            <article class="table-layout-row">
                                <div>
                                    <strong>${escapeHTML(tableId)}</strong>
                                    <span>${seats} seats &middot; ${escapeHTML(experience)}</span>
                                </div>
                                <button class="danger-action" type="button" data-delete-table-id="${escapeHTML(tableId)}">Delete</button>
                            </article>
                        `;
                        })
                        .join("")}
                </div>
            `
            }
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
                                ${["$", "$$", "$$$", "$$$$"]
                                    .map(function (priceLevel) {
                                        return `
                                        <option value="${priceLevel}">${priceLevel}</option>
                                    `;
                                    })
                                    .join("")}
                            </select>
                        </label>
                        <label>
                            Distance Category
                            <select name="distanceCategory" required>
                                ${["Nearby", "Medium", "Far"]
                                    .map(function (distanceCategory) {
                                        return `
                                        <option value="${distanceCategory}">${distanceCategory}</option>
                                    `;
                                    })
                                    .join("")}
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
                ${Object.keys(DEFAULT_PRICE_TIERS)
                    .map(function (seats) {
                        return `
                        <label>
                            ${seats}-seat fee
                            <input type="number" min="0" step="1" value="${priceTiers[seats]}" data-price-tier-seats="${seats}">
                        </label>
                    `;
                    })
                    .join("")}
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
                ${overviewItems
                    .map(function ([label, key]) {
                        return `
                        <article class="settings-count-card">
                            <span>${escapeHTML(label)}</span>
                            <strong>${getStoredRecordCount(key)}</strong>
                        </article>
                    `;
                    })
                    .join("")}
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

    adminView.querySelectorAll("[data-edit-restaurant-id]").forEach(function (button) {
        button.addEventListener("click", function () {
            return startEditRestaurant(button.dataset.editRestaurantId);
        });
    });
    adminView.querySelectorAll("[data-delete-restaurant-id]").forEach(function (button) {
        button.addEventListener("click", handleDeleteRestaurant);
    });
    adminView.querySelectorAll("[data-price-tier-seats]").forEach(function (input) {
        input.addEventListener("change", handlePriceTierUpdate);
    });
    adminView.querySelectorAll("[data-delete-table-id]").forEach(function (button) {
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
        restaurantSearch.addEventListener("input", function (event) {
            adminRestaurantSearchTerm = event.target.value;
            updateAdminRestaurantList();
        });
    }

    if (imageInput) {
        if (!editingRestaurantId) {
            pendingRestaurantImageDataUrl = "";
        }

        imageInput.addEventListener("input", function () {
            return handleRestaurantImageUrlInput(imageInput);
        });
        updateRestaurantImagePreview(imageInput.value);
    }

    if (imageUploadInput) {
        imageUploadInput.addEventListener("change", handleRestaurantImageUpload);
    }

    if (reservationSearch) {
        reservationSearch.addEventListener("input", function (event) {
            adminReservationSearchTerm = event.target.value;
            updateReservationManagementList();
        });
    }

    if (reservationStatusFilter) {
        reservationStatusFilter.addEventListener("change", function (event) {
            adminReservationStatusFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationRestaurantFilter) {
        reservationRestaurantFilter.addEventListener("change", function (event) {
            adminReservationRestaurantFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationDateFilter) {
        reservationDateFilter.addEventListener("change", function (event) {
            adminReservationDateFilter = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (reservationSortSelect) {
        reservationSortSelect.addEventListener("change", function (event) {
            adminReservationSort = event.target.value;
            renderActiveAdminSection();
        });
    }

    attachReservationListHandlers();

    if (tableRestaurantSelect) {
        tableRestaurantSelect.addEventListener("change", function (event) {
            adminSelectedRestaurantId = event.target.value;
            adminSelectedTableTime = "";
            ensureAdminTableSelection();
            renderActiveAdminSection();
        });
    }

    if (tableDateInput) {
        tableDateInput.addEventListener("change", function (event) {
            adminSelectedTableDate = event.target.value;
            adminSelectedTableTime = "";
            ensureAdminTableSelection();
            renderActiveAdminSection();
        });
    }

    if (tableTimeSelect) {
        tableTimeSelect.addEventListener("change", function (event) {
            adminSelectedTableTime = event.target.value;
            renderActiveAdminSection();
        });
    }

    if (addTableForm) {
        addTableForm.addEventListener("submit", handleAddTable);
    }

    if (editingRestaurantId && restaurantForm) {
        const restaurant = getRestaurants().find(function ({ id }) {
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

    adminView.querySelectorAll("[data-reservation-status-id]").forEach(function (select) {
        select.addEventListener("change", handleReservationStatusChange);
    });

    adminView.querySelectorAll("[data-reservation-details-id]").forEach(function (button) {
        button.addEventListener("click", function () {
            expandedReservationId =
                expandedReservationId === button.dataset.reservationDetailsId
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
    return isPreviewableImageURL(imageSource) || String(imageSource).startsWith("data:image/");
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
        previewImage.addEventListener("error", function () {
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

    reader.addEventListener("load", function () {
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

    reader.addEventListener("error", function () {
        uploadInput.value = "";
        updateRestaurantImagePreview(getCurrentRestaurantImageSource());
        showRestaurantImageError("The image could not be read. Try a different file.");
    });

    reader.readAsDataURL(file);
}
