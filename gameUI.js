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
export var GameUI = /*#__PURE__*/ function() {
    "use strict";
    function GameUI(game) {
        _class_call_check(this, GameUI);
        this.game = game;
        // Remove duplicate audio setup
        this.setupUI();
    }
    _create_class(GameUI, [
        {
            key: "setupUI",
            value: function setupUI() {
                var _this = this;
                // Create UI container
                this.uiContainer = document.createElement('div');
                this.uiContainer.style.position = 'absolute';
                this.uiContainer.style.top = '0';
                this.uiContainer.style.left = '0';
                this.uiContainer.style.width = '100%';
                this.uiContainer.style.height = '100%';
                this.uiContainer.style.pointerEvents = 'none';
                this.uiContainer.style.color = 'white';
                this.uiContainer.style.fontFamily = 'Arial, sans-serif';
                this.game.container.appendChild(this.uiContainer);

                // Add villain image to top right (no frame)
                const villainImg = document.createElement('img');
                villainImg.src = './assets/tonsil.png';
                villainImg.alt = 'Villian';
                villainImg.style.position = 'absolute';
                villainImg.style.top = '20px';
                villainImg.style.right = '20px';
                villainImg.style.width = '220px';
                villainImg.style.height = '220px';
                villainImg.style.objectFit = 'contain';
                villainImg.style.borderRadius = '24px';
                villainImg.style.boxShadow = '0 8px 32px rgba(0,0,0,0.7)';
                villainImg.style.opacity = '0.85';
                villainImg.style.zIndex = '200';
                villainImg.style.pointerEvents = 'none';
                villainImg.style.userSelect = 'none';
                villainImg.style.transition = 'transform 0.3s, filter 0.3s, box-shadow 0.3s';
                villainImg.style.transform = 'rotate(-8deg)';
                this.uiContainer.appendChild(villainImg);

                // Create game info panel
                this.gameInfoPanel = document.createElement('div');
                this.gameInfoPanel.style.position = 'absolute';
                this.gameInfoPanel.style.top = '10px';
                this.gameInfoPanel.style.left = '10px';
                this.gameInfoPanel.style.padding = '20px';
                this.gameInfoPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                this.gameInfoPanel.style.borderRadius = '10px';
                this.gameInfoPanel.style.fontSize = '1.2em';
                this.gameInfoPanel.innerHTML = `
      <h2 style="margin: 0 0 15px 0; font-size: 1.8em; color: #5ff;">Loren's Base Defense</h2>
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
        <div style="font-size: 1.2em;">Current Wave: <span id="waveNumber">1</span></div>
        <button id="muteBtn" style="background: rgba(0, 100, 150, 0.7); border: 1px solid #5ff; color: white; border-radius: 5px; padding: 5px 10px; cursor: pointer; pointer-events: auto;">
          <span id="muteIcon">🔊</span> Sound
        </button>
      </div>
      <div style="font-size: 1.2em;">Deployment Points: <span id="dpPoints">0</span></div>
      <div style="font-size: 1.2em;">Unit Name: <span id="displayUnitName">Duke</span> (<span id="playerPower">10</span> power)</div>
      <div style="font-size: 1.2em;">Enemy Name: Crabbies (<span id="enemyPower">10</span> power)</div>
    `;
                this.uiContainer.appendChild(this.gameInfoPanel);

                // Setup mute button functionality
                document.getElementById('muteBtn').addEventListener('click', () => {
                    if (this.game.audioManager) {
                        this.game.audioManager.toggleMute();
                        this.updateAllMuteButtons();
                    }
                });
                
                // Set initial mute button state
                if (this.game.audioManager) {
                    this.updateAllMuteButtons();
                }
                
                // Create unit ammo counter
                this.ammoCounter = document.createElement('div');
                this.ammoCounter.style.position = 'absolute';
                this.ammoCounter.style.bottom = '20px';
                this.ammoCounter.style.left = '20px';
                this.ammoCounter.style.padding = '20px';
                this.ammoCounter.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                this.ammoCounter.style.borderRadius = '10px';
                this.ammoCounter.style.fontSize = '1.2em';
                this.ammoCounter.innerHTML = '\n      <div style="font-size: 1.2em;">Unit: <span id="unitName">-</span></div>\n      <div style="font-size: 1.2em;">Ammo: <span id="ammoCount">0</span></div>\n      <div style="font-size: 1.2em; margin-top: 10px;">Press \'M\' for math problem to get ammo</div>\n      <div style="font-size: 1.2em; margin-top: 10px;">Move with Arrow Keys or WASD</div>\n      <div style="font-size: 1.2em; margin-top: 5px;">Find ammo boxes for extra ammo!</div>\n    ';
                this.uiContainer.appendChild(this.ammoCounter);
                // Create screens containers
                this.screens = {};
                [
                    'start',
                    'waveComplete',
                    'gameOver',
                    'mathProblem'
                ].forEach(function(screenName) {
                    var screen = document.createElement('div');
                    screen.id = "".concat(screenName, "Screen");
                    screen.style.position = 'absolute';
                    screen.style.top = '0';
                    screen.style.left = '0';
                    screen.style.width = '100%';
                    screen.style.height = '100%';
                    screen.style.display = 'none';
                    screen.style.justifyContent = 'center';
                    screen.style.alignItems = 'center';
                    screen.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
                    screen.style.zIndex = '100';
                    screen.style.pointerEvents = 'auto';
                    _this.uiContainer.appendChild(screen);
                    _this.screens[screenName] = screen;
                    
                    // Add mute button to screen if it's not already added to the game info panel
                    if (screenName !== 'mathProblem') {  // Don't add to math problem screen as it's modal
                        var muteBtn = document.createElement('button');
                        muteBtn.id = `${screenName}MuteBtn`;
                        muteBtn.className = 'screenMuteBtn';
                        muteBtn.innerHTML = `<span class="muteBtnIcon">🔊</span>`;
                        muteBtn.style.position = 'absolute';
                        muteBtn.style.top = '20px';
                        muteBtn.style.right = '20px';
                        muteBtn.style.background = 'rgba(0, 100, 150, 0.7)';
                        muteBtn.style.border = '1px solid #5ff';
                        muteBtn.style.color = 'white';
                        muteBtn.style.borderRadius = '50%';
                        muteBtn.style.width = '40px';
                        muteBtn.style.height = '40px';
                        muteBtn.style.cursor = 'pointer';
                        muteBtn.style.fontSize = '1.5em';
                        muteBtn.style.display = 'flex';
                        muteBtn.style.justifyContent = 'center';
                        muteBtn.style.alignItems = 'center';
                        muteBtn.style.zIndex = '200';
                        
                        muteBtn.addEventListener('click', function() {
                            if (_this.game.audioManager) {
                                _this.game.audioManager.toggleMute();
                                _this.updateAllMuteButtons();
                            }
                        });
                        
                        screen.appendChild(muteBtn);
                    }
                });
                
                // Helper method to update all mute buttons
                this.updateAllMuteButtons = function() {
                    const isMuted = this.game.audioManager.isMuted;
                    const icon = isMuted ? '🔇' : '🔊';
                    
                    // Update main mute button
                    const mainMuteIcon = document.getElementById('muteIcon');
                    if (mainMuteIcon) {
                        mainMuteIcon.textContent = icon;
                    }
                    
                    // Update all screen mute buttons
                    document.querySelectorAll('.screenMuteBtn .muteBtnIcon').forEach(btn => {
                        btn.textContent = icon;
                    });
                };
                
                this.setupStartScreen();
                this.setupWaveCompleteScreen();
                this.setupGameOverScreen();
                this.setupMathProblemScreen();

                // Create power labels container
                this.powerLabels = document.createElement('div');
                this.powerLabels.style.position = 'absolute';
                this.powerLabels.style.width = '100%';
                this.powerLabels.style.height = '100%';
                this.powerLabels.style.pointerEvents = 'none';
                this.game.container.appendChild(this.powerLabels);

                // Create player power label
                this.playerPowerLabel = document.createElement('div');
                this.playerPowerLabel.style.position = 'absolute';
                this.playerPowerLabel.style.padding = '5px 10px';
                this.playerPowerLabel.style.backgroundColor = 'rgba(0, 255, 255, 0.3)';
                this.playerPowerLabel.style.borderRadius = '5px';
                this.playerPowerLabel.style.color = '#fff';
                this.playerPowerLabel.style.fontSize = '1em';
                this.playerPowerLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
                this.powerLabels.appendChild(this.playerPowerLabel);

                // Create enemy power label
                this.enemyPowerLabel = document.createElement('div');
                this.enemyPowerLabel.style.position = 'absolute';
                this.enemyPowerLabel.style.padding = '5px 10px';
                this.enemyPowerLabel.style.backgroundColor = 'rgba(255, 102, 102, 0.3)';
                this.enemyPowerLabel.style.borderRadius = '5px';
                this.enemyPowerLabel.style.color = '#fff';
                this.enemyPowerLabel.style.fontSize = '1em';
                this.enemyPowerLabel.style.textShadow = '1px 1px 2px rgba(0,0,0,0.8)';
                this.powerLabels.appendChild(this.enemyPowerLabel);

                // Add methods to update power labels
                this.updatePlayerPower = function(power) {
                    this.playerPowerLabel.textContent = `Power: ${power}`;
                    this.playerPowerLabel.style.left = '35%';
                    this.playerPowerLabel.style.top = '50%';
                    this.playerPowerLabel.style.transform = 'translate(-50%, -50%)';
                };

                this.updateEnemyPower = function(power) {
                    this.enemyPowerLabel.textContent = `Power: ${power}`;
                    this.enemyPowerLabel.style.right = '35%';
                    this.enemyPowerLabel.style.top = '50%';
                    this.enemyPowerLabel.style.transform = 'translate(50%, -50%)';
                };

                // Add methods to update power information
                this.updatePowerInfo = function(playerPower, enemyPower) {
                    document.getElementById('playerPower').textContent = playerPower;
                    document.getElementById('enemyPower').textContent = enemyPower;
                    this.updatePlayerPower(playerPower);
                    this.updateEnemyPower(enemyPower);
                };

                this.updateDisplayUnitName = function(unitName) {
                    document.getElementById('displayUnitName').textContent = unitName;
                };
            }
        },
        {
            key: "setupStartScreen",
            value: function setupStartScreen() {
                var _this = this;
                var content = document.createElement('div');
                content.style.backgroundColor = 'rgba(0, 50, 100, 0.9)';
                content.style.padding = '30px';
                content.style.borderRadius = '15px';
                content.style.width = '70%';
                content.style.maxWidth = '800px';
                content.style.fontSize = '1.2em';
                content.style.textAlign = 'center';
                content.innerHTML = '\n      <h1 style="color: #5ff; margin-bottom: 20px;">Loren\'s Base Defense</h1>\n      <p style="margin-bottom: 15px;">Defend your underwater base against waves of enemy crabs!</p>\n      <ul style="text-align: left; margin-bottom: 20px; list-style-type: none; padding-left: 0;">\n        <li>• Each wave sends 6 crabs (5 regular + 1 leader)</li>\n        <li>• Deploy one unit per wave to defend your base</li>\n        <li>• Use arrow keys or WASD to move in all directions</li>\n        <li>• Collect ammo boxes dropped by defeated enemies</li>\n        <li>• Solve math problems to get +3 ammo when near boxes</li>\n        <li>• Earn Deployment Points (DP) to unlock new units</li>\n      </ul>\n      <button id="startGameBtn" style="padding: 10px 20px; background: #5ff; color: #003366; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">START GAME</button>\n    ';
                this.screens.start.appendChild(content);
                this.screens.start.style.display = 'flex';
                document.getElementById('startGameBtn').addEventListener('click', function() {
                    // Enable audio context if available
                    if (_this.game.audioManager && _this.game.audioManager.audioListener.context.state === 'suspended') {
                        _this.game.audioManager.audioListener.context.resume().then(function() {
                            console.log('AudioContext resumed successfully from start button');
                        });
                    }
                    
                    // Play button sound
                    if (_this.game.audioManager) {
                        _this.game.audioManager.playButton();
                        // Start background music
                        _this.game.audioManager.toggleBackgroundMusic(true);
                    }
                    
                    _this.screens.start.style.display = 'none';
                    _this.game.startNewWave(true);
                });
            }
        },
        {
            key: "setupWaveCompleteScreen",
            value: function setupWaveCompleteScreen() {
                var _this = this;
                var content = document.createElement('div');
                content.style.backgroundColor = 'rgba(0, 50, 100, 0.9)';
                content.style.padding = '30px';
                content.style.borderRadius = '15px';
                content.style.width = '70%';
                content.style.maxWidth = '800px';
                content.style.fontSize = '1.2em';
                content.style.textAlign = 'center';
                content.innerHTML = `
      <h2 style="color: #5ff; margin-bottom: 20px; text-align: center;">Wave Complete!</h2>
      <p id="waveCompleteText" style="margin-bottom: 30px; text-align: center;">Get ready for the next wave.</p>
      
      <div style="display: flex; flex-direction: column; gap: 20px; max-width: 600px; margin: 0 auto;">
        <!-- DP Store -->
        <div style="background: rgba(0, 50, 100, 0.8); padding: 15px; border-radius: 10px; border: 1px solid rgba(95, 255, 255, 0.3);">
          <h3 style="color: #5ff; margin: 0 0 10px 0; text-align: center;">Deployment Points Store</h3>
          <div id="storeContainer" style="margin-bottom: 10px;"></div>
          <div id="dpBalance" style="text-align: center; margin-top: 10px;">Available DP: <strong>${this.game.deploymentPoints}</strong></div>
        </div>
        
        <!-- Unit Selection -->
        <div style="background: rgba(0, 50, 100, 0.8); padding: 15px; border-radius: 10px; border: 1px solid rgba(95, 255, 255, 0.3);">
          <h3 style="margin: 0 0 10px 0; color: #5ff; text-align: center;">Select Deployment Unit</h3>
          <select id="unitSelector" style="padding: 10px; width: 100%; margin-bottom: 15px; background: rgba(0, 20, 40, 0.8); color: white; border: 1px solid rgba(95, 255, 255, 0.3); border-radius: 5px;"></select>
          <button id="nextWaveBtn" style="padding: 12px 20px; background: #5ff; color: #003366; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">START NEXT WAVE</button>
        </div>
      </div>
    `;
                this.screens.waveComplete.appendChild(content);
                document.getElementById('nextWaveBtn').addEventListener('click', function() {
                    var unitSelector = document.getElementById('unitSelector');
                    var selectedUnit = unitSelector.value;
                    console.log('Unit selected:', selectedUnit);
                    
                    // Play button sound
                    if (_this.game.audioManager) {
                        _this.game.audioManager.playButton();
                    }
                    
                    if (selectedUnit) {
                        _this.game.selectedUnit = selectedUnit;
                        _this.screens.waveComplete.style.display = 'none';
                        _this.game.startNewWave(true);
                    } else {
                        console.warn('No unit selected');
                    }
                });
            }
        },
        {
            key: "setupGameOverScreen",
            value: function setupGameOverScreen(isVictory) {
                const gameOverScreen = document.createElement('div');
                gameOverScreen.id = 'gameOverScreen';
                gameOverScreen.style.position = 'absolute';
                gameOverScreen.style.top = '0';
                gameOverScreen.style.left = '0';
                gameOverScreen.style.width = '100%';
                gameOverScreen.style.height = '100%';
                gameOverScreen.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
                gameOverScreen.style.display = 'none';
                gameOverScreen.style.flexDirection = 'column';
                gameOverScreen.style.justifyContent = 'center';
                gameOverScreen.style.alignItems = 'center';
                gameOverScreen.style.zIndex = '1000';
                gameOverScreen.style.color = 'white';
                gameOverScreen.style.fontSize = '2em';
                gameOverScreen.style.textAlign = 'center';

                const message = isVictory ? 'Victory!' : 'Game Over';
                const color = isVictory ? '#00ff00' : '#ff0000';
                
                gameOverScreen.innerHTML = `
                    <h1 style="color: ${color}; margin-bottom: 20px; text-shadow: 0 0 10px ${color};">${message}</h1>
                    <p style="margin-bottom: 30px;">Final Score: ${this.game.score}</p>
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

                document.body.appendChild(gameOverScreen);

                // Add click handler for play again button
                const playAgainButton = document.getElementById('playAgainButton');
                playAgainButton.addEventListener('click', () => {
                    // Remove game over screen
                    document.body.removeChild(gameOverScreen);
                    
                    // Reset game state
                    this.game.resetGame();
                    
                    // Start new game
                    this.game.startWave();
                });
            }
        },
        {
            key: "setupMathProblemScreen",
            value: function setupMathProblemScreen() {
                var _this = this;
                var content = document.createElement('div');
                content.style.backgroundColor = 'rgba(0, 50, 100, 0.9)';
                content.style.padding = '30px';
                content.style.borderRadius = '15px';
                content.style.width = '70%';
                content.style.maxWidth = '800px';
                content.style.fontSize = '1.2em';
                content.style.textAlign = 'center';
                content.innerHTML = '\n      <h2 style="color: #5ff; margin-bottom: 20px;">Math Problem</h2>\n      <p style="margin-bottom: 5px;">Solve this problem to reload ammo:</p>\n      <h3 id=\'mathProblem\' style="margin-bottom: 20px; font-size: 24px;">5 + 7 = ?</h3>\n      <input id="mathAnswer" type="number" style="padding: 10px; width: 100px; text-align: center; margin-bottom: 15px; font-size: 18px;" placeholder="?">\n      <div>\n        <button id="submitAnswerBtn" style="padding: 10px 20px; background: #5ff; color: #003366; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">SUBMIT</button>\n      </div>\n      <p id="mathResult" style="margin-top: 15px; height: 20px;"></p>\n    ';
                this.screens.mathProblem.appendChild(content);
                document.getElementById('submitAnswerBtn').addEventListener('click', function() {
                    // Play button sound
                    if (_this.game.audioManager) {
                        _this.game.audioManager.playButton();
                    }
                    
                    var answer = parseInt(document.getElementById('mathAnswer').value);
                    _this.game.mathProblem.checkAnswer(answer);
                });
            }
        },
        {
            key: "showStartScreen",
            value: function showStartScreen() {
                this.screens.start.style.display = 'flex';
            }
        },
        {
            key: "showWaveCompleteScreen",
            value: function showWaveCompleteScreen() {
                var unitSelector = document.getElementById('unitSelector');
                unitSelector.innerHTML = '';
                this.updateUnitSelector();
                // Set Duke as default if available
                if (this.game.unlockedUnits.has('Duke')) {
                    unitSelector.value = 'Duke';
                }
                document.getElementById('waveCompleteText').textContent = "Wave ".concat(this.game.currentWave - 1, " complete! Get ready for wave ").concat(this.game.currentWave, ".");
                this.screens.waveComplete.style.display = 'flex';
            }
        },
        {
            key: "showGameOverScreen",
            value: function showGameOverScreen(win) {
                var title = document.getElementById('gameOverTitle');
                var text = document.getElementById('gameOverText');
                var finalWave = document.getElementById('finalWave');
                if (win) {
                    title.textContent = 'Victory!';
                    title.style.color = '#5ff';
                    text.textContent = 'You have successfully defended Loren\'s base!';
                } else {
                    title.textContent = 'Game Over';
                    title.style.color = '#f55';
                    text.textContent = 'Your base has been destroyed by the crabs.';
                }
                finalWave.textContent = this.game.currentWave;
                this.screens.gameOver.style.display = 'flex';
            }
        },
        {
            key: "updateBaseHealth",
            value: function updateBaseHealth(health) {
                const baseHealthElement = document.getElementById('baseHealth');
                if (baseHealthElement) {
                    baseHealthElement.textContent = health;
                }
            }
        },
        {
            key: "updateWaveInfo",
            value: function updateWaveInfo(wave) {
                const waveElement = document.getElementById('waveNumber');
                if (waveElement) {
                    waveElement.textContent = wave;
                }
            }
        },
        {
            key: "updateDP",
            value: function updateDP(points) {
                const dpPointsElement = document.getElementById('dpPoints');
                const dpBalanceElement = document.getElementById('dpBalance');
                
                if (dpPointsElement) {
                    dpPointsElement.textContent = points;
                }
                
                if (dpBalanceElement) {
                    dpBalanceElement.textContent = "Available DP: ".concat(points);
                }
            }
        },
        {
            key: "updateUnitInfo",
            value: function updateUnitInfo(unitName, ammo) {
                const unitNameElement = document.getElementById('unitName');
                const ammoCountElement = document.getElementById('ammoCount');
                
                if (unitNameElement) {
                    unitNameElement.textContent = unitName;
                }
                
                if (ammoCountElement) {
                    ammoCountElement.textContent = ammo;
                }
            }
        },
        {
            key: "updateUnitSelector",
            value: function updateUnitSelector() {
                var _this = this;
                var unitSelector = document.getElementById('unitSelector');
                if (!unitSelector) return;
                unitSelector.innerHTML = '';
                this.game.unlockedUnits.forEach(function(unit) {
                    var option = document.createElement('option');
                    option.value = unit;
                    option.textContent = unit;
                    unitSelector.appendChild(option);
                });
                // Set to current selected unit if available
                if (this.game.selectedUnit && this.game.unlockedUnits.has(this.game.selectedUnit)) {
                    unitSelector.value = this.game.selectedUnit;
                }
                // Add event listener to track selection changes
                unitSelector.addEventListener('change', function(e) {
                    _this.game.selectedUnit = e.target.value;
                    console.log('Unit selected:', _this.game.selectedUnit);
                });
            }
        }
    ]);
    return GameUI;
}();
