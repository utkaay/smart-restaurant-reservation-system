function getRawSupportRequests() {
    const requests = getFromStorage(storageKeys.supportRequests);
    return Array.isArray(requests) ? requests : [];
}

function normalizeSupportStatus(status = "new") {
    const normalizedStatus = String(status || "new").trim().toLowerCase().replaceAll("_", "-").replaceAll(" ", "-");
    return SUPPORT_REQUEST_STATUSES.includes(normalizedStatus) ? normalizedStatus : "new";
}

function normalizeSupportTopic(topic = "Other") {
    return SUPPORT_REQUEST_TOPICS.includes(topic) ? topic : "Other";
}

function normalizeSupportRequest(request, storageIndex) {
    if (!request || typeof request !== "object" || Array.isArray(request)) {
        return null;
    }

    const user = request.user && typeof request.user === "object" && !Array.isArray(request.user) ? request.user : {};
    const requestId = String(request.requestId || request.id || "").trim();
    const createdAt = String(request.createdAt || request.date || "").trim();
    const parsedDate = createdAt ? new Date(createdAt) : null;

    return {
        storageIndex,
        key: requestId || `legacy-${storageIndex}`,
        requestId: requestId || `Legacy request ${storageIndex + 1}`,
        createdAt: parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString() : "",
        user: {
            id: user.id ?? request.userId ?? null,
            name: String(user.name || request.name || "Guest").trim() || "Guest",
            email: String(user.email || request.email || "").trim(),
            phone: String(user.phone || request.phone || "").trim() || null
        },
        topic: normalizeSupportTopic(request.topic || request.subject),
        reservationId: String(request.reservationId || "").trim() || null,
        message: String(request.message || request.body || "").trim(),
        status: normalizeSupportStatus(request.status)
    };
}

function getSupportRequests() {
    return getRawSupportRequests()
        .map(normalizeSupportRequest)
        .filter(Boolean)
        .sort(function (firstRequest, secondRequest) {
            return new Date(secondRequest.createdAt || 0).getTime() - new Date(firstRequest.createdAt || 0).getTime();
        });
}

function getSupportSummary() {
    return getSupportRequests().reduce(
        function (summary, request) {
            summary.total += 1;
            summary[request.status] += 1;
            return summary;
        },
        { total: 0, new: 0, "in-progress": 0, resolved: 0 }
    );
}

function getFilteredSupportRequests() {
    const cleanSearch = adminSupportSearchTerm.trim().toLowerCase();

    return getSupportRequests()
        .filter(function (request) {
            const searchableText = [
                request.requestId,
                request.user.name,
                request.user.email,
                request.topic,
                request.reservationId,
                request.message
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();
            return searchableText.includes(cleanSearch);
        })
        .filter(function (request) {
            return adminSupportTopicFilter === "all" || request.topic === adminSupportTopicFilter;
        })
        .filter(function (request) {
            return adminSupportStatusFilter === "all" || request.status === adminSupportStatusFilter;
        });
}

function formatSupportRequestDate(createdAt = "") {
    const date = new Date(createdAt);

    if (!Number.isFinite(date.getTime())) {
        return "Date unavailable";
    }

    return new Intl.DateTimeFormat("en-AE", {
        dateStyle: "medium",
        timeStyle: "short",
        timeZone: BOOKING_TIME_ZONE
    }).format(date);
}

function renderSupportStatusBadge(status = "new") {
    const normalizedStatus = normalizeSupportStatus(status);
    const label = normalizedStatus === "in-progress" ? "In progress" : normalizedStatus;
    return `<span class="support-status-badge status-${normalizedStatus}">${escapeHTML(label)}</span>`;
}

function renderSupportSummaryCards() {
    const summary = getSupportSummary();

    return `
        <section class="dashboard-overview-grid support-overview-grid" aria-label="Support request overview">
            <article class="overview-card"><span>Total requests</span><strong>${summary.total}</strong><p>Valid local support records</p></article>
            <article class="overview-card"><span>New</span><strong>${summary.new}</strong><p>Awaiting first review</p></article>
            <article class="overview-card"><span>In progress</span><strong>${summary["in-progress"]}</strong><p>Currently being handled</p></article>
            <article class="overview-card"><span>Resolved</span><strong>${summary.resolved}</strong><p>Completed support work</p></article>
        </section>
    `;
}

function renderSupportControls() {
    return `
        <section class="profile-panel admin-panel support-controls-panel">
            <div class="support-controls-grid">
                <label>
                    Search inbox
                    <input type="search" id="supportSearchInput" value="${escapeHTML(adminSupportSearchTerm)}" placeholder="Request ID, guest, email, reservation, or message" autocomplete="off">
                </label>
                <label>
                    Topic
                    <select id="supportTopicFilter">
                        <option value="all">All topics</option>
                        ${SUPPORT_REQUEST_TOPICS.map(function (topic) {
                            return `<option value="${escapeHTML(topic)}" ${adminSupportTopicFilter === topic ? "selected" : ""}>${escapeHTML(topic)}</option>`;
                        }).join("")}
                    </select>
                </label>
                <label>
                    Status
                    <select id="supportStatusFilter">
                        <option value="all">All statuses</option>
                        ${SUPPORT_REQUEST_STATUSES.map(function (status) {
                            const label = status === "in-progress" ? "In progress" : status;
                            return `<option value="${status}" ${adminSupportStatusFilter === status ? "selected" : ""}>${escapeHTML(label)}</option>`;
                        }).join("")}
                    </select>
                </label>
            </div>
        </section>
    `;
}

function renderSupportRequestList() {
    const requests = getFilteredSupportRequests();

    if (requests.length === 0) {
        return `
            <div class="empty-state support-empty-state">
                <span class="material-symbols-outlined" aria-hidden="true">inbox</span>
                <h3>No support requests found.</h3>
                <p>New requests submitted through Contact will appear here. Adjust the filters if the inbox already contains records.</p>
            </div>
        `;
    }

    return requests
        .map(function (request) {
            const isSelected = adminSelectedSupportRequestId === request.key;
            return `
                <button class="support-request-row ${isSelected ? "is-selected" : ""}" type="button" data-support-request-key="${escapeHTML(request.key)}">
                    <span class="support-request-icon material-symbols-outlined" aria-hidden="true">${request.status === "resolved" ? "task_alt" : "mail"}</span>
                    <span class="support-request-main">
                        <strong>${escapeHTML(request.user.name)}</strong>
                        <span>${escapeHTML(request.topic)}</span>
                        <small>${escapeHTML(request.message || "No message content")}</small>
                    </span>
                    <span class="support-request-meta">
                        ${renderSupportStatusBadge(request.status)}
                        <small>${escapeHTML(formatSupportRequestDate(request.createdAt))}</small>
                    </span>
                </button>
            `;
        })
        .join("");
}

function renderSupportRequestDetail() {
    const requests = getFilteredSupportRequests();
    const request =
        requests.find(function (entry) {
            return entry.key === adminSelectedSupportRequestId;
        }) || requests[0];

    if (!request) {
        return `
            <div class="support-detail-empty">
                <span class="material-symbols-outlined" aria-hidden="true">mark_email_read</span>
                <h3>Select a request</h3>
                <p>Open a support request to review its full message and update its status.</p>
            </div>
        `;
    }

    adminSelectedSupportRequestId = request.key;

    return `
        <article class="support-request-detail" data-support-detail-key="${escapeHTML(request.key)}">
            <header>
                <div>
                    <p class="eyebrow">${escapeHTML(request.requestId)}</p>
                    <h2>${escapeHTML(request.topic)}</h2>
                    <p>${escapeHTML(formatSupportRequestDate(request.createdAt))}</p>
                </div>
                ${renderSupportStatusBadge(request.status)}
            </header>

            <dl class="support-contact-grid">
                <div><dt>Guest</dt><dd>${escapeHTML(request.user.name)}</dd></div>
                <div><dt>Email</dt><dd>${escapeHTML(request.user.email || "Not provided")}</dd></div>
                <div><dt>Phone</dt><dd>${escapeHTML(request.user.phone || "Not provided")}</dd></div>
                <div><dt>Reservation</dt><dd>${escapeHTML(request.reservationId || "Not linked")}</dd></div>
            </dl>

            <section class="support-message-body">
                <h3>Full message</h3>
                <p>${escapeHTML(request.message || "No message content was stored.")}</p>
            </section>

            <label class="support-status-control">
                Status
                <select data-support-status-index="${request.storageIndex}">
                    ${SUPPORT_REQUEST_STATUSES.map(function (status) {
                        const label = status === "in-progress" ? "In progress" : status;
                        return `<option value="${status}" ${request.status === status ? "selected" : ""}>${escapeHTML(label)}</option>`;
                    }).join("")}
                </select>
            </label>
        </article>
    `;
}

function renderSupportView() {
    return `
        <section class="admin-section">
            ${renderSupportSummaryCards()}
            ${renderSupportControls()}
            <section class="support-workspace">
                <div class="profile-panel admin-panel support-list-panel">
                    <div class="support-list-heading">
                        <div><p class="eyebrow">Support inbox</p><h2>${getFilteredSupportRequests().length} shown</h2></div>
                        <span class="support-local-note"><span class="material-symbols-outlined" aria-hidden="true">database</span> Local browser data</span>
                    </div>
                    <div class="support-request-list" id="supportRequestList">${renderSupportRequestList()}</div>
                </div>
                <div class="profile-panel admin-panel support-detail-panel" id="supportRequestDetail">${renderSupportRequestDetail()}</div>
            </section>
        </section>
    `;
}

function updateSupportNavigationCount() {
    const count = getSupportSummary().new;
    const countElement = document.querySelector("#adminSupportNavCount");

    if (!countElement) {
        return;
    }

    countElement.textContent = count;
    countElement.hidden = count === 0;
}

function updateSupportRequestStatus(storageIndex, nextStatus) {
    const requests = getRawSupportRequests();
    const request = requests[storageIndex];

    if (!request || typeof request !== "object" || Array.isArray(request) || !SUPPORT_REQUEST_STATUSES.includes(nextStatus)) {
        return false;
    }

    requests[storageIndex] = { ...request, status: nextStatus };
    saveToStorage(storageKeys.supportRequests, requests);
    return true;
}

function attachSupportManagementHandlers() {
    const adminView = document.querySelector("#adminDashboard");

    if (!adminView) {
        return;
    }

    const search = adminView.querySelector("#supportSearchInput");
    const topicFilter = adminView.querySelector("#supportTopicFilter");
    const statusFilter = adminView.querySelector("#supportStatusFilter");

    search?.addEventListener("input", function (event) {
        adminSupportSearchTerm = event.target.value;
        adminSelectedSupportRequestId = null;
        renderActiveAdminSection();
        document.querySelector("#supportSearchInput")?.focus();
    });
    topicFilter?.addEventListener("change", function (event) {
        adminSupportTopicFilter = event.target.value;
        adminSelectedSupportRequestId = null;
        renderActiveAdminSection();
    });
    statusFilter?.addEventListener("change", function (event) {
        adminSupportStatusFilter = event.target.value;
        adminSelectedSupportRequestId = null;
        renderActiveAdminSection();
    });

    adminView.querySelectorAll("[data-support-request-key]").forEach(function (button) {
        button.addEventListener("click", function () {
            adminSelectedSupportRequestId = button.dataset.supportRequestKey;
            renderActiveAdminSection();
        });
    });

    adminView.querySelectorAll("[data-support-status-index]").forEach(function (select) {
        select.addEventListener("change", function () {
            if (adminActionInProgress) {
                return;
            }

            adminActionInProgress = true;
            const updated = updateSupportRequestStatus(Number(select.dataset.supportStatusIndex), select.value);
            adminActionInProgress = false;
            setAdminActionMessage(updated ? "Support request status updated." : "Support request could not be updated.", updated ? "success" : "error");
            renderActiveAdminSection();
        });
    });
}
