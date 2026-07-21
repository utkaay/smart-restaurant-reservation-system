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

function filterRestaurants() {
    const cleanSearchTerm = searchTerm.toLowerCase();
    const cleanActiveFilter = activeFilter.toLowerCase();

    return getRestaurants().filter(function (restaurant) {
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
