(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM TRANSFORMER V11.4-OVERLAY_FIX]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    const customCss = `
        #assignment_list_results { /* Original container might be hidden or ignored now */ }

        .wm-transformer-overlay {
            position: fixed;
            /* Initial size: Full width, significant height, centered a bit */
            top: 20px; /* Adjust as needed */
            left: 1%;  /* Adjust as needed */
            width: 98%; /* Full width with small margin */
            height: calc(100vh - 40px); /* Full height minus top/bottom margins */
            max-width: none; /* Allow full width */
            max-height: none;/* Allow full height */
            background-color: #f8f9fa;
            border: 1px solid #ccc;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            z-index: 9998;
            display: none; /* Initially hidden until content is ready */
            flex-direction: column;
            border-radius: 8px;
            overflow: hidden;
            box-sizing: border-box;
        }
        .wm-transformer-overlay.minimized {
            height: 40px !important; /* Height of header */
            width: 280px !important; /* Slightly wider for title */
            bottom: 0; /* Stick to bottom when minimized */
            top: auto;
            left: 20px;
            overflow: hidden;
        }
        .wm-transformer-overlay.minimized .overlay-content { display: none; }
        .wm-transformer-overlay.minimized .overlay-resize-handle { display: none; }

        .wm-transformer-overlay.maximized-true { /* State for maximized */
            top: 5px !important;
            left: 5px !important;
            width: calc(100vw - 10px) !important;
            height: calc(100vh - 10px) !important;
            border-radius: 0;
        }


        .overlay-header { /* ... same styling ... */ }
        .overlay-controls button { /* ... same styling ... */ }
        .overlay-content { /* ... same styling ... */ }
        .overlay-resize-handle { /* ... same styling ... */ }

        /* Tech Modal (same as V10/V11) */
        .tech-modal-overlay { /* ... */ }
        .tech-modal-content { /* ... */ }
        /* ... (Rest of your existing table and modal CSS) ... */
    `;

    // ... (addStylesGlobal, modifyPageSizeSelectGlobal - same as V11.3) ...
    function addStylesGlobal(cssString, prefix) { const styleElement = document.createElement('style'); styleElement.id = 'customAssignmentsTableStyles'; if (document.getElementById(styleElement.id)) { return; } styleElement.textContent = cssString; document.head.appendChild(styleElement); console.log(`${prefix} Custom styles injected successfully.`); }
    function modifyPageSizeSelectGlobal(prefix) { const pageSizeSelect = document.getElementById('assignment_list_size'); if (pageSizeSelect) { console.log(`${prefix} Modifying #assignment_list_size select.`); const currentSelectedValue = pageSizeSelect.value; pageSizeSelect.innerHTML = ''; let isCurrentSelectedStillAvailable = false; for (let i = 100; i <= 1000; i += 50) { const option = document.createElement('option'); option.value = i; option.textContent = i; if (String(i) === currentSelectedValue) { option.selected = true; isCurrentSelectedStillAvailable = true; } pageSizeSelect.appendChild(option); } if (!isCurrentSelectedStillAvailable && pageSizeSelect.options.length > 0) { /* Potentially select first */ } console.log(`${prefix} #assignment_list_size select modified.`); } else { console.warn(`${prefix} Warning: Select element #assignment_list_size not found.`); } }


class WorkMarketTransformer {
    constructor() {
        this.SCRIPT_PREFIX = SCRIPT_PREFIX;
        console.log(`${this.SCRIPT_PREFIX} Initializing WorkMarketTransformer...`);
        this.originalResultsContainerSource = document.getElementById('assignment_list_results');
        this.tableData = [];
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.activeTableHeaders = [];
        this.currentAssignmentTechsData = {};
        this.currentModalAssignmentId = null;
        this.currentModalTechIndex = -1;
        this.assignmentItemSelector = '.results-row.work';
        this.transformationInitialized = false;
        this.observer = null;
        this.mainOverlay = null;
        this.mainOverlayContentTarget = null;
        this.isDraggingOverlay = false; this.isResizingOverlay = false;
        this.overlayDragStartX = 0; this.overlayDragStartY = 0;
        this.overlayOriginalWidth = 0; this.overlayOriginalHeight = 0;
        this.overlayIsMaximized = false; // Track maximize state
        this.overlayPreMaximizeDimensions = {}; // Store dimensions before maximizing

        this.doDragOverlayBound = this.doDragOverlay.bind(this);
        this.stopDragOverlayBound = this.stopDragOverlay.bind(this);
        this.doResizeOverlayBound = this.doResizeOverlay.bind(this);
        this.stopResizeOverlayBound = this.stopResizeOverlay.bind(this);
        this.techModalIsDragging = false; this.techModalDragStartX = 0; this.techModalDragStartY = 0;
        this.doDragTechModalBound = this.doDragTechModal.bind(this);
        this.stopDragTechModalBound = this.stopDragTechModal.bind(this);

        if (!this.originalResultsContainerSource) {
            console.error(`${this.SCRIPT_PREFIX} CRITICAL ERROR: Source container #assignment_list_results not found. Aborting.`);
            return;
        }
        this.createMainOverlay();
        this.createTechModal();
        console.log(`${this.SCRIPT_PREFIX} Constructor finished. Setting up content observer/poller...`);
        this.waitForAssignmentsAndInitialize();
    }

    // ... (parseFullDateToParts, parseLocationString, fetchWorkerData, calculateOverallScore, extractAssignmentsData - ALL SAME AS V10/V11) ...
    // ... (renderTable, handleSort, sortData, updateSortIndicators - ALL SAME AS V10/V11) ...
    // ... (createMainOverlay, drag/resize methods for main overlay - SAME AS V11, but toggleMaximizeOverlay is improved) ...
    // ... (createTechModal, drag methods for tech modal - SAME AS V11) ...
    // ... (showPrevTech, showNextTech, closeModal, formatValue - SAME AS V10/V11) ...
    // ... (waitForAssignmentsAndInitialize, attemptFallbackInitializationPolling - SAME AS V10.MO_DEBUG_FULL) ...
    // ... (initializeTransformationSequence - SAME AS V10.MO_DEBUG_FULL, targets this.mainOverlayContentTarget) ...

    // For brevity, only showing the changed showTechDetailsModal and toggleMaximizeOverlay
    // Ensure ALL other methods are copied from V11.3-IMMEDIATE_FULL or V10.MO_DEBUG_FULL where they were complete.

    toggleMaximizeOverlay() {
        if (!this.mainOverlay) return;
        if (this.mainOverlay.classList.contains('maximized-true')) {
            this.mainOverlay.classList.remove('maximized-true');
            this.mainOverlay.style.width = this.overlayPreMaximizeDimensions.width || '98%';
            this.mainOverlay.style.height = this.overlayPreMaximizeDimensions.height || 'calc(100vh - 40px)';
            this.mainOverlay.style.top = this.overlayPreMaximizeDimensions.top || '20px';
            this.mainOverlay.style.left = this.overlayPreMaximizeDimensions.left || '1%';
            this.overlayIsMaximized = false;
        } else {
            this.overlayPreMaximizeDimensions = {
                width: this.mainOverlay.style.width,
                height: this.mainOverlay.style.height,
                top: this.mainOverlay.style.top,
                left: this.mainOverlay.style.left,
            };
            this.mainOverlay.classList.add('maximized-true');
            // CSS will handle the maximized dimensions via .maximized-true class
            this.overlayIsMaximized = true;
        }
    }


    showTechDetailsModal(techFullDataWithScores, assignmentIdForModal, techIndexInAssignment) {
        this.currentModalAssignmentId = assignmentIdForModal;
        this.currentModalTechIndex = techIndexInAssignment;
        const techRawData = techFullDataWithScores;

        console.log(`${this.SCRIPT_PREFIX} Showing modal for tech (Assign: ${assignmentIdForModal}, Index: ${techIndexInAssignment}):`, techRawData.company_name || techRawData.name);

        let modalOverlay = document.getElementById('techDetailModalOverlay');
        if (!modalOverlay) { this.createTechModal(); modalOverlay = document.getElementById('techDetailModalOverlay'); }
        if (!modalOverlay) { console.error("Failed to get modal overlay in showTechDetailsModal"); return; }

        const modalScoreDisplay = modalOverlay.querySelector('#techModalScoreDisplay');
        const detailsGrid = modalOverlay.querySelector('#techModalDetailsGrid');
        detailsGrid.innerHTML = '';

        if (techRawData.OverallScore !== undefined) {
            modalScoreDisplay.innerHTML = `Overall Score: ${techRawData.OverallScore}
                <span style="font-size:0.8em; display:block;">
                (Cost: ${techRawData.CostScore}, Dist: ${techRawData.DistanceScore}, Stats: ${techRawData.StatsScore})
                </span>
                <span style="font-size:0.7em; display:block; color: #6c757d;">
                CPS: ${techRawData.CPS_Final}, IPS: ${techRawData.IPS}
                </span>`;
            modalScoreDisplay.style.display = 'block';
        } else {
            modalScoreDisplay.style.display = 'none';
        }

        const prevBtn = modalOverlay.querySelector('#prevTechBtn'); const nextBtn = modalOverlay.querySelector('#nextTechBtn'); const counter = modalOverlay.querySelector('#techCounter');
        const techsForCurrentAssignment = this.currentAssignmentTechsData[assignmentIdForModal] || [];
        prevBtn.disabled = techIndexInAssignment <= 0; nextBtn.disabled = techIndexInAssignment >= techsForCurrentAssignment.length - 1;
        counter.textContent = `${techIndexInAssignment + 1} of ${techsForCurrentAssignment.length}`;

        // Moved priorityFields here
        const priorityFields = [
            { key: 'user_uuid', label: 'User Profile' }, { key: 'name', label: 'Contact Name' },
            { key: 'company_name', label: 'Company' }, { key: 'email', label: 'Email' },
            { key: 'work_phone', label: 'Work Phone' }, { key: 'mobile_phone', label: 'Mobile Phone' },
            { key: 'address', label: 'Address' }, { key: 'distance', label: 'Distance' },
            { key: 'status', label: 'Invitation Status' }, { key: 'sent_on', label: 'Sent On' },
            { key: 'declined_on', label: 'Declined On' }, { key: 'question_pending', label: 'Question Pending?' },
            { key: 'has_negotiation', label: 'Has Negotiation?' }, { key: 'schedule_conflict', label: 'Schedule Conflict?' }
        ];

        const renderKeyValuePair = (key, value, parentEl, isNested = false) => {
            const formattedValue = this.formatValue(value, key);
            // Only skip if value is literally 'N/A' from formatValue, or for certain keys if value is empty string
            if (formattedValue === 'N/A' && !(key === 'declined_on' && value === '')) return;


            const dt = document.createElement('dt');
            dt.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ':';
            if (isNested) dt.style.paddingLeft = '15px';

            const dd = document.createElement('dd');
            if (key === 'user_uuid') { dd.innerHTML = `<a href="https://www.workmarket.com/new-profile/${value}" target="_blank">${value}</a>`; }
            else if (key === 'email' && value) { const currentAssignment = this.tableData.find(a => a.assignmentId === this.currentModalAssignmentId); const subject = encodeURIComponent(`Question regarding WO: ${currentAssignment?.title || this.currentModalAssignmentId || 'Assignment'}`); dd.innerHTML = `<a href="mailto:${value}?subject=${subject}&body=I have a question:">${value}</a>`; }
            else if ((key === 'work_phone' || key === 'mobile_phone') && value) { dd.innerHTML = `<a href="tel:${String(value).replace(/\D/g,'')}">${value}</a>`; }
            else if (key === 'address' && value) { dd.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${value}</a>`; }
            else { dd.textContent = formattedValue; }
            parentEl.appendChild(dt); parentEl.appendChild(dd);
        };

        const renderSection = (title, dataObject, parentEl, isNestedForChildren = false) => {
            if (!dataObject || Object.keys(dataObject).length === 0) return;
            const headerDt = document.createElement('dt');
            headerDt.className = title.includes('Pricing') || title.includes('Rating') ? 'sub-section-dt' : 'section-header-dt'; // Use sub-section for Pricing inside Negotiation
            headerDt.textContent = title;
            parentEl.appendChild(headerDt);

            for (const key in dataObject) {
                if (dataObject.hasOwnProperty(key)) {
                    if ((title.includes('Scorecard')) && typeof dataObject[key] === 'object' && dataObject[key] !== null && dataObject[key].hasOwnProperty('all')) {
                         renderKeyValuePair(key, dataObject[key].all, parentEl, true);
                    } else if (title.includes('Pricing') || title === 'Negotiation Details') { // Render direct key-values for Pricing and Negotiation
                        renderKeyValuePair(key, dataObject[key], parentEl, true);
                    }
                    // Add more specific handling if other sections have deeply nested objects
                }
            }
        };

        // Render priority fields first
        priorityFields.forEach(pf => {
            if (techRawData.hasOwnProperty(pf.key)) {
                renderKeyValuePair(pf.key, techRawData[pf.key], detailsGrid, false);
            }
        });

        // Render Negotiation details if present
        if (techRawData.has_negotiation && techRawData.negotiation) {
            const negHeaderDt = document.createElement('dt');
            negHeaderDt.className = 'section-header-dt';
            negHeaderDt.textContent = 'Negotiation Details';
            detailsGrid.appendChild(negHeaderDt);

            // Render direct properties of negotiation object, explicitly excluding 'pricing' here as it's handled next
            for (const negKey in techRawData.negotiation) {
                if (techRawData.negotiation.hasOwnProperty(negKey) && negKey !== 'pricing') {
                    renderKeyValuePair(negKey, techRawData.negotiation[negKey], detailsGrid, true);
                }
            }
            // Then render pricing if it exists as a sub-section
            if (techRawData.negotiation.pricing) {
                renderSection('Pricing', techRawData.negotiation.pricing, detailsGrid, true);
            }
        }

        // Render Scorecards
        if (techRawData.resource_scorecard_for_company && techRawData.resource_scorecard_for_company.values) {
            renderSection('Scorecard (For Your Company)', techRawData.resource_scorecard_for_company.values, detailsGrid);
        }
        if (techRawData.resource_scorecard && techRawData.resource_scorecard.values) {
            renderSection('Scorecard (Overall Platform)', techRawData.resource_scorecard.values, detailsGrid);
        }

        // Render any other top-level properties not yet covered
        const renderedKeys = new Set(priorityFields.map(pf => pf.key));
        renderedKeys.add('has_negotiation'); // Already handled conceptually
        renderedKeys.add('negotiation');     // Handled above
        renderedKeys.add('resource_scorecard_for_company'); // Handled above
        renderedKeys.add('resource_scorecard');             // Handled above
        // Add score keys as they are displayed separately
        ['OverallScore', 'CostScore', 'DistanceScore', 'StatsScore', 'CPS_Final', 'IPS', 'assignmentId', 'raw_worker_data', 'user_id', 'user_number', 'latitude', 'longitude', 'new_user', 'rating_text', 'company_rating_text', 'lane', 'assign_to_first_to_accept', 'blocked', 'tieredPricingMetaData', 'avatar_uri', 'avatar_asset_uri', 'encrypted_id', 'valuesWithStringKey', 'labels', 'dispatcher'].forEach(k => renderedKeys.add(k));


        const otherDetailsHeader = document.createElement('dt');
        otherDetailsHeader.className = 'section-header-dt';
        otherDetailsHeader.textContent = 'Other Details';
        let hasOtherDetails = false;

        for (const key in techRawData) {
            if (techRawData.hasOwnProperty(key) && !renderedKeys.has(key)) {
                const value = techRawData[key];
                const formattedValue = this.formatValue(value,key);
                if (formattedValue !== 'N/A') {
                    if (!hasOtherDetails) {
                        detailsGrid.appendChild(otherDetailsHeader); // Add header only if there's content
                        hasOtherDetails = true;
                    }
                    renderKeyValuePair(key, value, detailsGrid, false);
                }
            }
        }
        modalOverlay.style.display = 'flex';
    }

    // ... (The rest of the methods: showPrevTech, showNextTech, closeModal, formatValue,
    //      waitForAssignmentsAndInitialize, attemptFallbackInitializationPolling, initializeTransformationSequence
    //      ARE THE SAME AS THE PREVIOUS FULL CODE (V10.MO_DEBUG_FULL / V11.3-IMMEDIATE_FULL)) ...
} // End of WorkMarketTransformer class


// --- Script Entry Point ---
try {
    if (typeof window.WorkMarketTransformerInstance !== 'undefined' && window.WorkMarketTransformerInstance !== null) {
        console.log(`${SCRIPT_PREFIX} Instance already exists. Not re-initializing.`);
    } else {
        if (document.getElementById('assignment_list_results') && (window.location.href.includes('/assignments') || window.location.href.includes('/workorders'))) {
            addStylesGlobal(customCss, SCRIPT_PREFIX);
            modifyPageSizeSelectGlobal(SCRIPT_PREFIX);
            console.log(`${SCRIPT_PREFIX} Conditions met. Creating new WorkMarketTransformer instance.`);
            window.WorkMarketTransformerInstance = new WorkMarketTransformer();
        } else {
            console.log(`${SCRIPT_PREFIX} Not on a recognized assignments page or #assignment_list_results not found. Script will not run.`);
        }
    }
} catch (e) {
    console.error(`${SCRIPT_PREFIX} CRITICAL ERROR DURING SCRIPT EXECUTION:`, e);
}

})();
