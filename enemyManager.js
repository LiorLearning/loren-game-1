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
        this.enemiesPerWave = 6; // 5 regular + 1 leader
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
                this.spawnX = this.game.width * 0.48;
                this.spawnRate = 2000;
                this.enemiesPerWave = 6;
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
                
                // Load crab texture
                var textureLoader = new THREE.TextureLoader();
                textureLoader.setCrossOrigin('Anonymous');
                var crabTexture = textureLoader.load('https://play.rosebud.ai/assets/crab.png?kHQO', 
                    // Success callback
                    (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        console.log('[DEBUG] Crab texture loaded successfully');
                    },
                    // Progress callback
                    undefined,
                    // Error callback
                    (error) => {
                        console.error('Error loading crab texture:', error);
                    }
                );
                
                // Set power: double for leader
                const crabPower = isLeader ? this.enemyPower * 3 : this.enemyPower;
                // Create sprite material
                var spriteMaterial = new THREE.SpriteMaterial({
                    map: crabTexture,
                    transparent: true,
                    alphaTest: 0.5,
                    color: isLeader ? 0xffaa33 : 0xff6666,
                    blending: THREE.NormalBlending,
                    depthTest: true,
                    depthWrite: false
                });
                
                // Create sprite
                var crabSprite = new THREE.Sprite(spriteMaterial);
                var size = isLeader ? 120 * 1.5 : 90; // Leader is 1.5x bigger
                crabSprite.scale.set(size, size, 1);
                crabSprite.center.set(0.5, 0.5);
                enemyGroup.add(crabSprite);
                
                // Position at spawn point with random y
                var yPos = Math.random() * (this.game.height * 0.2) - this.game.height * 0.1;
                enemyGroup.position.set(this.game.width * 0.48, yPos, 0);
                this.game.scene.add(enemyGroup);
                
                // Health is number of hits required: ceil(crabby power / unit power)
                const unitPower = this.unitPowerForWave || 10;
                const hitsRequired = Math.ceil(crabPower / unitPower);
                // Calculate speed multiplier: 1.1^level, capped at 1.5x
                const baseSpeed = isLeader ? 62.5 : 87.5;
                const speedMultiplier = Math.min(1.5, Math.pow(1.1, this.currentWave - 1));
                const crabSpeed = baseSpeed * speedMultiplier;
                return {
                    mesh: enemyGroup,
                    health: hitsRequired,
                    maxHealth: hitsRequired,
                    speed: crabSpeed,
                    position: enemyGroup.position,
                    isLeader: isLeader,
                    power: crabPower
                };
            }
        },
        {
            key: "update",
            value: function update() {
                // Move enemies toward base (only if game is not paused)
                if (!this.game.isPaused) {
                    for(var i = this.enemies.length - 1; i >= 0; i--){
                        var enemy = this.enemies[i];
                        enemy.position.x -= enemy.speed * (this.game.deltaTime || 0.016); // Frame-rate independent movement
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
                }
            }
        },
        {
            key: "checkProjectileCollisions",
            value: function checkProjectileCollisions(projectile, damage) {
                var _this, _loop = function(i) {
                    var enemy = _this.enemies[i];
                    // Simple distance-based collision check
                    var distance = enemy.position.distanceTo(projectile.position);
                    if (distance < 30) {
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
                            damageIndicator.textContent = `Hit! (${enemy.maxHealth} hits required)`;
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
                            _this.game.scene.remove(enemy.mesh);
                            _this.enemies.splice(i, 1);
                            _this.enemiesDefeated++;
                            // Enemy defeated - no DP awarded (only math questions give DP now)
                            _this.checkWaveCompletion();
                        } else {
                            // Visual feedback for damage
                            _this.flashEnemyDamage(enemy);
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
                    this.game.completeWave();
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
                this.enemiesSpawned = 0;
                this.enemiesDefeated = 0;
            }
        }
    ]);
    return EnemyManager;
}();
