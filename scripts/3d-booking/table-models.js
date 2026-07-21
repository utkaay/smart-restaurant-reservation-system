import * as THREE from "../vendor/three.module.js";

const EXPERIENCE_NAMES = ["Regular", "Premium", "VIP"];
const TABLE_POSITIONS = {
    A1: [-6, -3.45],
    A2: [-2, -3.45],
    A3: [2, -3.45],
    A4: [6, -3.45],
    B1: [-6, 0],
    B2: [-2, 0],
    B3: [2, 0],
    B4: [6, 0],
    C1: [-7.1, 3.65],
    C2: [-2.7, 3.65],
    D1: [2.1, 3.65],
    D2: [7.3, 3.65]
};

export function normalizeExperience(experience) {
    return EXPERIENCE_NAMES.includes(experience) ? experience : "Regular";
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

function addChair({
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
}) {
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

    [
        [-0.2, -0.18],
        [0.2, -0.18],
        [-0.2, 0.18],
        [0.2, 0.18]
    ].forEach(function ([legX, legZ]) {
        const leg = new THREE.Mesh(geometries.leg, materials.brass);
        leg.userData.materialRole = "brass";
        leg.position.set(legX, 0.18, legZ);
        leg.scale.y = 0.55;
        leg.castShadow = true;
        chair.add(leg);
    });

    [seat, back].forEach(function (part) {
        return addOutline(part, chairOutlineRoot, geometryCache, disposableGeometries, materials);
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
        currentOutwardOffset: 0,
        targetOutwardOffset: 0,
        surfaceMeshes: [
            seat,
            back,
            ...chair.children.filter(function (child) {
                return child.userData.materialRole === "brass";
            })
        ]
    };
}

function createChairPlacement(x, z, inwardX, inwardZ) {
    return { x, z, inwardX, inwardZ };
}

function getChairPlacements({ width, depth, chairs }) {
    if (chairs === 2) {
        return [createChairPlacement(-1.02, 0, 1, 0), createChairPlacement(1.02, 0, -1, 0)];
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

export function createTable(table, instance) {
    const { scene, geometries, materials, geometryCache, tableProxyMeshes, labelsLayer, tableViews, seatViews } =
        instance;
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
    const tableLegs = legXPositions.map(function (legX) {
        const tableLeg = new THREE.Mesh(geometries.tableLeg, materials.brass);
        tableLeg.userData.materialRole = "brass";
        tableLeg.position.set(legX, 0.48, 0);
        tableLeg.castShadow = true;
        root.add(tableLeg);
        return tableLeg;
    });

    const chairViews = getChairPlacements(dimensions).map(function (placement, seatIndex) {
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
    const labelOffsetZ =
        dimensions.shape === "round" ? 0.84 : dimensions.shape === "square" ? 0.95 : dimensions.depth / 2 + 1.02;
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
