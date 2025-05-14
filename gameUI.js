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
                content.innerHTML = `
      <h1 style="color: #5ff; margin-bottom: 20px;">Loren's Base Defense</h1>
      <div id="playerNameForm" style="margin-bottom: 20px;">
        <input type="text" id="playerNameInput" placeholder="Enter your name" style="padding: 10px; width: 200px; margin-bottom: 10px; background: rgba(0, 20, 40, 0.8); color: white; border: 1px solid rgba(95, 255, 255, 0.3); border-radius: 5px;">
        <div id="nameError" style="color: #ff5d5d; margin-bottom: 10px; height: 20px;"></div>
      </div>
      <p style="margin-bottom: 15px;">Defend your underwater base against waves of enemy crabs!</p>
      <ul style="text-align: left; margin-bottom: 20px; list-style-type: none; padding-left: 0;">
        <li>• Each wave sends 6 crabs (5 regular + 1 leader)</li>
        <li>• Deploy one unit per wave to defend your base</li>
        <li>• Use arrow keys or WASD to move in all directions</li>
        <li>• Collect ammo boxes dropped by defeated enemies</li>
        <li>• Solve math problems to get +3 ammo when near boxes</li>
        <li>• Earn Deployment Points (DP) to unlock new units</li>
      </ul>
      <button id="startGameBtn" style="padding: 10px 20px; background: #5ff; color: #003366; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">START GAME</button>
    `;
                this.screens.start.appendChild(content);
                this.screens.start.style.display = 'flex';

                // Add event listener for player name input
                const playerNameInput = document.getElementById('playerNameInput');
                const nameError = document.getElementById('nameError');
                const startGameBtn = document.getElementById('startGameBtn');

                // Disable start button initially
                startGameBtn.disabled = true;
                startGameBtn.style.opacity = '0.5';
                startGameBtn.style.cursor = 'not-allowed';

                // Wait for Supabase to be ready
                const waitForSupabase = () => {
                    return new Promise((resolve) => {
                        if (window.GameData && window.GameData.ready) {
                            resolve();
                        } else {
                            document.addEventListener('supabase-ready', () => {
                                resolve();
                            }, { once: true });
                        }
                    });
                };

                playerNameInput.addEventListener('input', function() {
                    const name = this.value.trim();
                    if (name.length >= 3) {
                        nameError.textContent = '';
                        startGameBtn.disabled = false;
                        startGameBtn.style.opacity = '1';
                        startGameBtn.style.cursor = 'pointer';
                    } else {
                        nameError.textContent = 'Name must be at least 3 characters long';
                        startGameBtn.disabled = true;
                        startGameBtn.style.opacity = '0.5';
                        startGameBtn.style.cursor = 'not-allowed';
                    }
                });

                startGameBtn.addEventListener('click', async function() {
                    const playerName = playerNameInput.value.trim();
                    if (playerName.length < 3) return;

                    // Disable the button while processing
                    startGameBtn.disabled = true;
                    startGameBtn.style.opacity = '0.5';
                    startGameBtn.style.cursor = 'not-allowed';
                    nameError.textContent = 'Saving player data...';

                    try {
                        console.log('Starting save process...');
                        console.log('Checking GameData:', window.GameData);
                        
                        // Wait for Supabase to be ready
                        console.log('Waiting for Supabase...');
                        await waitForSupabase();
                        console.log('Supabase ready check complete');

                        if (!window.GameData) {
                            console.error('GameData is undefined');
                            throw new Error('Game data system not initialized');
                        }

                        if (!window.GameData.saveUser) {
                            console.error('saveUser function is undefined');
                            throw new Error('Save user function not available');
                        }

                        console.log('Attempting to save user:', playerName);
                        // Save user to Supabase
                        const { data, error } = await window.GameData.saveUser(playerName);
                        console.log('Save response:', { data, error });
                        
                        if (error) {
                            console.error('Supabase save error:', error);
                            nameError.textContent = 'Error saving player name. Please try again.';
                            startGameBtn.disabled = false;
                            startGameBtn.style.opacity = '1';
                            startGameBtn.style.cursor = 'pointer';
                            return;
                        }

                        console.log('User saved successfully, starting game...');

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
                    } catch (error) {
                        console.error('Detailed error in game start:', {
                            error: error,
                            message: error.message,
                            stack: error.stack,
                            GameData: window.GameData
                        });
                        nameError.textContent = 'Error starting game. Please try again.';
                        startGameBtn.disabled = false;
                        startGameBtn.style.opacity = '1';
                        startGameBtn.style.cursor = 'pointer';
                    }
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
            value: function setupGameOverScreen() {
                var _this = this;
                var content = document.createElement('div');
                content.style.backgroundColor = 'rgba(0, 50, 100, 0.9)';
                content.style.padding = '30px';
                content.style.borderRadius = '15px';
                content.style.width = '70%';
                content.style.maxWidth = '800px';
                content.style.fontSize = '1.2em';
                content.style.textAlign = 'center';
                
                this.screens.gameOver.appendChild(content);
                this.gameOverContent = content;
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
                // Hide the old floating text and DP
                this.screens.waveComplete.innerHTML = '';
                this.screens.waveComplete.style.display = 'none';
            }
        },
        {
            key: "showGameOverScreen",
            value: function showGameOverScreen(win) {
                // Update the content of the game over screen
                const message = win ? 'Victory!' : 'Game Over';
                const color = win ? '#5dff5d' : '#ff5d5d';
                const bgColor = win ? 'rgba(0, 80, 30, 0.9)' : 'rgba(80, 0, 30, 0.9)';
                
                // Make sure we have the gameOverContent element
                if (!this.gameOverContent) {
                    this.gameOverContent = document.createElement('div');
                    this.screens.gameOver.appendChild(this.gameOverContent);
                }
                
                // Update styles
                this.gameOverContent.style.backgroundColor = bgColor;
                this.gameOverContent.style.padding = '40px';
                this.gameOverContent.style.borderRadius = '20px';
                this.gameOverContent.style.width = '80%';
                this.gameOverContent.style.maxWidth = '800px';
                this.gameOverContent.style.fontSize = '1.3em';
                this.gameOverContent.style.textAlign = 'center';
                this.gameOverContent.style.boxShadow = '0 0 30px rgba(0, 0, 0, 0.5)';
                this.gameOverContent.style.border = `3px solid ${color}`;
                
                let statsMessage = '';
                if (!win) {
                    statsMessage = `
                        <div style="margin: 20px 0; padding: 15px; background-color: rgba(255, 255, 255, 0.1); border-radius: 10px;">
                            <h3 style="margin-bottom: 10px; color: #8df">Game Stats</h3>
                            <p>Waves Completed: <span style="font-weight: bold; color: #8df">${this.game.currentWave - 1}</span></p>
                            <p>Enemies Defeated: <span style="font-weight: bold; color: #8df">${this.game.enemyManager ? this.game.enemyManager.enemiesDefeated : 0}</span></p>
                        </div>
                    `;
                }

                // Create the form HTML with scenario-specific messaging
                const formHTML = `
                    <div id="gameCreationForm" style="margin-top: 30px; text-align: left;">
                        <h2 style="color: ${color}; margin-bottom: 20px; text-align: center;">${win ? 'Congratulations! Create Your Next Adventure!' : 'Create Your Own Game!'}</h2>
                        
                        <div id="formStep1" class="form-step">
                            <h3 style="color: #8df; margin-bottom: 15px;">Step 1: Who will be your hero?</h3>
                            <input type="text" id="heroInput" placeholder="Enter your hero's name" style="width: 100%; padding: 10px; margin-bottom: 15px; background: rgba(0, 20, 40, 0.8); color: white; border: 1px solid rgba(95, 255, 255, 0.3); border-radius: 5px;">
                            <button id="nextStep1" style="padding: 10px 20px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">Next</button>
                        </div>

                        <div id="formStep2" class="form-step" style="display: none;">
                            <h3 style="color: #8df; margin-bottom: 15px;">Step 2: Who will be your villain?</h3>
                            <input type="text" id="villainInput" placeholder="Enter your villain's name" style="width: 100%; padding: 10px; margin-bottom: 15px; background: rgba(0, 20, 40, 0.8); color: white; border: 1px solid rgba(95, 255, 255, 0.3); border-radius: 5px;">
                            <button id="nextStep2" style="padding: 10px 20px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">Next</button>
                        </div>

                        <div id="formStep3" class="form-step" style="display: none;">
                            <h3 style="color: #8df; margin-bottom: 15px;">Step 3: What type of game will it be?</h3>
                            <select id="gameTypeInput" style="width: 100%; padding: 10px; margin-bottom: 15px; background: rgba(0, 20, 40, 0.8); color: white; border: 1px solid rgba(95, 255, 255, 0.3); border-radius: 5px;">
                                <option value="">Select game type...</option>
                                <option value="battle">Battle</option>
                                <option value="chase">Chase</option>
                                <option value="building">Building and Crafting</option>
                                <option value="platformer">Platformer</option>
                                <option value="other">Other</option>
                            </select>
                            <button id="nextStep3" style="padding: 10px 20px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">Next</button>
                        </div>

                        <div id="formStep4" class="form-step" style="display: none;">
                            <h3 style="color: #8df; margin-bottom: 15px;">Step 4: What is the setting?</h3>
                            <textarea id="settingInput" placeholder="Describe the environment..." style="width: 100%; padding: 10px; margin-bottom: 15px; background: rgba(0, 20, 40, 0.8); color: white; border: 1px solid rgba(95, 255, 255, 0.3); border-radius: 5px; min-height: 100px;"></textarea>
                            <button id="submitForm" style="padding: 10px 20px; background: ${color}; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%;">Submit</button>
                        </div>

                        <div id="formSuccess" class="form-step" style="display: none;">
                            <h3 style="color: ${color}; margin-bottom: 15px; text-align: center;">Your response has been submitted!</h3>
                            <p style="text-align: center; margin-bottom: 20px;">${win ? 'Come back in the next session to play your new adventure!' : 'Come back in the next session to play your own game!'}</p>
                            <button id="playAgainButton" style="padding: 18px 36px; background: ${color}; color: white; border: none; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%;">Play Again</button>
                        </div>
                    </div>
                `;
                
                this.gameOverContent.innerHTML = `
                    <h1 style="color: ${color}; margin-bottom: 20px; text-shadow: 0 0 15px ${color}; font-size: 2.5em;">${message}</h1>
                    <p style="margin-bottom: 30px; font-size: 1.2em; color: #fff;">You ${win ? 'completed' : 'reached'} wave ${this.game.currentWave}!</p>
                    ${statsMessage}
                    ${formHTML}
                `;

                // Show the game over screen with a fade-in effect
                this.screens.gameOver.style.display = 'flex';
                this.screens.gameOver.style.opacity = '0';
                this.screens.gameOver.style.transition = 'opacity 0.5s';
                setTimeout(() => {
                    this.screens.gameOver.style.opacity = '1';
                }, 50);

                // Add form step navigation
                const nextStep1 = document.getElementById('nextStep1');
                const nextStep2 = document.getElementById('nextStep2');
                const nextStep3 = document.getElementById('nextStep3');
                const submitForm = document.getElementById('submitForm');
                const playAgainButton = document.getElementById('playAgainButton');

                nextStep1.addEventListener('click', () => {
                    const heroInput = document.getElementById('heroInput');
                    if (heroInput.value.trim()) {
                        document.getElementById('formStep1').style.display = 'none';
                        document.getElementById('formStep2').style.display = 'block';
                    }
                });

                nextStep2.addEventListener('click', () => {
                    const villainInput = document.getElementById('villainInput');
                    if (villainInput.value.trim()) {
                        document.getElementById('formStep2').style.display = 'none';
                        document.getElementById('formStep3').style.display = 'block';
                    }
                });

                nextStep3.addEventListener('click', () => {
                    const gameTypeInput = document.getElementById('gameTypeInput');
                    if (gameTypeInput.value) {
                        document.getElementById('formStep3').style.display = 'none';
                        document.getElementById('formStep4').style.display = 'block';
                    }
                });

                submitForm.addEventListener('click', () => {
                    const heroInput = document.getElementById('heroInput');
                    const villainInput = document.getElementById('villainInput');
                    const gameTypeInput = document.getElementById('gameTypeInput');
                    const settingInput = document.getElementById('settingInput');

                    if (heroInput.value.trim() && villainInput.value.trim() && gameTypeInput.value && settingInput.value.trim()) {
                        // Save form submission
                        const formData = {
                            hero: heroInput.value.trim(),
                            villain: villainInput.value.trim(),
                            gameType: gameTypeInput.value,
                            setting: settingInput.value.trim(),
                            scenario: win ? 'victory' : 'defeat',
                            wave: this.game.currentWave
                        };

                        // Use the saveFormSubmission function from supabase.js
                        if (window.GameData && window.GameData.saveFormSubmission) {
                            window.GameData.saveFormSubmission(formData);
                        }

                        // Show success message
                        document.getElementById('formStep4').style.display = 'none';
                        document.getElementById('formSuccess').style.display = 'block';
                    }
                });

                // Add click handler for play again button
                if (playAgainButton) {
                    playAgainButton.addEventListener('click', () => {
                        // Play button sound if available
                        if (this.game.audioManager) {
                            this.game.audioManager.playButton();
                        }
                        
                        // Fade out effect
                        this.screens.gameOver.style.opacity = '0';
                        setTimeout(() => {
                            // Hide game over screen
                            this.screens.gameOver.style.display = 'none';
                            
                            // Reset game state
                            this.game.resetGame();
                            
                            // Show start screen
                            this.showStartScreen();
                        }, 500);
                    });
                }
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
