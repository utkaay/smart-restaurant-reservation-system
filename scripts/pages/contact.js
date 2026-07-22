(function initializeContactSupportPage() {
    "use strict";

    /**
     * Storage contract for the future Admin support view:
     * jacksSupportRequests = Array<{
     *   requestId: string,
     *   createdAt: ISO-8601 string,
     *   user: { id: string|null, name: string, email: string, phone: string|null },
     *   topic: "Reservation Help"|"Table Selection"|"Account"|"Cancellation"|"Technical Problem"|"Other",
     *   reservationId: string|null,
     *   message: string,
     *   status: "new"
     * }>
     */
    const SUPPORT_REQUESTS_KEY = "jacksSupportRequests";
    const PROFILE_STORAGE_KEYS = {
        authSession: "authSession",
        currentUserId: "currentUserId",
        guestProfile: "guestProfile",
        users: "users",
        reservations: "reservations"
    };
    const RESERVATION_TOPICS = new Set(["Reservation Help", "Table Selection", "Cancellation"]);
    const SUPPORT_TOPICS = new Set([
        "Reservation Help",
        "Table Selection",
        "Account",
        "Cancellation",
        "Technical Problem",
        "Other"
    ]);
    const FORM_FIELDS = ["name", "email", "topic", "reservationId", "message"];

    const form = document.querySelector("#contactForm");

    if (!form) {
        return;
    }

    const formFields = document.querySelector("#contactFormFields");
    const reservationField = document.querySelector("#contactReservationField");
    const reservationOptions = document.querySelector("#contactReservationOptions");
    const successState = document.querySelector("#contactSuccess");
    const successId = document.querySelector("#contactSuccessId");
    const storageError = document.querySelector("#contactStorageError");
    const submitButton = document.querySelector("#contactSubmitButton");
    const submitLabel = submitButton?.querySelector(".contact-submit-label");
    const anotherRequestButton = document.querySelector("#contactAnotherRequest");
    const messageCount = document.querySelector("#contactMessageCount");
    const authNavLink = document.querySelector("#authNavLink");
    const logoutButton = document.querySelector("#logoutButton");
    let isSubmitting = false;
    let currentProfile = null;

    function readStorageValue(key) {
        try {
            const rawValue = window.localStorage.getItem(key);

            if (rawValue === null) {
                return null;
            }

            return JSON.parse(rawValue);
        } catch {
            return null;
        }
    }

    function isStorageAvailable() {
        const testKey = "jacksContactStorageAvailabilityCheck";

        try {
            window.localStorage.setItem(testKey, "1");
            window.localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    }

    function readSupportRequests() {
        const storedRequests = readStorageValue(SUPPORT_REQUESTS_KEY);
        return Array.isArray(storedRequests) ? storedRequests : [];
    }

    function saveSupportRequests(requests) {
        try {
            window.localStorage.setItem(SUPPORT_REQUESTS_KEY, JSON.stringify(requests));
            return true;
        } catch {
            return false;
        }
    }

    function asText(value) {
        return typeof value === "string" ? value.trim() : "";
    }

    function normalizeEmail(value) {
        return asText(value).toLowerCase();
    }

    function getSignedInProfile() {
        const authSession = readStorageValue(PROFILE_STORAGE_KEYS.authSession);
        const currentUserId = readStorageValue(PROFILE_STORAGE_KEYS.currentUserId);
        const guestProfile = readStorageValue(PROFILE_STORAGE_KEYS.guestProfile);
        const users = readStorageValue(PROFILE_STORAGE_KEYS.users);

        if (!authSession || typeof authSession !== "object") {
            return null;
        }

        const sessionUserId = asText(authSession.userId || currentUserId);
        const savedUserId = asText(currentUserId);

        if (!sessionUserId || (savedUserId && savedUserId !== sessionUserId)) {
            return null;
        }

        const user = Array.isArray(users)
            ? users.find(function (entry) {
                  return entry && asText(entry.id) === sessionUserId;
              })
            : null;
        const profile = user || (guestProfile && asText(guestProfile.id) === sessionUserId ? guestProfile : null);

        if (!profile || normalizeEmail(profile.email) !== normalizeEmail(authSession.email)) {
            return null;
        }

        return {
            id: sessionUserId,
            name: asText(profile.name),
            email: asText(profile.email),
            phone: asText(profile.phone)
        };
    }

    function prefillProfile() {
        currentProfile = getSignedInProfile();

        if (!currentProfile) {
            return;
        }

        if (form.elements.name && !form.elements.name.value) {
            form.elements.name.value = currentProfile.name;
        }

        if (form.elements.email && !form.elements.email.value) {
            form.elements.email.value = currentProfile.email;
        }
    }

    function updateAccountNavigation() {
        currentProfile = getSignedInProfile();

        if (!authNavLink) {
            return;
        }

        if (currentProfile) {
            authNavLink.textContent = "Profile";
            authNavLink.href = "profile.html";
            authNavLink.setAttribute("aria-label", `Open ${currentProfile.name || "your"} profile`);

            if (logoutButton) {
                logoutButton.hidden = false;
                logoutButton.classList.remove("is-hidden");
            }
        } else {
            authNavLink.textContent = "Login";
            authNavLink.href = "login.html";
            authNavLink.setAttribute("aria-label", "Login");

            if (logoutButton) {
                logoutButton.hidden = true;
                logoutButton.classList.add("is-hidden");
            }
        }
    }

    function handleLogout() {
        try {
            window.localStorage.removeItem(PROFILE_STORAGE_KEYS.authSession);
            window.localStorage.removeItem(PROFILE_STORAGE_KEYS.currentUserId);
        } catch {
            showStorageError("We could not complete logout because browser storage is unavailable.");
            return;
        }

        currentProfile = null;
        form.reset();
        updateMessageCount();
        updateReservationVisibility();
        updateAccountNavigation();
        populateReservationOptions();
        form.elements.name?.focus();
    }

    function belongsToCurrentProfile(reservation) {
        if (!currentProfile || !reservation || typeof reservation !== "object") {
            return false;
        }

        const reservationUserId = asText(reservation.guestUserId || reservation.userId);

        if (reservationUserId && currentProfile.id) {
            return reservationUserId === currentProfile.id;
        }

        return Boolean(
            currentProfile.email && normalizeEmail(reservation.guestEmail || reservation.email) === normalizeEmail(currentProfile.email)
        );
    }

    function populateReservationOptions() {
        if (!reservationOptions) {
            return;
        }

        reservationOptions.replaceChildren();
        const reservations = readStorageValue(PROFILE_STORAGE_KEYS.reservations);

        if (!Array.isArray(reservations) || !currentProfile) {
            return;
        }

        reservations
            .filter(belongsToCurrentProfile)
            .slice(-12)
            .reverse()
            .forEach(function (reservation) {
                const reservationId = asText(reservation.reservationId || reservation.id);

                if (!reservationId) {
                    return;
                }

                const option = document.createElement("option");
                const details = [asText(reservation.restaurantName), asText(reservation.date)].filter(Boolean);
                option.value = reservationId;

                if (details.length > 0) {
                    option.label = details.join(" · ");
                }

                reservationOptions.append(option);
            });
    }

    function getFormValues() {
        return {
            name: asText(form.elements.name?.value),
            email: asText(form.elements.email?.value),
            topic: asText(form.elements.topic?.value),
            reservationId: asText(form.elements.reservationId?.value),
            message: asText(form.elements.message?.value)
        };
    }

    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function getValidationErrors(values) {
        const errors = {};

        if (!values.name) {
            errors.name = "Enter your name.";
        } else if (values.name.length < 2) {
            errors.name = "Name must be at least 2 characters.";
        }

        if (!values.email) {
            errors.email = "Enter your email address.";
        } else if (!isValidEmail(values.email)) {
            errors.email = "Enter a valid email address, such as name@example.com.";
        }

        if (!values.topic) {
            errors.topic = "Choose a support topic.";
        } else if (!SUPPORT_TOPICS.has(values.topic)) {
            errors.topic = "Choose a topic from the list.";
        }

        if (values.reservationId.length > 100) {
            errors.reservationId = "Reservation ID must be 100 characters or fewer.";
        }

        if (!values.message) {
            errors.message = "Tell us how we can help.";
        } else if (values.message.length < 20) {
            errors.message = `Add ${20 - values.message.length} more character${20 - values.message.length === 1 ? "" : "s"} so we have enough detail.`;
        }

        return errors;
    }

    function setFieldError(fieldName, message) {
        const field = form.elements[fieldName];
        const error = form.querySelector(`[data-contact-error="${fieldName}"]`);

        if (field) {
            if (message) {
                field.setAttribute("aria-invalid", "true");
            } else {
                field.removeAttribute("aria-invalid");
            }
        }

        if (error) {
            error.textContent = message || "";
        }
    }

    function setFormErrors(errors) {
        FORM_FIELDS.forEach(function (fieldName) {
            setFieldError(fieldName, errors[fieldName]);
        });
    }

    function validateField(fieldName) {
        const errors = getValidationErrors(getFormValues());
        setFieldError(fieldName, errors[fieldName]);
    }

    function updateReservationVisibility() {
        if (!reservationField) {
            return;
        }

        const shouldShow = RESERVATION_TOPICS.has(asText(form.elements.topic?.value));
        reservationField.hidden = !shouldShow;

        if (!shouldShow) {
            setFieldError("reservationId", "");
        }
    }

    function updateMessageCount() {
        if (messageCount) {
            messageCount.textContent = `${form.elements.message?.value.length || 0} / 1,500`;
        }
    }

    function showStorageError(message) {
        if (!storageError) {
            return;
        }

        storageError.textContent = message;
        storageError.hidden = false;
    }

    function hideStorageError() {
        if (storageError) {
            storageError.textContent = "";
            storageError.hidden = true;
        }
    }

    function createRequestId() {
        const dateStamp = new Date().toISOString().slice(0, 10).replaceAll("-", "");
        let randomPart = "";

        try {
            const randomValues = new Uint32Array(2);
            window.crypto.getRandomValues(randomValues);
            randomPart = Array.from(randomValues)
                .map(function (value) {
                    return value.toString(36).toUpperCase();
                })
                .join("")
                .slice(0, 8);
        } catch {
            randomPart = `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`.toUpperCase().slice(-8);
        }

        return `JKS-${dateStamp}-${randomPart.padEnd(8, "0")}`;
    }

    function setSubmitting(submitting) {
        isSubmitting = submitting;

        if (submitButton) {
            submitButton.disabled = submitting;
            submitButton.setAttribute("aria-busy", String(submitting));
        }

        if (submitLabel) {
            submitLabel.textContent = submitting ? "Recording Request…" : "Send Support Request";
        }
    }

    function showSuccess(requestId) {
        form.reset();
        setFormErrors({});
        updateMessageCount();
        updateReservationVisibility();
        prefillProfile();

        if (successId) {
            successId.textContent = requestId;
        }

        if (formFields) {
            formFields.hidden = true;
        }

        if (successState) {
            successState.hidden = false;
        }
    }

    function showNewRequestForm() {
        hideStorageError();

        if (successState) {
            successState.hidden = true;
        }

        if (formFields) {
            formFields.hidden = false;
        }

        const focusTarget = currentProfile ? form.elements.topic : form.elements.name;
        focusTarget?.focus();
    }

    function recordSupportRequest(values) {
        const requestId = createRequestId();
        const supportRequest = {
            requestId,
            createdAt: new Date().toISOString(),
            user: {
                id: currentProfile?.id || null,
                name: values.name,
                email: values.email,
                phone: currentProfile?.phone || null
            },
            topic: values.topic,
            reservationId: RESERVATION_TOPICS.has(values.topic) && values.reservationId ? values.reservationId : null,
            message: values.message,
            status: "new"
        };
        const requests = readSupportRequests();

        if (!saveSupportRequests([...requests, supportRequest])) {
            return null;
        }

        return requestId;
    }

    function handleSubmit(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        if (isSubmitting) {
            return;
        }

        hideStorageError();
        const values = getFormValues();
        const errors = getValidationErrors(values);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            const firstInvalidField = FORM_FIELDS.find(function (fieldName) {
                return errors[fieldName];
            });
            form.elements[firstInvalidField]?.focus();
            return;
        }

        if (!isStorageAvailable()) {
            showStorageError("Your request could not be recorded because browser storage is unavailable. Please enable site storage or use the direct email link.");
            return;
        }

        setSubmitting(true);

        window.setTimeout(function () {
            const requestId = recordSupportRequest(values);
            setSubmitting(false);

            if (!requestId) {
                showStorageError("Your request could not be recorded. Browser storage may be full or unavailable; please try again or use the direct email link.");
                return;
            }

            showSuccess(requestId);
        }, 350);
    }

    form.addEventListener("submit", handleSubmit, true);
    form.addEventListener("focusout", function (event) {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLSelectElement || event.target instanceof HTMLTextAreaElement) {
            validateField(event.target.name);
        }
    });
    form.addEventListener("input", function (event) {
        hideStorageError();

        if (event.target === form.elements.message) {
            updateMessageCount();
        }

        if (event.target.name && event.target.getAttribute("aria-invalid") === "true") {
            validateField(event.target.name);
        }
    });
    form.elements.topic?.addEventListener("change", updateReservationVisibility);
    anotherRequestButton?.addEventListener("click", showNewRequestForm);
    logoutButton?.addEventListener("click", handleLogout);

    updateAccountNavigation();
    prefillProfile();
    populateReservationOptions();
    updateReservationVisibility();
    updateMessageCount();
})();
