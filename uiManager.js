// uiManager.js

/**
 * Manages the creation and interaction of UI overlays and modals.
 * This class will be instantiated by WorkMarketTransformer.
 */
export class UIManager {
    constructor(scriptPrefix, mainOverlayId = 'wmTransformerOverlay', techModalId = 'techDetailModalOverlay') {
        this.SCRIPT_PREFIX = scriptPrefix;
        this.mainOverlayId = mainOverlayId;
        this.techModalId = techModalId;

        this.mainOverlay = null;
        this.mainOverlayContentTarget = null; // For table rendering
        this.techModalOverlay = null;

        // Main Overlay Drag/Resize State
        this.isDraggingOverlay = false; this.isResizingOverlay = false;
        this.overlayDragStartX = 0; this.overlayDragStartY = 0;
        this.overlayOriginalWidth = 0; this.overlayOriginalHeight = 0;
        this.overlayIsMaximized = false;
        this.overlayPreMaximizeDimensions = {};

        // Tech Modal Drag State
        this.techModalIsDragging = false; this.techModalDragStartX = 0; this.techModalDragStartY = 0;

        // Bound event handlers
        this.doDragOverlayBound = this.doDragOverlay.bind(this);
        this.stopDragOverlayBound = this.stopDragOverlay.bind(this);
        this.doResizeOverlayBound = this.doResizeOverlay.bind(this);
        this.stopResizeOverlayBound = this.stopResizeOverlay.bind(this);
        this.doDragTechModalBound = this.doDragTechModal.bind(this);
        this.stopDragTechModalBound = this.stopDragTechModal.bind(this);

        this._createMainOverlay();
        this._createTechModal();
    }

    // --- Main Overlay Methods ---
    _createMainOverlay() {
        if (document.getElementById(this.mainOverlayId)) {
            this.mainOverlay = document.getElementById(this.mainOverlayId);
            this.mainOverlayContentTarget = this.mainOverlay.querySelector('.overlay-content');
            console.log(`${this.SCRIPT_PREFIX} Main overlay already exists.`);
            return;
        }
        this.mainOverlay = document.createElement('div');
        this.mainOverlay.id = this.mainOverlayId;
        this.mainOverlay.className = 'wm-transformer-overlay';
        this.mainOverlay.style.display = 'none'; // Initially hidden

        const header = document.createElement('div');
        header.className = 'overlay-header';
        header.innerHTML = `<span>WorkMarket Enhanced Assignments</span><div class="overlay-controls"><button class="overlay-minimize-btn" title="Minimize">_</button><button class="overlay-maximize-btn" title="Maximize">□</button><button class="overlay-close-btn" title="Hide">X</button></div>`;

        this.mainOverlayContentTarget = document.createElement('div');
        this.mainOverlayContentTarget.className = 'overlay-content';
        // ID for table rendering target is set by WorkMarketTransformer class for clarity.

        const resizeHandle = document.createElement('div');
        resizeHandle.className = 'overlay-resize-handle';

        this.mainOverlay.appendChild(header);
        this.mainOverlay.appendChild(this.mainOverlayContentTarget);
        this.mainOverlay.appendChild(resizeHandle);
        document.body.appendChild(this.mainOverlay);

        header.addEventListener('mousedown', this.startDragOverlay.bind(this));
        resizeHandle.addEventListener('mousedown', this.startResizeOverlay.bind(this));
        header.querySelector('.overlay-minimize-btn').addEventListener('click', () => this.mainOverlay.classList.toggle('minimized'));
        header.querySelector('.overlay-maximize-btn').addEventListener('click', () => this.toggleMaximizeOverlay());
        header.querySelector('.overlay-close-btn').addEventListener('click', () => this.hideMainOverlay());
        console.log(`${this.SCRIPT_PREFIX} Main table overlay created.`);
    }

    showMainOverlay() {
        if (this.mainOverlay) this.mainOverlay.style.display = 'flex';
    }

    hideMainOverlay() {
        if (this.mainOverlay) this.mainOverlay.style.display = 'none';
    }

    getMainOverlayContentTarget() {
        return this.mainOverlayContentTarget;
    }

    startDragOverlay(e) { if (e.target.classList.contains('overlay-controls') || e.target.closest('.overlay-controls')) return; this.isDraggingOverlay = true; if(this.mainOverlay) this.mainOverlay.style.userSelect = 'none'; this.overlayDragStartX = e.clientX - this.mainOverlay.offsetLeft; this.overlayDragStartY = e.clientY - this.mainOverlay.offsetTop; document.addEventListener('mousemove', this.doDragOverlayBound); document.addEventListener('mouseup', this.stopDragOverlayBound); }
    doDragOverlay(e) { if (!this.isDraggingOverlay || !this.mainOverlay) return; this.mainOverlay.style.left = (e.clientX - this.overlayDragStartX) + 'px'; this.mainOverlay.style.top = (e.clientY - this.overlayDragStartY) + 'px'; }
    stopDragOverlay() { this.isDraggingOverlay = false; if(this.mainOverlay) this.mainOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doDragOverlayBound); document.removeEventListener('mouseup', this.stopDragOverlayBound); }
    startResizeOverlay(e) { this.isResizingOverlay = true; if(this.mainOverlay) this.mainOverlay.style.userSelect = 'none'; this.overlayDragStartX = e.clientX; this.overlayDragStartY = e.clientY; this.overlayOriginalWidth = this.mainOverlay.offsetWidth; this.overlayOriginalHeight = this.mainOverlay.offsetHeight; document.addEventListener('mousemove', this.doResizeOverlayBound); document.addEventListener('mouseup', this.stopResizeOverlayBound); }
    doResizeOverlay(e) { if (!this.isResizingOverlay || !this.mainOverlay) return; const newWidth = this.overlayOriginalWidth + (e.clientX - this.overlayDragStartX); const newHeight = this.overlayOriginalHeight + (e.clientY - this.overlayDragStartY); this.mainOverlay.style.width = Math.max(300, newWidth) + 'px'; this.mainOverlay.style.height = Math.max(150, newHeight) + 'px'; }
    stopResizeOverlay() { this.isResizingOverlay = false; if(this.mainOverlay) this.mainOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doResizeOverlayBound); document.removeEventListener('mouseup', this.stopResizeOverlayBound); }
    toggleMaximizeOverlay() { if (!this.mainOverlay) return; if (this.mainOverlay.classList.contains('maximized-true')) { this.mainOverlay.classList.remove('maximized-true'); this.mainOverlay.style.width = this.overlayPreMaximizeDimensions.width || '98%'; this.mainOverlay.style.height = this.overlayPreMaximizeDimensions.height || 'calc(100vh - 40px)'; this.mainOverlay.style.top = this.overlayPreMaximizeDimensions.top || '20px'; this.mainOverlay.style.left = this.overlayPreMaximizeDimensions.left || '1%'; this.overlayIsMaximized = false; } else { this.overlayPreMaximizeDimensions = { width: this.mainOverlay.style.width, height: this.mainOverlay.style.height, top: this.mainOverlay.style.top, left: this.mainOverlay.style.left, }; this.mainOverlay.classList.add('maximized-true'); this.overlayIsMaximized = true; } }


    // --- Tech Details Modal Methods ---
    _createTechModal() {
        if (document.getElementById(this.techModalId)) {
            this.techModalOverlay = document.getElementById(this.techModalId);
            console.log(`${this.SCRIPT_PREFIX} Tech modal already exists.`);
            return;
        }
        this.techModalOverlay = document.createElement('div');
        this.techModalOverlay.id = this.techModalId;
        this.techModalOverlay.className = 'tech-modal-overlay';
        this.techModalOverlay.addEventListener('click', (e) => { if (e.target === this.techModalOverlay) this.closeTechModal(); });

        const modalContent = document.createElement('div');
        modalContent.className = 'tech-modal-content';
        modalContent.innerHTML = `
            <div class="tech-modal-header" id="techModalHeaderDraggable">
                <h3>Technician / Company Details</h3>
                <button type="button" class="tech-modal-close" aria-label="Close">×</button>
            </div>
            <div class="tech-modal-body">
                <div id="techModalScoreDisplay" class="overall-score-display" style="display:none;"></div>
                <div id="techModalDetailsGrid" class="tech-modal-detail-grid"></div>
            </div>
            <div class="tech-modal-footer">
                <button id="prevTechBtnModal" class="tech-modal-nav-btn">« Previous</button>
                <span id="techCounterModal" style="margin: 0 10px;"></span>
                <button id="nextTechBtnModal" class="tech-modal-nav-btn">Next »</button>
            </div>`;
        this.techModalOverlay.appendChild(modalContent);
        document.body.appendChild(this.techModalOverlay);

        modalContent.querySelector('.tech-modal-header').addEventListener('mousedown', this.startDragTechModal.bind(this));
        this.techModalOverlay.querySelector('.tech-modal-close').addEventListener('click', () => this.closeTechModal());
        this.techModalOverlay.querySelector('#prevTechBtnModal').addEventListener('click', () => this.showPrevTechInModal());
        this.techModalOverlay.querySelector('#nextTechBtnModal').addEventListener('click', () => this.showNextTechInModal());
        console.log(`${this.SCRIPT_PREFIX} Tech details modal structure created.`);
    }

    startDragTechModal(e) { if (e.target.classList.contains('tech-modal-close')) return; this.techModalIsDragging = true; const modalContent = e.currentTarget.closest('.tech-modal-content'); if (!this.techModalOverlay || !modalContent) return; this.techModalOverlay.style.userSelect = 'none'; this.techModalDragStartX = e.clientX - modalContent.offsetLeft; this.techModalDragStartY = e.clientY - modalContent.offsetTop; document.addEventListener('mousemove', this.doDragTechModalBound); document.addEventListener('mouseup', this.stopDragTechModalBound); }
    doDragTechModal(e) { if (!this.techModalIsDragging) return; const modalContent = this.techModalOverlay.querySelector('.tech-modal-content'); if (!modalContent) return; const overlayRect = this.techModalOverlay.getBoundingClientRect(); modalContent.style.left = Math.min(Math.max(0, (e.clientX - this.techModalDragStartX)), overlayRect.width - modalContent.offsetWidth) + 'px'; modalContent.style.top = Math.min(Math.max(0, (e.clientY - this.techModalDragStartY)), overlayRect.height - modalContent.offsetHeight) + 'px'; }
    stopDragTechModal() { this.techModalIsDragging = false; if(this.techModalOverlay) this.techModalOverlay.style.userSelect = ''; document.removeEventListener('mousemove', this.doDragTechModalBound); document.removeEventListener('mouseup', this.stopDragTechModalBound); }


    // These will be set by WorkMarketTransformer instance before calling showTechDetailsModal
    setCurrentTechModalNavContext(assignmentId, techIndex, showPrevCallback, showNextCallback) {
        this.currentModalAssignmentId = assignmentId;
        this.currentModalTechIndex = techIndex;
        this.showPrevTechInModal = showPrevCallback; // Callbacks from main class
        this.showNextTechInModal = showNextCallback;
    }

    displayTechModal(techRawData, assignmentTitle = 'Assignment') { // Renamed from showTechDetailsModal to avoid conflict
        console.log(`${this.SCRIPT_PREFIX} Displaying modal for tech:`, techRawData.company_name || techRawData.name);
        if (!this.techModalOverlay) this._createTechModal(); // Ensure it exists

        const modalScoreDisplay = this.techModalOverlay.querySelector('#techModalScoreDisplay');
        const detailsGrid = this.techModalOverlay.querySelector('#techModalDetailsGrid');
        detailsGrid.innerHTML = '';

        if (techRawData.OverallScore !== undefined) {
            modalScoreDisplay.innerHTML = `Overall Score: ${techRawData.OverallScore}
                <span style="font-size:0.8em; display:block;">(Cost: ${techRawData.CostScore}, Dist: ${techRawData.DistanceScore}, Stats: ${techRawData.StatsScore})</span>
                <span style="font-size:0.7em; display:block; color: #6c757d;">CPS: ${techRawData.CPS_Final}, IPS: ${techRawData.IPS}</span>`;
            modalScoreDisplay.style.display = 'block';
        } else {
            modalScoreDisplay.style.display = 'none';
        }

        // Update navigation buttons (state managed by WorkMarketTransformer class, passed via setCurrentTechModalNavContext)
        const prevBtn = this.techModalOverlay.querySelector('#prevTechBtnModal');
        const nextBtn = this.techModalOverlay.querySelector('#nextTechBtnModal');
        const counter = this.techModalOverlay.querySelector('#techCounterModal');
        const techsForCurrentAssignment = window.WorkMarketTransformerInstance?.currentAssignmentTechsData[this.currentModalAssignmentId] || []; // Access instance directly
        if (prevBtn) prevBtn.disabled = this.currentModalTechIndex <= 0;
        if (nextBtn) nextBtn.disabled = this.currentModalTechIndex >= techsForCurrentAssignment.length - 1;
        if (counter) counter.textContent = `${this.currentModalTechIndex + 1} of ${techsForCurrentAssignment.length}`;


        const renderKeyValuePair = (key, value, parentEl, isNested = false) => { /* ... same as V9 renderKeyValuePair ... */ };
        const renderSection = (title, dataObject, parentEl, isTopLevelSection = true) => { /* ... same as V9 renderSection ... */ };
        // Call renderObject from V9, ensuring `this.formatValue` and other contexts are correct if you make it a method of UIManager
        // For now, I'll assume formatValue is passed or globally available if not part of UIManager
        const formatVal = window.WorkMarketTransformerInstance ? window.WorkMarketTransformerInstance.formatValue.bind(window.WorkMarketTransformerInstance) : (val => String(val));

        function _renderObject(obj, parentElement, indentLevel = 0, pathPrefix = '') {
            // ... (Full renderObject logic from V9, using `formatVal` instead of `this.formatValue`) ...
            // ... Ensure links (email, phone, maps) are generated correctly. Email subject needs assignment title.
        }
        _renderObject(techRawData, detailsGrid); // Call the local renderObject

        this.techModalOverlay.style.display = 'flex';
    }


    closeTechModal() {
        if (this.techModalOverlay) this.techModalOverlay.style.display = 'none';
        console.log(`${this.SCRIPT_PREFIX} Tech details modal closed.`);
    }
}
