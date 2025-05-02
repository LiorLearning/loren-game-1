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
function _type_of(obj) {
    "@swc/helpers - typeof";
    return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj;
}
import * as THREE from 'three';
export var EnemyManager = /*#__PURE__*/ function() {
    "use strict";
    function EnemyManager(game) {
        _class_call_check(this, EnemyManager);
        this.game = game;
        this.enemies = [];
        this.ammoBoxes = []; // Array to store ammo boxes
        this.enemiesPerWave = 5; // 4 regular + 1 leader
        this.spawnRate = 2000; // Spawn every 2 seconds
        this.enemiesSpawned = 0;
        this.enemiesDefeated = 0;
        this.currentWave = 1;
        this.enemyPower = 10;
        this.spawnX = this.game.width * 0.48; // Spawn enemies at far right
        this.init();
    }
    _create_class(EnemyManager, [
        {
            key: "init",
            value: function init() {
                this.enemies = [];
                this.ammoBoxes = [];
                this.spawnX = this.game.width * 0.48;
                this.spawnRate = 2000;
                this.enemiesPerWave = 5;
                this.enemiesSpawned = 0;
                this.enemiesDefeated = 0;
            }
        },
        {
            key: "startWave",
            value: function startWave(waveNumber) {
                // Clear any existing enemies first
                this.clearEnemies();
                
                this.currentWave = waveNumber;
                this.enemiesSpawned = 0;
                this.enemiesDefeated = 0;
                this.enemyPower = waveNumber * 10; // Set enemy power based on wave number
                // Store the current unit power for this wave
                this.unitPowerForWave = this.game.activeUnit ? this.game.activeUnit.power : 10;
                
                // Start spawning enemies
                this.spawnEnemy();
                
                console.log('[DEBUG] Starting wave:', {
                    waveNumber: waveNumber,
                    enemyPower: this.enemyPower,
                    enemiesPerWave: this.enemiesPerWave
                });
            }
        },
        {
            key: "spawnEnemy",
            value: function spawnEnemy() {
                if (this.enemiesSpawned >= this.enemiesPerWave) return;

                const isLeader = this.enemiesSpawned === this.enemiesPerWave - 1;
                const enemy = this.createEnemy(isLeader);
                
                if (enemy && enemy.mesh) {
                    this.enemies.push(enemy);
                    this.enemiesSpawned++;
                    
                    console.log('[DEBUG] Spawned enemy:', {
                        number: this.enemiesSpawned,
                        isLeader: isLeader,
                        power: enemy.power,
                        position: enemy.position
                    });

                    // Schedule next spawn if not done
                    if (this.enemiesSpawned < this.enemiesPerWave) {
                        setTimeout(() => this.spawnEnemy(), this.spawnRate);
                    }
                } else {
                    console.error('Failed to create enemy mesh');
                }
            }
        },
        {
            key: "createEnemy",
            value: function createEnemy(isLeader) {
                // Create enemy sprite
                var enemyGroup = new THREE.Group();
                
                // Check if we're in stage 2 (Ship stage)
                const isStage2 = this.game.selectedUnit === 'Ship';
                
                // Load appropriate texture based on stage
                var textureLoader = new THREE.TextureLoader();
                textureLoader.setCrossOrigin('Anonymous');
                
                // In stage 2, use enemy-ship.png, otherwise use kraken.png
                const textureUrl = isStage2 ? './assets/enemy-ship.png' : './assets/kraken.png';
                var enemyTexture = textureLoader.load(textureUrl, 
                    // Success callback
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        console.log(`[DEBUG] ${isStage2 ? 'Enemy ship' : 'Crab'} texture loaded successfully`);
                    },
                    // Progress callback
                    undefined,
                    // Error callback
                    (error) => {
                        console.error(`Error loading ${isStage2 ? 'enemy ship' : 'crab'} texture:`, error);
                    }
                );
                
                // Set power: double for leader
                const enemyPower = isLeader ? this.enemyPower * 1.5 : this.enemyPower;
                // Create sprite material
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: enemyTexture,
                    transparent: true,
                    alphaTest: 0.5,
                    color: isLeader ? 0xffaa33 : 0xff6666,
                    blending: THREE.NormalBlending,
                    depthTest: true,
                    depthWrite: false
                });
                
                // Create sprite with appropriate size based on stage and leader status
                var enemySprite = new THREE.Sprite(spriteMaterial);
                
                // Size adjustments for different enemy types
                var size;
                if (isStage2) {
                    size = isLeader ? 180 : 140; // Ships are bigger
                } else {
                    size = isLeader ? 120 * 1.5 : 90; // Underwater enemies (crabs)
                }
                
                enemySprite.scale.set(size, size, 1);
                enemySprite.center.set(0.5, 0.5);
                enemyGroup.add(enemySprite);
                
                // Position at spawn point
                // In stage 2, all ships are at sea level (slightly below 0)
                var yPos = isStage2 ? -125 : Math.random() * (this.game.height * 0.2) - this.game.height * 0.1;
                enemyGroup.position.set(this.game.width * 0.48, yPos, 0);
                this.game.scene.add(enemyGroup);
                
                // Health is number of hits required: ceil(enemy power / unit power)
                const unitPower = this.unitPowerForWave || 10;
                const hitsRequired = isLeader ? 5 : Math.ceil(enemyPower / unitPower); // Leader always takes 3 hits
                // Calculate speed multiplier: 1.1^level, capped at 1.5x
                const baseSpeed = isLeader ? 60 : 60;
                const speedMultiplier = Math.min(1.2, Math.pow(1.05, this.currentWave - 1));
                const enemySpeed = baseSpeed * speedMultiplier;
                return {
                    mesh: enemyGroup,
                    health: hitsRequired,
                    maxHealth: hitsRequired,
                    speed: enemySpeed,
                    position: enemyGroup.position,
                    isLeader: isLeader,
                    power: enemyPower
                };
            }
        },
        {
            key: "update",
            value: function update() {
                // Move enemies toward base (only if game is not paused)
                if (!this.game.isPaused) {
                    // Check if we're in stage 2 (Ship stage)
                    const isStage2 = this.game.selectedUnit === 'Ship';
                    
                    for(var i = this.enemies.length - 1; i >= 0; i--){
                        var enemy = this.enemies[i];
                        
                        // Move enemies horizontally toward base
                        enemy.position.x -= enemy.speed * (this.game.deltaTime || 0.016); // Frame-rate independent movement
                        
                        // In stage 2, ensure all enemies stay at sea level (slightly below 0)
                        if (isStage2) {
                            enemy.position.y = -125;
                        }
                        
                        // Check if enemy reached the base
                        if (enemy.position.x <= this.game.base.position.x + this.game.width * 0.1) {
                            this.game.base.takeDamage(5);
                            this.game.scene.remove(enemy.mesh);
                            this.enemies.splice(i, 1);
                            // Count as defeated for wave completion check
                            this.enemiesDefeated++;
                            this.checkWaveCompletion();
                        }
                    }
                    
                    // Update ammo boxes
                    this.updateAmmoBoxes();
                }
            }
        },
        
        {
            key: "updateAmmoBoxes",
            value: function updateAmmoBoxes() {
                // If no active unit, no need to check for collisions
                if (!this.game.activeUnit) return;
                
                const unit = this.game.activeUnit;
                
                // Check each ammo box
                for (let i = this.ammoBoxes.length - 1; i >= 0; i--) {
                    const ammoBox = this.ammoBoxes[i];
                    
                    // Animate ammo box - bobbing up and down
                    if (ammoBox.mesh) {
                        ammoBox.mesh.position.y += Math.sin(ammoBox.lifeTime * 0.1) * 0.2;
                        
                        // Rotate the ammo box
                        ammoBox.mesh.rotation.z += 0.01;
                        
                        // Glow effect pulsing
                        if (ammoBox.mesh.children.length > 1) {
                            const glowSprite = ammoBox.mesh.children[1];
                            const pulseScale = 0.8 + 0.2 * Math.sin(ammoBox.lifeTime * 0.2);
                            glowSprite.scale.set(80 * pulseScale, 80 * pulseScale, 1);
                            
                            // Pulsing opacity
                            if (glowSprite.material) {
                                glowSprite.material.opacity = 0.2 + 0.2 * Math.sin(ammoBox.lifeTime * 0.1);
                            }
                        }
                    }
                    
                    // Increment lifetime and check if expired
                    ammoBox.lifeTime++;
                    if (ammoBox.lifeTime > ammoBox.maxLifeTime) {
                        // Flash before disappearing
                        if (ammoBox.mesh.children.length > 0) {
                            // Toggle visibility for flashing effect
                            if (ammoBox.lifeTime % 10 < 5) {
                                ammoBox.mesh.children.forEach(child => {
                                    child.visible = true;
                                });
                            } else {
                                ammoBox.mesh.children.forEach(child => {
                                    child.visible = false;
                                });
                            }
                        }
                        
                        // Remove after additional flashing time
                        if (ammoBox.lifeTime > ammoBox.maxLifeTime + 60) {
                            this.game.scene.remove(ammoBox.mesh);
                            this.ammoBoxes.splice(i, 1);
                        }
                    }
                }
            }
        },
        
        {
            key: "showAmmoCollectedEffect",
            value: function showAmmoCollectedEffect(position) {
                // Create a text notification at the ammo box position
                const ammoText = document.createElement('div');
                ammoText.textContent = "+1 AMMO";
                ammoText.style.position = 'absolute';
                ammoText.style.left = `${position.x + window.innerWidth / 2}px`;
                ammoText.style.top = `${-position.y + window.innerHeight / 2}px`;
                ammoText.style.transform = 'translate(-50%, -50%)';
                ammoText.style.color = '#ffff00';
                ammoText.style.fontSize = '20px';
                ammoText.style.fontWeight = 'bold';
                ammoText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
                ammoText.style.zIndex = '1000';
                
                document.body.appendChild(ammoText);
                
                // Animate the text
                let opacity = 1;
                let posY = -position.y + window.innerHeight / 2;
                
                const animateText = () => {
                    opacity -= 0.03;
                    posY -= 1.5;
                    
                    ammoText.style.opacity = opacity;
                    ammoText.style.top = `${posY}px`;
                    
                    if (opacity > 0) {
                        requestAnimationFrame(animateText);
                    } else {
                        document.body.removeChild(ammoText);
                    }
                };
                
                requestAnimationFrame(animateText);
            }
        },
        {
            key: "checkProjectileCollisions",
            value: function checkProjectileCollisions(projectile, damage) {
                var _this, _loop = function(i) {
                    var enemy = _this.enemies[i];
                    // Simple distance-based collision check
                    var distance = enemy.position.distanceTo(projectile.position);
                    // Increased collision radius for leader enemies (big crabs)
                    var collisionRadius = enemy.isLeader ? 80 : 50;
                    if (distance < collisionRadius) {
                        // Remove projectile
                        _this.game.scene.remove(projectile);
                        var index = _this.game.activeUnit.projectiles.indexOf(projectile);
                        if (index > -1) {
                            _this.game.activeUnit.projectiles.splice(index, 1);
                        }
                        
                        // Play hit sound
                        if (_this.game.audioManager) {
                            _this.game.audioManager.playButton();
                        }
                        
                        // Damage enemy: subtract 1 hit per projectile
                        enemy.health -= 1;
                        // If enemy defeated
                        if (enemy.health <= 0) {
                            var damageIndicator = document.createElement('div');
                            damageIndicator.textContent = `Defeated! (${enemy.maxHealth} hits required)`;
                            damageIndicator.style.position = 'absolute';
                            damageIndicator.style.color = '#ff0';
                            damageIndicator.style.fontSize = '24px';
                            damageIndicator.style.fontWeight = 'bold';
                            damageIndicator.style.left = `${enemy.position.x + window.innerWidth / 2}px`;
                            damageIndicator.style.top = `${-enemy.position.y + window.innerHeight / 2}px`;
                            document.body.appendChild(damageIndicator);
                            setTimeout(function() {
                                document.body.removeChild(damageIndicator);
                            }, 1000);
                            
                            // Check if we're in stage 2 (Ship stage)
                            const isStage2 = _this.game.selectedUnit === 'Ship';
                            
                            // Create ammo box at enemy's position only if not in stage 2
                            if (!isStage2) {
                                _this.createAmmoBox(enemy.position.clone());
                            }
                            
                            _this.game.scene.remove(enemy.mesh);
                            _this.enemies.splice(i, 1);
                            _this.enemiesDefeated++;
                            // Enemy defeated - no DP awarded (only math questions give DP now)
                            _this.checkWaveCompletion();
                        } else {
                            // Visual feedback for damage
                            _this.flashEnemyDamage(enemy);
                            
                            // Show damage indicator for remaining health
                            var healthIndicator = document.createElement('div');
                            healthIndicator.textContent = `Hit! (${enemy.maxHealth - enemy.health}/${enemy.maxHealth})`;
                            healthIndicator.style.position = 'absolute';
                            healthIndicator.style.color = '#fff';
                            healthIndicator.style.fontSize = '20px';
                            healthIndicator.style.fontWeight = 'bold';
                            healthIndicator.style.left = `${enemy.position.x + window.innerWidth / 2}px`;
                            healthIndicator.style.top = `${-enemy.position.y + window.innerHeight / 2 - 30}px`;
                            document.body.appendChild(healthIndicator);
                            setTimeout(function() {
                                document.body.removeChild(healthIndicator);
                            }, 800);
                        }
                        return { v: true };
                    }
                };
                for(var i = this.enemies.length - 1; i >= 0; i--){
                    var _ret = (_this = this, _loop(i));
                    if (_type_of(_ret) === "object") return _ret.v;
                }
                return false;
            }
        },
        {
            key: "flashEnemyDamage",
            value: function flashEnemyDamage(enemy) {
                var originalColor = enemy.mesh.children[0].material.color.clone();
                enemy.mesh.children[0].material.color.set(0xffffff);
                setTimeout(function() {
                    enemy.mesh.children[0].material.color.copy(originalColor);
                }, 100);
            }
        },
        {
            key: "checkWaveCompletion",
            value: function checkWaveCompletion() {
                if (this.enemiesDefeated >= this.enemiesPerWave) {
                    // Check if we're in stage 2 (Ship stage)
                    const isStage2 = this.game.scene.background && 
                                     this.game.scene.background.image && 
                                     this.game.scene.background.image.src.includes('background2.png') &&
                                     this.game.selectedUnit === 'Ship';
                                    
                    if (isStage2) {
                        console.log('[DEBUG] Stage 2 completed');
                        // Show victory screen instead of regular wave completion
                        this.game.gameUI.showGameOverScreen(true); // true indicates victory
                    } else {
                        this.game.completeWave();
                    }
                }
            }
        },
        {
            key: "clearEnemies",
            value: function clearEnemies() {
                // Remove all existing enemies from the scene
                this.enemies.forEach(enemy => {
                    if (enemy && enemy.mesh) {
                        this.game.scene.remove(enemy.mesh);
                    }
                });
                this.enemies = [];
                
                // Remove all ammo boxes from the scene
                this.ammoBoxes.forEach(ammoBox => {
                    if (ammoBox && ammoBox.mesh) {
                        this.game.scene.remove(ammoBox.mesh);
                    }
                });
                this.ammoBoxes = [];
                
                this.enemiesSpawned = 0;
                this.enemiesDefeated = 0;
            }
        },
        {
            key: "createAmmoBox",
            value: function createAmmoBox(position) {
                // Create ammo box at enemy's position when defeated
                const ammoBoxGroup = new THREE.Group();
                
                // Load ammo box texture
                var textureLoader = new THREE.TextureLoader();
                textureLoader.setCrossOrigin('Anonymous');
                
                textureLoader.load('./assets/ammo_box.png', (texture) => {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    
                    // Create sprite material with ammo box texture
                    var spriteMaterial = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                        opacity: 1,
                        alphaTest: 0.5,
                        blending: THREE.NormalBlending,
                        depthTest: true,
                        depthWrite: false
                    });
                    
                    // Create sprite
                    var ammoBoxSprite = new THREE.Sprite(spriteMaterial);
                    ammoBoxSprite.scale.set(60, 60, 1); // Set appropriate size
                    ammoBoxSprite.center.set(0.5, 0.5);
                    
                    // Add sprite to group
                    ammoBoxGroup.add(ammoBoxSprite);
                    
                    // Create glow effect
                    var glowSprite = new THREE.Sprite(new THREE.SpriteMaterial({
                        color: 0xffff00,
                        transparent: true,
                        opacity: 0.3,
                        blending: THREE.AdditiveBlending
                    }));
                    glowSprite.scale.set(80, 80, 1);
                    glowSprite.center.set(0.5, 0.5);
                    ammoBoxGroup.add(glowSprite);
                    
                }, undefined, (error) => {
                    console.error('Error loading ammo box texture:', error);
                    
                    // Fallback if texture fails to load
                    const boxGeometry = new THREE.BoxGeometry(20, 20, 20);
                    const boxMaterial = new THREE.MeshBasicMaterial({
                        color: 0xffaa00,
                        wireframe: true
                    });
                    
                    const boxMesh = new THREE.Mesh(boxGeometry, boxMaterial);
                    ammoBoxGroup.add(boxMesh);
                });
                
                // Position ammo box at the enemy's last position
                ammoBoxGroup.position.copy(position);
                
                // Add to scene
                this.game.scene.add(ammoBoxGroup);
                
                // Add to ammo boxes array
                this.ammoBoxes.push({
                    mesh: ammoBoxGroup,
                    position: ammoBoxGroup.position,
                    lifeTime: 0,
                    maxLifeTime: 300  // Lifetime in frames (about 5 seconds at 60fps)
                });
            }
        }
    ]);
    return EnemyManager;
}();
