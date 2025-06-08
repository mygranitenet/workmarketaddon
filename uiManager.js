// uiManager.js

/**
 * Manages the creation and interaction of UI overlays and modals.
 */
export class UIManager {
    constructor(scriptPrefix, mainOverlayId = 'wmTransformerOverlay', techModalId = 'techDetailModalOverlay') {
        this.SCRIPT_PREFIX = scriptPrefix;
        this.mainOverlayId = mainOverlayId;
        this.techModalId = techModalId;

        this.mainOverlay = null;
        this.mainOverlayContentTarget = null; // For table rendering by WorkMarketTransformer
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
        header.innerHTML = `<span>WorkMarket Enhanced Assignments</span><input id="assignmentFilterInput" type="text" placeholder="Filter..." style="margin-left:10px;flex-grow:1;max-width:200px;"/><div class="overlay-controls"><button class="overlay-minimize-btn" title="Minimize">_</button><button class="overlay-maximize-btn" title="Maximize">□</button><button class="overlay-close-btn" title="Hide">X</button></div>`;

        this.mainOverlayContentTarget = document.createElement('div');
        this.mainOverlayContentTarget.className = 'overlay-content';
        // The ID for table rendering target will be set by WorkMarketTransformer class on this element if needed,
        // or it can just pass this.mainOverlayContentTarget to its renderTable method.

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

        // Dragging for the modal content itself, not the overlay
        modalContent.querySelector('.tech-modal-header').addEventListener('mousedown', this.startDragTechModal.bind(this));
        this.techModalOverlay.querySelector('.tech-modal-close').addEventListener('click', () => this.closeTechModal());

        // Navigation button event listeners will be set up by the main class using callbacks
        // as UIManager doesn't know about the main class's data or methods directly.
        console.log(`${this.SCRIPT_PREFIX} Tech details modal structure created.`);
    }

    startDragTechModal(e) {
        if (e.target.classList.contains('tech-modal-close')) return;
        this.techModalIsDragging = true;
        const modalContent = e.currentTarget.closest('.tech-modal-content'); // The draggable part is the content
        if (!this.techModalOverlay || !modalContent) return;
        this.techModalOverlay.style.userSelect = 'none'; // Prevent text selection on overlay
        modalContent.style.userSelect = 'none';      // Prevent text selection on content during drag

        // Calculate initial offset from the top-left of the *viewport* for the modal content
        const modalRect = modalContent.getBoundingClientRect();
        this.techModalDragStartX = e.clientX - modalRect.left;
        this.techModalDragStartY = e.clientY - modalRect.top;

        // We need to drag relative to the overlay, so make sure overlay itself isn't moving
        // For simplicity, we'll just ensure the modal content is positioned absolutely/fixed within the overlay
        // The CSS already does this by making tech-modal-overlay fixed and tech-modal-content centered.
        // If tech-modal-content was 'position: relative' inside a static overlay, dragging would be different.

        document.addEventListener('mousemove', this.doDragTechModalBound);
        document.addEventListener('mouseup', this.stopDragTechModalBound);
    }

    doDragTechModal(e) {
        if (!this.techModalIsDragging) return;
        const modalContent = this.techModalOverlay.querySelector('.tech-modal-content');
        if (!modalContent) return;

        // New position relative to the viewport
        let newTop = e.clientY - this.techModalDragStartY;
        let newLeft = e.clientX - this.techModalDragStartX;

        // Ensure the modal content (which is centered in the overlay) doesn't go too far off-screen
        // For simplicity, we'll just set top/left of the overlay as it's fixed.
        // If modal-content itself was positioned absolutely within the overlay, we'd set its top/left.
        // Since it's centered, moving the overlay effectively moves the content.
        this.techModalOverlay.style.left = newLeft + 'px'; // This will move the whole overlay
        this.techModalOverlay.style.top = newTop + 'px';   // This will move the whole overlay

        // If you want to drag the modal *content* within a *static* overlay, the logic would be:
        // modalContent.style.position = 'absolute'; // If not already
        // modalContent.style.left = (e.clientX - this.techModalDragStartX) + 'px';
        // modalContent.style.top = (e.clientY - this.techModalDragStartY) + 'px';
    }

    stopDragTechModal() {
        this.techModalIsDragging = false;
        if(this.techModalOverlay) {
            this.techModalOverlay.style.userSelect = '';
            const modalContent = this.techModalOverlay.querySelector('.tech-modal-content');
            if (modalContent) modalContent.style.userSelect = '';
        }
        document.removeEventListener('mousemove', this.doDragTechModalBound);
        document.removeEventListener('mouseup', this.stopDragTechModalBound);
    }

    // Callbacks for modal navigation, to be set by WorkMarketTransformer
    // These are placeholders; the actual functions are in the main class
    showPrevTechInModal() { if (this._showPrevTechCallback) this._showPrevTechCallback(); }
    showNextTechInModal() { if (this._showNextTechCallback) this._showNextTechCallback(); }

    /**
     * Updates the tech modal with new data and sets up navigation.
     * @param {object} techRawData - The full data object for the tech.
     * @param {string} assignmentTitle - Title of the current assignment.
     * @param {number} techIndex - Current index of the tech in the list for this assignment.
     * @param {number} totalTechs - Total number of techs for this assignment's modal navigation.
     * @param {function} prevCallback - Function to call when "Previous" is clicked.
     * @param {function} nextCallback - Function to call when "Next" is clicked.
     * @param {function} formatValueCallback - Callback to format values.
     */
    displayTechModal(techRawData, assignmentTitle, techIndex, totalTechs, prevCallback, nextCallback, formatValueCallback) {
        console.log(`${this.SCRIPT_PREFIX} UIManager: Displaying modal for tech:`, techRawData.company_name || techRawData.name);
        if (!this.techModalOverlay) this._createTechModal();

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

        const prevBtn = this.techModalOverlay.querySelector('#prevTechBtnModal');
        const nextBtn = this.techModalOverlay.querySelector('#nextTechBtnModal');
        const counter = this.techModalOverlay.querySelector('#techCounterModal');

        if(prevBtn) prevBtn.disabled = techIndex <= 0;
        if(nextBtn) nextBtn.disabled = techIndex >= totalTechs - 1;
        if(counter) counter.textContent = `${techIndex + 1} of ${totalTechs}`;

        // Update internal callbacks for nav buttons IF THEY CHANGE (e.g., different assignment)
        // Or they can be set once when the main class instance is linked.
        this._showPrevTechCallback = prevCallback;
        this._showNextTechCallback = nextCallback;

        // Recursive rendering function, now using the passed formatValueCallback
        const _renderObject = (obj, parentElement, indentLevel = 0, pathPrefix = '') => {
            const keysToExclude = ['avatar_uri', 'avatar_asset_uri', 'user_uuid_for_link_only', 'encrypted_id', 'valuesWithStringKey', 'tieredPricingMetaData', 'labels', 'dispatcher', 'resource_scorecard_for_company', 'resource_scorecard', 'OverallScore', 'CostScore', 'DistanceScore', 'StatsScore', 'CPS_Final', 'IPS', 'assignmentId', 'raw_worker_data'];
            const priorityFields = [
                { key: 'user_uuid', label: 'User Profile' }, { key: 'name', label: 'Contact Name' },
                { key: 'company_name', label: 'Company' }, { key: 'email', label: 'Email' },
                { key: 'work_phone', label: 'Work Phone' }, { key: 'mobile_phone', label: 'Mobile Phone' },
                { key: 'address', label: 'Address' }, { key: 'distance', label: 'Distance' },
                { key: 'status', label: 'Invitation Status' }, { key: 'sent_on', label: 'Sent On' },
                { key: 'declined_on', label: 'Declined On' }, { key: 'question_pending', label: 'Question Pending?' },
                { key: 'has_negotiation', label: 'Has Negotiation?' }, { key: 'schedule_conflict', label: 'Schedule Conflict?' }
            ];

            const createDdWithValue = (key, value) => {
                const dd = document.createElement('dd');
                if (key === 'user_uuid') { dd.innerHTML = `<a href="https://www.workmarket.com/new-profile/${value}" target="_blank">${value}</a>`; }
                else if (key === 'email' && value) { const subject = encodeURIComponent(`Question regarding WO: ${assignmentTitle}`); dd.innerHTML = `<a href="mailto:${value}?subject=${subject}&body=I have a question:">${value}</a>`; }
                else if ((key === 'work_phone' || key === 'mobile_phone') && value) { dd.innerHTML = `<a href="tel:${String(value).replace(/\D/g,'')}">${value}</a>`; }
                else if (key === 'address' && value) { dd.innerHTML = `<a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(value)}" target="_blank">${value}</a>`; }
                else if (key === 'graniteTicket' && value) { dd.innerHTML = `<a href="YOUR_TICKET_SYSTEM_BASE_URL/${value}" target="_blank">${value}</a>`; /* REPLACE */ }
                else { dd.textContent = formatValueCallback(value, key); } // Use passed formatter
                return dd;
            };

            priorityFields.forEach(pf => {
                if (obj.hasOwnProperty(pf.key)) {
                    const value = obj[pf.key];
                    if (formatValueCallback(value, pf.key) === 'N/A' && !(pf.key === 'declined_on' && value === '')) return;
                    const dt = document.createElement('dt'); dt.textContent = (pf.label || pf.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())) + ':';
                    const dd = createDdWithValue(pf.key, value);
                    parentElement.appendChild(dt); parentElement.appendChild(dd);
                }
            });

            if (obj.has_negotiation && obj.negotiation) {
                const negHeaderDt = document.createElement('dt'); negHeaderDt.className = 'section-header-dt'; negHeaderDt.textContent = 'Negotiation Details'; parentElement.appendChild(negHeaderDt);
                _renderObject(obj.negotiation, parentElement, indentLevel + 1, 'negotiation');
            }
            if (obj.resource_scorecard_for_company && obj.resource_scorecard_for_company.values) {
                const rscCompHeader = document.createElement('dt'); rscCompHeader.className = 'section-header-dt'; rscCompHeader.textContent = 'Scorecard (For Your Company)'; parentElement.appendChild(rscCompHeader);
                _renderObject(obj.resource_scorecard_for_company.values, parentElement, indentLevel + 1, 'resource_scorecard_for_company.values');
                if(obj.resource_scorecard_for_company.rating){ _renderObject(obj.resource_scorecard_for_company.rating, parentElement, indentLevel + 1, 'resource_scorecard_for_company.rating');}
            }
            if (obj.resource_scorecard && obj.resource_scorecard.values) {
                const rscHeader = document.createElement('dt'); rscHeader.className = 'section-header-dt'; rscHeader.textContent = 'Scorecard (Overall Platform)'; parentElement.appendChild(rscHeader);
                _renderObject(obj.resource_scorecard.values, parentElement, indentLevel + 1, 'resource_scorecard.values');
                 if(obj.resource_scorecard.rating){ _renderObject(obj.resource_scorecard.rating, parentElement, indentLevel + 1, 'resource_scorecard.rating');}
            }

            let hasOtherDetails = false; const otherDetailsFragment = document.createDocumentFragment();
            for (const key in obj) {
                if (obj.hasOwnProperty(key) && !keysToExclude.includes(key) && !priorityFields.find(pf => pf.key === key) && key !== 'negotiation' && key !== 'resource_scorecard' && key !== 'has_negotiation' && key !== 'resource_scorecard_for_company') {
                    const value = obj[key];
                    if (formatValueCallback(value,key) === 'N/A') continue;
                    if(!hasOtherDetails){ const otherDt = document.createElement('dt'); otherDt.className = 'section-header-dt'; otherDt.textContent = 'Other Raw Details'; otherDetailsFragment.appendChild(otherDt); hasOtherDetails = true; }
                    const dt = document.createElement('dt'); dt.textContent = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + ':'; dt.style.paddingLeft = `${(indentLevel + (key.includes('.') ? 1 : 0)) * 15}px`; // Basic indent for sub-keys
                    const dd = createDdWithValue(key, value);
                    otherDetailsFragment.appendChild(dt); otherDetailsFragment.appendChild(dd);
                }
            }
            if(hasOtherDetails) parentElement.appendChild(otherDetailsFragment);
        };
        _renderObject(techRawData, detailsGrid);

        this.techModalOverlay.style.display = 'flex';
    }

    closeTechModal() {
        if (this.techModalOverlay) this.techModalOverlay.style.display = 'none';
        console.log(`${this.SCRIPT_PREFIX} Tech details modal closed.`);
    }
}
