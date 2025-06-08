// main.js
import { customCss } from './css.js';
import { addStylesOnce, modifyPageSizeSelectOnce } from './utils.js';
import { WorkMarketTransformer } from './workMarketTransformer.js';

(function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM TRANSFORMER V12.MODULAR]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    try {
        if (typeof window.WorkMarketTransformerInstance !== 'undefined' && window.WorkMarketTransformerInstance !== null) {
            console.log(`${SCRIPT_PREFIX} Instance already exists. Not re-initializing.`);
        } else {
            if (document.getElementById('assignment_list_results') &&
                (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {

                // Call global setup functions ONCE
                addStylesOnce(customCss, SCRIPT_PREFIX);
                modifyPageSizeSelectOnce(SCRIPT_PREFIX);

                console.log(`${SCRIPT_PREFIX} Global setup complete. Creating new WorkMarketTransformer instance.`);
                window.WorkMarketTransformerInstance = new WorkMarketTransformer(SCRIPT_PREFIX); // Pass prefix
            } else {
                console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
            }
        }
    } catch (e) {
        console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
    }
})();
