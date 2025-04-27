function _class_call_check(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _create_class(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
import * as THREE from 'three';
export var Unit = /*#__PURE__*/ function() {
    "use strict";
    function Unit(game, unitType) {
        _class_call_check(this, Unit);
        this.game = game;
        this.type = unitType;
        this.ammo = 3;
        this.position = new THREE.Vector3(0, 0, 0);
        this.projectiles = [];
        this.setUnitStats();
        this.createUnitMesh();
        this.game.gameUI.updateUnitInfo(this.type, this.ammo);
        this.game.gameUI.updatePlayerPower(this.power);
        // --- Smooth movement additions ---
        this.targetY = 0;
        this.targetX = 0; // Target X position
        this.velocityY = 0;
        this.velocityX = 0; // X velocity
        this.smoothMoveSpeed = 0.18; // Lower = smoother
        this.maxMoveSpeed = 32; // px per frame
        this.friction = 0.3; // Even higher friction for velocity damping
        this.stopFriction = 0.08; // Much stronger friction when nearly stopped
        this.stopThreshold = 2; // px/frame threshold for strong friction
    }
    _create_class(Unit, [
        {
            key: "cleanup",
            value: function cleanup() {
                // Clean up aim reticle if it exists
                if (this.aimReticle) {
                    this.game.scene.remove(this.aimReticle);
                    this.aimReticle = null;
                }
                
                // Clean up trajectory line if it exists
                if (this.trajectoryLine) {
                    this.game.scene.remove(this.trajectoryLine);
                    this.trajectoryLine = null;
                }
                
                // Clean up projectiles
                for(let i = this.projectiles.length - 1; i >= 0; i--) {
                    const projectile = this.projectiles[i];
                    this.game.scene.remove(projectile);
                }
                this.projectiles = [];
            },
        },
        {
            key: "setUnitStats",
            value: function setUnitStats() {
                switch(this.type){
                    case 'Duke':
                        this.power = 10;
                        this.color = 0x00ffff;
                        break;
                    case 'Tank':
                        this.power = 30;
                        this.color = 0x555555;
                        console.log('[DEBUG] Tank initialized with:', {
                            power: this.power,
                            size: {
                                width: 200,
                                height: 120
                            },
                            asset: 'tank.png'
                        });
                        break;
                    case 'Mech':
                        this.power = 40;
                        this.color = 0xaa0000;
                        break;
                    case 'Turret':
                        this.power = 20;
                        this.color = 0xffff00;
                        break;
                    case 'Ship':
                        this.power = 50;
                        this.color = 0x00aaff;
                        break;
                    default:
                        this.power = 10;
                        this.color = 0x00ffff;
                        break;
                }
                // Update UI with the unit's power
                this.game.gameUI.updatePowerInfo(this.power, this.game.enemyPower);
                this.game.gameUI.updatePlayerPower(this.power);
            }
        },
        {
            
            key: "updateAimIndicator",
            value: function updateAimIndicator() {
                if (!this.aimReticle) return;
                
                // Keep aim at sea level (same y as ship)
                const targetY = -125; // Sea level
                
                // Ensure aimX is within boundaries
                this.aimX = Math.max(this.minAimX, Math.min(this.maxAimX, this.aimX));
                
                // Update reticle position
                this.aimReticle.position.set(this.aimX, targetY, 5);
                
                // Store target position for shooting
                this.targetPosition = new THREE.Vector3(this.aimX, targetY, 0);
                
                // Update the trajectory line
                if (this.trajectoryLine && this.trajectoryPath) {
                    // Calculate a parabolic trajectory
                    const startX = this.position.x + 60; // Start from ship front
                    const startY = this.position.y;
                    const endX = this.aimX;
                    const endY = targetY;
                    const distance = endX - startX;
                    const midPointHeight = Math.min(150, distance * 0.3); // Arc height proportional to distance
                    
                    // Generate points for parabolic trajectory
                    const points = [];
                    const numPoints = 20;
                    
                    for (let i = 0; i <= numPoints; i++) {
                        const t = i / numPoints;
                        const x = startX + distance * t;
                        
                        // Parabolic equation: y = a*t^2 + b*t + c
                        // where a, b, c are calculated to make curve pass through start, apex, and end
                        const y = startY + (4 * midPointHeight * t * (1 - t));
                        
                        points.push(new THREE.Vector3(x, y, 5));
                    }
                    
                    // Update the trajectory geometry
                    this.trajectoryPath.geometry.dispose();
                    this.trajectoryPath.geometry = new THREE.BufferGeometry().setFromPoints(points);
                    
                    // Update the trajectory dots
                    for (let i = 0; i < this.trajectoryDots.length; i++) {
                        if (i < points.length && i % 2 === 0) { // Place dots every other point
                            const pointIndex = i * 2;
                            if (pointIndex < points.length) {
                                this.trajectoryDots[i].position.copy(points[pointIndex]);
                                this.trajectoryDots[i].visible = true;
                            }
                        } else {
                            this.trajectoryDots[i].visible = false;
                        }
                    }
                }
            }
        },
        {
            key: "setUnitStats",
            value: function setUnitStats() {
                switch(this.type){
                    case 'Duke':
                        this.power = 10;
                        this.color = 0x00ffff;
                        break;
                    case 'Tank':
                        this.power = 30;
                        this.color = 0x555555;
                        console.log('[DEBUG] Tank initialized with:', {
                            power: this.power,
                            size: {
                                width: 200,
                                height: 120
                            },
                            asset: 'tank.png'
                        });
                        break;
                    case 'Mech':
                        this.power = 40;
                        this.color = 0xaa0000;
                        break;
                    case 'Turret':
                        this.power = 20;
                        this.color = 0xffff00;
                        break;
                    case 'Ship':
                        this.power = 50;
                        this.color = 0x00aaff;
                        break;
                    default:
                        this.power = 10;
                        this.color = 0x00ffff;
                        break;
                }
                // Update UI with the unit's power
                this.game.gameUI.updatePowerInfo(this.power, this.game.enemyPower);
                this.game.gameUI.updatePlayerPower(this.power);
            }
        },
        {
            key: "createUnitMesh",
            value: function createUnitMesh() {
                var _this = this;
                var unitGroup = new THREE.Group();
                // Create texture from Duke asset
                var texture = new THREE.TextureLoader();
                texture.setCrossOrigin('Anonymous');
                var textureUrl;
                switch(this.type){
                    case 'Tank':
                        textureUrl = './assets/tank.png';
                        break;
                    case 'Mech':
                        textureUrl = './assets/mech.png';
                        break;
                    case 'Turret':
                        textureUrl = './assets/turret.png';
                        break;
                    case 'Ship':
                        textureUrl = './assets/user-ship.png';
                        break;
                    default:
                        textureUrl = './assets/Duke.png';
                }
                texture.load(textureUrl, function(tex) {
                    tex.colorSpace = THREE.SRGBColorSpace;
                    tex.minFilter = THREE.LinearFilter; // Disable mipmapping for crisp pixels
                    // Create sprite with Duke texture
                    var dukeMaterial = new THREE.SpriteMaterial({
                        map: tex,
                        transparent: true,
                        opacity: 1,
                        alphaTest: 0.5,
                        // Need to explicitly enable alpha blending
                        blending: THREE.NormalBlending,
                        depthTest: true,
                        depthWrite: false
                    });
                    var dukeSprite = new THREE.Sprite(dukeMaterial);
                    var sprite = _this.type === 'Tank' ? new THREE.Sprite(dukeMaterial) : new THREE.Sprite(dukeMaterial);
                    var width, height;
                    switch(_this.type){
                        case 'Tank':
                            width = 180;
                            height = 120;
                            break;
                        case 'Mech':
                            width = 180;
                            height = 180;
                            break;
                        case 'Turret':
                            width = 150;
                            height = 150;
                            break;
                        case 'Ship':
                            width = 360;
                            height = 200;
                            break;
                        default:
                            width = 160;
                            height = 120;
                    }
                    sprite.scale.set(width, height, 1);
                    dukeSprite.position.z = 5;
                    dukeSprite.center.set(0.5, 0.5);
                    dukeSprite.renderOrder = 1;
                    // Store original scale for flipping
                    sprite.userData.originalScale = {
                        x: width,
                        y: height,
                        sign: 1 // Track facing direction (1 = right, -1 = left)
                    };
                    unitGroup.add(sprite);
                    // Turret (projectile emitter)
                    var turret = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), new THREE.MeshBasicMaterial({
                        color: 0xff0000,
                        transparent: true,
                        opacity: 0.5
                    }));
                    turret.position.set(25, 0, 0);
                    turret.visible = false; // Hide turret for debugging
                    unitGroup.add(turret);
                    console.log('Duke sprite created:', dukeSprite);
                }, undefined, function(err) {
                    console.error('Error loading Duke texture:', err);
                });
                // Position ship 
                if (this.type === 'Ship') {
                    // Fixed position in front of the base
                    const basePosition = this.game.base ? this.game.base.position : new THREE.Vector3(-this.game.width * 0.38, 0, 0);
                    // Position slightly to the right of the base
                    unitGroup.position.set(basePosition.x + 120, -125, 0);
                    
                    // Initialize aiming properties
                    this.aimX = this.position.x + 300; // Starting X position for aim (300px ahead)
                    this.minAimX = -this.game.width / 2 + 100; // Left boundary
                    this.maxAimX = this.game.width / 2 - 100;  // Right boundary
                    this.aimSpeed = 8; // Speed of aim movement
                    
                    // Create target reticle (circle with plus)
                    const reticleGroup = new THREE.Group();
                    
                    // Circle
                    const circleSegments = 32;
                    const circleRadius = 20;
                    const circleGeometry = new THREE.BufferGeometry();
                    const circlePoints = [];
                    
                    // Create circle points manually
                    for (let i = 0; i <= circleSegments; i++) {
                        const theta = (i / circleSegments) * Math.PI * 2;
                        circlePoints.push(
                            new THREE.Vector3(
                                circleRadius * Math.cos(theta),
                                circleRadius * Math.sin(theta),
                                0
                            )
                        );
                    }
                    
                    circleGeometry.setFromPoints(circlePoints);
                    // Orange color and thicker line
                    const circleMaterial = new THREE.LineBasicMaterial({ color: 0xff8800, linewidth: 4 });
                    const circle = new THREE.Line(circleGeometry, circleMaterial);
                    
                    // Horizontal line for plus
                    const horizontalGeometry = new THREE.BufferGeometry();
                    horizontalGeometry.setFromPoints([
                        new THREE.Vector3(-10, 0, 0),
                        new THREE.Vector3(10, 0, 0)
                    ]);
                    const horizontalLine = new THREE.Line(horizontalGeometry, circleMaterial);
                    
                    // Vertical line for plus
                    const verticalGeometry = new THREE.BufferGeometry();
                    verticalGeometry.setFromPoints([
                        new THREE.Vector3(0, -10, 0),
                        new THREE.Vector3(0, 10, 0)
                    ]);
                    const verticalLine = new THREE.Line(verticalGeometry, circleMaterial);
                    
                    // Add all parts to the reticle group
                    reticleGroup.add(circle);
                    reticleGroup.add(horizontalLine);
                    reticleGroup.add(verticalLine);
                    
                    // Position reticle initially ahead of the ship
                    reticleGroup.position.set(300, 0, 0);
                    
                    // Store reference to the reticle
                    this.aimReticle = reticleGroup;
                    
                    // Create the projectile trajectory line
                    // Create a projectile trajectory path
                    this.trajectoryLine = new THREE.Group();
                    this.trajectoryPoints = [];
                    
                    // Create the trajectory line material - orange and thicker
                    const trajectoryMaterial = new THREE.LineBasicMaterial({ 
                        color: 0xff8800, 
                        linewidth: 3,
                        transparent: true,
                        opacity: 0.7
                    });
                    
                    // Create an empty line geometry (will be updated in updateAimIndicator)
                    const trajectoryGeometry = new THREE.BufferGeometry();
                    this.trajectoryPath = new THREE.Line(trajectoryGeometry, trajectoryMaterial);
                    this.trajectoryLine.add(this.trajectoryPath);
                    
                    // Add small dots along the trajectory
                    this.trajectoryDots = [];
                    const dotGeometry = new THREE.CircleGeometry(3, 8);
                    const dotMaterial = new THREE.MeshBasicMaterial({ 
                        color: 0xff8800,
                        transparent: true,
                        opacity: 0.8
                    });
                    
                    for (let i = 0; i < 10; i++) {
                        const dot = new THREE.Mesh(dotGeometry, dotMaterial);
                        dot.visible = false; // Start invisible
                        this.trajectoryLine.add(dot);
                        this.trajectoryDots.push(dot);
                    }
                    
                    // Add the trajectory line to the scene
                    this.game.scene.add(this.trajectoryLine);
                    
                    // Add the reticle to the scene (not to the unit group)
                    this.game.scene.add(this.aimReticle);
                    
                    // Update aim indicator
                    this.updateAimIndicator();
                } else {
                    // Original position logic for other units
                    unitGroup.position.set(-this.game.width * 0.20, 0, 0);
                }
                
                this.position.copy(unitGroup.position);
                this.targetX = this.position.x; // Initialize targetX with current position
                this.mesh = unitGroup;
                this.game.scene.add(this.mesh);
                
                // Set initial direction to right (toward crabs)
                this.lastMoveDirection = 'right';
            }
        },
        {
            key: "update",
            value: function update() {
                // In stage 2, ships (user and enemies) should stay at sea level
                const isStage2 = this.type === 'Ship';
                
                // For Ship, check for continuous key presses to move the aim smoothly
                if (isStage2) {
                    // Get current key states
                    const keys = this.game.keys || {};
                    
                    // Move aim based on keys held down
                    if (keys['ArrowLeft'] || keys['a']) {
                        this.aimX -= this.aimSpeed;
                        this.updateAimIndicator();
                    }
                    
                    if (keys['ArrowRight'] || keys['d']) {
                        this.aimX += this.aimSpeed;
                        this.updateAimIndicator();
                    }
                }
                
                // Smooth Y movement - only allow in stage 1
                if (typeof this.targetY === 'number') {
                    // In stage 2, keep the ship at sea level (slightly below 0)
                    if (isStage2) {
                        // Position ships slightly below center for sea level
                        this.position.y = -125;
                        this.mesh.position.y = -125;
                        this.velocityY = 0;
                    } else {
                        let dy = this.targetY - this.position.y;
                        // Step-wise friction: use strong friction when nearly stopped
                        let frictionToUse = Math.abs(this.velocityY) < this.stopThreshold ? this.stopFriction : this.friction;
                        this.velocityY = this.velocityY * frictionToUse + dy * this.smoothMoveSpeed;
                        // Clamp max speed
                        if (this.velocityY > this.maxMoveSpeed) this.velocityY = this.maxMoveSpeed;
                        if (this.velocityY < -this.maxMoveSpeed) this.velocityY = -this.maxMoveSpeed;
                        // Move
                        this.position.y += this.velocityY;
                        // Clamp to bounds
                        this.position.y = Math.max(Math.min(this.position.y, this.game.height / 2 - 80), -this.game.height / 2 + 80);
                        this.mesh.position.y = this.position.y;
                    }
                }
                
                // Smooth X movement - allowed in both stages
                // For Ship, we handle just rotation rather than movement
                if (this.type === 'Ship') {
                    // Ship stays in fixed position in front of the base
                    // It only rotates to aim when left/right keys are pressed
                } else if (typeof this.targetX === 'number') {
                    let dx = this.targetX - this.position.x;
                    // Step-wise friction: use strong friction when nearly stopped
                    let frictionToUse = Math.abs(this.velocityX) < this.stopThreshold ? this.stopFriction : this.friction;
                    this.velocityX = this.velocityX * frictionToUse + dx * this.smoothMoveSpeed;
                    // Clamp max speed
                    if (this.velocityX > this.maxMoveSpeed) this.velocityX = this.maxMoveSpeed;
                    if (this.velocityX < -this.maxMoveSpeed) this.velocityX = -this.maxMoveSpeed;
                    // Move
                    this.position.x += this.velocityX;
                    // Clamp to bounds
                    this.position.x = Math.max(Math.min(this.position.x, this.game.width / 2 - 80), -this.game.width / 2 + 80);
                    this.mesh.position.x = this.position.x;
                }
                
                // Check for ammo box collisions
                if (this.game.enemyManager && this.game.enemyManager.ammoBoxes) {
                    for (let i = this.game.enemyManager.ammoBoxes.length - 1; i >= 0; i--) {
                        const ammoBox = this.game.enemyManager.ammoBoxes[i];
                        const distance = this.position.distanceTo(ammoBox.position);
                        if (distance < 80) { // Collision radius
                            // Show math problem when near ammo box
                            this.game.mathProblem.showProblem();
                            
                            // Remove ammo box
                            this.game.scene.remove(ammoBox.mesh);
                            this.game.enemyManager.ammoBoxes.splice(i, 1);
                            break;
                        }
                    }
                }
                
                // Update projectiles
                for(var i = this.projectiles.length - 1; i >= 0; i--){
                    var projectile = this.projectiles[i];
                    
                    // Handle trajectory-based projectiles
                    if (projectile.userData.isOnTrajectory) {
                        // Get trajectory points array and current index
                        const points = projectile.userData.trajectoryPoints;
                        let index = projectile.userData.currentPointIndex;
                        
                        // Check if we've reached the end of the trajectory
                        if (index >= points.length - 1) {
                            // We've reached the target - check for hits
                            projectile.position.copy(points[points.length - 1]);
                            
                            // Check for enemy hits at this exact position
                            this.game.enemyManager.checkProjectileCollisions(projectile, this.power);
                            
                            // Remove projectile after checking hits
                            this.game.scene.remove(projectile);
                            this.projectiles.splice(i, 1);
                            continue;
                        }
                        
                        // Move along trajectory
                        const speed = projectile.userData.speed || 1;
                        index += speed;
                        
                        // Clamp to array bounds
                        if (index >= points.length) {
                            index = points.length - 1;
                        }
                        
                        // Update position
                        projectile.position.copy(points[Math.floor(index)]);
                        
                        // Interpolate between points for smoother movement
                        if (Math.floor(index) < points.length - 1) {
                            const fraction = index - Math.floor(index);
                            const nextPoint = points[Math.floor(index) + 1];
                            projectile.position.lerp(nextPoint, fraction);
                        }
                        
                        // Update stored index
                        projectile.userData.currentPointIndex = index;
                        
                        // Check for enemy hits along the path
                        this.game.enemyManager.checkProjectileCollisions(projectile, this.power);
                        
                        // Add rotation to the projectile for visual effect
                        projectile.rotation.z += 0.15;
                        
                        // Random trail fade effect
                        if (projectile.children.length > 0) {
                            const trail = projectile.children[0];
                            trail.material.opacity = 0.3 + Math.random() * 0.4;
                            const scale = 0.8 + Math.random() * 0.4;
                            trail.scale.set(scale, scale, 1);
                        }
                    } 
                    // Handle straight projectiles for Ship (fallback)
                    else if (projectile.userData.velocityX !== undefined && projectile.userData.targetX !== undefined) {
                        // Ship projectile movement - always goes straight
                        projectile.position.x += projectile.userData.velocityX;
                        
                        // Check if the projectile has reached or passed the target X
                        if (projectile.position.x >= projectile.userData.targetX) {
                            // Position it exactly at the target for hit detection
                            projectile.position.x = projectile.userData.targetX;
                            
                            // Check for enemy hits at this exact position
                            this.game.enemyManager.checkProjectileCollisions(projectile, this.power);
                            
                            // Remove projectile after checking hits
                            this.game.scene.remove(projectile);
                            this.projectiles.splice(i, 1);
                            
                            // Skip the rest of the loop for this projectile
                            continue;
                        }
                    } 
                    else if (projectile.userData.velocityX !== undefined && projectile.userData.velocityY !== undefined) {
                        // Angled projectile movement (for backward compatibility)
                        projectile.position.x += projectile.userData.velocityX;
                        projectile.position.y += projectile.userData.velocityY;
                    } else {
                        // Standard projectile movement
                        projectile.position.x += projectile.userData.velocity || 15;
                    }
                    
                    // Check for enemy hits
                    this.game.enemyManager.checkProjectileCollisions(projectile, this.power);
                    
                    // Remove if out of bounds - check both x and y bounds
                    if (projectile.position.x > this.game.width / 2 || 
                        projectile.position.x < -this.game.width / 2 ||
                        projectile.position.y > this.game.height / 2 ||
                        projectile.position.y < -this.game.height / 2) {
                        this.game.scene.remove(projectile);
                        this.projectiles.splice(i, 1);
                    }
                }
            }
        },
        {
            key: "handleKeyInput",
            value: function handleKeyInput(key) {
                var moveStep = 40; // Increased move step for smoother movement
                const isStage2 = this.type === 'Ship';
                
                if (isStage2) {
                    // Ship aiming controls
                    if (key === 'ArrowLeft' || key === 'a') {
                        // Move aim left
                        this.aimX -= this.aimSpeed;
                        this.updateAimIndicator();
                    }
                    
                    if (key === 'ArrowRight' || key === 'd') {
                        // Move aim right
                        this.aimX += this.aimSpeed;
                        this.updateAimIndicator();
                    }
                    
                    // Shooting for ship - uses current aim position
                    if (key === ' ' && this.ammo > 0) {
                        this.shoot();
                    }
                } else {
                    // Regular unit controls
                    
                    // Movement controls - vertical (only in stage 1)
                    if (key === 'ArrowUp' || key === 'w') {
                        this.targetY = Math.min((this.targetY || this.position.y) + moveStep, this.game.height / 2 - 80);
                    }
                    if (key === 'ArrowDown' || key === 's') {
                        this.targetY = Math.max((this.targetY || this.position.y) - moveStep, -this.game.height / 2 + 80);
                    }
                    
                    // Movement controls - horizontal
                    if (key === 'ArrowLeft' || key === 'a') {
                        this.targetX = Math.max((this.targetX || this.position.x) - moveStep, -this.game.width / 2 + 80);
                        this.changeDirection('left');
                        this.lastMoveDirection = 'left';
                    }
                    if (key === 'ArrowRight' || key === 'd') {
                        this.targetX = Math.min((this.targetX || this.position.x) + moveStep, this.game.width / 2 - 80);
                        this.changeDirection('right');
                        this.lastMoveDirection = 'right';
                    }
                    
                    // Regular shooting
                    if (key === ' ' && this.ammo > 0) {
                        this.shoot();
                    }
                }
            }
        },
        {
            key: "shoot",
            value: function shoot() {
                var _this = this;
                if (this.ammo <= 0) return;
                
                // Play attack sound
                if (this.game.audioManager) {
                    this.game.audioManager.playAttack();
                }
                
                // Create projectile
                var projectileGeometry = new THREE.SphereGeometry(6, 12, 12); // Slightly bigger projectile
                var projectileMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff8800, // Orange projectile
                    emissive: 0xff4400, // Light emission for glow effect
                    emissiveIntensity: 0.5
                });
                var projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
                
                // Set position to start from the turret/ship
                projectile.position.copy(this.position);
                var dukeSprite = this.mesh.children[0];
                
                if (this.type === 'Ship') {
                    // Make sure aim indicator is updated
                    if (!this.targetPosition) {
                        this.updateAimIndicator();
                    }
                    
                    // Adjust start position to be at the ship front
                    projectile.position.x += 60;
                    
                    // Get trajectory points for projectile to follow
                    if (this.trajectoryPath && this.trajectoryPath.geometry) {
                        const points = [];
                        const positions = this.trajectoryPath.geometry.attributes.position;
                        
                        // Extract all points from the trajectory geometry
                        for (let i = 0; i < positions.count; i++) {
                            points.push(new THREE.Vector3(
                                positions.getX(i),
                                positions.getY(i),
                                positions.getZ(i)
                            ));
                        }
                        
                        // Store trajectory data for update method to use
                        projectile.userData = {
                            trajectoryPoints: points, // All points along the path
                            currentPointIndex: 0,     // Start at the beginning
                            speed: 1.5,               // How many points to advance per frame
                            targetX: this.aimX,       // Target X for hit detection
                            isOnTrajectory: true      // Flag to indicate this uses trajectory
                        };
                    } else {
                        // Fallback if trajectory not available
                        const speed = 25;
                        projectile.userData = {
                            velocityX: speed,
                            velocityY: 0,
                            direction: 1,
                            targetX: this.aimX
                        };
                    }
                    
                    // Flash the reticle to indicate shooting
                    if (this.aimReticle) {
                        const originalColor = this.aimReticle.children[0].material.color.clone();
                        this.aimReticle.children.forEach(part => {
                            part.material.color.set(0xffff00); // Yellow flash
                        });
                        
                        setTimeout(() => {
                            this.aimReticle.children.forEach(part => {
                                part.material.color.copy(originalColor);
                            });
                        }, 100);
                    }
                    
                    // Also flash the trajectory line
                    if (this.trajectoryPath) {
                        const originalColor = this.trajectoryPath.material.color.clone();
                        this.trajectoryPath.material.color.set(0xffff00); // Yellow flash
                        
                        setTimeout(() => {
                            this.trajectoryPath.material.color.copy(originalColor);
                        }, 100);
                    }
                } else {
                    // Standard unit shooting logic
                    // Always shoot right (where crabs come from)
                    var currentDirection = 1; // 1 = right
                    
                    // Force sync sprite direction with right-facing direction
                    dukeSprite.scale.x = dukeSprite.userData.originalScale.x * currentDirection;
                    dukeSprite.userData.originalScale.sign = currentDirection;
                    
                    // Adjust spawn position for right-facing direction
                    projectile.position.x += 60; // positive = right
                    projectile.position.y = this.position.y;
                    
                    // Set velocity for right-facing direction
                    projectile.userData = {
                        velocity: 25, // positive = right
                        direction: currentDirection
                    };
                    
                    // Debug visualization - show projectile direction
                    var arrowHelper = new THREE.ArrowHelper(new THREE.Vector3(currentDirection, 0, 0), projectile.position, 50, 0x00ff00, 10, 5);
                    this.game.scene.add(arrowHelper);
                    setTimeout(function() {
                        return _this.game.scene.remove(arrowHelper);
                    }, 100);
                }
                
                // Add trail effect to projectile
                const trailGeometry = new THREE.CircleGeometry(4, 8);
                const trailMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff4400,
                    transparent: true,
                    opacity: 0.7
                });
                
                const trail = new THREE.Mesh(trailGeometry, trailMaterial);
                projectile.add(trail);
                trail.position.set(0, 0, -2); // Position slightly behind the projectile
                
                this.game.scene.add(projectile);
                this.projectiles.push(projectile);
                
                // Reduce ammo
                this.ammo--;
                this.game.gameUI.updateUnitInfo(this.type, this.ammo);
            }
        },
        {
            key: "changeDirection",
            value: function changeDirection(direction) {
                if (!this.mesh || this.mesh.children.length === 0) return;
                var sprite = this.mesh.children[0];
                var newDirection = direction === 'left' ? -1 : 1;
                // Flip the sprite by scaling X negatively for left direction
                sprite.scale.x = Math.abs(sprite.userData.originalScale.x) * newDirection;
                sprite.userData.originalScale.sign = newDirection;
                // Position the turret on the correct side
                if (this.mesh.children[1]) {
                    this.mesh.children[1].position.x = newDirection > 0 ? 25 : -25;
                }
            }
        },
        {
            key: "addAmmo",
            value: function addAmmo() {
                var amount = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 1;
                this.ammo += amount;
                this.game.gameUI.updateUnitInfo(this.type, this.ammo);
            }
        },
        {
            key: "upgradePower",
            value: function upgradePower(newPower) {
                this.power = newPower;
                // Defensive: Only update material if mesh and children exist
                if (
                    this.mesh &&
                    this.mesh.children &&
                    this.mesh.children[0] &&
                    this.mesh.children[0].material &&
                    typeof this.mesh.children[0].material.color.setHSL === 'function'
                ) {
                    var colorIntensity = Math.min(1, (newPower - 5) / 15);
                    this.mesh.children[0].material.color.setHSL(0.5 + colorIntensity * 0.2, 1, 0.5 + colorIntensity * 0.3);
                }
                // Update power display
                this.game.gameUI.updatePlayerPower(this.power);
            }
        }
    ]);
    return Unit;
}();
