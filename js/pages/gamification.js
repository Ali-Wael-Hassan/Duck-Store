import { StorageManager } from '../core/StorageManager.js';

export class GamificationAdmin {
    constructor() {
        this.configKey = this.configKey;
        // 1. Define hardcoded defaults
        this.defaults = {
            loginPoints: 10,
            streakBonus: 50,
            reviewBase: 25,
            reviewBonus: 50,
            reviewMinChar: 100,
            reviewLimit: 5,
            purchaseRate: 2,
            purchaseMax: 500
        };

        this.form = document.querySelector('#config-points form');
        this.updateBtn = document.getElementById('update-points');
        this.resetBtn = document.getElementById('reset-points');

        // Mapping inputs to the data keys
        this.inputMap = {
            'loginPoints': this.form.querySelectorAll('input[type="number"]')[0],
            'streakBonus': this.form.querySelectorAll('input[type="number"]')[1],
            'reviewBase': this.form.querySelectorAll('input[type="number"]')[2],
            'reviewBonus': this.form.querySelectorAll('input[type="number"]')[3],
            'reviewMinChar': this.form.querySelectorAll('input[type="number"]')[4],
            'reviewLimit': this.form.querySelectorAll('input[type="number"]')[5],
            'purchaseRate': this.form.querySelectorAll('input[type="number"]')[6],
            'purchaseMax': this.form.querySelectorAll('input[type="number"]')[7]
        };

        this.init();
    }

    init() {
        this.loadConfiguration();
        this.setupEventListeners();
        window.configManager = this;
    }

    loadConfiguration() {
        const savedData = StorageManager.get(this.configKey);

        // Debugging: Check the console (F12) to see what is being loaded
        console.log("Loading Config:", savedData);

        // If savedData exists, use it; otherwise, use defaults
        const configToUse = savedData ? savedData : this.defaults;
        this.applyConfigToUI(configToUse);
    }

    applyConfigToUI(config) {
        Object.keys(this.inputMap).forEach(key => {
            const element = this.inputMap[key];
            if (!element) return;
            // Ensure we aren't passing undefined to the value property
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