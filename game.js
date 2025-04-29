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
import { GameUI } from './gameUI.js';
import { Base } from './base.js';
import { Unit } from './unit.js';
import { EnemyManager } from './enemyManager.js';
import { MathProblem } from './mathProblem.js';
import { StoreUI } from './storeUI.js';
// Constants
var STORE_ITEMS = {
    units: new Map([
        [
            'Tank',
            {
                power: 30,
                cost: 100,
                name: 'Tank'
            }
        ],
        [
            'Turret',
            {
                power: 20,
                cost: 50,
                name: 'Turret'
            }
        ],
        [
            'Mech',
            {
                power: 40,
                cost: 150,
                name: 'Mech'
            }
        ]
    ]),
    upgrades: new Map([
        [
            'Power Upgrade (2x)',
            {
                cost: 40,
                power: 20
            }
        ],
        [
            'Power Upgrade (3x)',
            {
                cost: 80,
                power: 30
            }
        ]
    ]),
    shipUpgrades: new Map([
        [
            'Ship Power Upgrade (2x)',
            {
                cost: 50,
                power: 25
            }
        ],
        [
            'Ship Power Upgrade (3x)',
            {
                cost: 100,
                power: 40
            }
        ],
        [
            'Ship Speed Upgrade',
            {
                cost: 75,
                power: 0,
                speed: 1.5
            }
        ]
    ])
};
export var Game = /*#__PURE__*/ function() {
    "use strict";
    function Game(container) {
        _class_call_check(this, Game);
        // Core properties
        this.container = container;
        this.width = container.clientWidth;
        this.height = container.clientHeight;
        this.currentWave = 1;
        this.gameUI = null;
        this.gameOver = false;
        this.deploymentPoints = 0;
        this.unlockedUnits = new Set([
            'Duke',
            'Mech'
        ]);
        this.selectedUnit = 'Mech';
        this.isWaveActive = false;
        this.isPaused = false;
        this.store = STORE_ITEMS;
        this.playerPower = 40; // Mech power
        this.enemyPower = 10;
        this.pendingUpgrade = null;
        
        // Track key states for continuous movement
        this.keys = {};
        
        // Initialize systems
        this.initScene();
        this.initGameSystems();
        this.initEventListeners();
    }
    _create_class(Game, [
        {
            key: "initGameSystems",
            value: function initGameSystems() {
                // Initialize game components
                this.gameUI = new GameUI(this);
                this.storeUI = new StoreUI(this);
                this.base = new Base(this);
                this.activeUnit = null;
                this.enemyManager = new EnemyManager(this);
                this.enemyManager.init();
                this.mathProblem = new MathProblem(this);
                this.mathProblem.init();
            }
        },
        {
            key: "initEventListeners",
            value: function initEventListeners() {
                window.addEventListener('resize', this.onWindowResize.bind(this));
                
                // Track key down and up events for continuous movement
                window.addEventListener('keydown', (event) => {
                    // Track key state
                    this.keys[event.key] = true;
                    
                    // Also handle single press events
                    this.handleKeyInput(event);
                });
                
                window.addEventListener('keyup', (event) => {
                    // Remove key from tracked keys
                    this.keys[event.key] = false;
                });
            }
        },
        {
            key: "initScene",
            value: function initScene() {
                var _this = this;
                // Scene setup
                this.scene = new THREE.Scene();
                var textureLoader = new THREE.TextureLoader();
                textureLoader.load('./assets/background.png', function(texture) {
                    texture.colorSpace = THREE.SRGBColorSpace;
                    _this.scene.background = texture;
                });
                // Fullscreen camera setup with proper aspect ratio
                this.camera = new THREE.OrthographicCamera(-this.width / 2, this.width / 2, this.height / 2, -this.height / 2, 1, 2000);
                this.camera.position.z = 200;
                // Update aspect ratio on resize
                window.addEventListener('resize', function() {
                    var width = _this.container.clientWidth;
                    var height = _this.container.clientHeight;
                    _this.camera.left = -width / 2;
                    _this.camera.right = width / 2;
                    _this.camera.top = height / 2;
                    _this.camera.bottom = -height / 2;
                    _this.camera.updateProjectionMatrix();
                    _this.renderer.setSize(width, height);
                });
                // Renderer setup
                this.renderer = new THREE.WebGLRenderer({
                    antialias: true,
                    powerPreference: 'high-performance'
                });
                this.renderer.setSize(this.width, this.height);
                this.container.appendChild(this.renderer.domElement);
                // Lighting setup
                // Add ambient light
                this.scene.add(new THREE.AmbientLight(0xcccccc, 0.8));
                // Add directional light
                var directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
                directionalLight.position.set(0, 1, 5);
                this.scene.add(directionalLight);
                // Effects
                this.addUnderwaterEffect();
            }
        },
        {
            key: "addUnderwaterEffect",
            value: function addUnderwaterEffect() {
                this.particles = new THREE.Group();
                var particleGeometry = new THREE.BoxGeometry(2, 2, 2);
                var particleMaterial = new THREE.MeshBasicMaterial({
                    color: 0x88ccff,
                    transparent: true,
                    opacity: 0.3
                });
                for(var i = 0; i < 50; i++){
                    var particle = new THREE.Mesh(particleGeometry, particleMaterial);
                    particle.position.x = Math.random() * this.width - this.width / 2;
                    particle.position.y = Math.random() * this.height - this.height / 2;
                    particle.position.z = Math.random() * 50 - 25;
                    particle.userData = {
                        speedY: Math.random() * 0.5 + 0.1,
                        speedX: Math.random() * 0.2 - 0.1
                    };
                    this.particles.add(particle);
                }
                this.scene.add(this.particles);
            }
        },
        {
            key: "start",
            value: function start() {
                this.gameUI.showStartScreen();
                this.audioManager.toggleBackgroundMusic(true);
                
                // Initialize all mute buttons to reflect current audio state
                if (this.gameUI.updateAllMuteButtons) {
                    this.gameUI.updateAllMuteButtons();
                }
                
                this.animate();
            }
        },
        {
            key: "animate",
            value: function animate() {
                var _this = this;
                if (this.gameOver) return;
                
                // Calculate delta time for frame rate independence
                const currentTime = performance.now();
                if (!this.lastFrameTime) this.lastFrameTime = currentTime;
                this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // in seconds
                this.lastFrameTime = currentTime;
                
                // Cap very high delta times (e.g., after tab switch)
                if (this.deltaTime > 0.1) this.deltaTime = 0.016; // Default to 60fps
                
                requestAnimationFrame(this.animate.bind(this));
                
                // Update particles
                this.particles.children.forEach(function(particle) {
                    particle.position.y += particle.userData.speedY;
                    particle.position.x += particle.userData.speedX;
                    if (particle.position.y > _this.height / 2) {
                        particle.position.y = -_this.height / 2;
                        particle.position.x = Math.random() * _this.width - _this.width / 2;
                    }
                });
                
                // Update game entities
                if (this.isWaveActive) {
                    this.enemyManager.update();
                    if (this.activeUnit) this.activeUnit.update();
                }
                
                // Render
                this.renderer.render(this.scene, this.camera);
            }
        },
        {
            key: "startNewWave",
            value: function startNewWave(skipStartScreen) {
                // Only show start screen on first wave and if not skipping
                if (this.currentWave === 1 && !skipStartScreen && !this.isWaveActive) {
                    this.gameUI.showStartScreen();
                    return;
                }
                
                this.isWaveActive = true;
                
                // Update enemy power based on current wave number
                this.enemyPower = this.currentWave * 10;
                
                // Create unit with base power
                this.activeUnit = new Unit(this, this.selectedUnit);
                
                // Apply pending upgrade if exists
                if (this.pendingUpgrade) {
                    const newPower = this.activeUnit.power + this.pendingUpgrade;
                    this.activeUnit.upgradePower(newPower);
                    console.log('[DEBUG] Applied power upgrade:', {
                        basePower: this.activeUnit.power,
                        upgrade: this.pendingUpgrade,
                        newPower: newPower
                    });
                    this.pendingUpgrade = null;
                }
                
                // Update all UI elements with current powers
                this.gameUI.updatePowerInfo(this.activeUnit.power, this.enemyPower);
                this.gameUI.updateWaveInfo(this.currentWave);
                this.gameUI.updateUnitInfo(this.selectedUnit, this.activeUnit.ammo);
                this.gameUI.updateDisplayUnitName(this.selectedUnit);
                
                // Start wave with enemies
                this.enemyManager.startWave(this.currentWave);
                
                console.log('[DEBUG] Wave started:', {
                    wave: this.currentWave,
                    unit: this.selectedUnit,
                    unitPower: this.activeUnit.power,
                    enemyPower: this.enemyPower
                });
            }
        },
        {
            key: "completeWave",
            value: function completeWave() {
                this.isWaveActive = false;
                
                // Award DP for completing wave (changed from 20 to 10)
                const waveDP = this.currentWave * 10;
                this.deploymentPoints += waveDP;
                this.gameUI.updateDP(this.deploymentPoints);
                
                // Check if we need to transition to stage 2
                // Since we start with level 4 base and mech, transition immediately after first wave
                const shouldTransition = this.base.baseLevel >= 4 &&
                                        this.selectedUnit === 'Mech' && 
                                        this.unlockedUnits.has('Mech') &&
                                        this.currentWave === 1;
                
                // Check if we've completed one wave in stage 2
                const isStage2FirstWaveCompleted = 
                    this.scene.background && 
                    this.scene.background.image && 
                    this.scene.background.image.src.includes('background2.png') && 
                    this.currentWave > 1;
                
                if (isStage2FirstWaveCompleted) {
                    // Show stage 2 completion banner
                    this.showStage2CompleteBanner();
                    return;
                } else if (shouldTransition) {
                    this.transitionToStage2();
                } else {
                    // Upgrade base after each wave
                    if (this.base) {
                        this.base.upgradeBase();
                    }
                    
                    // Increment wave number
                    this.currentWave++;
                    
                    // Cleanup
                    this.enemyManager.clearEnemies();
                    if (this.activeUnit) {
                        if (typeof this.activeUnit.cleanup === 'function') {
                            this.activeUnit.cleanup();
                        }
                        this.scene.remove(this.activeUnit.mesh);
                        this.activeUnit = null;
                    }
                    
                    // Reset base health after each wave
                    if (this.base) {
                        this.base.health = this.base.maxHealth;
                        this.base.updateHealthBar();
                        this.gameUI.updateBaseHealth(this.base.health);
                    }
                    
                    // Show store
                    this.showStore();
                }
            }
        },
        
        {
            key: "showStage2CompleteBanner",
            value: function showStage2CompleteBanner() {
                // Hide wave complete screen if it's visible
                if (this.gameUI.screens.waveComplete) {
                    this.gameUI.screens.waveComplete.style.display = 'none';
                }
                
                // Show store first
                this.showStore();
                
                // Create end of stage 2 banner after 5 seconds
                setTimeout(() => {
                    const endBanner = document.createElement('div');
                    endBanner.style.position = 'absolute';
                    endBanner.style.top = '50%';
                    endBanner.style.left = '50%';
                    endBanner.style.transform = 'translate(-50%, -50%)';
                    endBanner.style.padding = '30px';
                    endBanner.style.backgroundColor = 'rgba(0, 20, 50, 0.95)';
                    endBanner.style.border = '3px solid #5ff';
                    endBanner.style.borderRadius = '10px';
                    endBanner.style.color = 'white';
                    endBanner.style.fontSize = '1.5em';
                    endBanner.style.textAlign = 'center';
                    endBanner.style.boxShadow = '0 0 20px rgba(0, 255, 255, 0.5)';
                    endBanner.style.zIndex = '1001';
                    endBanner.innerHTML = `
                        <h2 style="color: #5ff; margin-bottom: 15px; text-shadow: 0 0 10px #0ff;">Great job, Loren!</h2>
                        <p style="margin-bottom: 15px;">The store is locked for now. Come back in the next session to upgrade your ship and create further levels.</p>
                        <p style="color: #ffcc00; font-weight: bold; margin-bottom: 30px;">Your adventure will continue soon!</p>
                        <button id="playAgainButton" style="
                            padding: 15px 30px;
                            font-size: 1.2em;
                            background-color: #4CAF50;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: background-color 0.3s;
                        ">Play Again</button>
                    `;
                    document.body.appendChild(endBanner);

                    // Add click handler for play again button
                    const playAgainButton = document.getElementById('playAgainButton');
                    playAgainButton.addEventListener('click', () => {
                        // Remove game over screen and store
                        document.body.removeChild(endBanner);
                        const storeContainer = document.getElementById('storeContainer');
                        if (storeContainer) {
                            document.body.removeChild(storeContainer);
                        }
                        
                        // Reset game state completely
                        this.resetGame();
                        
                        // Start from the beginning
                        this.currentWave = 1;
                        this.selectedUnit = 'Mech';
                        this.unlockedUnits = new Set(['Duke', 'Mech']);
                        this.deploymentPoints = 0;
                        
                        // Show start screen
                        this.gameUI.showStartScreen();
                    });
                }, 5000);
            }
        },
            
        {
            key: "transitionToStage2",
            value: function transitionToStage2() {
                // Create a transition overlay
                const overlay = document.createElement('div');
                overlay.style.position = 'absolute';
                overlay.style.left = '0';
                overlay.style.top = '0';
                overlay.style.width = '100%';
                overlay.style.height = '100%';
                overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                overlay.style.display = 'flex';
                overlay.style.flexDirection = 'column';
                overlay.style.justifyContent = 'center';
                overlay.style.alignItems = 'center';
                overlay.style.zIndex = '1000';
                
                // Create title text
                const title = document.createElement('h1');
                title.textContent = 'STAGE 2 REACHED!';
                title.style.color = '#5ff';
                title.style.fontSize = '3em';
                title.style.marginBottom = '20px';
                title.style.textShadow = '0 0 10px #0ff, 0 0 20px #0ff';
                overlay.appendChild(title);
                
                // Create description text
                const description = document.createElement('p');
                description.textContent = 'Congratulations! Your base is now at maximum level and your Mech is ready for the next stage!';
                description.style.color = '#fff';
                description.style.fontSize = '1.5em';
                description.style.marginBottom = '40px';
                description.style.textAlign = 'center';
                description.style.maxWidth = '80%';
                overlay.appendChild(description);
                
                // Create continue button
                const continueButton = document.createElement('button');
                continueButton.textContent = 'CONTINUE TO STAGE 2';
                continueButton.style.padding = '15px 30px';
                continueButton.style.fontSize = '1.2em';
                continueButton.style.backgroundColor = '#0088ff';
                continueButton.style.color = 'white';
                continueButton.style.border = 'none';
                continueButton.style.borderRadius = '5px';
                continueButton.style.cursor = 'pointer';
                continueButton.style.boxShadow = '0 0 10px #0ff';
                overlay.appendChild(continueButton);
                
                // Add to document
                document.body.appendChild(overlay);
                
                // Handle click to continue
                continueButton.addEventListener('click', () => {
                    // Change background
                    const textureLoader = new THREE.TextureLoader();
                    textureLoader.load('./assets/background2.png', (texture) => {
                        texture.colorSpace = THREE.SRGBColorSpace;
                        this.scene.background = texture;
                    });
                    
                    // Change user to a ship
                    this.selectedUnit = 'Ship';
                    
                    // Force player to sea level by setting initial Y position
                    // This will be maintained by the unit.js update function
                    if (this.activeUnit) {
                        this.activeUnit.position.y = -125;
                        this.activeUnit.mesh.position.y = -125;
                    }
                    
                    // Transform base to surface base
                    if (this.base) {
                        // Update the base with a new texture instead of removing it
                        if (this.base.mesh) {
                            const textureLoader = new THREE.TextureLoader();
                            textureLoader.load('./assets/surface-base.png', (texture) => {
                                texture.colorSpace = THREE.SRGBColorSpace;
                                texture.minFilter = THREE.LinearFilter;
                                
                                // Create new material with the surface-base texture
                                const spriteMaterial = new THREE.SpriteMaterial({
                                    map: texture,
                                    transparent: true,
                                    alphaTest: 0.5,
                                    blending: THREE.NormalBlending,
                                    depthTest: true,
                                    depthWrite: false
                                });
                                
                                // Update the base sprite material
                                if (this.base.mesh.children.length > 0) {
                                    this.base.mesh.children[0].material = spriteMaterial;
                                }
                                
                                // Reset base health for stage 2
                                this.base.health = this.base.maxHealth;
                                this.base.updateHealthBar();
                            });
                        }
                    }
                    
                    // Remove overlay
                    document.body.removeChild(overlay);
                    
                    // Continue game flow
                    // Increment wave number
                    this.currentWave++;
                    
                    // Cleanup
                    this.enemyManager.clearEnemies();
                    if (this.activeUnit) {
                        if (typeof this.activeUnit.cleanup === 'function') {
                            this.activeUnit.cleanup();
                        }
                        this.scene.remove(this.activeUnit.mesh);
                        this.activeUnit = null;
                    }
                    
                    // Update base health UI
                    if (this.base) {
                        this.gameUI.updateBaseHealth(this.base.health);
                    }
                    
                    // Start new wave immediately instead of showing store
                    this.startNewWave(true);
                    
                    // Play sound if possible
                    if (this.audioManager) {
                        this.audioManager.playCorrect();
                    }
                });
            }
        },
        {
            key: "showStore",
            value: function showStore() {
                // Clear any existing store UI
                if (this.storeUI && this.storeUI.container) {
                    this.storeUI.container.innerHTML = '';
                }
                
                // Create new store UI if it doesn't exist
                if (!this.storeUI) {
                    this.storeUI = new StoreUI(this);
                }
                
                // Add store container to wave complete screen
                let existingStoreContainer = document.getElementById('storeContainer');
                if (!existingStoreContainer) {
                    const newStoreContainer = document.createElement('div');
                    newStoreContainer.id = 'storeContainer';
                    newStoreContainer.style.width = '100%';
                    newStoreContainer.style.height = '100%';
                    newStoreContainer.style.position = 'absolute';
                    newStoreContainer.style.top = '0';
                    newStoreContainer.style.left = '0';
                    newStoreContainer.style.background = 'rgba(0, 10, 20, 0.95)';
                    newStoreContainer.style.backdropFilter = 'blur(10px)';
                    newStoreContainer.style.display = 'flex';
                    newStoreContainer.style.flexDirection = 'column';
                    newStoreContainer.style.alignItems = 'center';
                    newStoreContainer.style.padding = '40px 20px';
                    newStoreContainer.style.overflowY = 'auto';
                    newStoreContainer.style.opacity = '1';
                    newStoreContainer.style.pointerEvents = 'auto';
                    document.body.appendChild(newStoreContainer);
                    existingStoreContainer = newStoreContainer;
                }
                
                // Add store title
                const storeTitle = document.createElement('h2');
                storeTitle.textContent = this.selectedUnit === 'Ship' ? 'SHIP UPGRADE STORE' : 'DEPLOYMENT STORE';
                storeTitle.style.color = '#5ff';
                storeTitle.style.fontSize = '2em';
                storeTitle.style.marginBottom = '30px';
                storeTitle.style.textAlign = 'center';
                this.storeUI.container.appendChild(storeTitle);
                
                // Render store UI
                this.storeUI.render();
                
                // Add store UI to container
                existingStoreContainer.innerHTML = '';
                existingStoreContainer.appendChild(this.storeUI.container);
            }
        },
        {
            key: "handleStorePurchase",
            value: function handleStorePurchase(type, name) {
                const item = type === './unit.js' ? this.store.units.get(name) : 
                            (this.selectedUnit === 'Ship' ? this.store.shipUpgrades.get(name) : this.store.upgrades.get(name));
                if (!item || this.deploymentPoints < item.cost) return false;
                
                // Deduct cost
                this.deploymentPoints -= item.cost;
                this.gameUI.updateDP(this.deploymentPoints);

                if (type === './unit.js') {
                    this.unlockedUnits.add(name);
                    this.selectedUnit = name;
                    // Store the base power of the unit
                    this.playerPower = item.power;
                    this.gameUI.updateDisplayUnitName(name);
                    this.audioManager.playButton();
                } else if (type === 'upgrade') {
                    // Store the upgrade to apply when unit is created
                    this.pendingUpgrade = item;
                    this.audioManager.playButton();
                }
                return true;
            }
        },
        {
            key: "endGame",
            value: function endGame() {
                var win = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
                this.gameOver = true;
                this.isWaveActive = false;
                if (this.activeUnit) {
                    if (typeof this.activeUnit.cleanup === 'function') {
                        this.activeUnit.cleanup();
                    }
                    this.scene.remove(this.activeUnit.mesh);
                    this.activeUnit = null;
                }
                this.enemyManager.clearEnemies();
                if (!win) {
                    // Don't advance wave if player lost
                    this.currentWave = Math.max(1, this.currentWave - 1);
                }
                this.gameUI.showGameOverScreen(win);
            }
        },
        {
            key: "onWindowResize",
            value: function onWindowResize() {
                this.width = this.container.clientWidth;
                this.height = this.container.clientHeight;
                this.camera.left = -this.width / 2;
                this.camera.right = this.width / 2;
                this.camera.top = this.height / 2;
                this.camera.bottom = -this.height / 2;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.width, this.height);
            }
        },
        {
            key: "handleKeyInput",
            value: function handleKeyInput(event) {
                if (this.activeUnit && this.isWaveActive) {
                    this.activeUnit.handleKeyInput(event.key);
                }
                if (event.key.toLowerCase() === 'm' && this.isWaveActive && this.activeUnit) {
                    this.mathProblem.showProblem();
                }
            }
        },
        {
            key: "addDeploymentPoints",
            value: function addDeploymentPoints(points) {
                this.deploymentPoints += points;
                this.gameUI.updateDP(this.deploymentPoints);
            }
        },
        {
            key: "resetGame",
            value: function resetGame(preserveWave) {
                // If preserveWave is true, keep the current wave number
                if (!preserveWave) {
                    this.currentWave = 1;
                }
                
                this.deploymentPoints = 0;
                this.unlockedUnits = new Set(['Duke']);
                this.selectedUnit = 'Duke';
                this.pendingUpgrade = null;
                this.isWaveActive = false;
                this.gameOver = false;
                
                if (this.activeUnit) {
                    if (typeof this.activeUnit.cleanup === 'function') {
                        this.activeUnit.cleanup();
                    }
                    this.scene.remove(this.activeUnit.mesh);
                    this.activeUnit = null;
                }
                
                this.enemyManager.clearEnemies();
                this.gameUI.updateWaveInfo(this.currentWave);
                this.gameUI.updateDP(this.deploymentPoints);
                
                // Reset base health and level
                if (this.base) {
                    this.base.baseLevel = 0;
                    this.base.maxHealth = 10;
                    this.base.health = this.base.maxHealth;
                    this.base.updateHealthBar();
                    
                    // Reload base texture for level 0
                    if (this.base.mesh) {
                        this.base.loadBaseTexture(this.base.mesh);
                    }
                }
                
                return true;
            }
        },
        {
            key: "handleCollision",
            value: function handleCollision(projectile, enemy) {
                // Remove projectile
                this.scene.remove(projectile);
                if (this.activeUnit) {
                    this.activeUnit.projectiles = this.activeUnit.projectiles.filter(function(p) {
                        return p !== projectile;
                    });
                }
                
                // Display power comparison
                const powerDisplay = document.createElement('div');
                powerDisplay.style.position = 'absolute';
                powerDisplay.style.left = '50%';
                powerDisplay.style.top = '40%';
                powerDisplay.style.transform = 'translate(-50%, -50%)';
                powerDisplay.style.color = '#fff';
                powerDisplay.style.fontSize = '24px';
                powerDisplay.style.fontWeight = 'bold';
                powerDisplay.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
                powerDisplay.style.zIndex = '1000';
                powerDisplay.style.padding = '10px';
                powerDisplay.style.borderRadius = '5px';
                powerDisplay.style.backgroundColor = 'rgba(0,0,0,0.7)';
                
                const unitPower = this.activeUnit ? this.activeUnit.power : 0;
                const message = `${this.activeUnit.type} (${unitPower} power) vs Crab (${enemy.power} power)`;
                powerDisplay.textContent = message;
                
                this.container.appendChild(powerDisplay);
                setTimeout(() => {
                    if (powerDisplay.parentNode) {
                        powerDisplay.parentNode.removeChild(powerDisplay);
                    }
                }, 2000);
                
                // Handle damage
                if (this.activeUnit && this.activeUnit.power >= enemy.power) {
                    // Remove enemy
                    this.scene.remove(enemy.mesh);
                    this.enemyManager.enemies = this.enemyManager.enemies.filter(function(e) {
                        return e !== enemy;
                    });
                    this.enemyManager.enemiesDefeated++;
                }
            }
        }
    ]);
    return Game;
}();
