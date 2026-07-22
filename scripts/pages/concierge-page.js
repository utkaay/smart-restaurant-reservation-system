(function () {
    "use strict";

    const conciergeView = document.querySelector("#smartConciergeView");
    const controlsSlot = document.querySelector("#conciergeControlsSlot");
    const MEANINGFUL_MATCH_PERCENTAGE = 50;
    const MAX_RECOMMENDATIONS = 3;

    if (!conciergeView || !controlsSlot) {
        return;
    }

    const moodIcons = {
        "Date Night": "check_circle",
        "Family Friendly": "groups",
        "Quick Bite": "bolt",
        "Fine Dining": "wine_bar",
        Casual: "eco"
    };

    function createMaterialIcon(name) {
        const icon = document.createElement("span");
        icon.className = "material-symbols-outlined";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = name;
        return icon;
    }

    function normalizePreference(value) {
        return String(value || "").trim().toLowerCase();
    }

    function getStrictDietaryTags() {
        const profile = typeof getGuestProfile === "function" ? getGuestProfile() : null;

        return Array.isArray(profile?.dietaryTags)
            ? Array.from(new Set(profile.dietaryTags.map(normalizePreference).filter(Boolean)))
            : [];
    }

    function supportsDietaryPreferences(restaurant, dietaryTags) {
        if (dietaryTags.length === 0) {
            return true;
        }

        const restaurantTags = new Set(
            typeof getRestaurantSearchTags === "function" ? getRestaurantSearchTags(restaurant) : []
        );

        return dietaryTags.every(function (tag) {
            return restaurantTags.has(tag);
        });
    }

    function getConstraintDistance(restaurant) {
        const budgetGap = Math.max(0, getBudgetLevel(restaurant.priceLevel) - getBudgetLevel(smartMatchFilters.budget));
        const distanceGap = Math.max(
            0,
            getDistanceLevel(getRestaurantDistanceCategory(restaurant)) - getDistanceLevel(smartMatchFilters.distance)
        );

        return budgetGap + distanceGap;
    }

    function compareByScore(firstRestaurant, secondRestaurant) {
        return (
            secondRestaurant.match.score - firstRestaurant.match.score ||
            Number(secondRestaurant.rating) - Number(firstRestaurant.rating)
        );
    }

    function compareAlternatives(firstRestaurant, secondRestaurant) {
        return (
            firstRestaurant.constraintDistance - secondRestaurant.constraintDistance ||
            compareByScore(firstRestaurant, secondRestaurant)
        );
    }

    function getPageRecommendations() {
        const profile = typeof getGuestProfile === "function" ? getGuestProfile() : null;
        const dietaryTags = getStrictDietaryTags();
        const compatibleRestaurants = getRestaurants()
            .filter(function (restaurant) {
                return supportsDietaryPreferences(restaurant, dietaryTags);
            })
            .map(function (restaurant) {
                return {
                    ...restaurant,
                    match: calculateRestaurantScore(restaurant, profile, smartMatchFilters),
                    constraintDistance: getConstraintDistance(restaurant),
                    isAlternative: false
                };
            });

        const withinSelectedLimits = compatibleRestaurants
            .filter(function (restaurant) {
                return isWithinSmartBudget(restaurant, smartMatchFilters.budget);
            })
            .filter(function (restaurant) {
                return isWithinSmartDistance(restaurant, smartMatchFilters.distance);
            })
            .sort(compareByScore);
        const recommendations = withinSelectedLimits.slice(0, MAX_RECOMMENDATIONS);

        if (recommendations.length < MAX_RECOMMENDATIONS) {
            const selectedIds = new Set(recommendations.map(function (restaurant) {
                return Number(restaurant.id);
            }));
            const alternatives = compatibleRestaurants
                .filter(function (restaurant) {
                    return !selectedIds.has(Number(restaurant.id));
                })
                .map(function (restaurant) {
                    return { ...restaurant, isAlternative: true };
                })
                .sort(compareAlternatives)
                .slice(0, MAX_RECOMMENDATIONS - recommendations.length);

            recommendations.push(...alternatives);
        }

        recommendations.sort(compareByScore);

        return {
            recommendations,
            compatibleCount: compatibleRestaurants.length,
            strictMatchCount: withinSelectedLimits.length,
            dietaryTags
        };
    }

    function createMoodChoices(moodSelect, filterGrid) {
        const nativeLabel = moodSelect.closest("label");
        nativeLabel?.classList.add("concierge-native-mood");
        nativeLabel?.setAttribute("aria-hidden", "true");

        const fieldset = document.createElement("fieldset");
        fieldset.className = "concierge-mood-fieldset";

        const legend = document.createElement("legend");
        legend.textContent = "Choose your mood";
        fieldset.append(legend);

        const choices = document.createElement("div");
        choices.className = "concierge-mood-options";

        Array.from(moodSelect.options).forEach(function (option) {
            const button = document.createElement("button");
            const isSelected = option.value === moodSelect.value;

            button.className = "concierge-mood-option";
            button.type = "button";
            button.dataset.moodValue = option.value;
            button.setAttribute("aria-pressed", String(isSelected));
            button.classList.toggle("is-selected", isSelected);
            button.append(createMaterialIcon(moodIcons[option.value] || "circle"));

            const label = document.createElement("span");
            label.textContent = option.textContent;
            button.append(label);

            button.addEventListener("click", function () {
                moodSelect.value = option.value;
                moodSelect.dispatchEvent(new Event("change", { bubbles: true }));
            });

            choices.append(button);
        });

        fieldset.append(choices);
        filterGrid.before(fieldset);
    }

    function createDietarySummary(filterGrid) {
        const summary = document.createElement("div");
        summary.className = "concierge-profile-filter";

        const label = document.createElement("span");
        label.className = "concierge-profile-label";
        label.textContent = "Dietary";

        const value = document.createElement("span");
        value.className = "concierge-profile-value";
        value.append(createMaterialIcon("manage_accounts"));

        const dietaryTags = getStrictDietaryTags();
        const preferenceText = dietaryTags.length ? dietaryTags.join(", ") : "No restrictions";
        const valueText = document.createElement("span");
        valueText.textContent = preferenceText;
        value.append(valueText);
        value.title = dietaryTags.length
            ? `Only restaurants supporting all saved dietary preferences are shown: ${preferenceText}`
            : "No saved dietary restrictions are limiting these recommendations.";

        summary.append(label, value);
        filterGrid.append(summary);
    }

    function createFindMatchesButton(controlsPanel, resultsPanel) {
        const button = document.createElement("button");
        button.className = "concierge-find-matches";
        button.type = "button";
        button.id = "conciergeFindMatches";
        button.textContent = "Find my matches";

        const status = document.createElement("p");
        status.className = "sr-only";
        status.setAttribute("role", "status");

        button.addEventListener("click", function () {
            const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
            resultsPanel.classList.add("is-refreshed");
            resultsPanel.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
            status.textContent = "Matches refreshed using the selected mood, budget, distance, and dietary preferences.";

            window.setTimeout(function () {
                resultsPanel.classList.remove("is-refreshed");
            }, 700);
        });

        controlsPanel.append(button, status);
    }

    function decorateMatchBadge(matchBadge) {
        const percentage = Number(matchBadge.textContent.match(/\d+/)?.[0]);

        if (!Number.isFinite(percentage)) {
            return;
        }

        const percentageText = document.createElement("strong");
        percentageText.textContent = `${percentage}%`;
        const label = document.createElement("small");
        label.textContent = "match";

        matchBadge.replaceChildren(percentageText, label);
        matchBadge.setAttribute("aria-label", `${percentage} percent match`);
    }

    function createResultLabel(text, iconName) {
        const badge = document.createElement("div");
        badge.className = "concierge-best-match";
        badge.append(createMaterialIcon(iconName));

        const badgeText = document.createElement("span");
        badgeText.textContent = text;
        badge.append(badgeText);
        return badge;
    }

    function createRecommendationCard(restaurant, index) {
        const card = document.createElement("article");
        const isMeaningfulLeader = index === 0 && restaurant.match.percentage >= MEANINGFUL_MATCH_PERCENTAGE;
        const isLowLeader = index === 0 && !isMeaningfulLeader;

        card.className = "smart-recommendation-card";
        card.classList.toggle("is-leading-result", index === 0);
        card.classList.toggle("is-best-match", isMeaningfulLeader);
        card.classList.toggle("is-alternative", restaurant.isAlternative);
        card.dataset.resultType = restaurant.isAlternative ? "alternative" : "within-filters";

        const image = document.createElement("div");
        image.className = "smart-card-image";
        const imageUrl = String(restaurant.image || "").replace(/["'()]/g, function (character) {
            return encodeURIComponent(character);
        });
        image.style.backgroundImage = `linear-gradient(180deg, rgba(10, 15, 20, 0.08), rgba(10, 15, 20, 0.42)), url("${imageUrl}")`;
        image.setAttribute("role", "img");
        image.setAttribute("aria-label", `${restaurant.name} restaurant`);

        const matchBadge = document.createElement("span");
        matchBadge.textContent = `${restaurant.match.percentage}% match`;
        decorateMatchBadge(matchBadge);
        image.append(matchBadge);

        const body = document.createElement("div");
        body.className = "smart-card-body";

        if (isMeaningfulLeader) {
            body.classList.add("has-result-label");
            body.append(createResultLabel("Best match", "star"));
        } else if (isLowLeader) {
            body.classList.add("has-result-label");
            body.append(createResultLabel("Closest available", "near_me"));
        } else if (restaurant.isAlternative) {
            body.classList.add("has-result-label");
            body.append(createResultLabel("Closest alternative", "near_me"));
        }

        const heading = document.createElement("div");
        heading.className = "concierge-card-heading";

        const name = document.createElement("h3");
        name.textContent = restaurant.name;
        const cuisine = document.createElement("p");
        cuisine.className = "concierge-cuisine";
        cuisine.textContent = restaurant.cuisine;
        const location = document.createElement("p");
        location.className = "location";
        location.append(createMaterialIcon("location_on"));
        const locationText = document.createElement("span");
        locationText.textContent = restaurant.location;
        location.append(locationText);
        const rating = document.createElement("div");
        rating.className = "concierge-rating";
        rating.append(createMaterialIcon("star"));
        const ratingText = document.createElement("span");
        ratingText.textContent = restaurant.rating;
        const price = document.createElement("span");
        price.className = "concierge-price";
        price.textContent = restaurant.priceLevel;
        rating.append(ratingText, price);
        heading.append(name, cuisine, location, rating);
        body.append(heading);

        const badgeContainer = document.createElement("div");
        badgeContainer.innerHTML = createRestaurantBadgeSections(restaurant);
        const badges = badgeContainer.firstElementChild;
        if (badges) {
            body.append(badges);
        }

        if (restaurant.isAlternative) {
            const alternativeNote = document.createElement("p");
            alternativeNote.className = "concierge-alternative-note";
            alternativeNote.textContent = "Closest alternative to your budget or distance selection";
            body.append(alternativeNote);
        }

        const button = document.createElement("button");
        button.className = "book-button";
        button.type = "button";
        button.dataset.restaurantId = restaurant.id;
        button.textContent = "Choose exact table";
        button.setAttribute("aria-label", `Choose an exact table at ${restaurant.name}`);
        body.append(button);

        card.append(image, body);
        return card;
    }

    function createResultsExplanation(resultState) {
        const explanation = document.createElement("p");
        explanation.className = "concierge-results-explanation";
        const dietaryLabel = resultState.dietaryTags.join(", ");

        if (resultState.compatibleCount === 0) {
            explanation.textContent = dietaryLabel
                ? `No restaurant currently supports every saved dietary preference (${dietaryLabel}). Change your profile preferences to broaden the results.`
                : "No restaurants are currently available for these preferences.";
        } else if (resultState.compatibleCount === 1) {
            explanation.textContent = dietaryLabel
                ? `Only one restaurant currently supports every saved dietary preference (${dietaryLabel}).`
                : "Only one compatible restaurant is currently available.";
        } else if (resultState.compatibleCount === 2) {
            explanation.textContent = dietaryLabel
                ? `Only two restaurants currently support every saved dietary preference (${dietaryLabel}).`
                : "Only two compatible restaurants are currently available.";
        } else if (resultState.strictMatchCount < MAX_RECOMMENDATIONS) {
            const strictLabel = resultState.strictMatchCount === 1 ? "match" : "matches";
            explanation.textContent = `We found ${resultState.strictMatchCount} ${strictLabel} within your budget and distance, then added the closest compatible alternatives.`;
        } else {
            explanation.textContent = "Ranked with your selected mood, budget, distance, profile preferences, and restaurant rating.";
        }

        return explanation;
    }

    function renderPageRecommendations(resultsPanel) {
        const heading = resultsPanel.querySelector(".form-heading");
        const eyebrow = heading?.querySelector(".eyebrow");
        const title = heading?.querySelector("h3");
        const grid = resultsPanel.querySelector(".smart-recommendation-grid");
        const resultState = getPageRecommendations();

        if (!heading || !title || !grid) {
            return;
        }

        if (eyebrow) {
            eyebrow.textContent = resultState.dietaryTags.length ? "Dietary-safe recommendations" : "Curated for your plans";
        }

        if (resultState.compatibleCount === 0) {
            title.textContent = "No compatible matches yet";
        } else if (resultState.compatibleCount === 1) {
            title.textContent = "Your closest match";
        } else if (resultState.compatibleCount === 2) {
            title.textContent = "Your closest matches";
        } else {
            title.textContent = "Your top matches";
        }

        heading.querySelector(".concierge-results-explanation")?.remove();
        heading.append(createResultsExplanation(resultState));
        grid.replaceChildren(
            ...resultState.recommendations.map(function (restaurant, index) {
                return createRecommendationCard(restaurant, index);
            })
        );

        if (resultState.recommendations.length === 0) {
            const emptyState = document.createElement("div");
            emptyState.className = "concierge-empty-state";
            emptyState.append(createMaterialIcon("restaurant_menu"));
            const emptyTitle = document.createElement("h3");
            emptyTitle.textContent = "Your dietary preferences come first";
            const emptyCopy = document.createElement("p");
            emptyCopy.textContent = "We will not suggest a restaurant that conflicts with your saved restrictions.";
            emptyState.append(emptyTitle, emptyCopy);
            grid.append(emptyState);
        }

        resultsPanel.dataset.compatibleCount = resultState.compatibleCount;
        resultsPanel.dataset.strictMatchCount = resultState.strictMatchCount;
    }

    function decorateControlsPanel(controlsPanel, resultsPanel) {
        controlsPanel.classList.add("concierge-controls-panel");
        controlsPanel.querySelector(".form-heading")?.classList.add("concierge-original-filter-heading");

        const filterGrid = controlsPanel.querySelector(".smart-filter-grid");
        const moodSelect = controlsPanel.querySelector('[data-smart-filter="mood"]');

        if (!filterGrid || !moodSelect) {
            return;
        }

        createMoodChoices(moodSelect, filterGrid);
        createDietarySummary(filterGrid);
        createFindMatchesButton(controlsPanel, resultsPanel);
    }

    function decorateResultsPanel(resultsPanel) {
        resultsPanel.classList.add("concierge-results-panel");
        renderPageRecommendations(resultsPanel);
    }

    function decorateSmartConcierge() {
        const controlsPanel = Array.from(conciergeView.children).find(function (panel) {
            return panel.querySelector?.("[data-smart-filter]");
        });
        const resultsPanel = Array.from(conciergeView.children).find(function (panel) {
            return panel.querySelector?.(".smart-recommendation-grid");
        });

        if (!controlsPanel || !resultsPanel) {
            return;
        }

        decorateControlsPanel(controlsPanel, resultsPanel);
        decorateResultsPanel(resultsPanel);
        controlsSlot.replaceChildren(controlsPanel);
    }

    conciergeView.addEventListener(
        "click",
        function (event) {
            const button = event.target.closest(".book-button[data-restaurant-id]");

            if (!button) {
                return;
            }

            event.preventDefault();
            event.stopImmediatePropagation();
            startBooking(Number(button.dataset.restaurantId), { mood: smartMatchFilters.mood });
        },
        true
    );

    const observer = new MutationObserver(decorateSmartConcierge);
    observer.observe(conciergeView, { childList: true });
    decorateSmartConcierge();
})();
