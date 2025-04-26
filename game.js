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
            'Duke'
        ]);
        this.selectedUnit = 'Duke';
        this.isWaveActive = false;
        this.isPaused = false;
        this.store = STORE_ITEMS;
        this.playerPower = 10;
        this.enemyPower = 10;
        this.pendingUpgrade = null;
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
                window.addEventListener('keydown', this.handleKeyInput.bind(this));
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
                
                // Upgrade base after each wave
                if (this.base) {
                    this.base.upgradeBase();
                }
                
                // Increment wave number
                this.currentWave++;
                
                // Cleanup
                this.enemyManager.clearEnemies();
                if (this.activeUnit) {
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
        },
        {
            key: "showStore",
            value: function showStore() {
                // Add store container to wave complete screen
                const storeContainer = document.getElementById('storeContainer');
                storeContainer.innerHTML = '';
                storeContainer.style.width = '100%';
                storeContainer.style.height = '100%';
                storeContainer.style.position = 'absolute';
                storeContainer.style.top = '0';
                storeContainer.style.left = '0';
                storeContainer.style.background = 'rgba(0, 10, 20, 0.95)';
                storeContainer.style.backdropFilter = 'blur(10px)';
                storeContainer.style.display = 'flex';
                storeContainer.style.flexDirection = 'column';
                storeContainer.style.alignItems = 'center';
                storeContainer.style.padding = '40px 20px';
                storeContainer.style.overflowY = 'auto';

                // Add store title
                const storeTitle = document.createElement('h2');
                storeTitle.textContent = 'DEPLOYMENT STORE';
                storeTitle.style.color = '#5ff';
                storeTitle.style.fontSize = '2em';
                storeTitle.style.marginBottom = '30px';
                storeTitle.style.textAlign = 'center';
                storeContainer.appendChild(storeTitle);

                storeContainer.appendChild(this.storeUI.container);
                this.storeUI.render();

                this.gameUI.screens.waveComplete.style.display = 'flex';
            }
        },
        {
            key: "handleStorePurchase",
            value: function handleStorePurchase(type, name) {
                const item = type === './unit.js' ? this.store.units.get(name) : this.store.upgrades.get(name);
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
                    this.pendingUpgrade = item.power;
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
                if (event.key === 'm' && this.isWaveActive && this.activeUnit) {
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
