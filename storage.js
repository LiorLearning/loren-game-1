export class GameStorage {
    static STORAGE_KEY = 'loren_game_state';

    static saveGameState(game) {
        const gameState = {
            unlockedUnits: Array.from(game.unlockedUnits),
            deploymentPoints: game.deploymentPoints,
            currentWave: game.currentWave,
            selectedUnit: game.selectedUnit,
            baseLevel: game.base ? game.base.baseLevel : 1,
            isStage2: game.selectedUnit === 'Ship'
        };

        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(gameState));
            console.log('[DEBUG] Game state saved:', gameState);
        } catch (error) {
            console.error('[ERROR] Failed to save game state:', error);
        }
    }

    static loadGameState() {
        try {
            const savedState = localStorage.getItem(this.STORAGE_KEY);
            if (savedState) {
                const gameState = JSON.parse(savedState);
                console.log('[DEBUG] Game state loaded:', gameState);
                return gameState;
            }
        } catch (error) {
            console.error('[ERROR] Failed to load game state:', error);
        }
        return null;
    }

    static resetGameState() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            console.log('[DEBUG] Game state reset');
        } catch (error) {
            console.error('[ERROR] Failed to reset game state:', error);
        }
    }

    static isFirstTimePlayer() {
        return !localStorage.getItem(this.STORAGE_KEY);
    }
} 