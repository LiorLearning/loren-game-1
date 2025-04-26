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
        this.velocityY = 0;
        this.smoothMoveSpeed = 0.18; // Lower = smoother
        this.maxMoveSpeed = 32; // px per frame
        this.friction = 0.3; // Even higher friction for velocity damping
        this.stopFriction = 0.08; // Much stronger friction when nearly stopped
        this.stopThreshold = 2; // px/frame threshold for strong friction
    }
    _create_class(Unit, [
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
                // Position closer to the left side (near base)
                unitGroup.position.set(-this.game.width * 0.20, 0, 0);
                this.position.copy(unitGroup.position);
                this.mesh = unitGroup;
                this.game.scene.add(this.mesh);
                
                // Set initial direction to right (toward crabs)
                this.lastMoveDirection = 'right';
            }
        },
        {
            key: "update",
            value: function update() {
                // Smooth Y movement
                if (typeof this.targetY === 'number') {
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
                // Update projectiles
                for(var i = this.projectiles.length - 1; i >= 0; i--){
                    var projectile = this.projectiles[i];
                    projectile.position.x += projectile.userData.velocity || 15;
                    // Check for enemy hits
                    this.game.enemyManager.checkProjectileCollisions(projectile, this.power);
                    // Remove if out of bounds
                    if (projectile.position.x > this.game.width / 2) {
                        this.game.scene.remove(projectile);
                        this.projectiles.splice(i, 1);
                    }
                }
            }
        },
        {
            key: "handleKeyInput",
            value: function handleKeyInput(key) {
                var moveStep = 30; // How far to move per key press (target, smaller for finer movement)
                // Movement controls
                if (key === 'ArrowUp' || key === 'w') {
                    this.targetY = Math.min((this.targetY || this.position.y) + moveStep, this.game.height / 2 - 80);
                }
                if (key === 'ArrowDown' || key === 's') {
                    this.targetY = Math.max((this.targetY || this.position.y) - moveStep, -this.game.height / 2 + 80);
                }
                // Shooting
                if (key === ' ' && this.ammo > 0) {
                    this.shoot();
                }
                // Remove left direction capability
                // Always force right direction (where the crabs are coming from)
                if (key === 'ArrowRight') {
                    this.changeDirection('right');
                    this.lastMoveDirection = 'right';
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
                var projectileGeometry = new THREE.SphereGeometry(5, 8, 8);
                var projectileMaterial = new THREE.MeshBasicMaterial({
                    color: 0xffff00
                });
                var projectile = new THREE.Mesh(projectileGeometry, projectileMaterial);
                
                // Set position to start from the turret
                projectile.position.copy(this.position);
                var dukeSprite = this.mesh.children[0];
                
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
