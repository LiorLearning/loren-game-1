class StoreUI {
    constructor(game) {
        this.game = game;
        this.storeContent = document.getElementById('store-content');
        this.characters = [
            {
                id: 'Duke',
                name: 'Duke',
                description: 'Starting unit with balanced stats',
                wave: 1
            },
            {
                id: 'Turret',
                name: 'Turret',
                description: 'Stationary unit with high damage',
                wave: 2
            },
            {
                id: 'Tank',
                name: 'Tank',
                description: 'Heavy unit with high health',
                wave: 3
            },
            {
                id: 'Mech',
                name: 'Mech',
                description: 'Advanced unit with high power',
                wave: 4
            }
        ];
        this.upgrades = [
            {
                id: 'damage',
                name: 'Damage Upgrade',
                description: 'Increases damage of all units',
                cost: 50,
                maxLevel: 3
            },
            {
                id: 'health',
                name: 'Health Upgrade',
                description: 'Increases health of all units',
                cost: 50,
                maxLevel: 3
            }
        ];
    }

    updateStoreUI() {
        // Clear existing content
        this.storeContent.innerHTML = '';
        
        // Add characters section
        const charactersSection = document.createElement('div');
        charactersSection.className = 'store-section';
        charactersSection.innerHTML = '<h3>Characters</h3>';
        
        // Get current wave from game
        const currentWave = this.game.currentWave;
        
        // Filter characters based on wave and unlock status
        const availableCharacters = this.characters.filter(char => 
            char.wave <= currentWave && !this.game.unlockedCharacters.includes(char.id)
        );
        
        if (availableCharacters.length === 0) {
            charactersSection.innerHTML += '<p>No new characters available</p>';
        } else {
            availableCharacters.forEach(char => {
                const charElement = document.createElement('div');
                charElement.className = 'store-item';
                charElement.innerHTML = `
                    <div class="item-info">
                        <h4>${char.name}</h4>
                        <p>${char.description}</p>
                        <p>Wave Required: ${char.wave}</p>
                    </div>
                    <div class="item-actions">
                        <button class="unlock-btn" data-id="${char.id}">
                            Unlock (100 DP)
                        </button>
                    </div>
                `;
                charactersSection.appendChild(charElement);
            });
        }
        
        this.storeContent.appendChild(charactersSection);
        
        // Add upgrades section
        const upgradesSection = document.createElement('div');
        upgradesSection.className = 'store-section';
        upgradesSection.innerHTML = '<h3>Upgrades</h3>';
        
        this.upgrades.forEach(upgrade => {
            const upgradeElement = document.createElement('div');
            upgradeElement.className = 'store-item';
            const isUnlocked = this.game.unlockedUpgrades.includes(upgrade.id);
            const isMaxLevel = isUnlocked && this.game.upgradeLevels[upgrade.id] >= upgrade.maxLevel;
            
            upgradeElement.innerHTML = `
                <div class="item-info">
                    <h4>${upgrade.name}</h4>
                    <p>${upgrade.description}</p>
                    <p>Level: ${isUnlocked ? this.game.upgradeLevels[upgrade.id] : 0}/${upgrade.maxLevel}</p>
                </div>
                <div class="item-actions">
                    <button class="${isUnlocked ? 'upgrade-btn' : 'unlock-btn'}" data-id="${upgrade.id}" ${isMaxLevel ? 'disabled' : ''}>
                        ${isUnlocked ? `Upgrade (${upgrade.cost} DP)` : 'Unlock (100 DP)'}
                    </button>
                </div>
            `;
            upgradesSection.appendChild(upgradeElement);
        });
        
        this.storeContent.appendChild(upgradesSection);
        
        // Add event listeners
        this.addStoreEventListeners();
    }

    addStoreEventListeners() {
        // Add event listeners for unlock buttons
        this.storeContent.querySelectorAll('.unlock-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const item = [...this.characters, ...this.upgrades].find(item => item.id === id);
                if (item && this.game.deploymentPoints >= 100) {
                    this.game.unlockItem(id);
                    this.updateStoreUI();
                }
            });
        });

        // Add event listeners for upgrade buttons
        this.storeContent.querySelectorAll('.upgrade-btn').forEach(button => {
            button.addEventListener('click', () => {
                const id = button.dataset.id;
                const upgrade = this.upgrades.find(u => u.id === id);
                if (upgrade && this.game.deploymentPoints >= upgrade.cost) {
                    this.game.upgradeItem(id);
                    this.updateStoreUI();
                }
            });
        });
    }
} 