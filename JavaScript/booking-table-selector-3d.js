// Three.js r168 (0.168.0), vendored from https://unpkg.com/three@0.168.0/build/three.module.js
import * as THREE from "./vendor/three.module.js";

const EXPERIENCE_NAMES = ["Regular", "Premium", "VIP"];
const TABLE_POSITIONS = {
    A1: [-6, -3.45], A2: [-2, -3.45], A3: [2, -3.45], A4: [6, -3.45],
    B1: [-6, 0], B2: [-2, 0], B3: [2, 0], B4: [6, 0],
    C1: [-7.1, 3.65], C2: [-2.7, 3.65], D1: [2.1, 3.65], D2: [7.3, 3.65]
};
const HOME_TARGET = new THREE.Vector3(0, 0.15, 0.1);
let activeInstance = null;
let webGLSupportCache;

function normalizeExperience(experience) {
    return (EXPERIENCE_NAMES.includes(experience) ? experience : "Regular");
}

function createWebGLContext() {
    try {
        const canvas = document.createElement("canvas");
        return canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true })
            || canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true });
    } catch (error) {
        return null;
    }
}

export function isBookingTableSelector3DSupported() {
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
}

function tableDimensions(tableId = "", seats = 2) {
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
}

function createMaterials() {
    function material(color, roughness = 0.74, metalness = 0.03) {
        return new THREE.MeshStandardMaterial({
            color,
            roughness,
            metalness
        });
    }

    return {
        floor: material(0x765137, 0.88, 0.02),
        wall: material(0x5a3a2c, 0.9, 0.01),
        wallPanel: material(0x7c5842, 0.82, 0.02),
        wallTrim: material(0xb88a5c, 0.52, 0.16),
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
        selectedOutline: new THREE.LineBasicMaterial({ color: 0x07543a, transparent: true, opacity: 1 }),
        seatOutline: new THREE.LineBasicMaterial({ color: 0xc89a4c, transparent: true, opacity: 1 })
    };
}

function createGeometries() {
    return ({
        floor: new THREE.PlaneGeometry(21, 15.5),
        backWall: new THREE.BoxGeometry(21, 4.2, 0.24),
        sideWall: new THREE.BoxGeometry(0.24, 3.1, 15.5),
        wallPanel: new THREE.BoxGeometry(4.1, 2.45, 0.1),
        wallTrim: new THREE.BoxGeometry(20.4, 0.08, 0.1),
        roundTop: new THREE.CylinderGeometry(0.64, 0.64, 0.16, 32),
        squareTop: new THREE.BoxGeometry(1, 0.16, 1),
        chairSeat: new THREE.BoxGeometry(0.52, 0.16, 0.5),
        chairBack: new THREE.CapsuleGeometry(0.28, 0.28, 4, 8),
        leg: new THREE.CylinderGeometry(0.035, 0.045, 0.78, 8),
        tableLeg: new THREE.CylinderGeometry(0.055, 0.07, 0.86, 10),
        proxy: new THREE.BoxGeometry(1, 1, 1),
        seatMarker: new THREE.CylinderGeometry(0.24, 0.24, 0.022, 24)
    });
}

function addRoomSurface(scene, geometry, material, x, y, z) {
    const surface = new THREE.Mesh(geometry, material);
    surface.position.set(x, y, z);
    surface.receiveShadow = true;
    scene.add(surface);
    return surface;
}

function createRestaurantFloor(instance) {
    const { scene, geometries, materials } = instance;
    const floor = new THREE.Mesh(geometries.floor, materials.floor);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.015;
    floor.receiveShadow = true;
    scene.add(floor);

    const plankLines = new THREE.GridHelper(21, 21, 0x3f291d, 0x9a7252);
    plankLines.scale.z = 0.74;
    plankLines.position.y = 0.006;
    plankLines.material.transparent = true;
    plankLines.material.opacity = 0.34;
    scene.add(plankLines);
    instance.gridMaterial = plankLines.material;
}

function createModernWalls(instance) {
    const { scene, geometries, materials } = instance;
    addRoomSurface(scene, geometries.backWall, materials.wall, 0, 2.08, -7.63);
    addRoomSurface(scene, geometries.sideWall, materials.wall, -10.38, 1.53, 0);
    addRoomSurface(scene, geometries.sideWall, materials.wall, 10.38, 1.53, 0);

    const panelPositions = [-7.5, -2.5, 2.5, 7.5];
    panelPositions.forEach(function(x) {
        addRoomSurface(scene, geometries.wallPanel, materials.wallPanel, x, 2.22, -7.46);
    });

    addRoomSurface(scene, geometries.wallTrim, materials.wallTrim, 0, 0.5, -7.43);
    addRoomSurface(scene, geometries.wallTrim, materials.wallTrim, 0, 3.72, -7.43);
}

function createRestaurantLighting(scene) {
    scene.add(new THREE.HemisphereLight(0xffead2, 0x3b271f, 2.25));

    const keyLight = new THREE.DirectionalLight(0xffe2c2, 3.25);
    keyLight.position.set(-5, 11, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    keyLight.shadow.camera.left = -12;
    keyLight.shadow.camera.right = 12;
    keyLight.shadow.camera.top = 8;
    keyLight.shadow.camera.bottom = -8;
    keyLight.shadow.bias = -0.0007;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff0df, 1.22);
    fillLight.position.set(8, 7, -7);
    scene.add(fillLight);

    const leftWallLight = new THREE.PointLight(0xffb86b, 1.15, 9);
    leftWallLight.position.set(-5.8, 3.1, -6.9);
    scene.add(leftWallLight);

    const rightWallLight = new THREE.PointLight(0xffb86b, 1.15, 9);
    rightWallLight.position.set(5.8, 3.1, -6.9);
    scene.add(rightWallLight);
}

function addOutline(mesh, outlineRoot, geometryCache, geometries, materials) {
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
}

function addChair(
    {
        root,
        tableId,
        seatIndex,
        x,
        z,
        inwardX,
        inwardZ,
        geometries,
        materials,
        geometryCache,
        disposableGeometries
    }
) {
    const inwardDirection = new THREE.Vector3(inwardX, 0, inwardZ).normalize();
    const outwardDirection = inwardDirection.clone().multiplyScalar(-1);
    // The generated chair's seating front is local -Z; its backrest is local +Z.
    const modelForwardOffset = Math.PI;
    const rotationY = Math.atan2(inwardDirection.x, inwardDirection.z) - modelForwardOffset;
    const seatId = `${tableId}-S${seatIndex + 1}`;
    const chair = new THREE.Group();
    chair.position.set(x, 0, z);
    chair.rotation.y = rotationY;
    chair.userData = { kind: "seat", tableId, seatId, seatIndex, outwardDirection };

    const chairOutlineRoot = new THREE.Group();
    chairOutlineRoot.visible = false;
    chair.add(chairOutlineRoot);

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

    [[-0.2, -0.18], [0.2, -0.18], [-0.2, 0.18], [0.2, 0.18]].forEach(function([legX, legZ]) {
        const leg = new THREE.Mesh(geometries.leg, materials.brass);
        leg.userData.materialRole = "brass";
        leg.position.set(legX, 0.18, legZ);
        leg.scale.y = 0.55;
        leg.castShadow = true;
        chair.add(leg);
    });

    [seat, back].forEach(function(part) {
        return addOutline(
            part,
            chairOutlineRoot,
            geometryCache,
            disposableGeometries,
            materials
        );
    });

    const marker = new THREE.Mesh(geometries.seatMarker, materials.brass);
    marker.position.y = 0.018;
    marker.visible = false;
    marker.receiveShadow = true;
    chair.add(marker);

    const proxy = new THREE.Mesh(geometries.proxy, materials.proxy);
    proxy.position.y = 0.55;
    proxy.scale.set(0.72, 1.18, 0.72);
    proxy.userData = { kind: "seat", tableId, seatId, seatIndex };
    chair.add(proxy);
    root.add(chair);

    return {
        chair,
        proxy,
        marker,
        outlineRoot: chairOutlineRoot,
        originalPosition: chair.position.clone(),
        outwardDirection,
        surfaceMeshes: [seat, back, ...chair.children.filter(function(child) {
            return child.userData.materialRole === "brass";
        })]
    };
}

function createChairPlacement(x, z, inwardX, inwardZ) {
    return { x, z, inwardX, inwardZ };
}

function getChairPlacements({ width, depth, chairs }) {
    if (chairs === 2) {
        return [
            createChairPlacement(-1.02, 0, 1, 0),
            createChairPlacement(1.02, 0, -1, 0)
        ];
    }

    if (chairs === 4) {
        return [
            createChairPlacement(-1.05, 0, 1, 0),
            createChairPlacement(1.05, 0, -1, 0),
            createChairPlacement(0, -1.05, 0, 1),
            createChairPlacement(0, 1.05, 0, -1)
        ];
    }

    const placements = [];
    const chairsPerLongSide = Math.max(2, Math.floor((chairs - 2) / 2));
    const edgeInset = 0.55;
    const sideChairSpan = Math.max(0, width - edgeInset * 2);
    const sideChairSpacing = sideChairSpan / (chairsPerLongSide - 1);
    const sideChairZ = depth / 2 + 0.48;
    const endChairX = width / 2 + 0.48;

    for (let index = 0; index < chairsPerLongSide; index += 1) {
        const x = -sideChairSpan / 2 + sideChairSpacing * index;
        placements.push(createChairPlacement(x, -sideChairZ, 0, 1));
        placements.push(createChairPlacement(x, sideChairZ, 0, -1));
    }

    placements.push(createChairPlacement(-endChairX, 0, 1, 0));
    placements.push(createChairPlacement(endChairX, 0, -1, 0));
    return placements.slice(0, chairs);
}

function createTable(table, instance) {
    const { scene, geometries, materials, geometryCache, tableProxyMeshes, labelsLayer, tableViews, seatViews } = instance;
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
    const tableLegs = legXPositions.map(function(legX) {
        const tableLeg = new THREE.Mesh(geometries.tableLeg, materials.brass);
        tableLeg.userData.materialRole = "brass";
        tableLeg.position.set(legX, 0.48, 0);
        tableLeg.castShadow = true;
        root.add(tableLeg);
        return tableLeg;
    });

    const chairViews = getChairPlacements(dimensions).map(function(placement, seatIndex) {
        const chairView = addChair({
            root,
            tableId,
            seatIndex,
            ...placement,
            geometries,
            materials,
            geometryCache: instance.geometryCache,
            disposableGeometries: instance.disposableGeometries
        });
        seatViews.set(chairView.chair.userData.seatId, chairView);
        return chairView;
    });

    const proxy = new THREE.Mesh(geometries.proxy, materials.proxy);
    proxy.position.y = 0.72;
    proxy.scale.set(dimensions.width + 1.35, 1.55, dimensions.depth + 1.3);
    proxy.userData = { kind: "table", tableId };
    root.add(proxy);
    tableProxyMeshes.push(proxy);

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
        dimensions,
        chairViews,
        labelAnchor,
        label,
        surfaceMeshes: [top, ...tableLegs]
    });
}

function createInstance(options) {
    const { container, tables = [] } = options;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x3b2923);
    scene.fog = new THREE.Fog(0x3b2923, 28, 52);

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 60);
    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = "booking-table-3d-canvas";
    renderer.domElement.setAttribute("role", "img");
    renderer.domElement.setAttribute(
        "aria-label",
        "Interactive 3D restaurant floor and seat selector. Select a table, then its chairs. Keyboard users can use the mirrored table and seat buttons after the canvas."
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
        animationFrame: 0,
        disposed: false,
        listeners: []
    };

    createRestaurantFloor(instance);
    createModernWalls(instance);
    createRestaurantLighting(scene);

    tables.forEach(function(table) {
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

function animateCameraTo(instance, pose) {
    cancelAnimationFrame(instance.animationFrame);
    instance.animationFrame = 0;
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
        applyCameraPose(instance, pose);
        render(instance);
        return;
    }

    const startPosition = instance.camera.position.clone();
    const startTarget = instance.cameraTarget.clone();
    const startFov = instance.camera.fov;
    const startedAt = performance.now();
    const duration = 430;

    function step(now) {
        if (instance.disposed) {
            return;
        }
        const progress = Math.min(1, (now - startedAt) / duration);
        const eased = 1 - ((1 - progress) ** 3);
        instance.camera.position.lerpVectors(startPosition, pose.position, eased);
        instance.cameraTarget.lerpVectors(startTarget, pose.target, eased);
        instance.camera.fov = THREE.MathUtils.lerp(startFov, pose.fov, eased);
        instance.camera.updateProjectionMatrix();
        instance.camera.lookAt(instance.cameraTarget);
        render(instance);
        if (progress < 1) {
            instance.animationFrame = requestAnimationFrame(step);
        } else {
            instance.animationFrame = 0;
        }
    }

    instance.animationFrame = requestAnimationFrame(step);
}

function refreshActiveSeatProxies(instance) {
    const view = instance.tableViews.get(instance.focusedTableId);
    const selectedSeatIds = new Set(instance.selectedSeatIds || []);
    const selectionFull = selectedSeatIds.size >= Math.max(1, Number(instance.requiredSeatCount) || 1);
    instance.activeSeatProxies = view && instance.selectedTableId === instance.focusedTableId
        && instance.getTableStatus(view.table) === "Selected"
        ? view.chairViews
            .filter(function({ chair }) {
        return selectedSeatIds.has(chair.userData.seatId) || !selectionFull;
    })
            .map(function({ proxy }) {
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

    instance.tableViews.forEach(function({ labelAnchor, label }) {
        labelAnchor.getWorldPosition(worldPosition);
        worldPosition.project(instance.camera);
        const x = (worldPosition.x * 0.5 + 0.5) * width;
        const y = (-worldPosition.y * 0.5 + 0.5) * height;
        label.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
        label.hidden = worldPosition.z > 1
            || Boolean(instance.focusedTableId && label.dataset.tableLabel !== instance.focusedTableId);
    });
}

function render(instance) {
    if (instance.disposed) {
        return;
    }

    instance.renderer.render(instance.scene, instance.camera);
    updateLabels(instance);
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

function applyVisualState(instance) {
    const selectedSeatIds = new Set(instance.selectedSeatIds || []);
    const selectionFull = selectedSeatIds.size >= Math.max(1, Number(instance.requiredSeatCount) || 1);
    instance.tableViews.forEach(function(view, tableId) {
        const status = instance.getTableStatus(view.table);
        const matches = view.table.experience === instance.experienceFilter;
        const selected = status === "Selected" || tableId === instance.selectedTableId;
        const hovered = tableId === instance.hoveredTableId;
        view.outlineRoot.visible = selected || hovered;
        view.outlineRoot.traverse(function(object) {
            if (object.isLineSegments) {
                object.material = selected ? instance.materials.selectedOutline : instance.materials.outline;
            }
        });
        view.surfaceMeshes.forEach(function(mesh) {
            mesh.material = getMaterialForMesh(mesh, instance.materials, { status, matches });
        });
        const activeTable = instance.focusedTableId === tableId
            && instance.selectedTableId === tableId
            && status === "Selected";
        view.chairViews.forEach(function(chairView) {
            const seatId = chairView.chair.userData.seatId;
            const seatSelected = selectedSeatIds.has(seatId);
            const seatHovered = instance.hoveredSeatId === seatId;
            const seatUnavailable = !activeTable || (selectionFull && !seatSelected);
            chairView.chair.position.copy(chairView.originalPosition);
            if (seatSelected) {
                chairView.chair.position.addScaledVector(chairView.outwardDirection, 0.06);
            }
            chairView.marker.visible = seatSelected;
            chairView.outlineRoot.visible = seatSelected || seatHovered;
            chairView.outlineRoot.traverse(function(object) {
                if (object.isLineSegments) {
                    object.material = instance.materials.seatOutline;
                }
            });
            chairView.surfaceMeshes.forEach(function(mesh) {
                if (status === "Disabled") {
                    mesh.material = instance.materials.disabled;
                } else if (status === "Reserved") {
                    mesh.material = instance.materials.reserved;
                } else if (mesh.userData.materialRole === "brass") {
                    mesh.material = (!matches || (activeTable && seatUnavailable))
                        ? instance.materials.brassDim
                        : instance.materials.brass;
                } else {
                    mesh.material = (!matches || (activeTable && seatUnavailable))
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
        first.right + margin < second.left
        || first.left - margin > second.right
        || first.bottom + margin < second.top
        || first.top - margin > second.bottom
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
    ].map(function({ x, y }) {
        return ({
            x: clampX(x),
            y: clampY(y)
        });
    });
    const selectedLabelBounds = [...instance.tableViews.values()]
        .filter(function({ table }) {
        return instance.getTableStatus(table) === "Selected";
    })
        .map(function({ label }) {
        return label.getBoundingClientRect();
    });
    const position = candidates.find(function({ x, y }) {
        const candidateBounds = {
            left: containerBounds.left + x,
            top: containerBounds.top + y,
            right: containerBounds.left + x + tooltipWidth,
            bottom: containerBounds.top + y + tooltipHeight
        };
        return selectedLabelBounds.every(function(labelBounds) {
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
        activeInstance.resizeObserver = new ResizeObserver(function() {
            return resize(activeInstance);
        });
        activeInstance.resizeObserver.observe(activeInstance.container);
        resize(activeInstance);
        if (activeInstance.selectedTableId) {
            focusTable(activeInstance, activeInstance.selectedTableId);
        }
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
    cancelAnimationFrame(instance.animationFrame);
    instance.resizeObserver?.disconnect();
    instance.listeners.forEach(function([target, type, handler]) {
        return target.removeEventListener(type, handler);
    });
    instance.disposableGeometries.forEach(function(geometry) {
        return geometry.dispose();
    });
    Object.values(instance.materials).forEach(function(material) {
        return material.dispose();
    });
    instance.gridMaterial?.dispose();
    instance.renderer.dispose();
    instance.renderer.forceContextLoss();
    instance.container.replaceChildren();
}
