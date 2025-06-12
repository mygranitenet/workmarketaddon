// ==UserScript==
// @name         WorkMarket - Enhanced Assignment Details
// @namespace    
// @version      
// @description  Fetches detailed assignment, worker, notes, and log data from v3 APIs and displays it in new tabs on the assignment details page.
// @author       
// @match        
// @grant        
// @grant        
// @connect      
// ==/UserScript==

(async function() {
    'use strict';
    const SCRIPT_PREFIX = '[WM DETAIL ENHANCER V2.0]';
    console.log(`${SCRIPT_PREFIX} Script starting...`);

    // --- Custom CSS for new tabs and content ---
    const customCss = `
        /* Tab and Content Styling */
        .enhancer-tab-content { padding: 15px; border: 1px solid #ddd; border-top: none; background-color: #fff; }
        .enhancer-loading { font-style: italic; color: #888; padding: 20px; text-align: center; font-size: 1.2em; }
        .enhancer-error { color: #d9534f; font-weight: bold; }

        /* Generic Data Grid (for Details tab) */
        .enhancer-grid { display: grid; grid-template-columns: minmax(200px, max-content) 1fr; gap: 6px 12px; font-size: 0.9em; }
        .enhancer-grid dt { font-weight: bold; color: #444; text-align: right; grid-column: 1; }
        .enhancer-grid dd { margin-left: 0; grid-column: 2; word-break: break-word; }
        .enhancer-grid .section-header { grid-column: 1 / -1; background-color: #f7f7f7; color: #333; padding: 8px; margin-top: 15px; font-weight: bold; border-radius: 4px; text-align: left; border-bottom: 2px solid #e7e7e7;}
        .enhancer-grid .html-content { padding: 10px; border: 1px solid #eee; margin-top: 5px; background-color: #fdfdfd; max-height: 250px; overflow-y: auto; white-space: pre-wrap; }
        .enhancer-grid .html-content a { color: #337ab7; }
        .enhancer-grid ul { padding-left: 20px; margin-top: 0; }

        /* Table Styling (for Applicants, Notes, Log) */
        .enhancer-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.85em; box-shadow: 0 0 8px rgba(0,0,0,0.1); }
        .enhancer-table thead tr { background-color: #4A5568; color: #ffffff; text-align: left; }
        .enhancer-table th, .enhancer-table td { padding: 6px 8px; border: 1px solid #ddd; vertical-align: top; }
        .enhancer-table tbody tr:nth-of-type(even) { background-color: #f9f9f9; }
        .enhancer-table tbody tr:hover { background-color: #f1f1f1; }
        .enhancer-table td a { color: #337ab7; text-decoration: none; }
        .enhancer-table td a:hover { text-decoration: underline; }
        .enhancer-table .col-score { text-align: right; font-weight: bold; }
        .enhancer-table .col-log-text { white-space: pre-wrap; }
        .enhancer-table .col-log-text strong { font-weight: 600; color: #222; }
    `;

    class WorkMarketDetailEnhancer {
        constructor() {
            this.workNumber = this.getWorkNumberFromURL();
            if (!this.workNumber) {
                console.error(`${SCRIPT_PREFIX} Could not find workNumber in URL. Aborting.`);
                return;
            }
            console.log(`${SCRIPT_PREFIX} Found workNumber: ${this.workNumber}`);
            this.injectUI();
            this.fetchAllDataAndRender();
        }

        getWorkNumberFromURL() {
            const pathParts = window.location.pathname.split('/');
            return pathParts.pop() || pathParts.pop(); // Handles trailing slash
        }

        injectUI() {
            const tabContainer = document.querySelector('ul.nav.nav-tabs');
            const tabContentContainer = document.querySelector('div.tab-content');
            if (!tabContainer || !tabContentContainer) {
                console.error(`${SCRIPT_PREFIX} Could not find tab containers on page. Cannot inject UI.`);
                return;
            }

            const tabIds = ['enhanced-details', 'applicants', 'notes', 'activity-log'];
            const tabLabels = ['Enhanced Details', 'Applicants', 'Notes', 'Activity Log'];

            tabLabels.forEach((label, index) => {
                const id = tabIds[index];
                // Create Tab
                const li = document.createElement('li');
                li.innerHTML = `<a href="#${id}" data-toggle="tab">${label}</a>`;
                tabContainer.appendChild(li);

                // Create Content Pane
                const pane = document.createElement('div');
                pane.id = id;
                pane.className = 'tab-pane enhancer-tab-content';
                pane.innerHTML = `<div class="enhancer-loading">Loading ${label}...</div>`;
                tabContentContainer.appendChild(pane);
            });
             GM_addStyle(customCss);
        }

        async apiPostRequest(endpoint, payload) {
            const url = `https://www.workmarket.com${endpoint}`;
            return new Promise((resolve, reject) => {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: url,
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json, text/plain, */*',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    data: JSON.stringify(payload),
                    onload: function(response) {
                        if (response.status >= 200 && response.status < 300) {
                            try {
                                resolve(JSON.parse(response.responseText));
                            } catch (e) {
                                reject(new Error(`JSON Parse Error: ${e.message}`));
                            }
                        } else {
                            reject(new Error(`HTTP Error: ${response.status} ${response.statusText}`));
                        }
                    },
                    onerror: function(error) {
                        reject(new Error(`Request Error: ${error.details}`));
                    }
                });
            });
        }

        async fetchAllDataAndRender() {
            const endpoints = {
                details: '/v3/assignment/view',
                workers: '/v3/assignment-details/view-invited-workers',
                notes: '/v3/assignment/view-notes',
                log: '/v3/assignment-details/view-activity-log'
            };

            const requests = Object.entries(endpoints).map(([key, endpoint]) =>
                this.apiPostRequest(endpoint, { workNumber: this.workNumber })
                    .then(data => ({ status: 'fulfilled', value: data, key }))
                    .catch(error => ({ status: 'rejected', reason: error, key }))
            );

            const results = await Promise.all(requests);

            results.forEach(result => {
                if (result.status === 'fulfilled') {
                    console.log(`${SCRIPT_PREFIX} Successfully fetched data for: ${result.key}`, result.value);
                    const payload = result.value.result?.payload?.[0];
                    if (!payload) {
                        console.warn(`${SCRIPT_PREFIX} No payload found for ${result.key}`);
                        this.renderError(result.key, `No payload in API response.`);
                        return;
                    }

                    switch (result.key) {
                        case 'details': this.renderAssignmentDetails(payload); break;
                        case 'workers': this.renderWorkersTable(payload); break;
                        case 'notes': this.renderNotes(payload); break;
                        case 'log': this.renderActivityLog(payload); break;
                    }
                } else {
                    console.error(`${SCRIPT_PREFIX} Failed to fetch data for ${result.key}:`, result.reason);
                    this.renderError(result.key, result.reason.message);
                }
            });
        }
        
        renderError(tabKey, errorMessage) {
            let paneId = '';
            if (tabKey === 'details') paneId = 'enhanced-details';
            else if (tabKey === 'workers') paneId = 'applicants';
            else if (tabKey === 'log') paneId = 'activity-log';
            else paneId = tabKey;
            
            const pane = document.getElementById(paneId);
            if (pane) {
                 pane.innerHTML = `<div class="enhancer-error">Error loading data: ${errorMessage}</div>`;
            }
        }

        // --- RENDER FUNCTIONS ---
        renderAssignmentDetails(data) {
            const container = document.getElementById('enhanced-details');
            const grid = document.createElement('dl');
            grid.className = 'enhancer-grid';

            const createDtDd = (key, value, isHtml = false) => {
                if (value === null || value === undefined || value === '') return;
                const dt = document.createElement('dt');
                dt.textContent = key;
                const dd = document.createElement('dd');
                if (isHtml) dd.innerHTML = value;
                else dd.textContent = value;
                grid.appendChild(dt);
                grid.appendChild(dd);
            };

            const renderSection = (title, obj, fieldOrder = null) => {
                if (!obj || Object.keys(obj).length === 0) return;
                const header = document.createElement('dt');
                header.className = 'section-header';
                header.textContent = title;
                grid.appendChild(header);
                const keys = fieldOrder || Object.keys(obj);
                keys.forEach(key => {
                    if (obj.hasOwnProperty(key)) {
                        let value = obj[key];
                         if(typeof value === 'object' && value !== null) {
                            renderSection(this.formatKey(key), value);
                        } else {
                            createDtDd(this.formatKey(key) + ':', this.formatValue(value, key));
                        }
                    }
                });
            };

            // Main Details
            createDtDd('Title:', data.title);
            createDtDd('Status:', data.workDisplayStatus);
            if(data.description) createDtDd('Description:', `<div class="html-content">${data.description}</div>`, true);
            if(data.instructions) createDtDd('Instructions:', `<div class="html-content">${data.instructions}</div>`, true);

            // Sections
            renderSection('Schedule', data.schedule);
            renderSection('Pricing', data.pricing, ['type', 'budget', 'workerMaxEarnings', 'perHourPrice', 'maxNumberOfHours', 'flatPrice']);
            renderSection('Payment Details', data.pricing?.payment);
            renderSection('Location', data.location?.address);
            renderSection('On-Site Contact', data.location?.contact);
            renderSection('Internal Owner', data.internalOwner);

            // Custom Fields
            if (data.customFieldGroups?.length > 0) {
                 const header = document.createElement('dt'); header.className = 'section-header'; header.textContent = 'Custom Fields'; grid.appendChild(header);
                 data.customFieldGroups.forEach(group => {
                     group.fields.forEach(field => createDtDd(`${group.name} / ${field.name}:`, field.value));
                 });
            }
             // Documents
            if (data.documents?.length > 0) {
                 const header = document.createElement('dt'); header.className = 'section-header'; header.textContent = 'Documents'; grid.appendChild(header);
                 const ul = document.createElement('ul');
                 data.documents.forEach(doc => {
                     ul.innerHTML += `<li><a href="https://www.workmarket.com${doc.uri}" target="_blank">${doc.name}</a> ${doc.description ? `(${doc.description})` : ''}</li>`;
                 });
                 const dd = document.createElement('dd'); dd.appendChild(ul); grid.appendChild(dd);
            }
            // Deliverables
            if (data.deliverableRequirementGroup?.deliverableRequirements?.length > 0) {
                const header = document.createElement('dt'); header.className = 'section-header'; header.textContent = 'Deliverables'; grid.appendChild(header);
                if(data.deliverableRequirementGroup.instructions) {
                     createDtDd('Instructions:', `<div class="html-content">${data.deliverableRequirementGroup.instructions}</div>`, true);
                }
                const ul = document.createElement('ul');
                data.deliverableRequirementGroup.deliverableRequirements.forEach(d => {
                    ul.innerHTML += `<li><strong>${d.numberOfFiles}x ${this.formatKey(d.type)}:</strong> ${d.instructions || ''}</li>`;
                });
                const dd = document.createElement('dd'); dd.appendChild(ul); grid.appendChild(dd);
            }

            container.innerHTML = '';
            container.appendChild(grid);
        }

        renderWorkersTable(data) {
            const container = document.getElementById('applicants');
            if (!data.workers || data.workers.length === 0) {
                container.innerHTML = 'No applicants or invited workers found.';
                return;
            }

            const table = document.createElement('table');
            table.className = 'enhancer-table';
            const headers = ['Name / Company', 'Contact', 'Status', 'Distance', 'Overall Score', 'Stats'];
            table.innerHTML = `<thead><tr><th>${headers.join('</th><th>')}</th></tr></thead>`;
            const tbody = document.createElement('tbody');

            data.workers.forEach(worker => {
                const tr = document.createElement('tr');
                const scores = this.calculateOverallScore(worker, data.budget || 350); // Use assignment budget or a default
                const user = worker.user;
                const company = worker.company;
                const displayName = company.name === 'Sole Proprietor' ? user.firstName + ' ' + user.lastName : company.name;

                let contactInfo = '';
                if(user.email) contactInfo += `<div><a href="mailto:${user.email}">${user.email}</a></div>`;
                if(user.phoneNumber?.phoneNumber) contactInfo += `<div><a href="tel:${user.phoneNumber.phoneNumber}">${user.phoneNumber.phoneNumber}</a> (Work)</div>`;
                if(user.mobilePhoneNumber?.phoneNumber) contactInfo += `<div><a href="tel:${user.mobilePhoneNumber.phoneNumber}">${user.mobilePhoneNumber.phoneNumber}</a> (Mobile)</div>`;

                const stats = `Cost: ${scores.CostScore}, Dist: ${scores.DistanceScore}, Perf: ${scores.StatsScore}<br/><small>(CPS: ${scores.CPS_Final}, IPS: ${scores.IPS})</small>`;
                
                tr.innerHTML = `
                    <td>
                        <a href="https://www.workmarket.com/new-profile/${user.userUuid}" target="_blank"><strong>${displayName}</strong></a>
                        ${company.name !== 'Sole Proprietor' ? `<div><small>(${user.firstName} ${user.lastName})</small></div>` : ''}
                    </td>
                    <td>${contactInfo}</td>
                    <td>${this.formatKey(worker.status)}</td>
                    <td>${this.formatValue(worker.distance, 'distance')}</td>
                    <td class="col-score">${scores.OverallScore}</td>
                    <td>${stats}</td>
                `;
                tbody.appendChild(tr);
            });

            table.appendChild(tbody);
            container.innerHTML = '';
            container.appendChild(table);
        }

        renderNotes(data) {
            const container = document.getElementById('notes');
             if (!data.notes || data.notes.length === 0) {
                container.innerHTML = 'No notes found.';
                return;
            }
            const table = document.createElement('table');
            table.className = 'enhancer-table';
            table.innerHTML = `<thead><tr><th>Date</th><th>Creator</th><th>Note</th></tr></thead>`;
            const tbody = document.createElement('tbody');

            data.notes.forEach(note => {
                const tr = document.createElement('tr');
                const creator = note.creator;
                tr.innerHTML = `
                    <td>${new Date(note.createdOn).toLocaleString()}</td>
                    <td>${creator.firstName} ${creator.lastName}</td>
                    <td>${note.note}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.innerHTML = '';
            container.appendChild(table);
        }

        renderActivityLog(data) {
            const container = document.getElementById('activity-log');
             if (!data.logEntries || data.logEntries.length === 0) {
                container.innerHTML = 'No activity log entries found.';
                return;
            }
            const table = document.createElement('table');
            table.className = 'enhancer-table';
            table.innerHTML = `<thead><tr><th>Date</th><th>Actor</th><th>Action</th></tr></thead>`;
            const tbody = document.createElement('tbody');

            data.logEntries.forEach(entry => {
                const tr = document.createElement('tr');
                const actor = entry.actor;
                tr.innerHTML = `
                    <td>${new Date(entry.createdDate).toLocaleString()}</td>
                    <td>${actor.firstName} ${actor.lastName}</td>
                    <td class="col-log-text">${entry.text}</td>
                `;
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            container.innerHTML = '';
            container.appendChild(table);
        }

        // --- UTILITY AND SCORING FUNCTIONS (from original script) ---
        formatKey(key) {
             if (!key) return '';
             return key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
        
        formatValue(value, key = '') {
            if (value === null || value === undefined || String(value).trim() === '') return 'N/A';
            if (typeof value === 'boolean') return value ? 'Yes' : 'No';
            const lowerKey = key.toLowerCase();
            if (typeof value === 'number') {
                if (lowerKey.includes('price') || lowerKey.includes('cost') || lowerKey.includes('spend') || lowerKey.includes('fee') || lowerKey.includes('budget')) {
                    return `$${value.toFixed(2)}`;
                }
                if (lowerKey === 'distance') return `${value.toFixed(1)} mi`;
                if ((lowerKey.includes('percentage') || lowerKey.includes('rate') || lowerKey.includes('ratio')) && !lowerKey.includes('rating')) {
                    if (value >= 0 && value <= 1.000001) { return `${(value * 100).toFixed(2)}%`; }
                }
                return value.toFixed(2);
            }
            return String(value);
        }

        // Adapted from original script. The JSON structure for workers is different here.
        calculateOverallScore(techData, assignmentBudget = 350) {
            let CS = 50, DS = 0, SS = 50, OS = 0;
            const totalCost = techData.negotiation?.pricing?.total_cost;
            if (totalCost !== undefined && totalCost !== null) { CS = Math.max(0, (1 - (parseFloat(totalCost) / assignmentBudget)) * 100); }
            const distance = techData.distance;
            if (distance !== undefined && distance !== null) {
                if (distance <= 40) { DS = Math.max(0, (1 - (distance / 80)) * 100); }
                else if (distance <= 60) { DS = 20; }
                else if (distance <= 80) { DS = 10; }
                else { DS = 0; }
            }
            let CPS_Final = 50;
            const rscCompany = techData.resourceCompanyScoreCard?.scores;
            const rscIndividual = techData.resourceScoreCard;
            if (rscCompany) {
                const compCompletedNet90 = rscCompany.COMPLETED_WORK?.net90;
                if (compCompletedNet90 !== undefined && compCompletedNet90 !== null && compCompletedNet90 > 0) {
                    const satNet90 = rscCompany.SATISFACTION_OVER_ALL?.net90 || 0;
                    const onTimeNet90 = rscCompany.ON_TIME_PERCENTAGE?.net90 || 0;
                    const reliabilityNet90Factor = Math.min(1, (compCompletedNet90 || 0) / 5);
                    const negNet90Count = (rscCompany.CANCELLED_WORK?.net90 || 0) + (rscCompany.LATE_WORK?.net90 || 0) + (rscCompany.ABANDONED_WORK?.net90 || 0);
                    CPS_Final = ((satNet90 * 0.45) + (onTimeNet90 * 0.35) + (reliabilityNet90Factor * 0.20) - (negNet90Count * 0.10)) * 100;
                } else if (rscCompany.COMPLETED_WORK?.all !== undefined && rscCompany.COMPLETED_WORK?.all > 0) {
                    const satAll = rscCompany.SATISFACTION_OVER_ALL?.all || 0;
                    const onTimeAll = rscCompany.ON_TIME_PERCENTAGE?.all || 0;
                    const reliabilityAllFactor = Math.min(1, (rscCompany.COMPLETED_WORK?.all || 0) / 5);
                    const negAllCount = (rscCompany.CANCELLED_WORK?.all || 0) + (rscCompany.LATE_WORK?.all || 0) + (rscCompany.ABANDONED_WORK?.all || 0);
                    const CPS_All_Raw = ((satAll * 0.45) + (onTimeAll * 0.35) + (reliabilityAllFactor * 0.20) - (negAllCount * 0.10)) * 100;
                    CPS_Final = CPS_All_Raw * 0.85;
                }
            }
            let IPS = 50;
            if (rscIndividual?.ratingSummary && rscIndividual?.scores) {
                if (rscIndividual.ratingSummary.count > 0) {
                    const satInd = rscIndividual.ratingSummary.satisfactionRate || 0;
                    const onTimeInd = rscIndividual.scores.ON_TIME_PERCENTAGE?.all || 0;
                    const reliabilityIndFactor = Math.min(1, (rscIndividual.ratingSummary.count || 0) / 50);
                    const negIndCount = (rscIndividual.scores.CANCELLED_WORK?.all || 0) + (rscIndividual.scores.LATE_WORK?.all || 0) + (rscIndividual.scores.ABANDONED_WORK?.all || 0);
                    IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100;
                }
            } else if (techData.newUser === true) { IPS = 50; }
            if (rscCompany?.COMPLETED_WORK?.net90 > 0) { SS = (CPS_Final * 0.80) + (IPS * 0.20); }
            else if (rscCompany?.COMPLETED_WORK?.all > 0) { SS = (CPS_Final * 0.65) + (IPS * 0.35); }
            else { SS = IPS; }
            SS = Math.max(0, Math.min(100, SS));
            CPS_Final = Math.max(0, Math.min(100, CPS_Final));
            IPS = Math.max(0, Math.min(100, IPS));
            CS = Math.max(0, Math.min(100, CS));
            DS = Math.max(0, Math.min(100, DS));
            OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55);
            OS = Math.max(0, Math.min(100, OS));
            return { OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2), StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2) };
        }
    }

    // --- Script Entry Point ---
    // Use a short delay to ensure the page's own JS has finished rendering the tab structure
    setTimeout(() => {
        new WorkMarketDetailEnhancer();
    }, 500);

})();
