/**
 * ============================================
 * AR BUSINESS CARD - MAIN APPLICATION
 * ============================================
 * Three.js AR Business Card with Interactive Elements
 */

// Global variables
let scene, camera, renderer, controls;
let cardGroup, cardFront, cardBack;
let raycaster, mouse;
let isFlipped = false;
let isAutoRotating = false;
let isInAR = false;
let clock;
let interactiveObjects = [];
let particleSystem;
let xrHitTestSource = null;
let reticle = null;

// Initialize the application
function init() {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a2e);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(0, 0, 12);

    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.xr.enabled = true;  // Enable XR from the start
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Initialize clock
    clock = new THREE.Clock();

    // Initialize raycaster for interactions
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    // Add controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 20;

    // Add lights
    setupLights();

    // Create the business card
    createBusinessCard();

    // Add particle effects
    if (CARD_CONFIG.interactiveElements.decorations.particles) {
        createParticles();
    }

    // Setup event listeners
    setupEventListeners();

    // Hide loading screen
    setTimeout(() => {
        document.getElementById('loading').classList.add('hidden');
    }, 1000);

    // Start animation loop using setAnimationLoop (required for WebXR)
    renderer.setAnimationLoop(animate);
}

function setupLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Main directional light
    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(5, 10, 7);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Accent lights
    const accentLight1 = new THREE.PointLight(CARD_CONFIG.cardStyle.primaryColor, 0.5, 20);
    accentLight1.position.set(-5, 3, 5);
    scene.add(accentLight1);

    const accentLight2 = new THREE.PointLight(CARD_CONFIG.cardStyle.secondaryColor, 0.3, 20);
    accentLight2.position.set(5, -3, 5);
    scene.add(accentLight2);

    // Rim light
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.3);
    rimLight.position.set(0, 0, -10);
    scene.add(rimLight);
}

function createBusinessCard() {
    cardGroup = new THREE.Group();

    // Card dimensions from config
    const { width, height, depth } = CARD_CONFIG.cardStyle;

    // Create card geometry with rounded corners (using box for simplicity)
    const cardGeometry = new THREE.BoxGeometry(width, height, depth);
    
    // Front material
    const frontMaterial = new THREE.MeshPhysicalMaterial({
        color: CARD_CONFIG.cardStyle.cardColor,
        metalness: 0.1,
        roughness: 0.4,
        clearcoat: 0.3,
        clearcoatRoughness: 0.2,
    });

    // Back material (slightly different shade)
    const backMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0f0f1a,
        metalness: 0.1,
        roughness: 0.5,
        clearcoat: 0.2,
    });

    // Create main card mesh
    const cardMesh = new THREE.Mesh(cardGeometry, frontMaterial);
    cardMesh.castShadow = true;
    cardMesh.receiveShadow = true;
    cardGroup.add(cardMesh);

    // Add border/edge glow
    const borderGeometry = new THREE.EdgesGeometry(cardGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({ 
        color: CARD_CONFIG.cardStyle.primaryColor,
        linewidth: 2,
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    cardGroup.add(border);

    // Add front content
    createFrontContent();

    // Add back content
    createBackContent();

    // Add interactive elements
    createInteractiveElements();

    scene.add(cardGroup);
}

function createFrontContent() {
    const config = CARD_CONFIG.personalInfo;
    const style = CARD_CONFIG.cardStyle;
    const depth = style.depth / 2 + 0.01;

    // Create a group for front content
    const frontGroup = new THREE.Group();
    frontGroup.position.z = depth;

    // Profile Photo Placeholder
    if (CARD_CONFIG.interactiveElements.profilePhoto.enabled) {
        const photoSize = CARD_CONFIG.interactiveElements.profilePhoto.size;
        const photoGeometry = new THREE.CircleGeometry(photoSize, 32);
        
        let photoMaterial;
        if (CARD_CONFIG.interactiveElements.profilePhoto.placeholder) {
            // Placeholder with gradient
            const canvas = createPlaceholderCanvas('👤', photoSize * 100);
            const texture = new THREE.CanvasTexture(canvas);
            photoMaterial = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true 
            });
        } else {
            // Load actual image
            const textureLoader = new THREE.TextureLoader();
            const texture = textureLoader.load(CARD_CONFIG.interactiveElements.profilePhoto.imageUrl);
            photoMaterial = new THREE.MeshBasicMaterial({ map: texture });
        }
        
        const photoMesh = new THREE.Mesh(photoGeometry, photoMaterial);
        photoMesh.position.set(-2.5, 1, 0);
        photoMesh.userData = { 
            type: 'profile',
            tooltip: 'Profile Photo - Click to customize'
        };
        frontGroup.add(photoMesh);
        interactiveObjects.push(photoMesh);

        // Photo border
        const photoBorderGeometry = new THREE.RingGeometry(photoSize, photoSize + 0.08, 32);
        const photoBorderMaterial = new THREE.MeshBasicMaterial({ 
            color: style.primaryColor,
            side: THREE.DoubleSide
        });
        const photoBorder = new THREE.Mesh(photoBorderGeometry, photoBorderMaterial);
        photoBorder.position.copy(photoMesh.position);
        frontGroup.add(photoBorder);
    }

    // Name text
    const nameMesh = createTextMesh(config.name, {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#ffffff'
    });
    nameMesh.position.set(1, 1.5, 0.01);
    nameMesh.scale.set(1.1, 1.1, 1);
    frontGroup.add(nameMesh);

    // Title text
    const titleMesh = createTextMesh(config.title, {
        fontSize: 28,
        color: '#00d4ff'
    });
    titleMesh.position.set(1, 0.7, 0.01);
    titleMesh.scale.set(1.1, 1, 1);
    frontGroup.add(titleMesh);

    // Company
    const companyMesh = createTextMesh(config.company, {
        fontSize: 24,
        color: '#aaaaaa'
    });
    companyMesh.position.set(1, 0.1, 0.01);
    companyMesh.scale.set(0.95, 0.85, 1);
    frontGroup.add(companyMesh);

    // Divider line
    const dividerGeometry = new THREE.PlaneGeometry(5, 0.02);
    const dividerMaterial = new THREE.MeshBasicMaterial({ 
        color: style.primaryColor,
        transparent: true,
        opacity: 0.5
    });
    const divider = new THREE.Mesh(dividerGeometry, dividerMaterial);
    divider.position.set(0.5, -0.3, 0);
    frontGroup.add(divider);

    // Contact info icons and text
    const contactItems = [
        { icon: '📧', text: config.email, y: -0.8 },
        { icon: '📱', text: config.phone, y: -1.3 },
        { icon: '🌐', text: config.website, y: -1.8 },
    ];

    contactItems.forEach(item => {
        const iconMesh = createTextMesh(item.icon, { fontSize: 24 });
        iconMesh.position.set(-3.2, item.y, 0.01);
        iconMesh.scale.set(0.22, 0.85, 1);
        frontGroup.add(iconMesh);

        const textMesh = createTextMesh(item.text, { 
            fontSize: 20, 
            color: '#cccccc' 
        });
        textMesh.position.set(0.5, item.y, 0.01);
        textMesh.scale.set(1.1, 0.75, 1);
        textMesh.userData = { 
            type: 'contact',
            tooltip: `Click to copy: ${item.text}`
        };
        frontGroup.add(textMesh);
        interactiveObjects.push(textMesh);
    });

    // Social media icons
    createSocialIcons(frontGroup);

    cardGroup.add(frontGroup);
    cardFront = frontGroup;
}

function createBackContent() {
    const config = CARD_CONFIG;
    const style = config.cardStyle;
    const depth = -(style.depth / 2 + 0.01);

    // Create a group for back content
    const backGroup = new THREE.Group();
    backGroup.position.z = depth;
    backGroup.rotation.y = Math.PI;

    // QR Code placeholder
    if (config.interactiveElements.qrCode.enabled) {
        const qrSize = config.interactiveElements.qrCode.size;
        const qrGeometry = new THREE.PlaneGeometry(qrSize * 2, qrSize * 2);
        
        let qrMaterial;
        if (config.interactiveElements.qrCode.placeholder) {
            const canvas = createQRPlaceholder(qrSize * 100);
            const texture = new THREE.CanvasTexture(canvas);
            qrMaterial = new THREE.MeshBasicMaterial({ 
                map: texture,
                transparent: true 
            });
        }
        
        const qrMesh = new THREE.Mesh(qrGeometry, qrMaterial);
        qrMesh.position.set(2.5, 0, 0);
        qrMesh.userData = { 
            type: 'qrcode',
            tooltip: 'QR Code - Scan for contact info'
        };
        backGroup.add(qrMesh);
        interactiveObjects.push(qrMesh);

        // QR Code label
        const qrLabel = createTextMesh('Scan Me!', {
            fontSize: 18,
            color: '#00d4ff'
        });
        qrLabel.position.set(2.5, -1.8, 0.01);
        qrLabel.scale.set(0.6, 0.55, 1);
        backGroup.add(qrLabel);
    }

    // Tagline
    const taglineMesh = createTextMesh(config.additionalInfo.tagline, {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff'
    });
    taglineMesh.position.set(-1, 2, 0.01);
    taglineMesh.scale.set(1.4, 1, 1);
    backGroup.add(taglineMesh);

    // Skills section
    const skillsTitle = createTextMesh('Skills & Expertise', {
        fontSize: 22,
        color: '#00d4ff'
    });
    skillsTitle.position.set(-1.5, 1.2, 0.01);
    skillsTitle.scale.set(0.9, 0.7, 1);
    backGroup.add(skillsTitle);

    // Skill tags
    config.skills.forEach((skill, index) => {
        const row = Math.floor(index / 2);
        const col = index % 2;
        
        const skillTag = createSkillTag(skill);
        skillTag.position.set(-2.5 + col * 2.2, 0.5 - row * 0.6, 0);
        backGroup.add(skillTag);
    });

    // Bio
    const bioMesh = createTextMesh(config.additionalInfo.bio, {
        fontSize: 16,
        color: '#aaaaaa'
    });
    bioMesh.position.set(-1, -1.8, 0.01);
    bioMesh.scale.set(1.4, 1.1, 1);
    backGroup.add(bioMesh);

    // Logo placeholder
    if (config.interactiveElements.logo.enabled) {
        const logoSize = config.interactiveElements.logo.size;
        const logoGeometry = new THREE.PlaneGeometry(logoSize * 2, logoSize);
        
        const canvas = createPlaceholderCanvas('LOGO', logoSize * 80);
        const texture = new THREE.CanvasTexture(canvas);
        const logoMaterial = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true 
        });
        
        const logoMesh = new THREE.Mesh(logoGeometry, logoMaterial);
        logoMesh.position.set(-2.5, -2.2, 0);
        logoMesh.userData = { 
            type: 'logo',
            tooltip: 'Company Logo - Click to customize'
        };
        backGroup.add(logoMesh);
        interactiveObjects.push(logoMesh);
    }

    cardGroup.add(backGroup);
    cardBack = backGroup;
}

function createSocialIcons(parent) {
    const socialConfig = CARD_CONFIG.socialLinks;
    const icons = [
        { name: 'LinkedIn', symbol: 'in', url: socialConfig.linkedin, color: 0x0077b5 },
        { name: 'GitHub', symbol: '⌘', url: socialConfig.github, color: 0x333333 },
        { name: 'Twitter', symbol: '𝕏', url: socialConfig.twitter, color: 0x1da1f2 },
        { name: 'Portfolio', symbol: '◈', url: socialConfig.portfolio, color: 0x00d4ff },
    ];

    icons.forEach((icon, index) => {
        const iconGroup = new THREE.Group();
        
        // Icon background
        const bgGeometry = new THREE.CircleGeometry(0.35, 32);
        const bgMaterial = new THREE.MeshBasicMaterial({ 
            color: icon.color,
            transparent: true,
            opacity: 0.8
        });
        const bg = new THREE.Mesh(bgGeometry, bgMaterial);
        iconGroup.add(bg);

        // Icon symbol
        const symbolMesh = createTextMesh(icon.symbol, {
            fontSize: 24,
            color: '#ffffff'
        });
        symbolMesh.position.z = 0.02;
        symbolMesh.scale.set(0.15, 0.55, 1);
        iconGroup.add(symbolMesh);

        iconGroup.position.set(-2.8 + index * 0.9, -2.3, 0);
        iconGroup.userData = { 
            type: 'social',
            name: icon.name,
            url: icon.url,
            tooltip: `${icon.name} - Click to visit`
        };
        
        parent.add(iconGroup);
        interactiveObjects.push(iconGroup);
    });
}

function createInteractiveElements() {
    const config = CARD_CONFIG.interactiveElements.decorations;

    if (config.floatingIcons) {
        // Floating decorative elements
        const shapes = [
            { geometry: new THREE.TetrahedronGeometry(0.2), position: [4, 2.5, 2] },
            { geometry: new THREE.OctahedronGeometry(0.15), position: [-4, -2, 2] },
            { geometry: new THREE.IcosahedronGeometry(0.18), position: [4.5, -2.5, 1.5] },
            { geometry: new THREE.TorusGeometry(0.15, 0.05, 8, 16), position: [-4.5, 2, 1] },
        ];

        shapes.forEach((shape, index) => {
            const material = new THREE.MeshPhysicalMaterial({
                color: CARD_CONFIG.cardStyle.primaryColor,
                metalness: 0.8,
                roughness: 0.2,
                transparent: true,
                opacity: 0.7,
            });
            const mesh = new THREE.Mesh(shape.geometry, material);
            mesh.position.set(...shape.position);
            mesh.userData = { 
                floatOffset: index * 0.5,
                rotationSpeed: 0.01 + Math.random() * 0.02
            };
            scene.add(mesh);
        });
    }

    if (config.glowEffects) {
        // Add glow plane behind card
        const glowGeometry = new THREE.PlaneGeometry(10, 7);
        const glowMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 },
                color1: { value: new THREE.Color(CARD_CONFIG.cardStyle.primaryColor) },
                color2: { value: new THREE.Color(CARD_CONFIG.cardStyle.secondaryColor) },
            },
            vertexShader: `
                varying vec2 vUv;
                void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform float time;
                uniform vec3 color1;
                uniform vec3 color2;
                varying vec2 vUv;
                
                void main() {
                    vec2 center = vUv - 0.5;
                    float dist = length(center);
                    float alpha = smoothstep(0.5, 0.0, dist) * 0.3;
                    vec3 color = mix(color1, color2, sin(time + dist * 5.0) * 0.5 + 0.5);
                    gl_FragColor = vec4(color, alpha);
                }
            `,
            transparent: true,
            side: THREE.DoubleSide,
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        glow.position.z = -0.5;
        glow.userData = { type: 'glow' };
        cardGroup.add(glow);
    }
}

function createParticles() {
    const particleCount = 100;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(CARD_CONFIG.cardStyle.primaryColor);
    const color2 = new THREE.Color(CARD_CONFIG.cardStyle.secondaryColor);

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 30;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 15 - 5;

        const mixRatio = Math.random();
        const color = color1.clone().lerp(color2, mixRatio);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
    });

    particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
}

function createTextMesh(text, options = {}) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = 512;
    canvas.height = 128;

    const fontSize = options.fontSize || 32;
    const fontWeight = options.fontWeight || 'normal';
    const fontFamily = options.fontFamily || 'Segoe UI, Arial, sans-serif';
    const color = options.color || '#ffffff';

    context.fillStyle = 'transparent';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    context.fillStyle = color;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    // Use PlaneGeometry instead of Sprite so it rotates with parent
    const geometry = new THREE.PlaneGeometry(4, 1);
    const material = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    return mesh;
}

function createPlaceholderCanvas(text, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Gradient background
    const gradient = ctx.createRadialGradient(
        size/2, size/2, 0,
        size/2, size/2, size/2
    );
    gradient.addColorStop(0, '#2a2a4a');
    gradient.addColorStop(1, '#1a1a2e');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(size/2, size/2, size/2, 0, Math.PI * 2);
    ctx.fill();

    // Border
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 4;
    ctx.stroke();

    // Text/Icon
    ctx.fillStyle = '#00d4ff';
    ctx.font = `${size * 0.4}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, size/2, size/2);

    return canvas;
}

function createQRPlaceholder(size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    // QR-like pattern
    const cellSize = size / 20;
    ctx.fillStyle = '#000000';
    
    // Create a simple pattern that looks like QR
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 20; j++) {
            // Corner patterns
            if ((i < 7 && j < 7) || (i < 7 && j > 12) || (i > 12 && j < 7)) {
                if ((i < 1 || i > 5 || j < 1 || j > 5) ||
                    (i > 1 && i < 5 && j > 1 && j < 5)) {
                    ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
                }
            } else if (Math.random() > 0.5) {
                ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
            }
        }
    }

    // Border
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, size - 4, size - 4);

    return canvas;
}

function createSkillTag(text) {
    const group = new THREE.Group();

    // Tag background
    const bgGeometry = new THREE.PlaneGeometry(1.8, 0.4);
    const bgMaterial = new THREE.MeshBasicMaterial({
        color: CARD_CONFIG.cardStyle.primaryColor,
        transparent: true,
        opacity: 0.2,
    });
    const bg = new THREE.Mesh(bgGeometry, bgMaterial);
    group.add(bg);

    // Tag border
    const borderGeometry = new THREE.EdgesGeometry(bgGeometry);
    const borderMaterial = new THREE.LineBasicMaterial({
        color: CARD_CONFIG.cardStyle.primaryColor,
        transparent: true,
        opacity: 0.5,
    });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    group.add(border);

    // Tag text
    const textMesh = createTextMesh(text, {
        fontSize: 18,
        color: '#ffffff'
    });
    textMesh.position.z = 0.02;
    textMesh.scale.set(0.55, 0.5, 1);
    group.add(textMesh);

    return group;
}

function setupEventListeners() {
    // Window resize
    window.addEventListener('resize', onWindowResize);

    // Mouse move for interactions
    window.addEventListener('mousemove', onMouseMove);

    // Click for interactions
    window.addEventListener('click', onMouseClick);

    // Button controls
    document.getElementById('btn-rotate').addEventListener('click', toggleAutoRotate);
    document.getElementById('btn-flip').addEventListener('click', flipCard);
    document.getElementById('btn-reset').addEventListener('click', resetView);
    document.getElementById('btn-ar').addEventListener('click', toggleARMode);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseMove(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update tooltip
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    const tooltip = document.getElementById('tooltip');
    
    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.tooltip) {
            obj = obj.parent;
        }
        
        if (obj && obj.userData.tooltip) {
            tooltip.textContent = obj.userData.tooltip;
            tooltip.style.left = event.clientX + 15 + 'px';
            tooltip.style.top = event.clientY + 15 + 'px';
            tooltip.classList.add('visible');
            document.body.style.cursor = 'pointer';
        }
    } else {
        tooltip.classList.remove('visible');
        document.body.style.cursor = 'default';
    }
}

function onMouseClick(event) {
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(interactiveObjects, true);

    if (intersects.length > 0) {
        let obj = intersects[0].object;
        while (obj && !obj.userData.type) {
            obj = obj.parent;
        }
        
        if (obj && obj.userData.type) {
            handleInteraction(obj.userData);
        }
    }
}

function handleInteraction(userData) {
    switch (userData.type) {
        case 'social':
            console.log(`Opening ${userData.name}: ${userData.url}`);
            // In production, you would open the URL
            // window.open(userData.url, '_blank');
            showNotification(`${userData.name} link clicked!`);
            break;
        case 'contact':
            console.log('Contact info clicked');
            showNotification('Contact info copied to clipboard!');
            break;
        case 'qrcode':
            showNotification('QR Code - Replace with your vCard QR!');
            break;
        case 'profile':
            showNotification('Profile Photo placeholder - Add your image URL in config.js');
            break;
        case 'logo':
            showNotification('Logo placeholder - Add your logo URL in config.js');
            break;
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: rgba(0, 212, 255, 0.9);
        color: white;
        padding: 15px 30px;
        border-radius: 10px;
        font-size: 14px;
        z-index: 1000;
        animation: fadeInOut 2s ease forwards;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 2000);

    // Add animation style if not exists
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes fadeInOut {
                0% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
                20% { opacity: 1; transform: translateX(-50%) translateY(0); }
                80% { opacity: 1; transform: translateX(-50%) translateY(0); }
                100% { opacity: 0; transform: translateX(-50%) translateY(-20px); }
            }
        `;
        document.head.appendChild(style);
    }
}

function toggleAutoRotate() {
    isAutoRotating = !isAutoRotating;
    const btn = document.getElementById('btn-rotate');
    btn.style.background = isAutoRotating 
        ? 'linear-gradient(135deg, #ff6b6b, #ee5a5a)'
        : 'linear-gradient(135deg, #00d4ff, #0099cc)';
    btn.textContent = isAutoRotating ? 'Stop Rotation' : 'Auto Rotate';
}

function flipCard() {
    isFlipped = !isFlipped;
    const targetRotation = isFlipped ? Math.PI : 0;
    
    const startRotation = cardGroup.rotation.y;
    const duration = CARD_CONFIG.animations.flipDuration;
    const startTime = Date.now();

    function animateFlip() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        cardGroup.rotation.y = startRotation + (targetRotation - startRotation) * easeProgress;
        
        if (progress < 1) {
            requestAnimationFrame(animateFlip);
        }
    }
    
    animateFlip();
}

function resetView() {
    camera.position.set(0, 0, 12);
    camera.lookAt(0, 0, 0);
    cardGroup.rotation.set(0, 0, 0);
    controls.reset();
    isFlipped = false;
    isAutoRotating = false;
    document.getElementById('btn-rotate').textContent = 'Auto Rotate';
    document.getElementById('btn-rotate').style.background = 'linear-gradient(135deg, #00d4ff, #0099cc)';
}

let currentXRSession = null;

function toggleARMode() {
    const status = document.getElementById('ar-status');
    
    // If already in AR, exit it
    if (isInAR && currentXRSession) {
        currentXRSession.end();
        return;
    }
    
    // Check for WebXR support
    if ('xr' in navigator) {
        navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            if (supported) {
                startARSession();
            } else {
                status.textContent = 'AR not supported on this device';
                status.style.borderColor = '#ff6b6b';
                showNotification('WebXR AR is not supported on this device. Try on a mobile device with AR capabilities.');
            }
        });
    } else {
        status.textContent = 'WebXR not available';
        status.style.borderColor = '#ff6b6b';
        showNotification('WebXR is not available. For full AR experience, use a compatible browser and device.');
    }
}

async function startARSession() {
    try {
        // Request AR session with optional features for better compatibility
        const session = await navigator.xr.requestSession('immersive-ar', {
            requiredFeatures: ['local-floor'],
            optionalFeatures: ['hit-test', 'dom-overlay'],
            domOverlay: { root: document.getElementById('controls') }
        });
        
        renderer.xr.setReferenceSpaceType('local-floor');
        await renderer.xr.setSession(session);
        
        currentXRSession = session;
        isInAR = true;
        
        // Add AR active class to body for CSS
        document.body.classList.add('ar-active');
        
        // Change button text
        document.getElementById('btn-ar').textContent = 'Exit AR';
        
        // Force button positioning with inline styles
        const controls = document.getElementById('controls');
        controls.style.cssText = 'position:fixed !important; bottom:20px !important; right:20px !important; left:auto !important; top:auto !important; transform:none !important; width:auto !important; max-width:130px !important; flex-direction:column !important; display:flex !important; gap:10px !important; background:rgba(0,0,0,0.5) !important; padding:15px !important; border-radius:15px !important;';
        
        // Hide unnecessary buttons
        document.getElementById('btn-rotate').style.display = 'none';
        document.getElementById('btn-reset').style.display = 'none';
        document.getElementById('info-panel').style.display = 'none';
        document.getElementById('ar-status').style.display = 'none';
        
        // Hide background and particles in AR
        scene.background = null;
        if (particleSystem) particleSystem.visible = false;
        
        // Scale and reposition card for AR - bigger and further away
        cardGroup.scale.set(0.25, 0.25, 0.25);
        cardGroup.position.set(0, 0.1, -2.0);
        
        // Disable orbit controls in AR
        controls.enabled = false;
        
        document.getElementById('ar-status').textContent = 'AR Active';
        document.getElementById('ar-status').style.borderColor = '#00ff88';
        
        showNotification('AR Mode Active! Look around to see your card.');
        
        session.addEventListener('end', () => {
            currentXRSession = null;
            isInAR = false;
            
            // Remove AR active class
            document.body.classList.remove('ar-active');
            
            // Change button text back
            document.getElementById('btn-ar').textContent = 'Enter AR';
            
            // Restore button positioning
            const controls = document.getElementById('controls');
            controls.style.cssText = '';
            
            // Show buttons again
            document.getElementById('btn-rotate').style.display = '';
            document.getElementById('btn-reset').style.display = '';
            document.getElementById('info-panel').style.display = '';
            document.getElementById('ar-status').style.display = '';
            
            // Restore normal view
            scene.background = new THREE.Color(0x1a1a2e);
            if (particleSystem) particleSystem.visible = true;
            cardGroup.scale.set(1, 1, 1);
            cardGroup.position.set(0, 0, 0);
            controls.enabled = true;
            
            document.getElementById('ar-status').textContent = 'AR Mode Ready';
            document.getElementById('ar-status').style.borderColor = '#00d4ff';
        });
    } catch (error) {
        console.error('Failed to start AR session:', error);
        showNotification('Failed to start AR session: ' + error.message);
    }
}

function animate(timestamp, frame) {
    const time = clock.getElapsedTime();

    // Auto rotation (only when not in AR)
    if (isAutoRotating && !isInAR) {
        cardGroup.rotation.y += CARD_CONFIG.animations.autoRotateSpeed * 0.01;
    }

    // Float animation (reduced in AR mode)
    if (CARD_CONFIG.animations.floatAnimation) {
        const amplitude = isInAR ? CARD_CONFIG.animations.floatAmplitude * 0.3 : CARD_CONFIG.animations.floatAmplitude;
        const baseY = isInAR ? 0.1 : 0;
        cardGroup.position.y = baseY + Math.sin(time * CARD_CONFIG.animations.floatSpeed * 1000) * amplitude;
    }

    // Animate floating decorations (only when not in AR)
    if (!isInAR) {
        scene.children.forEach(child => {
            if (child.userData && child.userData.floatOffset !== undefined) {
                child.position.y += Math.sin(time + child.userData.floatOffset) * 0.003;
                child.rotation.x += child.userData.rotationSpeed;
                child.rotation.y += child.userData.rotationSpeed * 0.7;
            }
        });
    }

    // Animate particles (only when not in AR)
    if (particleSystem && !isInAR) {
        particleSystem.rotation.y = time * 0.02;
        particleSystem.rotation.x = Math.sin(time * 0.1) * 0.1;
    }

    // Update glow shader
    cardGroup.children.forEach(child => {
        if (child.userData && child.userData.type === 'glow' && child.material.uniforms) {
            child.material.uniforms.time.value = time;
        }
    });

    // Update controls (only when not in AR)
    if (!isInAR) {
        controls.update();
    }

    // Render scene
    renderer.render(scene, camera);
}

// Initialize on load
window.addEventListener('DOMContentLoaded', init);
