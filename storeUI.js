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
        this.container.style.padding = '2vw 2vw 2vw 2vw';
        this.container.style.backgroundColor = 'rgba(0, 50, 100, 0.8)';
        this.container.style.borderRadius = '2vw';
        this.container.style.color = 'white';
        this.container.style.fontFamily = 'Arial, sans-serif';
        this.container.style.margin = '2vw auto';
        this.container.style.width = '100%';
        this.container.style.maxWidth = '900px';
        this.container.style.minWidth = '600px';
        this.container.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
        this.container.style.border = '1px solid rgba(95, 255, 255, 0.3)';
        this.container.style.boxSizing = 'border-box';
        this.container.style.display = 'flex';
        this.container.style.flexDirection = 'column';
        this.container.style.alignItems = 'center';
        this.container.style.justifyContent = 'center';
        this.container.style.overflowX = 'auto';
        
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

                // Add wave complete header at the top of the store panel
                const waveHeader = document.createElement('div');
                waveHeader.style.textAlign = 'center';
                waveHeader.style.marginBottom = '10px';
                waveHeader.innerHTML = `<h2 style="color:#5ff; margin-bottom:10px;">Wave ${this.game.currentWave - 1} complete! Get ready for wave ${this.game.currentWave}.</h2>`;
                this.container.appendChild(waveHeader);

                // Store title
                const storeTitle = document.createElement('h2');
                storeTitle.textContent = this.game.selectedUnit === 'Ship' ? 'SHIP UPGRADE STORE' : 'DEPLOYMENT STORE';
                storeTitle.style.color = '#5ff';
                storeTitle.style.fontSize = '2em';
                storeTitle.style.marginBottom = '20px';
                storeTitle.style.textAlign = 'center';
                this.container.appendChild(storeTitle);

                // Sections container
                const sectionsRow = document.createElement('div');
                sectionsRow.style.display = 'flex';
                sectionsRow.style.flexDirection = 'row';
                sectionsRow.style.gap = '32px';
                sectionsRow.style.width = '100%';
                sectionsRow.style.justifyContent = 'space-between';
                sectionsRow.style.alignItems = 'stretch';
                sectionsRow.style.flexWrap = 'nowrap';
                sectionsRow.style.overflowX = 'auto';
                this.container.appendChild(sectionsRow);

                // Units Section
                const unitsSection = document.createElement('div');
                unitsSection.style.backgroundColor = 'rgba(0, 20, 40, 0.8)';
                unitsSection.style.borderRadius = '10px';
                unitsSection.style.padding = '20px';
                unitsSection.style.border = '1px solid rgba(95, 255, 255, 0.3)';
                unitsSection.style.flex = '1 1 340px';
                unitsSection.style.minWidth = '280px';
                unitsSection.style.maxWidth = '400px';

                const unitsTitle = document.createElement('h3');
                unitsTitle.textContent = 'SELECT UNIT';
                unitsTitle.style.color = '#5ff';
                unitsTitle.style.fontSize = '1.4em';
                unitsTitle.style.marginBottom = '20px';
                unitsTitle.style.textAlign = 'center';
                unitsSection.appendChild(unitsTitle);
                const unitsGrid = document.createElement('div');
                unitsGrid.style.display = 'grid';
                unitsGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
                unitsGrid.style.gap = '15px';
                unitsSection.appendChild(unitsGrid);
                this.createUnitCard('Duke', { power: 10, cost: 0, name: 'Duke' }, unitsGrid);
                this.game.store.units.forEach((item, name) => {
                    this.createUnitCard(name, item, unitsGrid);
                });
                sectionsRow.appendChild(unitsSection);

                // Upgrades Section
                const upgradesSection = document.createElement('div');
                upgradesSection.style.backgroundColor = 'rgba(0, 20, 40, 0.8)';
                upgradesSection.style.borderRadius = '10px';
                upgradesSection.style.padding = '20px';
                upgradesSection.style.border = '1px solid rgba(95, 255, 255, 0.3)';
                upgradesSection.style.flex = '1 1 260px';
                upgradesSection.style.minWidth = '220px';
                upgradesSection.style.maxWidth = '340px';

                const upgradesTitle = document.createElement('h3');
                upgradesTitle.textContent = 'SELECT UPGRADE';
                upgradesTitle.style.color = '#5ff';
                upgradesTitle.style.fontSize = '1.4em';
                upgradesTitle.style.marginBottom = '20px';
                upgradesTitle.style.textAlign = 'center';
                upgradesSection.appendChild(upgradesTitle);
                const upgradesGrid = document.createElement('div');
                upgradesGrid.style.display = 'grid';
                upgradesGrid.style.gridTemplateColumns = 'repeat(1, 1fr)';
                upgradesGrid.style.gap = '15px';
                upgradesSection.appendChild(upgradesGrid);
                this.game.store.upgrades.forEach((upgrade, name) => {
                    this.createUpgradeCard(name, upgrade, upgradesGrid);
                });
                sectionsRow.appendChild(upgradesSection);

                // Error message
                if (this.errorMessage) {
                    const errorDisplay = document.createElement('div');
                    errorDisplay.style.color = '#ff5555';
                    errorDisplay.style.textAlign = 'center';
                    errorDisplay.style.marginTop = '10px';
                    errorDisplay.style.fontSize = '1.1em';
                    errorDisplay.textContent = this.errorMessage;
                    this.container.appendChild(errorDisplay);
                }

                // Button container below the sections
                const buttonContainer = document.createElement('div');
                buttonContainer.style.display = 'flex';
                buttonContainer.style.flexDirection = 'column';
                buttonContainer.style.gap = '12px';
                buttonContainer.style.width = '100%';
                buttonContainer.style.marginTop = '28px';

                // CONFIRM SELECTION button
                const confirmButton = document.createElement('button');
                confirmButton.textContent = 'CONFIRM SELECTION';
                confirmButton.style.padding = '15px 30px';
                confirmButton.style.background = (this.selectedUnit || this.selectedUpgrade) ? '#5ff' : '#666';
                confirmButton.style.color = '#003366';
                confirmButton.style.border = 'none';
                confirmButton.style.borderRadius = '5px';
                confirmButton.style.cursor = (this.selectedUnit || this.selectedUpgrade) ? 'pointer' : 'not-allowed';
                confirmButton.style.fontWeight = 'bold';
                confirmButton.style.fontSize = '1.2em';
                confirmButton.style.width = '100%';
                confirmButton.style.transition = 'all 0.2s';
                confirmButton.disabled = !(this.selectedUnit || this.selectedUpgrade);
                confirmButton.onclick = () => {
                    // Calculate total cost
                    const unitCost = (this.selectedUnit === 'Duke' || this.game.unlockedUnits.has(this.selectedUnit)) ? 0 : (this.selectedUnit ? this.game.store.units.get(this.selectedUnit).cost : 0);
                    const upgradeCost = this.selectedUpgrade ? this.selectedUpgrade.cost : 0;
                    const totalCost = unitCost + upgradeCost;
                    if (this.game.deploymentPoints >= totalCost) {
                        this.errorMessage = '';
                        let purchaseSuccessful = true;
                        // Purchase unit if not Duke and not already unlocked
                        if (this.selectedUnit && this.selectedUnit !== 'Duke' && !this.game.unlockedUnits.has(this.selectedUnit)) {
                            purchaseSuccessful = this.game.handleStorePurchase('./unit.js', this.selectedUnit);
                        }
                        // Purchase upgrade if selected
                        if (purchaseSuccessful && this.selectedUpgrade) {
                            const upgradeMap = this.game.selectedUnit === 'Ship' ? this.game.store.shipUpgrades : this.game.store.upgrades;
                            for (const [upgradeName, upgradeData] of upgradeMap) {
                                if (upgradeData.power === this.selectedUpgrade.power && upgradeData.cost === this.selectedUpgrade.cost) {
                                    purchaseSuccessful = this.game.handleStorePurchase('upgrade', upgradeName);
                                    break;
                                }
                            }
                        }
                        if (purchaseSuccessful) {
                            this.selectedUpgrade = null;
                            this.render();
                        } else {
                            this.errorMessage = 'Purchase failed! Please try again.';
                            this.render();
                        }
                    } else {
                        this.errorMessage = `Not enough DP! Need ${totalCost} DP but only have ${this.game.deploymentPoints} DP`;
                        this.render();
                    }
                };
                buttonContainer.appendChild(confirmButton);

                // START NEXT WAVE button
                const nextWaveBtn = document.createElement('button');
                nextWaveBtn.textContent = 'START NEXT WAVE';
                nextWaveBtn.style.padding = '15px 30px';
                nextWaveBtn.style.background = '#5ff';
                nextWaveBtn.style.color = '#003366';
                nextWaveBtn.style.border = 'none';
                nextWaveBtn.style.borderRadius = '5px';
                nextWaveBtn.style.cursor = 'pointer';
                nextWaveBtn.style.fontWeight = 'bold';
                nextWaveBtn.style.fontSize = '1.2em';
                nextWaveBtn.style.width = '100%';
                nextWaveBtn.onclick = () => {
                    // Hide store overlay
                    const waveCompleteScreen = this.game.gameUI.screens.waveComplete;
                    if (waveCompleteScreen) waveCompleteScreen.style.display = 'none';
                    // Start next wave
                    this.game.startNewWave(true);
                };
                buttonContainer.appendChild(nextWaveBtn);

                // Add Play Stage 2 button if wave 3 is completed
                if (this.game.currentWave > 3) {
                    const stage2Btn = document.createElement('button');
                    stage2Btn.textContent = 'PLAY STAGE 2';
                    stage2Btn.style.padding = '15px 30px';
                    stage2Btn.style.background = this.game.deploymentPoints >= 100 ? '#5ff' : '#666';
                    stage2Btn.style.color = '#003366';
                    stage2Btn.style.border = 'none';
                    stage2Btn.style.borderRadius = '5px';
                    stage2Btn.style.cursor = this.game.deploymentPoints >= 100 ? 'pointer' : 'not-allowed';
                    stage2Btn.style.fontWeight = 'bold';
                    stage2Btn.style.fontSize = '1.2em';
                    stage2Btn.style.width = '100%';
                    stage2Btn.style.transition = 'all 0.2s';
                    stage2Btn.disabled = this.game.deploymentPoints < 100;

                    stage2Btn.onclick = () => {
                        if (this.game.deploymentPoints >= 100) {
                            // Deduct 100 DP
                            this.game.deploymentPoints -= 100;
                            this.game.gameUI.updateDP(this.game.deploymentPoints);
                            
                            // Hide store overlay and wave complete screen
                            const waveCompleteScreen = this.game.gameUI.screens.waveComplete;
                            if (waveCompleteScreen) {
                                waveCompleteScreen.style.display = 'none';
                                // Also hide the store container
                                const storeContainer = document.getElementById('storeContainer');
                                if (storeContainer) {
                                    storeContainer.style.display = 'none';
                                }
                            }
                            
                            // Transition to stage 2
                            this.game.transitionToStage2();
                        } else {
                            // Show error message
                            const errorDisplay = document.createElement('div');
                            errorDisplay.style.position = 'fixed';
                            errorDisplay.style.top = '50%';
                            errorDisplay.style.left = '50%';
                            errorDisplay.style.transform = 'translate(-50%, -50%)';
                            errorDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
                            errorDisplay.style.color = '#ff5555';
                            errorDisplay.style.padding = '20px';
                            errorDisplay.style.borderRadius = '10px';
                            errorDisplay.style.zIndex = '1000';
                            errorDisplay.style.textAlign = 'center';
                            errorDisplay.style.border = '2px solid #ff5555';
                            errorDisplay.textContent = 'Not enough DPs to progress to stage 2';
                            
                            document.body.appendChild(errorDisplay);
                            
                            // Remove error message after 2 seconds
                            setTimeout(() => {
                                if (errorDisplay.parentNode) {
                                    errorDisplay.parentNode.removeChild(errorDisplay);
                                }
                            }, 2000);
                        }
                    };

                    buttonContainer.appendChild(stage2Btn);
                }
                this.container.appendChild(buttonContainer);
            }
        },
        {
            key: "createUnitCard",
            value: function createUnitCard(name, item, container) {
                const card = document.createElement('div');
                const isUnlocked = this.game.unlockedUnits.has(name);
                const isSelected = this.selectedUnit === name;
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

                // Add lock icon for locked units
                if (!isUnlocked && name !== 'Duke') {
                    const lockIcon = document.createElement('div');
                    lockIcon.innerHTML = '🔒';
                    lockIcon.style.position = 'absolute';
                    lockIcon.style.top = '10px';
                    lockIcon.style.right = '10px';
                    lockIcon.style.fontSize = '1.2em';
                    card.appendChild(lockIcon);
                }

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

                // Add hover effects
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

                // Add click handler
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
                const isSelected = this.selectedUpgrade && this.selectedUpgrade.power === upgrade.power;
                const canAfford = this.game.deploymentPoints >= upgrade.cost;
                
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

                // Info container
                const info = document.createElement('div');
                info.style.width = '100%';
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

                // Add hover effects
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

                // Add click handler
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
