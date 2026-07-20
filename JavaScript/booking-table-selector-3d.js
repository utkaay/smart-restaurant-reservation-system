// Three.js r168 (0.168.0), vendored from https://unpkg.com/three@0.168.0/build/three.module.js
import * as THREE from "./vendor/three.module.js";

const EXPERIENCE_NAMES = ["Regular", "Premium", "VIP"];
const TABLE_POSITIONS = {
    A1: [-6, -3.45], A2: [-2, -3.45], A3: [2, -3.45], A4: [6, -3.45],
    B1: [-6, 0], B2: [-2, 0], B3: [2, 0], B4: [6, 0],
    C1: [-5.7, 3.65], C2: [-2.05, 3.65], D1: [2.25, 3.65], D2: [6.3, 3.65]
};
const HOME_TARGET = new THREE.Vector3(0, 0.15, 0.1);
let activeInstance = null;
let webGLSupportCache;

const normalizeExperience = (experience) => (
    EXPERIENCE_NAMES.includes(experience) ? experience : "Regular"
);

const createWebGLContext = () => {
    try {
        const canvas = document.createElement("canvas");
        return canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
            || canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    } catch (error) {
        return null;
    }
};

export const isBookingTableSelector3DSupported = () => {
    if (webGLSupportCache !== undefined) {
        return webGLSupportCache;
    }

    const context = typeof window !== "undefined"
        && typeof window.WebGLRenderingContext !== "undefined"
        ? createWebGLContext()
        : null;
    webGLSupportCache = Boolean(context);
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return webGLSupportCache;
};

const tableDimensions = (tableId = "", seats = 2) => {
    if (tableId.startsWith("A")) {
        return { shape: "round", width: 1.28, depth: 1.28, chairs: 2 };
    }

    if (tableId.startsWith("B")) {
        return { shape: "square", width: 1.48, depth: 1.48, chairs: 4 };
    }

    if (tableId.startsWith("C")) {
        return { shape: "rectangle", width: 2.4, depth: 1.2, chairs: 6 };
    }

    return { shape: "long", width: 3.18, depth: 1.12, chairs: Math.min(8, Math.max(2, seats)) };
};

const createMaterials = () => {
    const material = (color, roughness = 0.74, metalness = 0.03) => new THREE.MeshStandardMaterial({
        color,
        roughness,
        metalness
    });

    return {
        floor: material(0xe7ddd2, 0.98, 0),
        walnut: material(0x563620, 0.58, 0.02),
        walnutDim: material(0x67594c, 0.82, 0),
        olive: material(0x27351f, 0.82, 0.01),
        oliveDim: material(0x4d5146, 0.9, 0),
        brass: material(0xb58a45, 0.38, 0.68),
        brassDim: material(0x8a806f, 0.72, 0.18),
        reserved: material(0x74695e, 0.92, 0),
        disabled: material(0xaaa49a, 0.96, 0),
        proxy: new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
        outline: new THREE.LineBasicMaterial({ color: 0xc79542, transparent: true, opacity: 0.98 }),
        selectedOutline: new THREE.LineBasicMaterial({ color: 0x07543a, transparent: true, opacity: 1 })
    };
};

const createGeometries = () => ({
    floor: new THREE.PlaneGeometry(19, 15.5),
    roundTop: new THREE.CylinderGeometry(0.64, 0.64, 0.16, 32),
    squareTop: new THREE.BoxGeometry(1, 0.16, 1),
    chairSeat: new THREE.BoxGeometry(0.52, 0.16, 0.5),
    chairBack: new THREE.CapsuleGeometry(0.28, 0.28, 4, 8),
    leg: new THREE.CylinderGeometry(0.035, 0.045, 0.78, 8),
    tableLeg: new THREE.CylinderGeometry(0.055, 0.07, 0.86, 10),
    proxy: new THREE.BoxGeometry(1, 1, 1)
});

const addOutline = (mesh, outlineRoot, geometryCache, geometries, materials) => {
    if (!geometryCache.has(mesh.geometry)) {
        const edges = new THREE.EdgesGeometry(mesh.geometry, 28);
        geometryCache.set(mesh.geometry, edges);
        geometries.add(edges);
    }

    const outline = new THREE.LineSegments(geometryCache.get(mesh.geometry), materials.outline);
    outline.position.copy(mesh.position);
    outline.rotation.copy(mesh.rotation);
    outline.scale.copy(mesh.scale).multiplyScalar(1.04);
    outlineRoot.add(outline);
};

const addChair = ({ root, outlineRoot, x, z, rotationY, geometries, materials, geometryCache, disposableGeometries }) => {
    const chair = new THREE.Group();
    chair.position.set(x, 0, z);
    chair.rotation.y = rotationY;

    const seat = new THREE.Mesh(geometries.chairSeat, materials.olive);
    seat.userData.materialRole = "olive";
    seat.position.y = 0.5;
    seat.castShadow = true;
    chair.add(seat);

    const back = new THREE.Mesh(geometries.chairBack, materials.olive);
    back.userData.materialRole = "olive";
    back.position.set(0, 0.76, 0.26);
    back.scale.set(1, 0.86, 0.42);
    back.rotation.x = -0.1;
    back.castShadow = true;
    chair.add(back);

    [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].forEach(([legX, legZ]) => {
        const leg = new THREE.Mesh(geometries.leg, materials.brass);
        leg.userData.materialRole = "brass";
        leg.position.set(legX, 0.18, legZ);
        leg.scale.y = 0.55;
        leg.castShadow = true;
        chair.add(leg);
    });

    root.add(chair);

    [seat, back].forEach((part) => {
        const outlineCarrier = part.clone();
        outlineCarrier.position.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotationY);
        outlineCarrier.position.add(new THREE.Vector3(x, 0, z));
        outlineCarrier.rotation.y += rotationY;
        addOutline(outlineCarrier, outlineRoot, geometryCache, disposableGeometries, materials);
    });
};

const getChairPlacements = ({ width, depth, chairs }) => {
    if (chairs === 2) {
        return [
            { x: -1.02, z: 0, rotationY: Math.PI / 2 },
            { x: 1.02, z: 0, rotationY: -Math.PI / 2 }
        ];
    }

    if (chairs === 4) {
        return [
            { x: -1.05, z: 0, rotationY: Math.PI / 2 },
            { x: 1.05, z: 0, rotationY: -Math.PI / 2 },
            { x: 0, z: -1.05, rotationY: 0 },
            { x: 0, z: 1.05, rotationY: Math.PI }
        ];
    }

    const placements = [];
    const perSide = Math.max(2, Math.floor(chairs / 2));
    const spacing = width / perSide;

    for (let index = 0; index < perSide; index += 1) {
        const x = -width / 2 + spacing / 2 + spacing * index;
        placements.push({ x, z: -(depth / 2 + 0.62), rotationY: 0 });
        placements.push({ x, z: depth / 2 + 0.62, rotationY: Math.PI });
    }

    return placements.slice(0, chairs);
};

const createTable = (table, instance) => {
    const { scene, geometries, materials, geometryCache, proxyMeshes, labelsLayer, tableViews } = instance;
    const tableId = String(table.tableId || "");
    const experience = normalizeExperience(table.experience);
    const dimensions = tableDimensions(tableId, table.seats);
    const position = TABLE_POSITIONS[tableId] || [0, 0];
    const root = new THREE.Group();
    root.position.set(position[0], 0, position[1]);
    root.userData = { kind: "table", tableId };
    scene.add(root);

    const outlineRoot = new THREE.Group();
    outlineRoot.visible = false;
    root.add(outlineRoot);

    const top = new THREE.Mesh(
        dimensions.shape === "round" ? geometries.roundTop : geometries.squareTop,
        materials.walnut
    );
    top.userData.materialRole = "walnut";
    top.position.y = 0.96;
    if (dimensions.shape !== "round") {
        top.scale.set(dimensions.width, 1, dimensions.depth);
    }
    top.castShadow = true;
    top.receiveShadow = true;
    root.add(top);
    addOutline(top, outlineRoot, geometryCache, instance.disposableGeometries, materials);

    const legXPositions = dimensions.width > 2.5 ? [-dimensions.width * 0.34, dimensions.width * 0.34] : [0];
    legXPositions.forEach((legX) => {
        const tableLeg = new THREE.Mesh(geometries.tableLeg, materials.brass);
        tableLeg.userData.materialRole = "brass";
        tableLeg.position.set(legX, 0.48, 0);
        tableLeg.castShadow = true;
        root.add(tableLeg);
    });

    getChairPlacements(dimensions).forEach((placement) => addChair({
        root,
        outlineRoot,
        ...placement,
        geometries,
        materials,
        geometryCache: instance.geometryCache,
        disposableGeometries: instance.disposableGeometries
    }));

    const proxy = new THREE.Mesh(geometries.proxy, materials.proxy);
    proxy.position.y = 0.72;
    proxy.scale.set(dimensions.width + 1.35, 1.55, dimensions.depth + 1.3);
    proxy.userData = { kind: "table", tableId };
    root.add(proxy);
    proxyMeshes.push(proxy);

    const label = document.createElement("div");
    label.className = `booking-table-3d-label tier-${experience.toLowerCase()}`;
    label.dataset.tableLabel = tableId;
    label.innerHTML = `<span class="booking-table-status-dot" aria-hidden="true"></span><strong>${tableId}</strong><span class="booking-table-tier-badge">${experience}</span>`;
    labelsLayer.append(label);

    const labelAnchor = new THREE.Object3D();
    const labelOffsetZ = dimensions.shape === "round"
        ? 0.84
        : dimensions.shape === "square"
            ? 0.95
            : dimensions.depth / 2 + 1.02;
    labelAnchor.position.set(0, 0.03, labelOffsetZ);
    root.add(labelAnchor);

    tableViews.set(tableId, {
        table: { ...table, experience },
        root,
        top,
        outlineRoot,
        labelAnchor,
        label,
        surfaceMeshes: root.children.flatMap((child) => (
            child.type === "Group" ? child.children.filter(({ isMesh }) => isMesh) : (child.isMesh ? [child] : [])
        )).filter((mesh) => mesh !== proxy)
    });
};

const createInstance = (options) => {
    const { container, tables = [] } = options;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe7ddd2);
    scene.fog = new THREE.Fog(0xe7ddd2, 25, 48);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "booking-table-3d-canvas";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute("aria-label", "Interactive 3D restaurant floor. Use the mirrored table buttons after the canvas to select by keyboard.");

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
        proxyMeshes: [],
        tableViews: new Map(),
        raycaster: new THREE.Raycaster(),
        pointer: new THREE.Vector2(),
        hoveredTableId: "",
        animationFrame: 0,
        disposed: false,
        listeners: []
    };

    const floor = new THREE.Mesh(geometries.floor, materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.015;
    floor.receiveShadow = true;
    scene.add(floor);

    const tileGrid = new THREE.GridHelper(19, 19, 0xcbbdac, 0xcbbdac);
    tileGrid.scale.z = 0.82;
    tileGrid.position.y = 0.006;
    tileGrid.material.transparent = true;
    tileGrid.material.opacity = 0.22;
    scene.add(tileGrid);
    instance.gridMaterial = tileGrid.material;

    scene.add(new THREE.HemisphereLight(0xfffaf2, 0x6f665f, 2.08));
    const keyLight = new THREE.DirectionalLight(0xfff0df, 3.02);
    keyLight.position.set(-5, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -11;
    keyLight.shadow.camera.right = 11;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0007;
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0xfff8ef, 1.12);
    fillLight.position.set(8, 7, -7);
    scene.add(fillLight);

    tables.forEach((table) => createTable(table, instance));
    return instance;
};

const setHomeCamera = (instance) => {
    const isMobile = instance.container.clientWidth < 680;
    instance.camera.fov = isMobile ? 40 : 35;
    instance.camera.position.set(0, isMobile ? 21 : 11.6, isMobile ? 24 : 14.6);
    instance.camera.updateProjectionMatrix();
    instance.camera.lookAt(HOME_TARGET);
};

const updateLabels = (instance) => {
    const width = instance.container.clientWidth;
    const height = instance.container.clientHeight;
    const worldPosition = new THREE.Vector3();

    instance.tableViews.forEach(({ labelAnchor, label }) => {
        labelAnchor.getWorldPosition(worldPosition);
        worldPosition.project(instance.camera);
        const x = (worldPosition.x * 0.5 + 0.5) * width;
        const y = (-worldPosition.y * 0.5 + 0.5) * height;
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        label.hidden = worldPosition.z > 1;
    });
};

const render = (instance) => {
    if (instance.disposed) {
        return;
    }

    instance.renderer.render(instance.scene, instance.camera);
    updateLabels(instance);
};

const getMaterialForMesh = (mesh, materials, state) => {
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
};

const applyVisualState = (instance) => {
    instance.tableViews.forEach((view, tableId) => {
        const status = instance.getTableStatus(view.table);
        const matches = view.table.experience === instance.experienceFilter;
        const selected = status === "Selected" || tableId === instance.selectedTableId;
        const hovered = tableId === instance.hoveredTableId;
        view.outlineRoot.visible = selected || hovered;
        view.outlineRoot.traverse((object) => {
            if (object.isLineSegments) {
                object.material = selected ? instance.materials.selectedOutline : instance.materials.outline;
            }
        });
        view.surfaceMeshes.forEach((mesh) => {
            mesh.material = getMaterialForMesh(mesh, instance.materials, { status, matches });
        });
        view.label.classList.toggle("is-muted", !matches);
        view.label.classList.toggle("is-selected", selected);
        view.label.classList.toggle("is-reserved", status === "Reserved");
        view.label.classList.toggle("is-disabled", status === "Disabled");
        view.label.querySelector(".booking-table-status-dot").dataset.status = status.toLowerCase();
    });
};

const findInteractiveTable = (instance, event) => {
    const bounds = instance.renderer.domElement.getBoundingClientRect();
    instance.pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
    instance.pointer.y = -((event.clientY - bounds.top) / bounds.height) * 2 + 1;
    instance.raycaster.setFromCamera(instance.pointer, instance.camera);
    const hit = instance.raycaster.intersectObjects(instance.proxyMeshes, false)[0];
    if (!hit) {
        return null;
    }

    const view = instance.tableViews.get(hit.object.userData.tableId);
    return view
        && view.table.experience === instance.experienceFilter
        && instance.getTableStatus(view.table) === "Available"
        ? view
        : null;
};

const clearHover = (instance) => {
    if (!instance.hoveredTableId && instance.tooltip.hidden) {
        return;
    }

    instance.hoveredTableId = "";
    instance.tooltip.hidden = true;
    instance.renderer.domElement.style.cursor = "default";
    applyVisualState(instance);
    render(instance);
};

const rectanglesOverlap = (first, second, margin = 6) => !(
    first.right + margin < second.left
    || first.left - margin > second.right
    || first.bottom + margin < second.top
    || first.top - margin > second.bottom
);

const positionTooltip = (instance, event) => {
    const containerBounds = instance.container.getBoundingClientRect();
    const pointerX = event.clientX - containerBounds.left;
    const pointerY = event.clientY - containerBounds.top;
    const tooltipWidth = instance.tooltip.offsetWidth;
    const tooltipHeight = instance.tooltip.offsetHeight;
    const edge = 8;
    const gap = 14;
    const clampX = (x) => Math.min(containerBounds.width - tooltipWidth - edge, Math.max(edge, x));
    const clampY = (y) => Math.min(containerBounds.height - tooltipHeight - edge, Math.max(edge, y));
    const candidates = [
        { x: pointerX + gap, y: pointerY - tooltipHeight - gap },
        { x: pointerX - tooltipWidth - gap, y: pointerY - tooltipHeight - gap },
        { x: pointerX + gap, y: pointerY + gap },
        { x: pointerX - tooltipWidth - gap, y: pointerY + gap }
    ].map(({ x, y }) => ({ x: clampX(x), y: clampY(y) }));
    const selectedLabelBounds = [...instance.tableViews.values()]
        .filter(({ table }) => instance.getTableStatus(table) === "Selected")
        .map(({ label }) => label.getBoundingClientRect());
    const position = candidates.find(({ x, y }) => {
        const candidateBounds = {
            left: containerBounds.left + x,
            top: containerBounds.top + y,
            right: containerBounds.left + x + tooltipWidth,
            bottom: containerBounds.top + y + tooltipHeight
        };
        return selectedLabelBounds.every((labelBounds) => !rectanglesOverlap(candidateBounds, labelBounds));
    }) || candidates[0];

    instance.tooltip.style.left = `${position.x}px`;
    instance.tooltip.style.top = `${position.y}px`;
};

const attachInteractions = (instance) => {
    const canvas = instance.renderer.domElement;
    const onPointerMove = (event) => {
        const view = findInteractiveTable(instance, event);
        if (!view) {
            clearHover(instance);
            return;
        }

        instance.hoveredTableId = view.table.tableId;
        instance.tooltip.textContent = `${view.table.tableId} \u00b7 ${view.table.experience} \u00b7 ${view.table.seats} seats \u00b7 Available`;
        instance.tooltip.hidden = false;
        positionTooltip(instance, event);
        canvas.style.cursor = "pointer";
        applyVisualState(instance);
        render(instance);
    };
    const onPointerLeave = () => clearHover(instance);
    const onClick = (event) => {
        const view = findInteractiveTable(instance, event);
        if (view) {
            instance.onTableSelect?.(view.table.tableId);
        }
    };
    const onReturn = () => {
        setHomeCamera(instance);
        render(instance);
    };
    const onContextLost = (event) => {
        event.preventDefault();
        instance.onFailure?.();
        destroyBookingTableSelector3D();
    };
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
};

const resize = (instance) => {
    const width = Math.max(1, instance.container.clientWidth);
    const height = Math.max(1, instance.container.clientHeight);
    const isMobile = width < 680;
    instance.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5));
    instance.renderer.setSize(width, height, false);
    instance.camera.aspect = width / height;
    instance.camera.updateProjectionMatrix();
    setHomeCamera(instance);
    render(instance);
};

export const initBookingTableSelector3D = (options = {}) => {
    destroyBookingTableSelector3D();
    if (!options.container || !isBookingTableSelector3DSupported()) {
        options.onFailure?.();
        return false;
    }

    try {
        activeInstance = createInstance({
            ...options,
            experienceFilter: normalizeExperience(options.experienceFilter)
        });
        attachInteractions(activeInstance);
        applyVisualState(activeInstance);
        activeInstance.resizeObserver = new ResizeObserver(() => resize(activeInstance));
        activeInstance.resizeObserver.observe(activeInstance.container);
        resize(activeInstance);
        return true;
    } catch (error) {
        console.warn("Interactive 3D floor unavailable; showing table cards.", error);
        destroyBookingTableSelector3D();
        options.onFailure?.();
        return false;
    }
};

export const updateBookingTableSelector3D = (options = {}) => {
    if (!activeInstance || activeInstance.disposed) {
        return false;
    }

    Object.assign(activeInstance, options);
    activeInstance.experienceFilter = normalizeExperience(activeInstance.experienceFilter);
    clearHover(activeInstance);
    applyVisualState(activeInstance);
    render(activeInstance);
    return true;
};

export const destroyBookingTableSelector3D = () => {
    const instance = activeInstance;
    activeInstance = null;
    if (!instance || instance.disposed) {
        return;
    }

    instance.disposed = true;
    cancelAnimationFrame(instance.animationFrame);
    instance.resizeObserver?.disconnect();
    instance.listeners.forEach(([target, type, handler]) => target.removeEventListener(type, handler));
    instance.disposableGeometries.forEach((geometry) => geometry.dispose());
    Object.values(instance.materials).forEach((material) => material.dispose());
    instance.gridMaterial?.dispose();
    instance.renderer.dispose();
    instance.renderer.forceContextLoss();
    instance.container.replaceChildren();
};
