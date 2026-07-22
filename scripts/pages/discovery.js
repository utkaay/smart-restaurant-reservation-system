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
        '"': "&quot;",
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

    return badges
        .map(function (badge) {
            return `<span class="badge${badgeTypeClass}">${escapeHTML(badge)}</span>`;
        })
        .join("");
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

const discoveryFilterDefaults = {
    cuisine: "All",
    location: "All",
    price: "All",
    rating: "All",
    dietary: "All"
};

const discoveryCuisineFilters = filters.filter(function (filterName) {
    return !["Rooftop", "Family Friendly"].includes(filterName);
});

let discoveryFacetFilters = {
    ...discoveryFilterDefaults,
    cuisine: discoveryCuisineFilters.includes(activeFilter) ? activeFilter : "All",
    dietary: ["Rooftop", "Family Friendly"].includes(activeFilter) ? activeFilter : "All"
};

const discoveryPlanDefaults = Object.freeze({
    datePreset: "tonight",
    date: "",
    time: "19:30",
    partySize: 2,
    mood: "Date night"
});

let discoveryPlanState = { ...discoveryPlanDefaults };

function getDiscoveryBookingPreferences() {
    return {
        date: discoveryPlanState.date,
        time: discoveryPlanState.time,
        partySize: discoveryPlanState.partySize,
        mood: discoveryPlanState.mood
    };
}

function getDiscoveryMoodScore(restaurant, mood = discoveryPlanState.mood) {
    const normalizedMood = String(mood || "").trim().toLowerCase();
    const restaurantTags = getRestaurantSearchTags(restaurant);
    const moodKeywords = getMoodKeywords(mood).map(function (keyword) {
        return keyword.toLowerCase();
    });
    let score = restaurantTags.includes(normalizedMood) ? 10 : 0;

    moodKeywords.forEach(function (keyword, index) {
        if (restaurantTags.includes(keyword)) {
            score += index === 0 ? 4 : 1;
        }
    });

    return score;
}

function filterRestaurants() {
    const cleanSearchTerm = searchTerm.toLowerCase();

    return getRestaurants()
        .filter(function (restaurant) {
        const { name, cuisine, location, priceLevel, rating } = restaurant;
        const restaurantTags = getRestaurantSearchTags(restaurant).join(" ");
        const searchableText = `${name} ${cuisine} ${location} ${priceLevel} ${restaurantTags}`.toLowerCase();
        const matchesSearch = searchableText.includes(cleanSearchTerm);
        const matchesCuisine =
            discoveryFacetFilters.cuisine === "All" ||
            cuisine.toLowerCase().includes(discoveryFacetFilters.cuisine.toLowerCase());
        const matchesLocation =
            discoveryFacetFilters.location === "All" || location === discoveryFacetFilters.location;
        const matchesPrice = discoveryFacetFilters.price === "All" || priceLevel === discoveryFacetFilters.price;
        const matchesRating =
            discoveryFacetFilters.rating === "All" || Number(rating) >= Number(discoveryFacetFilters.rating);
        const matchesDietary =
            discoveryFacetFilters.dietary === "All" ||
            searchableText.includes(discoveryFacetFilters.dietary.toLowerCase());

        return matchesSearch && matchesCuisine && matchesLocation && matchesPrice && matchesRating && matchesDietary;
        })
        .map(function (restaurant, originalIndex) {
            return {
                restaurant,
                originalIndex,
                moodScore: getDiscoveryMoodScore(restaurant)
            };
        })
        .sort(function (first, second) {
            return second.moodScore - first.moodScore || first.originalIndex - second.originalIndex;
        })
        .map(function ({ restaurant }) {
            return restaurant;
        });
}

function getRestaurantMatchPercentage(restaurant) {
    return Math.min(99, Math.max(80, Math.round(Number(restaurant.rating || 4) * 20)));
}

function getRestaurantAvailabilityTimes(restaurant, index) {
    const timeSets = [
        ["7:00", "7:30", "8:15"],
        ["7:15", "8:00"],
        ["7:30", "8:30"],
        ["7:00", "7:45", "8:30"],
        ["7:15", "8:15"],
        ["7:30", "9:00"]
    ];

    return timeSets[index % timeSets.length];
}

function createRestaurantCard(restaurant, index) {
    const { id, name, cuisine, rating, hours, priceLevel, location, image } = restaurant;
    const matchPercentage = getRestaurantMatchPercentage(restaurant);
    const availabilityTimes = getRestaurantAvailabilityTimes(restaurant, index);
    const safeName = escapeHTML(name);

    return `
        <article class="restaurant-card ${index === 0 ? "is-featured" : ""}">
            <div class="card-image">
                <img
                    class="card-image-media"
                    src="${escapeHTML(image)}"
                    alt="Dining room at ${safeName}"
                    loading="${index < 3 ? "eager" : "lazy"}"
                >
                <span class="discovery-match-badge">
                    <span class="material-symbols-outlined" aria-hidden="true">auto_awesome</span>
                    ${matchPercentage}% match
                </span>
                <button
                    class="discovery-favorite-button"
                    type="button"
                    aria-label="Save ${safeName}"
                    aria-pressed="false"
                >
                    <span class="material-symbols-outlined" aria-hidden="true">favorite</span>
                </button>
            </div>

            <div class="card-body">
                <div class="discovery-card-heading">
                    <h3>${safeName}</h3>
                    <div class="card-meta" aria-label="Restaurant rating and price">
                        <span class="rating"><span class="material-symbols-outlined" aria-hidden="true">star</span>${escapeHTML(rating)}</span>
                        <span class="price">${escapeHTML(priceLevel)}</span>
                    </div>
                </div>

                <p class="location">
                    <span>${escapeHTML(cuisine)}</span>
                    <span aria-hidden="true">&middot;</span>
                    <span>${escapeHTML(location)}</span>
                </p>

                ${createRestaurantBadgeSections(restaurant)}

                <div class="discovery-availability">
                    <span class="discovery-availability-label">Available</span>
                    <div class="discovery-time-slots" aria-label="Available times at ${safeName}">
                        ${availabilityTimes
                            .map(function (time) {
                                return `<button type="button" class="discovery-time-slot" data-time="${time}">${time}</button>`;
                            })
                            .join("")}
                    </div>
                </div>

                <div class="discovery-card-actions">
                    <button
                        class="book-button"
                        type="button"
                        data-restaurant-id="${id}"
                        aria-label="Start Booking at ${safeName}"
                    >
                        View tables
                    </button>
                    <button class="book-button discovery-exact-table-button" type="button" data-restaurant-id="${id}">
                        <span class="material-symbols-outlined" aria-hidden="true">deployed_code</span>
                        Choose exact table
                    </button>
                </div>

                <div class="discovery-hours sr-only">
                    <span>Open ${escapeHTML(hours)}</span>
                    <span class="cuisine">${escapeHTML(cuisine)}</span>
                    <span class="price">${priceLevel}</span>
                </div>
            </div>
        </article>
    `;
}

function renderRestaurants() {
    const restaurantGrid = document.querySelector("#restaurantGrid");
    const resultCount = document.querySelector("#discoveryResultCount");
    const restaurantList = filterRestaurants();

    if (resultCount) {
        resultCount.textContent = `${restaurantList.length} ${restaurantList.length === 1 ? "restaurant" : "restaurants"}`;
    }

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

function createDiscoveryFilterOptions(options, selectedValue, defaultLabel) {
    return options
        .map(function (option) {
            const optionLabel = option === "All" ? defaultLabel : option;
            return `<option value="${escapeHTML(option)}" ${option === selectedValue ? "selected" : ""}>${escapeHTML(optionLabel)}</option>`;
        })
        .join("");
}

function createDiscoveryFilterControl({ key, label, icon, options }) {
    const selectedValue = discoveryFacetFilters[key];
    const displayValue = selectedValue === "All" ? label : selectedValue;

    return `
        <label class="home-discovery-filter-control ${selectedValue !== "All" ? "is-active" : ""}">
            <span class="material-symbols-outlined home-discovery-filter-icon" aria-hidden="true">${icon}</span>
            <span class="home-discovery-filter-value">${escapeHTML(displayValue)}</span>
            <span class="material-symbols-outlined home-discovery-filter-chevron" aria-hidden="true">expand_more</span>
            <select data-discovery-filter="${key}" aria-label="${escapeHTML(label)} filter">
                ${createDiscoveryFilterOptions(options, selectedValue, `Any ${label.toLowerCase()}`)}
            </select>
        </label>
    `;
}

function renderFilters() {
    const filterPills = document.querySelector("#filterPills");
    const restaurants = getRestaurants();
    const uniqueValues = function (values) {
        return [...new Set(values.filter(Boolean))];
    };
    const filterControls = [
        {
            key: "cuisine",
            label: "Cuisine",
            icon: "restaurant",
            options: ["All", ...uniqueValues(restaurants.map(function (restaurant) { return restaurant.cuisine; }))]
        },
        {
            key: "location",
            label: "Location",
            icon: "location_on",
            options: ["All", ...uniqueValues(restaurants.map(function (restaurant) { return restaurant.location; }))]
        },
        {
            key: "price",
            label: "Price",
            icon: "attach_money",
            options: ["All", ...uniqueValues(restaurants.map(function (restaurant) { return restaurant.priceLevel; }))]
        },
        {
            key: "rating",
            label: "Rating",
            icon: "star",
            options: ["All", "4.5", "4.7", "4.8"]
        },
        {
            key: "dietary",
            label: "Dietary",
            icon: "eco",
            options: ["All", "Vegetarian", "Organic", "Family Friendly", "Rooftop"]
        }
    ];

    filterPills.innerHTML = filterControls.map(createDiscoveryFilterControl).join("");
}

function updateRestaurantResults() {
    renderFilters();
    renderRestaurants();
}

function getRestaurantSearchTags(restaurant) {
    const menuTags = (restaurant.menu || []).flatMap(function ({ tags = [] }) {
        return tags;
    });

    return [
        restaurant.cuisine,
        restaurant.location,
        ...(restaurant.badges || []),
        ...(restaurant.sustainabilityBadges || []),
        ...(restaurant.allergenBadges || []),
        ...menuTags
    ]
        .filter(Boolean)
        .map(function (tag) {
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

    const matchingMood = Object.keys(moodKeywords).find(function (moodName) {
        return moodName.toLowerCase() === String(mood || "").trim().toLowerCase();
    });

    return moodKeywords[matchingMood] || [];
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
    if (
        favoriteCuisines.some(function (cuisine) {
            return cuisine.toLowerCase() === restaurant.cuisine.toLowerCase();
        })
    ) {
        score += 25;
    }

    maxScore += 20;
    if (
        dietaryTags.some(function (tag) {
            return restaurantTags.includes(tag.toLowerCase());
        })
    ) {
        score += 20;
    }

    maxScore += 15;
    if (restaurant.priceLevel === filters.budget) {
        score += 15;
    }

    maxScore += 20;
    if (
        getMoodKeywords(filters.mood).some(function (keyword) {
            return restaurantTags.includes(keyword);
        })
    ) {
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
        .filter(function (restaurant) {
            return isWithinSmartBudget(restaurant, smartMatchFilters.budget);
        })
        .filter(function (restaurant) {
            return isWithinSmartDistance(restaurant, smartMatchFilters.distance);
        })
        .map(function (restaurant) {
            const match = calculateRestaurantScore(restaurant, profile, smartMatchFilters);

            return { ...restaurant, match };
        })
        .sort(function (firstRestaurant, secondRestaurant) {
            return (
                secondRestaurant.match.score - firstRestaurant.match.score ||
                Number(secondRestaurant.rating) - Number(firstRestaurant.rating)
            );
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
                        ${["Date Night", "Family Friendly", "Quick Bite", "Fine Dining", "Casual"]
                            .map(function (mood) {
                                return `
                                <option value="${mood}" ${smartMatchFilters.mood === mood ? "selected" : ""}>${mood}</option>
                            `;
                            })
                            .join("")}
                    </select>
                </label>
                <label>
                    Budget
                    <select data-smart-filter="budget">
                        ${["$", "$$", "$$$", "$$$$"]
                            .map(function (budget) {
                                return `
                                <option value="${budget}" ${smartMatchFilters.budget === budget ? "selected" : ""}>${budget}</option>
                            `;
                            })
                            .join("")}
                    </select>
                </label>
                <label>
                    Distance
                    <select data-smart-filter="distance">
                        ${["Nearby", "Medium", "Far"]
                            .map(function (distance) {
                                return `
                                <option value="${distance}" ${smartMatchFilters.distance === distance ? "selected" : ""}>${distance}</option>
                            `;
                            })
                            .join("")}
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
                ${recommendations
                    .map(function (restaurant) {
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
                    })
                    .join("")}
            </div>
        </section>
    `;

    smartConciergeView.querySelectorAll("[data-smart-filter]").forEach(function (input) {
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
