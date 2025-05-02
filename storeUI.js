function _array_like_to_array(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for(var i = 0, arr2 = new Array(len); i < len; i++)arr2[i] = arr[i];
    return arr2;
}
function _array_with_holes(arr) {
    if (Array.isArray(arr)) return arr;
}
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
function _iterable_to_array_limit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;
    var _s, _e;
    try {
        for(_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true){
            _arr.push(_s.value);
            if (i && _arr.length === i) break;
        }
    } catch (err) {
        _d = true;
        _e = err;
    } finally{
        try {
            if (!_n && _i["return"] != null) _i["return"]();
        } finally{
            if (_d) throw _e;
        }
    }
    return _arr;
}
function _non_iterable_rest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _sliced_to_array(arr, i) {
    return _array_with_holes(arr) || _iterable_to_array_limit(arr, i) || _unsupported_iterable_to_array(arr, i) || _non_iterable_rest();
}
function _unsupported_iterable_to_array(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _array_like_to_array(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(n);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _array_like_to_array(o, minLen);
}
export var StoreUI = /*#__PURE__*/ function() {
    "use strict";
    function StoreUI(game) {
        _class_call_check(this, StoreUI);
        this.game = game;
        this.container = document.createElement('div');
        this.container.style.position = 'relative';
        this.container.style.padding = '15px';
        this.container.style.backgroundColor = 'rgba(0, 50, 100, 0.8)';
        this.container.style.borderRadius = '10px';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.margin = '0 auto 20px';
        this.container.style.width = '90%';
        this.container.style.maxWidth = '400px';
        this.container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        this.container.style.border = '1px solid rgba(95, 255, 255, 0.3)';
        
        // Track selected items before purchase
        this.selectedUnit = null;
        this.selectedUpgrade = null;
        this.previewPower = 10; // Default Duke power
        this.errorMessage = ''; // Add error message tracking
    }
    _create_class(StoreUI, [
        {
            key: "render",
            value: function render() {
                this.container.innerHTML = '';
                
                // Create sections container
                const sectionsContainer = document.createElement('div');
                sectionsContainer.style.display = 'flex';
                sectionsContainer.style.flexDirection = 'column';
                sectionsContainer.style.gap = '20px';
                sectionsContainer.style.width = '100%';
                this.container.appendChild(sectionsContainer);

                // Clear error message
                this.errorMessage = '';

                // If in stage 2 (Ship), only show upgrades
                if (this.game.selectedUnit === 'Ship') {
                    // Upgrades Section
                    const upgradesSection = document.createElement('div');
                    upgradesSection.style.backgroundColor = 'rgba(0, 20, 40, 0.8)';
                    upgradesSection.style.borderRadius = '10px';
                    upgradesSection.style.padding = '20px';
                    upgradesSection.style.border = '1px solid rgba(95, 255, 255, 0.3)';

                    const upgradesTitle = document.createElement('h3');
                    upgradesTitle.textContent = 'SELECT SHIP UPGRADE';
                    upgradesTitle.style.color = '#5ff';
                    upgradesTitle.style.fontSize = '1.4em';
                    upgradesTitle.style.marginBottom = '20px';
                    upgradesTitle.style.textAlign = 'center';
                    upgradesSection.appendChild(upgradesTitle);

                    // Create upgrades grid
                    const upgradesGrid = document.createElement('div');
                    upgradesGrid.style.display = 'grid';
                    upgradesGrid.style.gridTemplateColumns = 'repeat(1, 1fr)';
                    upgradesGrid.style.gap = '15px';
                    upgradesSection.appendChild(upgradesGrid);

                    // Add ship image
                    const shipImage = document.createElement('img');
                    shipImage.src = './assets/user-ship.png';
                    shipImage.style.width = '150px';
                    shipImage.style.height = '150px';
                    shipImage.style.objectFit = 'contain';
                    shipImage.style.margin = '0 auto 20px';
                    shipImage.style.display = 'block';
                    upgradesSection.appendChild(shipImage);

                    // Add base image below ship
                    const baseImage = document.createElement('img');
                    baseImage.src = './assets/surface-base.png';
                    baseImage.style.width = '250px';
                    baseImage.style.height = '150px';
                    baseImage.style.objectFit = 'contain';
                    baseImage.style.margin = '0 auto 20px';
                    baseImage.style.display = 'block';
                    upgradesSection.appendChild(baseImage);

                    // Add all ship upgrades
                    this.game.store.shipUpgrades.forEach((upgrade, name) => {
                        this.createUpgradeCard(name, upgrade, upgradesGrid);
                    });

                    sectionsContainer.appendChild(upgradesSection);
                } else {
                    // Original store UI for stage 1
                    // Units Section
                    const unitsSection = document.createElement('div');
                    unitsSection.style.backgroundColor = 'rgba(0, 20, 40, 0.8)';
                    unitsSection.style.borderRadius = '10px';
                    unitsSection.style.padding = '20px';
                    unitsSection.style.border = '1px solid rgba(95, 255, 255, 0.3)';

                    const unitsTitle = document.createElement('h3');
                    unitsTitle.textContent = 'SELECT UNIT';
                    unitsTitle.style.color = '#5ff';
                    unitsTitle.style.fontSize = '1.4em';
                    unitsTitle.style.marginBottom = '20px';
                    unitsTitle.style.textAlign = 'center';
                    unitsSection.appendChild(unitsTitle);

                    // Create unit grid
                    const unitsGrid = document.createElement('div');
                    unitsGrid.style.display = 'grid';
                    unitsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                    unitsGrid.style.gap = '15px';
                    unitsSection.appendChild(unitsGrid);

                    // Add Duke first
                    this.createUnitCard('Duke', { power: 10, cost: 0, name: 'Duke' }, unitsGrid);

                    // Add other units
                    this.game.store.units.forEach((item, name) => {
                        this.createUnitCard(name, item, unitsGrid);
                    });

                    sectionsContainer.appendChild(unitsSection);

                    // Upgrades Section
                    const upgradesSection = document.createElement('div');
                    upgradesSection.style.backgroundColor = 'rgba(0, 20, 40, 0.8)';
                    upgradesSection.style.borderRadius = '10px';
                    upgradesSection.style.padding = '20px';
                    upgradesSection.style.border = '1px solid rgba(95, 255, 255, 0.3)';

                    const upgradesTitle = document.createElement('h3');
                    upgradesTitle.textContent = 'SELECT UPGRADE';
                    upgradesTitle.style.color = '#5ff';
                    upgradesTitle.style.fontSize = '1.4em';
                    upgradesTitle.style.marginBottom = '20px';
                    upgradesTitle.style.textAlign = 'center';
                    upgradesSection.appendChild(upgradesTitle);

                    // Create upgrades grid
                    const upgradesGrid = document.createElement('div');
                    upgradesGrid.style.display = 'grid';
                    upgradesGrid.style.gridTemplateColumns = 'repeat(1, 1fr)';
                    upgradesGrid.style.gap = '15px';
                    upgradesSection.appendChild(upgradesGrid);

                    // Add all upgrades (unit agnostic)
                    this.game.store.upgrades.forEach((upgrade, name) => {
                        this.createUpgradeCard(name, upgrade, upgradesGrid);
                    });

                    sectionsContainer.appendChild(upgradesSection);
                }

                // Add error message display if exists
                if (this.errorMessage) {
                    const errorDisplay = document.createElement('div');
                    errorDisplay.style.color = '#ff5555';
                    errorDisplay.style.textAlign = 'center';
                    errorDisplay.style.marginTop = '10px';
                    errorDisplay.style.fontSize = '1.1em';
                    errorDisplay.textContent = this.errorMessage;
                    this.container.appendChild(errorDisplay);
                }

                // Add confirmation button at the bottom
                const confirmButton = document.createElement('button');
                confirmButton.textContent = 'CONFIRM SELECTION';
                confirmButton.style.padding = '15px 30px';
                confirmButton.style.background = this.selectedUnit ? '#5ff' : '#666';
                confirmButton.style.color = '#003366';
                confirmButton.style.border = 'none';
                confirmButton.style.borderRadius = '5px';
                confirmButton.style.cursor = this.selectedUnit ? 'pointer' : 'not-allowed';
                confirmButton.style.fontWeight = 'bold';
                confirmButton.style.fontSize = '1.2em';
                confirmButton.style.width = '100%';
                confirmButton.style.marginTop = '20px';
                confirmButton.style.transition = 'all 0.2s';

                if (this.selectedUnit) {
                    confirmButton.onmouseover = () => {
                        confirmButton.style.transform = 'scale(1.02)';
                        confirmButton.style.background = '#7ff';
                    };
                    confirmButton.onmouseout = () => {
                        confirmButton.style.transform = 'scale(1)';
                        confirmButton.style.background = '#5ff';
                    };
                    confirmButton.onclick = () => {
                        // Calculate total cost
                        const unitCost = (this.selectedUnit === 'Duke' || this.game.unlockedUnits.has(this.selectedUnit)) ? 0 : this.game.store.units.get(this.selectedUnit).cost;
                        const upgradeCost = this.selectedUpgrade ? this.selectedUpgrade.cost : 0;
                        const totalCost = unitCost + upgradeCost;

                        if (this.game.deploymentPoints >= totalCost) {
                            this.errorMessage = ''; // Clear any error message
                            
                            let purchaseSuccessful = true;
                            
                            // Purchase unit if not Duke and not already unlocked
                            if (this.selectedUnit !== 'Duke' && !this.game.unlockedUnits.has(this.selectedUnit)) {
                                purchaseSuccessful = this.game.handleStorePurchase('./unit.js', this.selectedUnit);
                            }

                            // Purchase upgrade if selected
                            if (purchaseSuccessful && this.selectedUpgrade) {
                                // Find the upgrade name from the store
                                const upgradeMap = this.game.selectedUnit === 'Ship' ? this.game.store.shipUpgrades : this.game.store.upgrades;
                                for (const [upgradeName, upgradeData] of upgradeMap) {
                                    if (upgradeData.power === this.selectedUpgrade.power && 
                                        upgradeData.cost === this.selectedUpgrade.cost) {
                                        purchaseSuccessful = this.game.handleStorePurchase('upgrade', upgradeName);
                                        break;
                                    }
                                }
                            }

                            if (purchaseSuccessful) {
                                // Hide store container
                                const storeContainer = document.getElementById('storeContainer');
                                if (storeContainer) {
                                    storeContainer.style.display = 'none';
                                }
                                // Hide the entire wave complete overlay
                                if (this.game.gameUI.screens.waveComplete) {
                                    this.game.gameUI.screens.waveComplete.style.display = 'none';
                                }
                                // Clear any existing enemies
                                this.game.enemyManager.clearEnemies();
                                // Clear any existing unit
                                if (this.game.activeUnit) {
                                    this.game.scene.remove(this.game.activeUnit.mesh);
                                    this.game.activeUnit = null;
                                }
                                console.log('[DEBUG] Starting new wave with:', {
                                    unit: this.selectedUnit,
                                    upgrade: this.selectedUpgrade ? this.selectedUpgrade.power : 'none',
                                    wave: this.game.currentWave
                                });
                                // Start the next wave
                                this.game.startNewWave(true);
                            } else {
                                this.errorMessage = 'Purchase failed! Please try again.';
                                this.render();
                            }
                        } else {
                            // Show error message
                            this.errorMessage = `Not enough DP! Need ${totalCost} DP but only have ${this.game.deploymentPoints} DP`;
                            this.render(); // Re-render to show error message
                        }
                    };
                }

                this.container.appendChild(confirmButton);

                // Update DP in store to match top-left display
                setTimeout(() => {
                    if (document.getElementById('dpBalance')) {
                        document.getElementById('dpBalance').textContent = `Available DP: ${this.game.deploymentPoints}`;
                    }
                }, 0);
            }
        },
        {
            key: "createUnitCard",
            value: function createUnitCard(name, item, container) {
                const card = document.createElement('div');
                const isUnlocked = this.game.unlockedUnits.has(name);
                const isSelected = this.selectedUnit === name;
                // If unlocked, always allow selection, no cost
                const canAfford = isUnlocked || this.game.deploymentPoints >= item.cost || name === 'Duke';
                card.style.backgroundColor = isSelected ? '#1a3a5a' : '#1a1a1a';
                card.style.borderRadius = '8px';
                card.style.padding = '15px';
                card.style.position = 'relative';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.alignItems = 'center';
                card.style.border = `1px solid ${isSelected ? '#5ff' : '#333'}`;
                card.style.transition = 'all 0.2s';
                card.style.cursor = canAfford ? 'pointer' : 'not-allowed';
                card.style.opacity = canAfford ? '1' : '0.6';

                // Asset image
                const image = document.createElement('img');
                image.style.width = '100px';
                image.style.height = '100px';
                image.style.objectFit = 'cover';
                image.style.marginBottom = '10px';
                
                switch(name.toLowerCase()) {
                    case 'tank':
                        image.src = './assets/tank.png';
                        break;
                    case 'turret':
                        image.src = './assets/turret.png';
                        break;
                    case 'mech':
                        image.src = './assets/mech.png';
                        break;
                    default:
                        image.src = './assets/duke.png';
                }
                card.appendChild(image);

                // Unit name
                const nameElement = document.createElement('div');
                nameElement.textContent = name.toUpperCase();
                nameElement.style.color = '#fff';
                nameElement.style.fontSize = '1.1em';
                nameElement.style.fontWeight = 'bold';
                nameElement.style.marginBottom = '10px';
                card.appendChild(nameElement);

                // Info container
                const info = document.createElement('div');
                info.style.width = '100%';
                info.style.display = 'flex';
                info.style.justifyContent = 'space-between';
                info.style.alignItems = 'center';

                // Power
                const power = document.createElement('div');
                power.innerHTML = `<span style="color: #5ff;">⚡ ${item.power}</span>`;
                power.style.fontSize = '1em';
                info.appendChild(power);

                // Cost
                const cost = document.createElement('div');
                if (isUnlocked || name === 'Duke') {
                    cost.innerHTML = `<span style="color: #5ff;">UNLOCKED</span>`;
                } else {
                    cost.innerHTML = `<span style="color: #ffd700;">₵ ${item.cost}</span>`;
                }
                cost.style.fontSize = '1em';
                info.appendChild(cost);

                card.appendChild(info);

                card.onmouseover = () => {
                    if (!isSelected) {
                        card.style.transform = 'translateY(-2px)';
                        card.style.boxShadow = '0 5px 15px rgba(95, 255, 255, 0.2)';
                    }
                };
                card.onmouseout = () => {
                    if (!isSelected) {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = 'none';
                    }
                };
                card.onclick = () => {
                    if (canAfford) {
                        if (this.selectedUnit === name) {
                            // Deselect if clicking the same unit
                            this.selectedUnit = null;
                            this.previewPower = 10; // Reset to Duke's power
                            if (this.selectedUpgrade) {
                                this.previewPower += this.selectedUpgrade.power;
                            }
                        } else {
                            this.selectedUnit = name;
                            this.previewPower = item.power;
                            if (this.selectedUpgrade) {
                                this.previewPower += this.selectedUpgrade.power;
                            }
                        }
                        this.errorMessage = ''; // Clear error message on valid selection
                        this.render();
                    } else {
                        this.errorMessage = `Not enough DP to select ${name}! Need ${item.cost} DP`;
                        this.render();
                    }
                };

                container.appendChild(card);
            }
        },
        {
            key: "createUpgradeCard",
            value: function createUpgradeCard(name, upgrade, container) {
                const card = document.createElement('div');
                // Store the name with the upgrade object for easier comparison
                const isSelected = this.selectedUpgrade && 
                                  this.selectedUpgrade.name === name &&
                                  this.selectedUpgrade.power === upgrade.power && 
                                  this.selectedUpgrade.cost === upgrade.cost;
                const canAfford = this.game.deploymentPoints >= upgrade.cost;
                
                card.style.backgroundColor = isSelected ? '#1a3a5a' : '#1a1a1a';
                card.style.borderRadius = '8px';
                card.style.padding = '15px';
                card.style.position = 'relative';
                card.style.display = 'flex';
                card.style.flexDirection = 'column';
                card.style.alignItems = 'center';
                card.style.border = `2px solid ${isSelected ? '#5ff' : '#333'}`;
                card.style.transition = 'all 0.2s';
                card.style.cursor = canAfford ? 'pointer' : 'not-allowed';
                card.style.opacity = canAfford ? '1' : '0.6';
                card.style.boxShadow = isSelected ? '0 0 15px rgba(95, 255, 255, 0.5)' : 'none';

                // Add hover effects for selectable cards
                if (canAfford && !isSelected) {
                    card.onmouseover = () => {
                        card.style.transform = 'translateY(-2px)';
                        card.style.boxShadow = '0 5px 15px rgba(95, 255, 255, 0.2)';
                    };
                    card.onmouseout = () => {
                        card.style.transform = 'translateY(0)';
                        card.style.boxShadow = 'none';
                    };
                }

                // Upgrade info
                const info = document.createElement('div');
                info.style.textAlign = 'center';
                info.style.marginBottom = '10px';

                const nameElement = document.createElement('div');
                nameElement.textContent = name;
                nameElement.style.fontWeight = 'bold';
                nameElement.style.fontSize = '1.1em';
                nameElement.style.color = isSelected ? '#5ff' : '#fff';
                info.appendChild(nameElement);

                const powerIncrease = document.createElement('div');
                powerIncrease.innerHTML = `<span style="color: ${isSelected ? '#5ff' : '#aaa'};">+${upgrade.power} Power</span>`;
                powerIncrease.style.fontSize = '0.9em';
                info.appendChild(powerIncrease);

                card.appendChild(info);

                // Cost
                const cost = document.createElement('div');
                cost.innerHTML = `<span style="color: ${isSelected ? '#ffd700' : '#aaa'};">₵ ${upgrade.cost}</span>`;
                cost.style.fontSize = '1.1em';
                card.appendChild(cost);

                card.onclick = () => {
                    if (canAfford) {
                        if (isSelected) {
                            // Deselect if clicking the same upgrade
                            this.selectedUpgrade = null;
                            this.previewPower = this.selectedUnit ? this.game.store.units.get(this.selectedUnit).power : 10;
                        } else {
                            // Store the name with the upgrade for proper comparison
                            this.selectedUpgrade = { ...upgrade, name };
                            const basePower = this.selectedUnit ? this.game.store.units.get(this.selectedUnit).power : 10;
                            this.previewPower = basePower + upgrade.power;
                        }
                        this.errorMessage = ''; // Clear error message on valid selection
                        this.render();
                    } else {
                        this.errorMessage = `Not enough DP for upgrade! Need ${upgrade.cost} DP`;
                        this.render();
                    }
                };

                container.appendChild(card);
            }
        }
    ]);
    return StoreUI;
}();
