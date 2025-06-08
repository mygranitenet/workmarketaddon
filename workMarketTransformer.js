// workMarketTransformer.js
import { parseFullDateToParts, parseLocationString, formatValue } from './utils.js';
import { calculateOverallScore } from './scoreCalculator.js';
import { UIManager } from './uiManager.js'; // Assuming UIManager is in a separate file

export class WorkMarketTransformer {
    constructor(scriptPrefix) {
        this.SCRIPT_PREFIX = scriptPrefix;
        console.log(`${this.SCRIPT_PREFIX} Initializing WorkMarketTransformer class instance...`);

        this.originalResultsContainerSource = document.getElementById('assignment_list_results');
        this.tableData = [];
        this.currentSort = { column: 'timestamp', direction: 'desc' };
        this.activeTableHeaders = [];
        this.currentAssignmentTechsData = {}; // Stores { assignmentId: [techObjWithScores, ...] }
        this.assignmentItemSelector = '.results-row.work';
        this.transformationInitialized = false;
        this.observer = null;

        if (!this.originalResultsContainerSource) {
            console.error(`${this.SCRIPT_PREFIX} CRITICAL ERROR: Source container #assignment_list_results not found. Aborting.`);
            return;
        }

        // Initialize UI Manager (handles main overlay and tech modal DOM)
        this.ui = new UIManager(this.SCRIPT_PREFIX);
        this.mainOverlayContentTarget = this.ui.getMainOverlayContentTarget(); // Get the div where table will be rendered

        console.log(`${this.SCRIPT_PREFIX} Constructor finished. Setting up content observer/poller...`);
        this.waitForAssignmentsAndInitialize();
    }

    // Use imported utils
    parseFullDateToParts = parseFullDateToParts;
    parseLocationString = parseLocationString;
    formatValue = formatValue;
    calculateOverallScore = calculateOverallScore;

    async fetchWorkerData(assignmentId) {
        // ... (fetchWorkerData logic from V9, using this.calculateOverallScore) ...
        // Ensure the filter logic for "hasApplied" is correct for your API data.
        // Based on your JSON, the filter is:
        // const isNotDeclined = w.declined_on === "";
        // const hasActiveNegotiation = w.has_negotiation === true && w.negotiation !== null;
        // const hasApplied = hasActiveNegotiation; // Simplification, as w.status was always "open" in sample
        // return isNotDeclined && hasApplied;
    }

    async extractAssignmentsData(assignmentNodes) {
        // ... (extractAssignmentsData logic from V9, remove client/owner, conditional lastUpdateText) ...
        // Call this.fetchWorkerData
    }

    renderTable(dataToRender, headersToRender, targetContainer) {
        // ... (renderTable logic from V9, ensure it renders to targetContainer) ...
        // Attach event listeners for tech links like this:
        // cell.querySelectorAll('.tech-detail-link').forEach(link => {
        //     link.addEventListener('click', (e) => {
        //         e.preventDefault();
        //         const assignmentId = e.target.dataset.assignmentId;
        //         const techIndex = parseInt(e.target.dataset.techIndex, 10);
        //         const techData = this.currentAssignmentTechsData[assignmentId]?.[techIndex];
        //         if (techData) {
        //             this.ui.setCurrentTechModalNavContext(assignmentId, techIndex, () => this.showPrevTechInModal(), () => this.showNextTechInModal());
        //             this.ui.displayTechModal(techData, this.tableData.find(a => a.assignmentId === assignmentId)?.title);
        //         } else { /* error handling */ }
        //     });
        // });
    }
    handleSort(columnKey) { /* ... (Same as V9, calls this.renderTable with this.mainOverlayContentTarget) ... */ }
    sortData() { /* ... (Same as V9) ... */ }
    updateSortIndicators() { /* ... (Same as V9, uses table ID 'customAssignmentsTable_overlay') ... */ }

    // Modal navigation callbacks for UIManager
    showPrevTechInModal() {
        if (this.ui.currentModalAssignmentId && this.ui.currentModalTechIndex > 0) {
            this.ui.currentModalTechIndex--;
            const techData = this.currentAssignmentTechsData[this.ui.currentModalAssignmentId]?.[this.ui.currentModalTechIndex];
            if (techData) this.ui.displayTechModal(techData, this.tableData.find(a => a.assignmentId === this.ui.currentModalAssignmentId)?.title);
        }
    }
    showNextTechInModal() {
        const techsForCurrentAssignment = this.currentAssignmentTechsData[this.ui.currentModalAssignmentId] || [];
        if (this.ui.currentModalAssignmentId && this.ui.currentModalTechIndex < techsForCurrentAssignment.length - 1) {
            this.ui.currentModalTechIndex++;
            const techData = techsForCurrentAssignment[this.ui.currentModalTechIndex];
            if (techData) this.ui.displayTechModal(techData, this.tableData.find(a => a.assignmentId === this.ui.currentModalAssignmentId)?.title);
        }
    }


    waitForAssignmentsAndInitialize() { /* ... (Same as V9) ... */ }
    attemptFallbackInitializationPolling(observerInstance) { /* ... (Same as V9, renderTable to this.mainOverlayContentTarget) ... */ }
    async initializeTransformationSequence() { /* ... (Same as V9, renderTable to this.mainOverlayContentTarget, call this.ui.showMainOverlay()) ... */ }

} // End of WorkMarketTransformer class
