// Three.js r168 (0.168.0), vendored from https://unpkg.com/three@0.168.0/build/three.module.js
import * as THREE from "../vendor/three.module.js";

import {
    ANIMATION_SETTINGS,
    createGeometries,
    createMaterials,
    createModernWalls,
    createRestaurantFloor,
    createRestaurantLighting,
    updateSunsetAnimation
} from "./scene-environment.js";
import { createTable, normalizeExperience } from "./table-models.js";

const HOME_TARGET = new THREE.Vector3(0, 0.15, 0.1);
let activeInstance = null;
let webGLSupportCache;

function createWebGLContext() {
    try {
        const canvas = document.createElement("canvas");
        return (
            canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
            canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
        );
    } catch (error) {
        return null;
    }
}

export function isBookingTableSelector3DSupported() {
    if (webGLSupportCache !== undefined) {
        return webGLSupportCache;
    }

    const context =
        typeof window !== "undefined" && typeof window.WebGLRenderingContext !== "undefined"
            ? createWebGLContext()
            : null;
    webGLSupportCache = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return webGLSupportCache;
}

function createInstance(options) {
    const { container, tables = [] } = options;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x2b2440);
    scene.fog = new THREE.Fog(0x2b2440, 28, 52);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "booking-table-3d-canvas";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
        "aria-label",
        "Interactive 3D restaurant at sunset with a floor and seat selector. Select a table, then its chairs. Keyboard users can use the mirrored table and seat buttons after the canvas."
    );

    const labelsLayer = document.createElement("div");
    labelsLayer.className = "booking-table-3d-labels";
    labelsLayer.setAttribute("aria-hidden", "true");
    const tooltip = document.createElement("div");
    tooltip.className = "booking-table-3d-tooltip";
    tooltip.hidden = true;
    tooltip.setAttribute("role", "tooltip");
    container.replaceChildren(renderer.domElement, labelsLayer, tooltip);

    const materials = createMaterials();
    const geometries = createGeometries();
    const disposableGeometries = new Set(Object.values(geometries));
    const instance = {
        ...options,
        scene,
        camera,
        renderer,
        labelsLayer,
        tooltip,
        materials,
        geometries,
        disposableGeometries,
        geometryCache: new Map(),
        tableProxyMeshes: [],
        activeSeatProxies: [],
        tableViews: new Map(),
        seatViews: new Map(),
        raycaster: new THREE.Raycaster(),
        pointer: new THREE.Vector2(),
        hoveredTableId: "",
        hoveredSeatId: "",
        focusedTableId: "",
        cameraTarget: HOME_TARGET.clone(),
        cameraAnimationFrame: 0,
        sceneAnimationFrame: 0,
        lastSceneAnimationTime: 0,
        sceneAnimationStartedAt: 0,
        reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches || false,
        disposed: false,
        listeners: []
    };

    createRestaurantFloor(instance);
    createModernWalls(instance);
    createRestaurantLighting(instance);

    tables.forEach(function (table) {
        return createTable(table, instance);
    });
    return instance;
}

function getHomeCameraPose(instance) {
    const isMobile = instance.container.clientWidth < 680;
    return {
        fov: isMobile ? 40 : 35,
        position: new THREE.Vector3(0, isMobile ? 21 : 12.6, isMobile ? 24 : 17),
        target: HOME_TARGET.clone()
    };
}

function getFocusCameraPose(instance, view) {
    const width = Math.max(1, instance.container.clientWidth);
    const height = Math.max(1, instance.container.clientHeight);
    const aspect = width / height;
    const isMobile = width < 680;
    const span = Math.max(view.dimensions.width + 1.9, view.dimensions.depth + 1.9);
    const narrowScreenFactor = Math.max(1, 0.86 / aspect);
    const distance = (span * (isMobile ? 1.75 : 1.45) + 2.15) * narrowScreenFactor;
    const target = view.root.position.clone().add(new THREE.Vector3(0, 0.48, 0));
    return {
        fov: isMobile ? 41 : 36,
        position: target.clone().add(new THREE.Vector3(0, distance * 0.72, distance * 0.86)),
        target
    };
}

function applyCameraPose(instance, pose) {
    instance.camera.fov = pose.fov;
    instance.camera.position.copy(pose.position);
    instance.cameraTarget.copy(pose.target);
    instance.camera.updateProjectionMatrix();
    instance.camera.lookAt(instance.cameraTarget);
}

function animateCameraTo(instance, pose, duration = ANIMATION_SETTINGS.cameraTransitionDuration) {
    cancelAnimationFrame(instance.cameraAnimationFrame);
    instance.cameraAnimationFrame = 0;
    if (instance.reducedMotion) {
        applyCameraPose(instance, pose);
        render(instance);
        return;
    }

    const startPosition = instance.camera.position.clone();
    const startTarget = instance.cameraTarget.clone();
    const startFov = instance.camera.fov;
    const startedAt = performance.now();

    function step(now) {
        if (instance.disposed) {
            return;
        }
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = progress * progress * (3 - 2 * progress);
        instance.camera.position.lerpVectors(startPosition, pose.position, eased);
        instance.cameraTarget.lerpVectors(startTarget, pose.target, eased);
        instance.camera.fov = THREE.MathUtils.lerp(startFov, pose.fov, eased);
        instance.camera.updateProjectionMatrix();
        instance.camera.lookAt(instance.cameraTarget);
        render(instance);
        if (progress < 1) {
            instance.cameraAnimationFrame = requestAnimationFrame(step);
        } else {
            instance.cameraAnimationFrame = 0;
        }
    }

    instance.cameraAnimationFrame = requestAnimationFrame(step);
}

function refreshActiveSeatProxies(instance) {
    const view = instance.tableViews.get(instance.focusedTableId);
    const selectedSeatIds = new Set(instance.selectedSeatIds || []);
    const selectionFull = selectedSeatIds.size >= Math.max(1, Number(instance.requiredSeatCount) || 1);
    instance.activeSeatProxies =
        view &&
        instance.selectedTableId === instance.focusedTableId &&
        instance.getTableStatus(view.table) === "Selected"
            ? view.chairViews
                  .filter(function ({ chair }) {
                      return selectedSeatIds.has(chair.userData.seatId) || !selectionFull;
                  })
                  .map(function ({ proxy }) {
                      return proxy;
                  })
            : [];
}

function focusTable(instance, tableId, animate = true) {
    const view = instance.tableViews.get(tableId);
    if (!view || instance.getTableStatus(view.table) !== "Selected") {
        return;
    }
    instance.focusedTableId = tableId;
    instance.hoveredTableId = "";
    instance.hoveredSeatId = "";
    instance.tooltip.hidden = true;
    refreshActiveSeatProxies(instance);
    applyVisualState(instance);
    const pose = getFocusCameraPose(instance, view);
    if (animate) {
        animateCameraTo(instance, pose);
    } else {
        applyCameraPose(instance, pose);
        render(instance);
    }
}

function setHomeCamera(instance, animate = true) {
    instance.focusedTableId = "";
    instance.hoveredSeatId = "";
    instance.tooltip.hidden = true;
    refreshActiveSeatProxies(instance);
    applyVisualState(instance);
    const pose = getHomeCameraPose(instance);
    if (animate) {
        animateCameraTo(instance, pose);
    } else {
        applyCameraPose(instance, pose);
        render(instance);
    }
}

function updateLabels(instance) {
    const width = instance.container.clientWidth;
    const height = instance.container.clientHeight;
    const worldPosition = new THREE.Vector3();

    instance.tableViews.forEach(function ({ labelAnchor, label }) {
        labelAnchor.getWorldPosition(worldPosition);
        worldPosition.project(instance.camera);
        const x = (worldPosition.x * 0.5 + 0.5) * width;
        const y = (-worldPosition.y * 0.5 + 0.5) * height;
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        label.hidden =
            worldPosition.z > 1 ||
            Boolean(instance.focusedTableId && label.dataset.tableLabel !== instance.focusedTableId);
    });
}

function render(instance) {
    if (instance.disposed) {
        return;
    }

    instance.renderer.render(instance.scene, instance.camera);
    updateLabels(instance);
}

function updateChairAnimation(instance, deltaSeconds) {
    const response = 1 - Math.exp(-ANIMATION_SETTINGS.chairResponse * deltaSeconds);
    instance.tableViews.forEach(function (view) {
        view.chairViews.forEach(function (chairView) {
            chairView.currentOutwardOffset = THREE.MathUtils.lerp(
                chairView.currentOutwardOffset || 0,
                chairView.targetOutwardOffset || 0,
                response
            );
            chairView.chair.position.copy(chairView.originalPosition);
            chairView.chair.position.addScaledVector(chairView.outwardDirection, chairView.currentOutwardOffset);
        });
    });
}

function applyStaticChairState(instance) {
    instance.tableViews.forEach(function (view) {
        view.chairViews.forEach(function (chairView) {
            chairView.currentOutwardOffset = chairView.targetOutwardOffset || 0;
            chairView.chair.position.copy(chairView.originalPosition);
            chairView.chair.position.addScaledVector(chairView.outwardDirection, chairView.currentOutwardOffset);
        });
    });
}

function startSceneAnimation(instance) {
    if (instance.reducedMotion || instance.sceneAnimationFrame) {
        return;
    }

    instance.sceneAnimationStartedAt = performance.now();
    instance.lastSceneAnimationTime = instance.sceneAnimationStartedAt;

    function animateScene(now) {
        if (instance.disposed) {
            return;
        }

        const elapsedSeconds = (now - instance.sceneAnimationStartedAt) / 1000;
        const deltaSeconds = Math.min(0.05, (now - instance.lastSceneAnimationTime) / 1000);
        instance.lastSceneAnimationTime = now;
        updateSunsetAnimation(instance, elapsedSeconds);
        updateChairAnimation(instance, deltaSeconds);
        render(instance);
        instance.sceneAnimationFrame = requestAnimationFrame(animateScene);
    }

    instance.sceneAnimationFrame = requestAnimationFrame(animateScene);
}

function getMaterialForMesh(mesh, materials, state) {
    if (state.status === "Disabled") {
        return materials.disabled;
    }

    if (state.status === "Reserved") {
        return materials.reserved;
    }

    if (mesh.userData.materialRole === "brass") {
        return state.matches ? materials.brass : materials.brassDim;
    }

    if (mesh.userData.materialRole === "olive") {
        return state.matches ? materials.olive : materials.oliveDim;
    }

    return state.matches ? materials.walnut : materials.walnutDim;
}

function getChairOutwardOffset(activeTable, selected, hovered) {
    if (!activeTable) {
        return selected ? 0.06 : 0;
    }
    if (selected) {
        return 0.19;
    }
    return hovered ? 0.16 : 0.11;
}

function applyVisualState(instance) {
    const selectedSeatIds = new Set(instance.selectedSeatIds || []);
    const selectionFull = selectedSeatIds.size >= Math.max(1, Number(instance.requiredSeatCount) || 1);
    instance.tableViews.forEach(function (view, tableId) {
        const status = instance.getTableStatus(view.table);
        const matches = view.table.experience === instance.experienceFilter;
        const selected = status === "Selected" || tableId === instance.selectedTableId;
        const hovered = tableId === instance.hoveredTableId;
        view.outlineRoot.visible = selected || hovered;
        view.outlineRoot.traverse(function (object) {
            if (object.isLineSegments) {
                object.material = selected ? instance.materials.selectedOutline : instance.materials.outline;
            }
        });
        view.surfaceMeshes.forEach(function (mesh) {
            mesh.material = getMaterialForMesh(mesh, instance.materials, { status, matches });
        });
        const activeTable =
            instance.focusedTableId === tableId && instance.selectedTableId === tableId && status === "Selected";
        view.chairViews.forEach(function (chairView) {
            const seatId = chairView.chair.userData.seatId;
            const seatSelected = selectedSeatIds.has(seatId);
            const seatHovered = instance.hoveredSeatId === seatId;
            const seatUnavailable = !activeTable || (selectionFull && !seatSelected);
            chairView.targetOutwardOffset = getChairOutwardOffset(activeTable, seatSelected, seatHovered);
            chairView.marker.visible = seatSelected;
            chairView.outlineRoot.visible = seatSelected || seatHovered;
            chairView.outlineRoot.traverse(function (object) {
                if (object.isLineSegments) {
                    object.material = instance.materials.seatOutline;
                }
            });
            chairView.surfaceMeshes.forEach(function (mesh) {
                if (status === "Disabled") {
                    mesh.material = instance.materials.disabled;
                } else if (status === "Reserved") {
                    mesh.material = instance.materials.reserved;
                } else if (mesh.userData.materialRole === "brass") {
                    mesh.material =
                        !matches || (activeTable && seatUnavailable)
                            ? instance.materials.brassDim
                            : instance.materials.brass;
                } else {
                    mesh.material =
                        !matches || (activeTable && seatUnavailable)
                            ? instance.materials.oliveDim
                            : instance.materials.olive;
                }
            });
        });
        view.label.classList.toggle("is-muted", !matches);
        view.label.classList.toggle("is-selected", selected);
        view.label.classList.toggle("is-reserved", status === "Reserved");
        view.label.classList.toggle("is-disabled", status === "Disabled");
        view.label.querySelector(".booking-table-status-dot").dataset.status = status.toLowerCase();
    });
    if (instance.reducedMotion) {
        applyStaticChairState(instance);
    }
}

function prepareRaycaster(instance, event) {
    const bounds = instance.renderer.domElement.getBoundingClientRect();
    instance.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    instance.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    instance.raycaster.setFromCamera(instance.pointer, instance.camera);
}

function findInteractiveSeat(instance, event) {
    prepareRaycaster(instance, event);
    const hit = instance.raycaster.intersectObjects(instance.activeSeatProxies, false)[0];
    return hit ? instance.seatViews.get(hit.object.userData.seatId) || null : null;
}

function findInteractiveTable(instance, event, includeSelected = false) {
    prepareRaycaster(instance, event);
    const hit = instance.raycaster.intersectObjects(instance.tableProxyMeshes, false)[0];
    if (!hit) {
        return null;
    }

    const view = instance.tableViews.get(hit.object.userData.tableId);
    if (!view || view.table.experience !== instance.experienceFilter) {
        return null;
    }
    const status = instance.getTableStatus(view.table);
    return status === "Available" || (includeSelected && status === "Selected") ? view : null;
}

function clearHover(instance) {
    if (!instance.hoveredTableId && !instance.hoveredSeatId && instance.tooltip.hidden) {
        return;
    }

    instance.hoveredTableId = "";
    instance.hoveredSeatId = "";
    instance.tooltip.hidden = true;
    instance.renderer.domElement.style.cursor = "default";
    applyVisualState(instance);
    render(instance);
}

function rectanglesOverlap(first, second, margin = 6) {
    return !(
        first.right + margin < second.left ||
        first.left - margin > second.right ||
        first.bottom + margin < second.top ||
        first.top - margin > second.bottom
    );
}

function positionTooltip(instance, event) {
    const containerBounds = instance.container.getBoundingClientRect();
    const pointerX = event.clientX - containerBounds.left;
    const pointerY = event.clientY - containerBounds.top;
    const tooltipWidth = instance.tooltip.offsetWidth;
    const tooltipHeight = instance.tooltip.offsetHeight;
    const edge = 8;
    const gap = 14;

    function clampX(x) {
        return Math.min(containerBounds.width - tooltipWidth - edge, Math.max(edge, x));
    }

    function clampY(y) {
        return Math.min(containerBounds.height - tooltipHeight - edge, Math.max(edge, y));
    }

    const candidates = [
        { x: pointerX + gap, y: pointerY - tooltipHeight - gap },
        { x: pointerX - tooltipWidth - gap, y: pointerY - tooltipHeight - gap },
        { x: pointerX + gap, y: pointerY + gap },
        { x: pointerX - tooltipWidth - gap, y: pointerY + gap }
    ].map(function ({ x, y }) {
        return {
            x: clampX(x),
            y: clampY(y)
        };
    });
    const selectedLabelBounds = [...instance.tableViews.values()]
        .filter(function ({ table }) {
            return instance.getTableStatus(table) === "Selected";
        })
        .map(function ({ label }) {
            return label.getBoundingClientRect();
        });
    const position =
        candidates.find(function ({ x, y }) {
            const candidateBounds = {
                left: containerBounds.left + x,
                top: containerBounds.top + y,
                right: containerBounds.left + x + tooltipWidth,
                bottom: containerBounds.top + y + tooltipHeight
            };
            return selectedLabelBounds.every(function (labelBounds) {
                return !rectanglesOverlap(candidateBounds, labelBounds);
            });
        }) || candidates[0];

    instance.tooltip.style.left = `${position.x}px`;
    instance.tooltip.style.top = `${position.y}px`;
}

function attachInteractions(instance) {
    const canvas = instance.renderer.domElement;

    function onPointerMove(event) {
        const seatView = findInteractiveSeat(instance, event);
        if (seatView) {
            instance.hoveredTableId = "";
            instance.hoveredSeatId = seatView.chair.userData.seatId;
            instance.tooltip.textContent = `Seat ${seatView.chair.userData.seatIndex + 1} \u00b7 ${
                (instance.selectedSeatIds || []).includes(seatView.chair.userData.seatId) ? "Selected" : "Available"
            }`;
            instance.tooltip.hidden = false;
            positionTooltip(instance, event);
            canvas.style.cursor = "pointer";
            applyVisualState(instance);
            render(instance);
            return;
        }
        const view = findInteractiveTable(instance, event);
        if (!view) {
            clearHover(instance);
            return;
        }

        instance.hoveredTableId = view.table.tableId;
        instance.hoveredSeatId = "";
        instance.tooltip.textContent = `${view.table.tableId} \u00b7 ${view.table.experience} \u00b7 ${view.table.seats} seats \u00b7 Available`;
        instance.tooltip.hidden = false;
        positionTooltip(instance, event);
        canvas.style.cursor = "pointer";
        applyVisualState(instance);
        render(instance);
    }

    function onPointerLeave() {
        return clearHover(instance);
    }

    function onClick(event) {
        const seatView = findInteractiveSeat(instance, event);
        if (seatView) {
            instance.onSeatToggle?.(seatView.chair.userData.seatId);
            return;
        }
        const view = findInteractiveTable(instance, event, true);
        if (view && instance.getTableStatus(view.table) === "Selected") {
            focusTable(instance, view.table.tableId);
        } else if (view) {
            instance.onTableSelect?.(view.table.tableId);
        }
    }

    function onReturn() {
        return setHomeCamera(instance);
    }

    function onContextLost(event) {
        event.preventDefault();
        instance.onFailure?.();
        destroyBookingTableSelector3D();
    }

    canvas.addEventListener("pointermove", onPointerMove);
    canvas.addEventListener("pointerleave", onPointerLeave);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("webglcontextlost", onContextLost);
    instance.returnButton?.addEventListener("click", onReturn);
    instance.listeners.push(
        [canvas, "pointermove", onPointerMove],
        [canvas, "pointerleave", onPointerLeave],
        [canvas, "click", onClick],
        [canvas, "webglcontextlost", onContextLost]
    );
    if (instance.returnButton) {
        instance.listeners.push([instance.returnButton, "click", onReturn]);
    }
}

function resize(instance) {
    const width = Math.max(1, instance.container.clientWidth);
    const height = Math.max(1, instance.container.clientHeight);
    const isMobile = width < 680;
    instance.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
    instance.renderer.setSize(width, height, false);
    instance.camera.aspect = width / height;
    instance.camera.updateProjectionMatrix();
    if (instance.focusedTableId && instance.tableViews.has(instance.focusedTableId)) {
        applyCameraPose(instance, getFocusCameraPose(instance, instance.tableViews.get(instance.focusedTableId)));
    } else {
        applyCameraPose(instance, getHomeCameraPose(instance));
    }
    render(instance);
}

export function initBookingTableSelector3D(options = {}) {
    destroyBookingTableSelector3D();
    if (!options.container || !isBookingTableSelector3DSupported()) {
        options.onFailure?.();
        return false;
    }

    try {
        activeInstance = createInstance({
            ...options,
            experienceFilter: normalizeExperience(options.experienceFilter),
            selectedSeatIds: Array.isArray(options.selectedSeatIds) ? [...options.selectedSeatIds] : [],
            requiredSeatCount: Math.max(1, Number(options.requiredSeatCount) || 1)
        });
        attachInteractions(activeInstance);
        applyVisualState(activeInstance);
        activeInstance.resizeObserver = new ResizeObserver(function () {
            return resize(activeInstance);
        });
        activeInstance.resizeObserver.observe(activeInstance.container);
        resize(activeInstance);
        if (activeInstance.selectedTableId) {
            focusTable(activeInstance, activeInstance.selectedTableId);
        }
        startSceneAnimation(activeInstance);
        return true;
    } catch (error) {
        console.warn("Interactive 3D floor unavailable; showing table cards.", error);
        destroyBookingTableSelector3D();
        options.onFailure?.();
        return false;
    }
}

export function updateBookingTableSelector3D(options = {}) {
    if (!activeInstance || activeInstance.disposed) {
        return false;
    }

    const previousSelectedTableId = activeInstance.selectedTableId;
    Object.assign(activeInstance, options);
    activeInstance.experienceFilter = normalizeExperience(activeInstance.experienceFilter);
    activeInstance.selectedSeatIds = Array.isArray(activeInstance.selectedSeatIds)
        ? [...activeInstance.selectedSeatIds]
        : [];
    activeInstance.requiredSeatCount = Math.max(1, Number(activeInstance.requiredSeatCount) || 1);
    clearHover(activeInstance);
    if (activeInstance.selectedTableId && activeInstance.selectedTableId !== previousSelectedTableId) {
        focusTable(activeInstance, activeInstance.selectedTableId);
        return true;
    }
    if (!activeInstance.selectedTableId && activeInstance.focusedTableId) {
        setHomeCamera(activeInstance);
        return true;
    }
    refreshActiveSeatProxies(activeInstance);
    applyVisualState(activeInstance);
    render(activeInstance);
    return true;
}

export function destroyBookingTableSelector3D() {
    const instance = activeInstance;
    activeInstance = null;
    if (!instance || instance.disposed) {
        return;
    }

    instance.disposed = true;
    cancelAnimationFrame(instance.cameraAnimationFrame);
    cancelAnimationFrame(instance.sceneAnimationFrame);
    instance.resizeObserver?.disconnect();
    instance.listeners.forEach(function ([target, type, handler]) {
        return target.removeEventListener(type, handler);
    });
    instance.disposableGeometries.forEach(function (geometry) {
        return geometry.dispose();
    });
    Object.values(instance.materials).forEach(function (material) {
        return material.dispose();
    });
    instance.sunsetTexture?.dispose();
    instance.sunTexture?.dispose();
    instance.starTexture?.dispose();
    instance.cloudTexture?.dispose();
    instance.gridMaterial?.dispose();
    instance.renderer.dispose();
    instance.renderer.forceContextLoss();
    instance.container.replaceChildren();
}
