import * as THREE from 'three';
import { Game } from './game.js';
import { AudioManager } from './audio.js';

// Create a loader screen elements
const loaderScreen = document.createElement('div');
loaderScreen.id = 'loaderScreen';
loaderScreen.style.position = 'fixed';
loaderScreen.style.top = '0';
loaderScreen.style.left = '0';
loaderScreen.style.width = '100vw';
loaderScreen.style.height = '100vh';
loaderScreen.style.backgroundColor = 'rgba(0, 25, 50, 0.95)';
loaderScreen.style.display = 'flex';
loaderScreen.style.flexDirection = 'column';
loaderScreen.style.alignItems = 'center';
loaderScreen.style.justifyContent = 'center';
loaderScreen.style.zIndex = '9999';

// Add loading text
const loadingText = document.createElement('h2');
loadingText.textContent = 'Loading Game...';
loadingText.style.color = '#5ff';
loadingText.style.fontFamily = 'Arial, sans-serif';
loadingText.style.marginBottom = '30px';
loadingText.style.textShadow = '0 0 10px #0ff';

// Add loading bar container
const loadingBarContainer = document.createElement('div');
loadingBarContainer.style.width = '300px';
loadingBarContainer.style.height = '20px';
loadingBarContainer.style.border = '2px solid #5ff';
loadingBarContainer.style.borderRadius = '10px';
loadingBarContainer.style.overflow = 'hidden';

// Add loading bar progress
const loadingBarProgress = document.createElement('div');
loadingBarProgress.style.width = '0%';
loadingBarProgress.style.height = '100%';
loadingBarProgress.style.backgroundColor = '#5ff';
loadingBarProgress.style.transition = 'width 0.3s ease-out';

// Add elements to the DOM
loadingBarContainer.appendChild(loadingBarProgress);
loaderScreen.appendChild(loadingText);
loaderScreen.appendChild(loadingBarContainer);
document.body.appendChild(loaderScreen);

// Preload all game assets
function preloadAssets() {
  return new Promise((resolve) => {
    const textureLoader = new THREE.TextureLoader();
    const assets = [
      './assets/background.png',
      './assets/background2.png',
      './assets/Duke.png',
      './assets/tank.png',
      './assets/mech.png',
      './assets/turret.png',
      './assets/enemy-ship.png',
      './assets/kraken.png',
      './assets/base1.png',
      './assets/base2.png',
      './assets/base3.png',
      './assets/base4.png'
    ];
    
    let loadedCount = 0;
    let errorCount = 0;
    const totalAssets = assets.length;
    
    const updateProgress = () => {
      const progress = (loadedCount / totalAssets) * 100;
      loadingBarProgress.style.width = `${progress}%`;
      
      // If all assets are processed (either loaded or errored)
      if (loadedCount + errorCount === totalAssets) {
        // Show warning if any assets failed to load
        if (errorCount > 0) {
          console.warn(`${errorCount} assets failed to load. Game may have missing textures.`);
          loadingText.textContent = 'Some assets failed to load. The game will try to continue...';
          loadingText.style.color = '#ffaa33';
          
          // Give user a chance to see the warning
          setTimeout(() => {
            loaderScreen.style.opacity = '0';
            loaderScreen.style.transition = 'opacity 0.5s ease-out';
            
            setTimeout(() => {
              loaderScreen.style.display = 'none';
              resolve();
            }, 500);
          }, 1500);
        } else {
          // All loaded successfully
          setTimeout(() => {
            loaderScreen.style.opacity = '0';
            loaderScreen.style.transition = 'opacity 0.5s ease-out';
            
            setTimeout(() => {
              loaderScreen.style.display = 'none';
              resolve();
            }, 500);
          }, 300);
        }
      }
    };
    
    assets.forEach(assetPath => {
      textureLoader.load(
        assetPath,
        // Handle successful loading
        () => {
          loadedCount++;
          updateProgress();
        },
        // Handle loading progress
        undefined,
        // Handle loading error
        (error) => {
          console.error('Error loading texture:', assetPath, error);
          errorCount++;
          updateProgress();
        }
      );
    });
  });
}

// Start the game after assets are loaded
async function initGame() {
  await preloadAssets();
  
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
}

// Initialize the game
initGame();
