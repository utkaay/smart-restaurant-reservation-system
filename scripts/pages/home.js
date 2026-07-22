(function setupHomepageVideoControl() {
    const video = document.querySelector("#heroBackgroundVideo");
    const toggle = document.querySelector("#heroVideoToggle");
    const icon = toggle?.querySelector("[data-film-icon]");

    if (!video || !toggle || !icon) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const showPausedState = function () {
        icon.textContent = "volume_off";
        toggle.setAttribute("aria-label", "Play background film");
    };

    const showPlayingState = function () {
        icon.textContent = "volume_up";
        toggle.setAttribute("aria-label", "Pause background film");
    };

    const alignOpeningFrame = function () {
        video.currentTime = 0;
        if (prefersReducedMotion.matches) {
            video.pause();
            showPausedState();
        }
    };

    if (video.readyState >= 1) {
        alignOpeningFrame();
    } else {
        video.addEventListener("loadedmetadata", alignOpeningFrame, { once: true });
    }

    toggle.addEventListener("click", async function () {
        if (video.paused) {
            try {
                await video.play();
                showPlayingState();
            } catch (error) {
                console.warn("Unable to resume the background film.", error);
            }
            return;
        }

        video.pause();
        showPausedState();
    });
})();

(function setupHomepageDiscoveryControls() {
    const section = document.querySelector("#restaurants.home-results-section");
    const heroSearchInput = document.querySelector("#searchInput");
    const discoverySearchInput = document.querySelector("#discoverySearchInput");
    const filterPills = document.querySelector("#filterPills");
    const restaurantGrid = document.querySelector("#restaurantGrid");
    const plan = document.querySelector(".home-discovery-plan");
    const clearFiltersButton = document.querySelector("#discoveryClearFilters");
    const resetFiltersButton = document.querySelector("#discoveryResetFilters");
    const dateSelect = document.querySelector("#homeDateSelect");
    const timeSelect = document.querySelector("#homeTimeSelect");
    const guestsSelect = document.querySelector("#homeGuestsSelect");
    const customDateInput = document.querySelector("#discoveryPlanCustomDate");
    const planTriggers = Array.from(document.querySelectorAll("[data-plan-trigger]"));
    const planMenus = Array.from(document.querySelectorAll("[data-plan-menu]"));
    let openPlanMenuName = "";

    if (!section || !discoverySearchInput || !filterPills || !restaurantGrid || !plan) {
        return;
    }

    const addDaysToDateValue = function (dateValue, days) {
        const date = new Date(`${dateValue}T12:00:00Z`);
        date.setUTCDate(date.getUTCDate() + days);
        return date.toISOString().slice(0, 10);
    };

    const getNextWeekdayDateValue = function (weekday) {
        const today = getTodayDateValue();
        const date = new Date(`${today}T12:00:00Z`);
        const daysUntilWeekday = (weekday - date.getUTCDay() + 7) % 7 || 7;
        return addDaysToDateValue(today, daysUntilWeekday);
    };

    const formatPlanDate = function () {
        if (discoveryPlanState.datePreset === "tonight") {
            return "Tonight";
        }

        if (discoveryPlanState.datePreset === "tomorrow") {
            return "Tomorrow";
        }

        const date = new Date(`${discoveryPlanState.date}T12:00:00Z`);
        if (Number.isNaN(date.getTime())) {
            return "Choose date";
        }

        return new Intl.DateTimeFormat("en-US", {
            weekday: "short",
            month: "short",
            day: "numeric",
            timeZone: "UTC"
        }).format(date);
    };

    const formatPlanTime = function (timeValue) {
        const [hoursText, minutesText] = String(timeValue || "").split(":");
        const hours = Number(hoursText);
        const minutes = Number(minutesText);

        if (!Number.isInteger(hours) || !Number.isInteger(minutes)) {
            return "Choose time";
        }

        const period = hours >= 12 ? "PM" : "AM";
        const displayHour = hours % 12 || 12;
        return `${displayHour}:${String(minutes).padStart(2, "0")} ${period}`;
    };

    const parsePlanTime = function (timeLabel) {
        const match = String(timeLabel || "")
            .trim()
            .match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

        if (!match) {
            return "";
        }

        let hours = Number(match[1]) % 12;
        const minutes = Number(match[2]);
        if (match[3].toUpperCase() === "PM") {
            hours += 12;
        }

        return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
    };

    const syncHeroSelect = function (select, displayValue) {
        if (!select) {
            return;
        }

        select.querySelectorAll("option[data-plan-synced]").forEach(function (option) {
            if (option.value !== displayValue) {
                option.remove();
            }
        });

        let matchingOption = Array.from(select.options).find(function (option) {
            return option.value === displayValue || option.textContent.trim() === displayValue;
        });

        if (!matchingOption) {
            matchingOption = new Option(displayValue, displayValue);
            matchingOption.dataset.planSynced = "true";
            select.add(matchingOption);
        }

        select.value = matchingOption.value;
    };

    const updateSelectedPlanOptions = function () {
        plan.querySelectorAll("[data-plan-option]").forEach(function (option) {
            const optionType = option.dataset.planOption;
            const optionValue = option.dataset.planValue;
            let isSelected = false;

            if (optionType === "date") {
                isSelected = discoveryPlanState.datePreset === optionValue;
            } else if (optionType === "time") {
                isSelected = discoveryPlanState.time === optionValue;
            } else if (optionType === "guests") {
                isSelected = discoveryPlanState.partySize === Number(optionValue);
            } else if (optionType === "mood") {
                isSelected = discoveryPlanState.mood === optionValue;
            }

            option.setAttribute("aria-pressed", String(isSelected));
        });
    };

    const renderPlanSummary = function () {
        const dateLabel = formatPlanDate();
        const timeLabel = formatPlanTime(discoveryPlanState.time);
        const guestsLabel = `${discoveryPlanState.partySize} ${discoveryPlanState.partySize === 1 ? "guest" : "guests"}`;
        const planDate = document.querySelector("#discoveryPlanDate");
        const planTime = document.querySelector("#discoveryPlanTime");
        const planGuests = document.querySelector("#discoveryPlanGuests");
        const planMood = document.querySelector("#discoveryPlanMood");

        if (planDate) {
            planDate.textContent = dateLabel;
        }
        if (planTime) {
            planTime.textContent = timeLabel;
        }
        if (planGuests) {
            planGuests.textContent = guestsLabel;
        }
        if (planMood) {
            planMood.textContent = discoveryPlanState.mood;
        }

        if (customDateInput) {
            customDateInput.min = getTodayDateValue();
            customDateInput.value = discoveryPlanState.date;
        }

        updateSelectedPlanOptions();
        syncHeroSelect(dateSelect, dateLabel);
        syncHeroSelect(timeSelect, timeLabel);
        syncHeroSelect(guestsSelect, guestsLabel);
    };

    const closePlanMenu = function (restoreFocus = false) {
        if (!openPlanMenuName) {
            return;
        }

        const trigger = plan.querySelector(`[data-plan-trigger="${openPlanMenuName}"]`);
        const menu = plan.querySelector(`[data-plan-menu="${openPlanMenuName}"]`);
        trigger?.setAttribute("aria-expanded", "false");
        if (menu) {
            menu.hidden = true;
        }
        openPlanMenuName = "";

        if (restoreFocus) {
            trigger?.focus();
        }
    };

    const openPlanMenu = function (menuName, focusLastOption = false) {
        const trigger = plan.querySelector(`[data-plan-trigger="${menuName}"]`);
        const menu = plan.querySelector(`[data-plan-menu="${menuName}"]`);

        if (!trigger || !menu) {
            return;
        }

        if (openPlanMenuName && openPlanMenuName !== menuName) {
            closePlanMenu(false);
        }

        menu.hidden = false;
        trigger.setAttribute("aria-expanded", "true");
        openPlanMenuName = menuName;

        const options = Array.from(menu.querySelectorAll(".home-plan-option"));
        const selectedOption = options.find(function (option) {
            return option.getAttribute("aria-pressed") === "true";
        });
        const focusTarget = focusLastOption ? options.at(-1) : selectedOption || options[0] || menu.querySelector("input");
        requestAnimationFrame(function () {
            focusTarget?.focus();
        });
    };

    const selectPlanOption = function (optionType, optionValue) {
        if (optionType === "date") {
            discoveryPlanState = {
                ...discoveryPlanState,
                datePreset: optionValue,
                date:
                    optionValue === "tomorrow"
                        ? addDaysToDateValue(getTodayDateValue(), 1)
                        : getTodayDateValue()
            };
        } else if (optionType === "time") {
            discoveryPlanState = { ...discoveryPlanState, time: optionValue };
        } else if (optionType === "guests") {
            discoveryPlanState = { ...discoveryPlanState, partySize: Number(optionValue) };
        } else if (optionType === "mood") {
            discoveryPlanState = { ...discoveryPlanState, mood: optionValue };
        }

        renderPlanSummary();
        if (optionType === "mood") {
            updateRestaurantResults();
        }
        closePlanMenu(true);
    };

    const resetDiscoveryPlan = function () {
        discoveryPlanState = {
            ...discoveryPlanDefaults,
            date: getTodayDateValue()
        };
        closePlanMenu(false);
        renderPlanSummary();
    };

    const syncSearchInputs = function (value) {
        discoverySearchInput.value = value;
        if (heroSearchInput) {
            heroSearchInput.value = value;
        }
    };

    const resetDiscovery = function () {
        searchTerm = "";
        activeFilter = "All";
        discoveryFacetFilters = { ...discoveryFilterDefaults };
        saveToStorage(storageKeys.searchTerm, searchTerm);
        saveToStorage(storageKeys.activeFilter, activeFilter);
        syncSearchInputs("");
        resetDiscoveryPlan();
        updateRestaurantResults();
    };

    discoveryPlanState = {
        ...discoveryPlanDefaults,
        date: getTodayDateValue()
    };
    renderPlanSummary();

    discoverySearchInput.value = searchTerm;
    heroSearchInput?.addEventListener("input", function () {
        discoverySearchInput.value = heroSearchInput.value;
    });
    discoverySearchInput.addEventListener("input", function () {
        searchTerm = discoverySearchInput.value.trim();
        if (heroSearchInput) {
            heroSearchInput.value = discoverySearchInput.value;
        }
        saveToStorage(storageKeys.searchTerm, searchTerm);
        updateRestaurantResults();
    });

    filterPills.addEventListener("change", function (event) {
        const filterSelect = event.target.closest("[data-discovery-filter]");

        if (!filterSelect) {
            return;
        }

        const filterKey = filterSelect.dataset.discoveryFilter;
        discoveryFacetFilters = {
            ...discoveryFacetFilters,
            [filterKey]: filterSelect.value
        };
        activeFilter = ["cuisine", "dietary"].includes(filterKey) ? filterSelect.value : "All";
        saveToStorage(storageKeys.activeFilter, activeFilter);
        updateRestaurantResults();
    });

    restaurantGrid.addEventListener("click", function (event) {
        const favoriteButton = event.target.closest(".discovery-favorite-button");
        const timeSlot = event.target.closest(".discovery-time-slot");

        if (favoriteButton) {
            const isPressed = favoriteButton.getAttribute("aria-pressed") === "true";
            favoriteButton.setAttribute("aria-pressed", String(!isPressed));
            favoriteButton.classList.toggle("is-saved", !isPressed);
            favoriteButton.setAttribute("aria-label", isPressed ? "Save restaurant" : "Remove saved restaurant");
            return;
        }

        if (timeSlot) {
            const slots = timeSlot.closest(".discovery-time-slots");
            slots.querySelectorAll(".discovery-time-slot").forEach(function (slot) {
                slot.classList.toggle("active", slot === timeSlot);
            });
        }
    });

    planTriggers.forEach(function (trigger) {
        trigger.addEventListener("click", function () {
            const menuName = trigger.dataset.planTrigger;
            if (openPlanMenuName === menuName) {
                closePlanMenu(false);
                return;
            }
            openPlanMenu(menuName);
        });

        trigger.addEventListener("keydown", function (event) {
            if (!["ArrowDown", "ArrowUp"].includes(event.key)) {
                return;
            }

            event.preventDefault();
            openPlanMenu(trigger.dataset.planTrigger, event.key === "ArrowUp");
        });
    });

    plan.addEventListener("click", function (event) {
        const option = event.target.closest("[data-plan-option]");
        if (!option) {
            return;
        }

        selectPlanOption(option.dataset.planOption, option.dataset.planValue);
    });

    planMenus.forEach(function (menu) {
        menu.addEventListener("keydown", function (event) {
            const option = event.target.closest(".home-plan-option");
            if (!option || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
                return;
            }

            const options = Array.from(menu.querySelectorAll(".home-plan-option"));
            const currentIndex = options.indexOf(option);
            let nextIndex = currentIndex;

            if (event.key === "ArrowDown") {
                nextIndex = (currentIndex + 1) % options.length;
            } else if (event.key === "ArrowUp") {
                nextIndex = (currentIndex - 1 + options.length) % options.length;
            } else if (event.key === "Home") {
                nextIndex = 0;
            } else if (event.key === "End") {
                nextIndex = options.length - 1;
            }

            event.preventDefault();
            options[nextIndex]?.focus();
        });
    });

    customDateInput?.addEventListener("change", function () {
        const selectedDate = normalizeBookingDate(customDateInput.value);
        if (!selectedDate || selectedDate < getTodayDateValue()) {
            return;
        }

        discoveryPlanState = {
            ...discoveryPlanState,
            datePreset: "custom",
            date: selectedDate
        };
        renderPlanSummary();
        closePlanMenu(true);
    });

    document.addEventListener("pointerdown", function (event) {
        if (openPlanMenuName && !plan.contains(event.target)) {
            closePlanMenu(false);
        }
    });

    document.addEventListener("keydown", function (event) {
        if (event.key !== "Escape" || !openPlanMenuName) {
            return;
        }

        event.preventDefault();
        closePlanMenu(true);
    });

    section.querySelectorAll("[data-discovery-view]").forEach(function (viewButton) {
        viewButton.addEventListener("click", function () {
            const selectedView = viewButton.dataset.discoveryView;
            section.querySelectorAll("[data-discovery-view]").forEach(function (button) {
                const isActive = button === viewButton;
                button.classList.toggle("active", isActive);
                button.setAttribute("aria-pressed", String(isActive));
            });
            restaurantGrid.classList.toggle("is-list-view", selectedView === "list");
        });
    });

    clearFiltersButton?.addEventListener("click", resetDiscovery);
    resetFiltersButton?.addEventListener("click", resetDiscovery);
    dateSelect?.addEventListener("change", function () {
        if (dateSelect.value === "Tonight") {
            discoveryPlanState = {
                ...discoveryPlanState,
                datePreset: "tonight",
                date: getTodayDateValue()
            };
        } else if (dateSelect.value === "Tomorrow") {
            discoveryPlanState = {
                ...discoveryPlanState,
                datePreset: "tomorrow",
                date: addDaysToDateValue(getTodayDateValue(), 1)
            };
        } else if (dateSelect.selectedOptions[0]?.dataset.planSynced === "true") {
            return;
        } else {
            discoveryPlanState = {
                ...discoveryPlanState,
                datePreset: "custom",
                date: getNextWeekdayDateValue(5)
            };
        }
        renderPlanSummary();
    });
    timeSelect?.addEventListener("change", function () {
        const selectedTime = parsePlanTime(timeSelect.value);
        if (selectedTime) {
            discoveryPlanState = { ...discoveryPlanState, time: selectedTime };
            renderPlanSummary();
        }
    });
    guestsSelect?.addEventListener("change", function () {
        const selectedPartySize = Number.parseInt(guestsSelect.value, 10);
        if (Number.isInteger(selectedPartySize) && selectedPartySize >= 1 && selectedPartySize <= 8) {
            discoveryPlanState = { ...discoveryPlanState, partySize: selectedPartySize };
            renderPlanSummary();
        }
    });
})();
