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
export var AudioManager = /*#__PURE__*/ function() {
    "use strict";
    function AudioManager(game) {
        _class_call_check(this, AudioManager);
        this.game = game;
        this.isMuted = false;
        this.audioListener = new THREE.AudioListener();
        this.audioLoader = new THREE.AudioLoader();
        this.sounds = {};
        this.bgMusic = null;
        this.bgMusicReady = false;
        this.onBgMusicReady = null;
        this.pendingPlay = false;
        this.loadingPromises = [];
        this.audioContextResumed = false;

        // Setup camera audio listener
        if (!this.game.camera) {
            console.warn('Game camera not available, creating temporary camera for audio');
            this.game.camera = new THREE.PerspectiveCamera();
        }
        this.game.camera.add(this.audioListener);
        
        // Log the initial context state
        console.log('Initial AudioContext state:', this.audioListener.context.state);
        
        // Initialize audio loading
        this.initializeAudio();
        
        // Add event listeners to resume AudioContext after user interaction
        this.setupAudioContextResume();
    }

    _create_class(AudioManager, [
        {
            key: "setupAudioContextResume",
            value: function setupAudioContextResume() {
                var _this = this;
                
                // Get the AudioContext from the listener
                const audioContext = this.audioListener.context;
                
                // Function to resume AudioContext
                const resumeAudioContext = function() {
                    if (audioContext.state === 'suspended' && !_this.audioContextResumed) {
                        audioContext.resume().then(function() {
                            console.log('AudioContext resumed successfully');
                            _this.audioContextResumed = true;
                            
                            // Play background music if it was queued and not muted
                            if (_this.bgMusicReady && _this.pendingPlay && !_this.isMuted) {
                                _this.bgMusic.play();
                                _this.pendingPlay = false;
                            }
                        }).catch(function(error) {
                            console.error('Failed to resume AudioContext:', error);
                        });
                    }
                };
                
                // Add user interaction event listeners
                const interactionEvents = ['click', 'touchstart', 'keydown', 'mousedown'];
                
                interactionEvents.forEach(function(eventType) {
                    document.addEventListener(eventType, resumeAudioContext, { once: true });
                });
                
                // Log the initial AudioContext state
                console.log('Initial AudioContext state:', audioContext.state);
            }
        },
        {
            key: "initializeAudio",
            value: function initializeAudio() {
                var _this = this;
                
                // Create a promise for background music loading
                const bgMusicPromise = new Promise((resolve, reject) => {
                    _this.bgMusic = new THREE.Audio(_this.audioListener);
                    _this.audioLoader.load('./sounds/run-130bpm-190419.mp3', 
                        function(buffer) {
                            _this.bgMusic.setBuffer(buffer);
                            _this.bgMusic.setLoop(true);
                            _this.bgMusic.setVolume(0.3);
                            _this.bgMusicReady = true;
                            console.log('Background music loaded successfully');
                            
                            // Only attempt to play if AudioContext is not suspended
                            if (_this.pendingPlay && !_this.isMuted && _this.audioListener.context.state === 'running') {
                                _this.bgMusic.play();
                                _this.pendingPlay = false;
                            } else if (_this.pendingPlay) {
                                console.log('Queuing background music to play after user interaction');
                            }
                            resolve();
                        },
                        function(xhr) {
                            console.log('Loading background music: ' + (xhr.loaded / xhr.total * 100) + '%');
                        },
                        function(error) {
                            console.error('Error loading background music:', error);
                            reject(error);
                        }
                    );
                });
                this.loadingPromises.push(bgMusicPromise);

                // Load other sound effects
                const soundEffects = {
                    attack: { file: './sounds/boost-100537.mp3', volume: 0.4 },
                    damage: { file: './sounds/bad-explosion-6855.mp3', volume: 0.4 },
                    correct: { file: './sounds/correct-98705.mp3', volume: 0.6 },
                    wrong: { file: './sounds/error-4-199275.mp3', volume: 0.6 },
                    button: { file: './sounds/button-305770.mp3', volume: 0.4 }
                };

                Object.entries(soundEffects).forEach(([name, config]) => {
                    const promise = new Promise((resolve, reject) => {
                        this.sounds[name] = new THREE.Audio(this.audioListener);
                        this.audioLoader.load(config.file,
                            function(buffer) {
                                _this.sounds[name].setBuffer(buffer);
                                _this.sounds[name].setVolume(config.volume);
                                console.log(`Sound ${name} loaded successfully`);
                                resolve();
                            },
                            function(xhr) {
                                console.log(`Loading ${name}: ${(xhr.loaded / xhr.total * 100)}%`);
                            },
                            function(error) {
                                console.error(`Error loading ${name}:`, error);
                                reject(error);
                            }
                        );
                    });
                    this.loadingPromises.push(promise);
                });

                // Wait for all sounds to load
                Promise.all(this.loadingPromises)
                    .then(() => {
                        console.log('All audio assets loaded successfully');
                        if (_this.onBgMusicReady) _this.onBgMusicReady();
                    })
                    .catch(error => {
                        console.error('Error loading audio assets:', error);
                    });
            }
        },
        {
            key: "playSound",
            value: function playSound(sound) {
                var _this = this;
                
                if (this.isMuted || !this.sounds[sound]) {
                    console.log(`[AUDIO DEBUG] Not playing sound '${sound}': muted or not loaded`);
                    return;
                }
                
                if (!this.sounds[sound].buffer) {
                    console.log(`[AUDIO DEBUG] Sound '${sound}' buffer not loaded yet`);
                    return;
                }
                
                // Safety check for audioListener
                if (!this.audioListener || !this.audioListener.context) {
                    console.error('[AUDIO DEBUG] AudioListener or context not available');
                    return;
                }
                
                // Check if AudioContext is suspended and try to resume it
                if (this.audioListener.context.state === 'suspended') {
                    console.log(`[AUDIO DEBUG] AudioContext is suspended, attempting to resume`);
                    this.audioListener.context.resume().then(function() {
                        console.log(`[AUDIO DEBUG] AudioContext resumed, now playing sound '${sound}'`);
                        _this._playSound(sound);
                    }).catch(function(error) {
                        console.error(`[AUDIO DEBUG] Failed to resume AudioContext:`, error);
                    });
                } else {
                    this._playSound(sound);
                }
            }
        },
        {
            key: "_playSound",
            value: function _playSound(sound) {
                // Internal method to actually play the sound once AudioContext is confirmed running
                if (this.sounds[sound].isPlaying) {
                    const newSound = this.sounds[sound].clone();
                    newSound.play();
                } else {
                    this.sounds[sound].play();
                }
            }
        },
        {
            key: "playAttack",
            value: function playAttack() {
                console.log('[AUDIO DEBUG] playAttack called');
                this.playSound('attack');
            }
        },
        {
            key: "playDamage",
            value: function playDamage() {
                console.log('[AUDIO DEBUG] playDamage called');
                this.playSound('damage');
            }
        },
        {
            key: "playCorrect",
            value: function playCorrect() {
                console.log('[AUDIO DEBUG] playCorrect called');
                this.playSound('correct');
            }
        },
        {
            key: "playWrong",
            value: function playWrong() {
                console.log('[AUDIO DEBUG] playWrong called');
                this.playSound('wrong');
            }
        },
        {
            key: "playButton",
            value: function playButton() {
                console.log('[AUDIO DEBUG] playButton called');
                this.playSound('button');
            }
        },
        {
            key: "playCrabAttack",
            value: function playCrabAttack() {
                console.log('[AUDIO DEBUG] playCrabAttack called');
                // Use damage sound for crab attacking the base
                this.playSound('damage');
            }
        },
        {
            key: "playPlayerHit",
            value: function playPlayerHit() {
                console.log('[AUDIO DEBUG] playPlayerHit called');
                // Use attack sound for player hitting an enemy
                this.playSound('attack');
            }
        },
        {
            key: "playMathCorrect",
            value: function playMathCorrect() {
                console.log('[AUDIO DEBUG] playMathCorrect called');
                this.playSound('correct');
            }
        },
        {
            key: "playMathWrong",
            value: function playMathWrong() {
                console.log('[AUDIO DEBUG] playMathWrong called');
                this.playSound('wrong');
            }
        },
        {
            key: "toggleMute",
            value: function toggleMute() {
                var _this = this;
                
                this.isMuted = !this.isMuted;
                console.log(`[AUDIO DEBUG] toggleMute: isMuted = ${this.isMuted}`);
                
                // Safety check for audioListener
                if (!this.audioListener || !this.audioListener.context) {
                    console.error('[AUDIO DEBUG] AudioListener or context not available');
                    return;
                }
                
                // Try to resume AudioContext if it's suspended and we're unmuting
                if (!this.isMuted && this.audioListener.context.state === 'suspended') {
                    this.audioListener.context.resume().then(function() {
                        console.log(`[AUDIO DEBUG] AudioContext resumed on unmute`);
                        if (_this.bgMusic && _this.bgMusic.buffer) {
                            _this.bgMusic.play();
                        }
                    }).catch(function(error) {
                        console.error(`[AUDIO DEBUG] Failed to resume AudioContext on unmute:`, error);
                    });
                } else if (this.bgMusic && this.bgMusic.buffer) {
                    this.isMuted ? this.bgMusic.pause() : this.bgMusic.play();
                }
                
                // Stop all playing sound effects when muted
                if (this.isMuted) {
                    Object.values(this.sounds).forEach(sound => {
                        if (sound.isPlaying) sound.stop();
                    });
                }
            }
        },
        {
            key: "toggleBackgroundMusic",
            value: function toggleBackgroundMusic(shouldPlay) {
                var _this = this;
                
                if (!this.bgMusic) return;
                
                if (!this.bgMusic.buffer) {
                    console.log('[AUDIO DEBUG] Queuing background music play state:', shouldPlay);
                    this.pendingPlay = shouldPlay;
                    return;
                }
                
                // Safety check for audioListener
                if (!this.audioListener || !this.audioListener.context) {
                    console.error('[AUDIO DEBUG] AudioListener or context not available');
                    return;
                }
                
                if (shouldPlay && !this.isMuted) {
                    // Check if AudioContext is suspended and try to resume it
                    if (this.audioListener.context.state === 'suspended') {
                        console.log('[AUDIO DEBUG] AudioContext suspended, attempting to resume before playing music');
                        this.audioListener.context.resume().then(function() {
                            console.log('[AUDIO DEBUG] AudioContext resumed, now playing background music');
                            _this.bgMusic.play();
                        }).catch(function(error) {
                            console.error('[AUDIO DEBUG] Failed to resume AudioContext for background music:', error);
                        });
                    } else {
                        console.log('[AUDIO DEBUG] Playing background music');
                        this.bgMusic.play();
                    }
                } else {
                    console.log('[AUDIO DEBUG] Pausing background music');
                    this.bgMusic.pause();
                }
            }
        }
    ]);
    return AudioManager;
}();
