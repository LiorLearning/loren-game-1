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
export var MathProblem = /*#__PURE__*/ function() {
    "use strict";
    function MathProblem(game) {
        _class_call_check(this, MathProblem);
        this.game = game;
        this.currentProblem = null;
        this.currentAnswer = null;
        this.isActive = false;
        this.uiElements = {
            problem: null,
            answer: null,
            result: null,
            screen: null
        };
    }
    _create_class(MathProblem, [
        {
            key: "init",
            value: function init() {
                this.cacheUIElements();
                this.setupEventListeners();
            }
        },
        {
            key: "cacheUIElements",
            value: function cacheUIElements() {
                this.uiElements.problem = document.getElementById('mathProblem');
                this.uiElements.answer = document.getElementById('mathAnswer');
                this.uiElements.result = document.getElementById('mathResult');
                this.uiElements.screen = this.game.gameUI.screens.mathProblem;
            }
        },
        {
            key: "setupEventListeners",
            value: function setupEventListeners() {
                var _this = this;
                if (this.uiElements.answer) {
                    this.uiElements.answer.addEventListener('keydown', function(e) {
                        if (e.key === 'Enter') {
                            _this.checkAnswer(_this.uiElements.answer.value);
                        }
                    });
                }
            }
        },
        {
            key: "showProblem",
            value: function showProblem() {
                if (!this.validateGameState()) return;
                this.generateProblem();
                this.updateUI();
                this.activateScreen();
            }
        },
        {
            key: "validateGameState",
            value: function validateGameState() {
                return this.game && this.game.activeUnit && this.uiElements.problem && this.uiElements.answer && this.uiElements.result && this.uiElements.screen;
            }
        },
        {
            key: "generateProblem",
            value: function generateProblem() {
                // Generate single-digit multiplication problem (1x1 digit)
                var num1 = Math.floor(Math.random() * 9) + 1; // 1-9
                var num2 = Math.floor(Math.random() * 9) + 1; // 1-9
                
                this.currentProblem = "".concat(num1, " \xd7 ").concat(num2, " = ?");
                this.currentAnswer = num1 * num2;
            }
        },
        {
            key: "updateUI",
            value: function updateUI() {
                this.uiElements.problem.textContent = this.currentProblem;
                this.uiElements.answer.value = '';
                this.uiElements.result.textContent = '';
            }
        },
        {
            key: "activateScreen",
            value: function activateScreen() {
                var _this = this;
                this.game.isPaused = true;
                this.uiElements.screen.style.display = 'flex';
                setTimeout(function() {
                    return _this.uiElements.answer.focus();
                }, 100);
                this.isActive = true;
            }
        },
        {
            key: "checkAnswer",
            value: function checkAnswer(answer) {
                if (!this.isActive) return;
                var parsedAnswer = parseInt(answer);
                if (isNaN(parsedAnswer)) {
                    this.showError('Please enter a valid number');
                    return;
                }
                if (parsedAnswer === this.currentAnswer) {
                    this.handleCorrectAnswer();
                } else {
                    this.handleIncorrectAnswer();
                }
            }
        },
        {
            key: "handleCorrectAnswer",
            value: function handleCorrectAnswer() {
                console.log('[DEBUG] MathProblem: Awarding 10 DP for correct answer. Current DP before:', this.game.deploymentPoints);
                this.uiElements.result.textContent = 'Correct! +10 DP, +3 Ammo';
                this.uiElements.result.style.color = '#5ff';
                this.game.addDeploymentPoints(10);
                console.log('[DEBUG] MathProblem: Current DP after:', this.game.deploymentPoints);
                this.game.activeUnit.addAmmo(3);
                
                // Play correct answer sound
                if (this.game.audioManager) {
                    this.game.audioManager.playMathCorrect();
                }
                
                // Show visual effect for ammo added
                if (this.game.enemyManager) {
                    const playerPosition = this.game.activeUnit.position.clone();
                    this.game.enemyManager.showAmmoCollectedEffect(playerPosition);
                }
                
                this.deactivateScreen(1000);
            }
        },
        {
            key: "handleIncorrectAnswer",
            value: function handleIncorrectAnswer() {
                this.showError('Incorrect, try again!');
                
                // Play wrong answer sound
                if (this.game.audioManager) {
                    this.game.audioManager.playMathWrong();
                }
                
                this.clearInput();
            }
        },
        {
            key: "showError",
            value: function showError(message) {
                this.uiElements.result.textContent = message;
                this.uiElements.result.style.color = '#f55';
            }
        },
        {
            key: "clearInput",
            value: function clearInput() {
                var _this = this;
                this.uiElements.answer.value = '';
                setTimeout(function() {
                    return _this.uiElements.answer.focus();
                }, 100);
            }
        },
        {
            key: "deactivateScreen",
            value: function deactivateScreen() {
                var _this = this;
                var delay = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
                setTimeout(function() {
                    _this.game.isPaused = false;
                    _this.uiElements.screen.style.display = 'none';
                    _this.isActive = false;
                }, delay);
            }
        }
    ]);
    return MathProblem;
}();
