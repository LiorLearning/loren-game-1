import * as THREE from 'three';
import { Game } from './game.js';
import { AudioManager } from './audio.js';
// Get the render target
var renderDiv = document.getElementById('renderDiv');
// Initialize the game with the render target
var game = new Game(renderDiv);
// Initialize audio manager
game.audioManager = new AudioManager(game);
// Start the game
game.start();

// --- Ensure audio context resumes and bg music plays on first user interaction ---
window.addEventListener('pointerdown', () => {
  try {
    if (THREE && THREE.AudioContext && THREE.AudioContext.prototype.state === 'suspended') {
      THREE.AudioContext.prototype.resume();
      console.log('[AUDIO DEBUG] Resumed THREE.AudioContext');
    }
    if (game.audioManager && game.audioManager.bgMusic && !game.audioManager.bgMusic.isPlaying) {
      game.audioManager.bgMusic.play();
      console.log('[AUDIO DEBUG] Forced bgMusic play on user interaction');
    }
  } catch (e) {
    console.warn('[AUDIO DEBUG] Error resuming audio context or playing music:', e);
  }
}, { once: true });
