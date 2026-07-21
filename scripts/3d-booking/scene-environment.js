import * as THREE from "../vendor/three.module.js";

export const ANIMATION_SETTINGS = Object.freeze({
    cameraTransitionDuration: 720,
    chairResponse: 9,
    cloudSpeed: 0.004,
    sunsetDuration: 36,
    sunStartX: 3.35,
    sunStartY: 2.72,
    sunEndX: 4.15,
    sunEndY: 1.48
});
const SKY_START_COLOR = new THREE.Color(0x2b2440);
const SKY_END_COLOR = new THREE.Color(0x171426);
const SUNSET_START_TINT = new THREE.Color(0xffffff);
const SUNSET_END_TINT = new THREE.Color(0xaaa0c9);

export function createMaterials() {
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

export function createGeometries() {
    return {
        floor: new THREE.PlaneGeometry(21, 15.5),
        backWall: new THREE.BoxGeometry(21, 4.2, 0.24),
        sideWall: new THREE.BoxGeometry(0.24, 3.1, 15.5),
        wallPanel: new THREE.BoxGeometry(4.1, 2.45, 0.1),
        wallTrim: new THREE.BoxGeometry(20.4, 0.08, 0.1),
        sunsetWindow: new THREE.PlaneGeometry(16.5, 2.76),
        sunsetSun: new THREE.PlaneGeometry(1.5, 1.5),
        windowVerticalFrame: new THREE.BoxGeometry(0.1, 2.94, 0.1),
        windowHorizontalFrame: new THREE.BoxGeometry(16.72, 0.1, 0.1),
        roundTop: new THREE.CylinderGeometry(0.64, 0.64, 0.16, 32),
        squareTop: new THREE.BoxGeometry(1, 0.16, 1),
        chairSeat: new THREE.BoxGeometry(0.52, 0.16, 0.5),
        chairBack: new THREE.CapsuleGeometry(0.28, 0.28, 4, 8),
        leg: new THREE.CylinderGeometry(0.035, 0.045, 0.78, 8),
        tableLeg: new THREE.CylinderGeometry(0.055, 0.07, 0.86, 10),
        proxy: new THREE.BoxGeometry(1, 1, 1),
        seatMarker: new THREE.CylinderGeometry(0.24, 0.24, 0.022, 24)
    };
}

function addRoomSurface(scene, geometry, material, x, y, z) {
    const surface = new THREE.Mesh(geometry, material);
    surface.position.set(x, y, z);
    surface.receiveShadow = true;
    scene.add(surface);
    return surface;
}

export function createRestaurantFloor(instance) {
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

function drawSunsetCloud(context, x, y, width, height, opacity) {
    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = "#fff1df";
    context.beginPath();
    context.ellipse(x, y, width * 0.28, height * 0.48, 0, 0, Math.PI * 2);
    context.ellipse(x + width * 0.24, y - height * 0.12, width * 0.34, height * 0.62, 0, 0, Math.PI * 2);
    context.ellipse(x + width * 0.56, y, width * 0.32, height * 0.46, 0, 0, Math.PI * 2);
    context.fill();
    context.restore();
}

function drawSunsetHorizon(context, width, height) {
    context.fillStyle = "#34231f";
    context.beginPath();
    context.moveTo(0, height);
    context.lineTo(0, height * 0.82);
    context.quadraticCurveTo(width * 0.12, height * 0.7, width * 0.25, height * 0.8);
    context.quadraticCurveTo(width * 0.4, height * 0.9, width * 0.56, height * 0.76);
    context.quadraticCurveTo(width * 0.7, height * 0.66, width * 0.82, height * 0.79);
    context.quadraticCurveTo(width * 0.92, height * 0.88, width, height * 0.75);
    context.lineTo(width, height);
    context.closePath();
    context.fill();

    context.fillStyle = "#1e1819";
    context.fillRect(0, height * 0.91, width, height * 0.09);
}

function createSunsetTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 384;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("The sunset view could not be created.");
    }

    const sky = context.createLinearGradient(0, 0, 0, canvas.height);
    sky.addColorStop(0, "#2b2448");
    sky.addColorStop(0.42, "#784052");
    sky.addColorStop(0.72, "#df754d");
    sky.addColorStop(1, "#f3b96d");
    context.fillStyle = sky;
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawSunsetHorizon(context, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

function createSunTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("The moving sun could not be created.");
    }

    const center = canvas.width / 2;
    const glow = context.createRadialGradient(center, center, 0, center, center, center);
    glow.addColorStop(0, "rgba(255, 250, 214, 1)");
    glow.addColorStop(0.25, "rgba(255, 236, 170, 1)");
    glow.addColorStop(0.48, "rgba(255, 185, 95, 0.62)");
    glow.addColorStop(1, "rgba(255, 132, 65, 0)");
    context.fillStyle = glow;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

function createStarTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 384;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("The evening stars could not be created.");
    }

    context.fillStyle = "#fff4d6";
    for (let index = 0; index < 42; index += 1) {
        const x = (index * 137 + 43) % canvas.width;
        const y = (index * 61 + 19) % Math.round(canvas.height * 0.58);
        const radius = index % 5 === 0 ? 1.8 : 1.1;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

function createCloudTexture() {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("The animated clouds could not be created.");
    }

    drawSunsetCloud(context, 42, 62, 150, 30, 0.42);
    drawSunsetCloud(context, 270, 36, 190, 34, 0.3);
    drawSunsetCloud(context, 448, 78, 130, 25, 0.24);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = THREE.RepeatWrapping;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
}

function createSunsetWindow(instance) {
    const { scene, geometries, materials } = instance;
    instance.sunsetTexture = createSunsetTexture();
    instance.sunTexture = createSunTexture();
    instance.starTexture = createStarTexture();
    instance.cloudTexture = createCloudTexture();
    materials.sunsetView = new THREE.MeshBasicMaterial({
        map: instance.sunsetTexture,
        toneMapped: false
    });
    materials.sunsetClouds = new THREE.MeshBasicMaterial({
        map: instance.cloudTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false
    });
    materials.sunsetSun = new THREE.MeshBasicMaterial({
        map: instance.sunTexture,
        transparent: true,
        depthWrite: false,
        toneMapped: false
    });
    materials.sunsetStars = new THREE.MeshBasicMaterial({
        map: instance.starTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false
    });

    const sunsetView = addRoomSurface(scene, geometries.sunsetWindow, materials.sunsetView, 0, 2.24, -7.36);
    sunsetView.receiveShadow = false;

    const starView = addRoomSurface(scene, geometries.sunsetWindow, materials.sunsetStars, 0, 2.24, -7.35);
    starView.receiveShadow = false;

    instance.sunView = addRoomSurface(
        scene,
        geometries.sunsetSun,
        materials.sunsetSun,
        ANIMATION_SETTINGS.sunStartX,
        ANIMATION_SETTINGS.sunStartY,
        -7.34
    );
    instance.sunView.receiveShadow = false;

    const cloudView = addRoomSurface(scene, geometries.sunsetWindow, materials.sunsetClouds, 0, 2.24, -7.33);
    cloudView.receiveShadow = false;

    const verticalFramePositions = [-8.3, -2.77, 2.77, 8.3];
    verticalFramePositions.forEach(function (x) {
        addRoomSurface(scene, geometries.windowVerticalFrame, materials.wallTrim, x, 2.24, -7.28);
    });
    addRoomSurface(scene, geometries.windowHorizontalFrame, materials.wallTrim, 0, 0.81, -7.28);
    addRoomSurface(scene, geometries.windowHorizontalFrame, materials.wallTrim, 0, 3.67, -7.28);
}

export function createModernWalls(instance) {
    const { scene, geometries, materials } = instance;
    addRoomSurface(scene, geometries.backWall, materials.wall, 0, 2.08, -7.63);
    addRoomSurface(scene, geometries.sideWall, materials.wall, -10.38, 1.53, 0);
    addRoomSurface(scene, geometries.sideWall, materials.wall, 10.38, 1.53, 0);

    const panelPositions = [-9.25, 9.25];
    panelPositions.forEach(function (x) {
        const panel = addRoomSurface(scene, geometries.wallPanel, materials.wallPanel, x, 2.22, -7.46);
        panel.scale.x = 0.4;
    });

    addRoomSurface(scene, geometries.wallTrim, materials.wallTrim, 0, 0.5, -7.43);
    addRoomSurface(scene, geometries.wallTrim, materials.wallTrim, 0, 3.72, -7.43);
    createSunsetWindow(instance);
}

export function createRestaurantLighting(instance) {
    const { scene } = instance;
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
    instance.wallLights = [leftWallLight, rightWallLight];

    const sunsetLight = new THREE.PointLight(0xff8f52, 2.3, 16, 2);
    sunsetLight.position.set(5.4, 3.2, -6.8);
    scene.add(sunsetLight);
    instance.sunsetLight = sunsetLight;
}

export function updateSunsetAnimation(instance, elapsedSeconds) {
    const rawProgress = Math.min(1, elapsedSeconds / ANIMATION_SETTINGS.sunsetDuration);
    const sunsetProgress = rawProgress * rawProgress * (3 - 2 * rawProgress);
    const starProgress = Math.max(0, (sunsetProgress - 0.42) / 0.58);

    instance.cloudTexture.offset.x = (elapsedSeconds * ANIMATION_SETTINGS.cloudSpeed) % 1;
    instance.sunView.position.x = THREE.MathUtils.lerp(
        ANIMATION_SETTINGS.sunStartX,
        ANIMATION_SETTINGS.sunEndX,
        sunsetProgress
    );
    instance.sunView.position.y = THREE.MathUtils.lerp(
        ANIMATION_SETTINGS.sunStartY,
        ANIMATION_SETTINGS.sunEndY,
        sunsetProgress
    );
    instance.materials.sunsetSun.opacity = THREE.MathUtils.lerp(1, 0.58, sunsetProgress);
    instance.materials.sunsetStars.opacity = THREE.MathUtils.lerp(0, 0.78, starProgress);
    instance.materials.sunsetView.color.lerpColors(SUNSET_START_TINT, SUNSET_END_TINT, sunsetProgress);

    instance.sunsetLight.intensity =
        THREE.MathUtils.lerp(2.3, 1.05, sunsetProgress) + Math.sin(elapsedSeconds * 0.55) * 0.05;
    instance.wallLights.forEach(function (light) {
        light.intensity = THREE.MathUtils.lerp(1.15, 1.85, sunsetProgress);
    });
    instance.scene.background.lerpColors(SKY_START_COLOR, SKY_END_COLOR, sunsetProgress);
    instance.scene.fog.color.copy(instance.scene.background);
}
