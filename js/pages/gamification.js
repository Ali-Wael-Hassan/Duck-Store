import { StorageManager } from 'core/StorageManager.js';

export class GamificationAdmin {
    constructor() {
        this.configKey = 'gamification-config';
        this.defaults = {
            loginPoints: 10,
            reviewBase: 25,
            reviewBonus: 50,
            reviewMinChar: 100,
            purchaseRate: 2,
            purchaseMax: 500
        };

        this.form = document.querySelector('#config-points form');
        this.updateBtn = document.getElementById('update-points');
        this.resetBtn = document.getElementById('reset-points');

        this.inputMap = {
            loginPoints: this.form.querySelectorAll('input[type="number"]')[0],
            reviewBase: this.form.querySelectorAll('input[type="number"]')[1],
            reviewBonus: this.form.querySelectorAll('input[type="number"]')[2],
            reviewMinChar: this.form.querySelectorAll('input[type="number"]')[3],
            purchaseRate: this.form.querySelectorAll('input[type="number"]')[4],
            purchaseMax: this.form.querySelectorAll('input[type="number"]')[5]
        };

        this.init();
    }

    init() {
        this.loadConfiguration();
        this.setupEventListeners();
    }

    loadConfiguration() {
        const savedData = StorageManager.get(this.configKey);

        console.log("Loading Config:", savedData);

        const configToUse = savedData ? savedData : this.defaults;
        this.applyConfigToUI(configToUse);
    }

    applyConfigToUI(config) {
        Object.keys(this.inputMap).forEach(key => {
            const element = this.inputMap[key];
            if (!element) return;
            element.value = config[key] !== undefined ? config[key] : this.defaults[key];

        });
    }

    saveConfiguration() {
        const newConfig = {};
        Object.keys(this.inputMap).forEach(key => {
            const element = this.inputMap[key];
            newConfig[key] = parseFloat(element.value);
        });

        StorageManager.save(this.configKey, newConfig);
        this.showFeedback('Configuration saved!');
    }

    resetToDefaults() {
        if (confirm('Reset to defaults?')) {
            this.applyConfigToUI(this.defaults);
            StorageManager.set(this.configKey, this.defaults);
        }
    }

    setupEventListeners() {
        this.updateBtn?.addEventListener('click', () => this.saveConfiguration());
        this.resetBtn?.addEventListener('click', () => this.resetToDefaults());
    }

    showFeedback(msg) {
        const original = this.updateBtn.innerText;
        this.updateBtn.innerText = msg;
        setTimeout(() => this.updateBtn.innerText = original, 2000);
    }
}