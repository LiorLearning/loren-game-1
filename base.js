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
export var Base = /*#__PURE__*/ function() {
    "use strict";
    function Base(game) {
        _class_call_check(this, Base);
        this.game = game;
        this.health = 10;
        this.maxHealth = 10;
        this.position = new THREE.Vector3(-this.game.width * 0.38, 0, 0); // Moved base further right from 0.42
        this.createBaseMesh();
    }
    _create_class(Base, [
        {
            key: "createBaseMesh",
            value: function createBaseMesh() {
                // Create base structure
                var baseGroup = new THREE.Group();
                // Main structure
                this.loadBaseTexture(baseGroup);
                
                // Base positioning
                baseGroup.position.copy(this.position);
                this.mesh = baseGroup;
                this.game.scene.add(this.mesh);
                // Add health bar
                this.createHealthBar();
            }
        },
        {
            key: "loadBaseTexture",
            value: function loadBaseTexture(baseGroup) {
                var _this = this;
                // Load base texture based on current wave number
                var textureLoader = new THREE.TextureLoader();
                const waveNumber = Math.min(this.game.currentWave, 4); // Ensure it doesn't exceed 4
                textureLoader.load(`./assets/base${waveNumber}.png`, function(texture) {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    texture.minFilter = THREE.LinearFilter;
                    // Create sprite material
                    var spriteMaterial = new THREE.SpriteMaterial({
                        map: texture,
                        transparent: true,
                        alphaTest: 0.5,
                        blending: THREE.NormalBlending,
                        depthTest: true,
                        depthWrite: false
                    });
                    // Create base sprite
                    var baseSprite = new THREE.Sprite(spriteMaterial);
                    baseSprite.scale.set(450, 450, 1); // Reduced from 500 to 450
                    baseSprite.center.set(0.5, 0.5);
                    
                    // Clear any existing sprites first
                    while(baseGroup.children.length > 0) {
                        baseGroup.remove(baseGroup.children[0]);
                    }
                    
                    baseGroup.add(baseSprite);
                }, undefined, function(error) {
                    console.error('Error loading base texture:', error);
                });
            }
        },
        {
            key: "createHealthBar",
            value: function createHealthBar() {
                var healthBarGroup = new THREE.Group();
                // Background
                var barBgGeometry = new THREE.PlaneGeometry(200, 15); // Thinner bar
                var barBgMaterial = new THREE.MeshBasicMaterial({
                    color: 0x333333,
                    transparent: true,
                    opacity: 0.7
                });
                this.healthBarBg = new THREE.Mesh(barBgGeometry, barBgMaterial);
                healthBarGroup.add(this.healthBarBg);

                // Foreground (actual health)
                var barGeometry = new THREE.PlaneGeometry(200, 15);
                var barMaterial = new THREE.MeshBasicMaterial({
                    color: 0x33ff33
                });
                this.healthBar = new THREE.Mesh(barGeometry, barMaterial);
                this.healthBar.position.z = 1;
                healthBarGroup.add(this.healthBar);

                // Position health bar above base dome
                healthBarGroup.position.set(this.position.x, this.position.y + 100, 10);
                this.healthBarGroup = healthBarGroup;
                this.game.scene.add(this.healthBarGroup);
                this.updateHealthBar();
            }
        },
        {
            key: "updateHealthBar",
            value: function updateHealthBar() {
                // Ensure health values are valid numbers
                if (isNaN(this.health) || isNaN(this.maxHealth)) {
                    console.warn('Invalid health values detected:', { health: this.health, maxHealth: this.maxHealth });
                    this.health = this.maxHealth = 10;
                }
                
                var healthRatio = Math.max(0, Math.min(1, this.health / this.maxHealth));
                this.healthBar.scale.x = healthRatio;
                this.healthBar.position.x = -100 * (1 - healthRatio);

                // Change color based on health
                if (healthRatio < 0.3) {
                    this.healthBar.material.color.setHex(0xff3333); // Red
                } else if (healthRatio < 0.6) {
                    this.healthBar.material.color.setHex(0xffaa33); // Orange
                } else {
                    this.healthBar.material.color.setHex(0x33ff33); // Green
                }

                // Update base sprite tint based on health
                if (this.mesh && this.mesh.children[0]) {
                    var tintIntensity = 1 - (healthRatio * 0.5);
                    this.mesh.children[0].material.color.setRGB(1 + tintIntensity, 1, 1);
                }
            }
        },
        {
            key: "takeDamage",
            value: function takeDamage(amount) {
                // Ensure amount is a valid number
                if (isNaN(amount) || amount < 0) {
                    console.warn('Invalid damage amount received:', amount);
                    amount = 1; // Default to 1 damage
                }
                
                this.health = Math.max(0, this.health - amount);
                if (this.health <= 0) {
                    this.health = 0;
                    this.game.endGame(false);
                }
                this.updateHealthBar();
                if (this.game.gameUI) {
                    this.game.gameUI.updateBaseHealth(this.health);
                }
                
                // Play damage sound
                if (this.game.audioManager) {
                    this.game.audioManager.playDamage();
                }
                
                // Visual feedback for damage
                this.flashDamage();
            }
        },
        {
            key: "flashDamage",
            value: function flashDamage() {
                var _this = this;
                if (this.mesh.children.length > 0 && this.mesh.children[0].material) {
                    var originalColor = this.mesh.children[0].material.color.clone();
                    this.mesh.children[0].material.color.set(0xff0000);
                    setTimeout(function() {
                        if (_this.mesh.children.length > 0 && _this.mesh.children[0].material) {
                            _this.mesh.children[0].material.color.copy(originalColor);
                        }
                    }, 200);
                }
            }
        },
        {
            key: "upgradeBase",
            value: function upgradeBase() {
                // Reset health for next wave
                this.maxHealth = 10;
                this.health = this.maxHealth;
                this.updateHealthBar();
                
                // Load new texture based on next wave
                if (this.mesh) {
                    this.loadBaseTexture(this.mesh);
                }
                
                return true;
            }
        },
        {
            key: "showUpgradeEffect",
            value: function showUpgradeEffect() {
                var _this = this;
                
                // Create a flash effect on upgrade
                if (this.mesh.children.length > 0 && this.mesh.children[0].material) {
                    // Store original color
                    var originalColor = this.mesh.children[0].material.color.clone();
                    
                    // Flash sequence
                    var flashColors = [0x55ffff, 0xffffff, 0x55ffff, 0xffffff, 0x55ffff];
                    var flashDelay = 100;
                    
                    flashColors.forEach(function(color, index) {
                        setTimeout(function() {
                            if (_this.mesh.children.length > 0 && _this.mesh.children[0].material) {
                                _this.mesh.children[0].material.color.set(color);
                            }
                        }, flashDelay * index);
                    });
                    
                    // Reset to original color
                    setTimeout(function() {
                        if (_this.mesh.children.length > 0 && _this.mesh.children[0].material) {
                            _this.mesh.children[0].material.color.copy(originalColor);
                        }
                    }, flashDelay * flashColors.length);
                    
                    // Create text notification
                    const upgradeText = document.createElement('div');
                    upgradeText.textContent = `BASE UPGRADED! Level ${this.baseLevel}`;
                    upgradeText.style.position = 'absolute';
                    upgradeText.style.left = '50%';
                    upgradeText.style.top = '40%';
                    upgradeText.style.transform = 'translate(-50%, -50%)';
                    upgradeText.style.color = '#5ff';
                    upgradeText.style.fontSize = '28px';
                    upgradeText.style.fontWeight = 'bold';
                    upgradeText.style.textShadow = '2px 2px 4px rgba(0,0,0,0.7)';
                    upgradeText.style.zIndex = '1000';
                    upgradeText.style.padding = '15px';
                    upgradeText.style.borderRadius = '10px';
                    upgradeText.style.backgroundColor = 'rgba(0,0,0,0.7)';
                    
                    document.body.appendChild(upgradeText);
                    
                    // Remove text after a delay
                    setTimeout(function() {
                        if (upgradeText.parentNode) {
                            upgradeText.parentNode.removeChild(upgradeText);
                        }
                    }, 3000);
                }
            }
        }
    ]);
    return Base;
}();
