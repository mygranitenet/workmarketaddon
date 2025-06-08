export function calculateOverallScore(techData, assignmentBudget = 350) {
    let CS = 50, DS = 0, SS = 50, OS = 0; // Defaults

    // 1. Cost Score (CS)
    const totalCost = techData.negotiation?.pricing?.total_cost;
    if (totalCost !== undefined && totalCost !== null) {
        CS = Math.max(0, (1 - (parseFloat(totalCost) / assignmentBudget)) * 100);
    }

    // 2. Distance Score (DS)
    const distance = techData.distance;
    if (distance !== undefined && distance !== null) {
        if (distance <= 40) {
            DS = Math.max(0, (1 - (distance / 80)) * 100);
        } else if (distance <= 60) {
            DS = 20;
        } else if (distance <= 80) {
            DS = 10;
        } else {
            DS = 0;
        }
    }

    // 3. Stats Score (SS)
    let CPS_Final = 50; // Default Company Performance Score
    const rscCompany = techData.resource_scorecard_for_company?.values;
    const rscIndividual = techData.resource_scorecard;

    // Part A: Company Performance
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

    // Part B: Individual Performance (IPS)
    let IPS = 50;
    if (rscIndividual?.rating && rscIndividual?.values) {
        if (rscIndividual.rating.count > 0) {
            const satInd = rscIndividual.rating.satisfactionRate || 0;
            const onTimeInd = rscIndividual.values.ON_TIME_PERCENTAGE?.all || 0;
            const reliabilityIndFactor = Math.min(1, (rscIndividual.rating.count || 0) / 50);
            const negIndCount = (rscIndividual.values.CANCELLED_WORK?.all || 0) + (rscIndividual.values.LATE_WORK?.all || 0) + (rscIndividual.values.ABANDONED_WORK?.all || 0);
            IPS = ((satInd * 0.40) + (onTimeInd * 0.30) + (reliabilityIndFactor * 0.30) - (negIndCount * 0.02)) * 100;
        }
    } else if (techData.new_user === true) {
        IPS = 50;
    }

    // Part C: Combine for Stats Score (SS)
    if (rscCompany?.COMPLETED_WORK?.net90 > 0) {
        SS = (CPS_Final * 0.80) + (IPS * 0.20);
    } else if (rscCompany?.COMPLETED_WORK?.all > 0) {
        SS = (CPS_Final * 0.65) + (IPS * 0.35);
    } else {
        SS = IPS;
    }
    SS = Math.max(0, Math.min(100, SS)); CPS_Final = Math.max(0, Math.min(100, CPS_Final)); IPS = Math.max(0, Math.min(100, IPS)); CS = Math.max(0, Math.min(100, CS)); DS = Math.max(0, Math.min(100, DS));
    OS = (CS * 0.30) + (DS * 0.15) + (SS * 0.55); OS = Math.max(0, Math.min(100, OS));
    return {
        OverallScore: OS.toFixed(2), CostScore: CS.toFixed(2), DistanceScore: DS.toFixed(2),
        StatsScore: SS.toFixed(2), CPS_Final: CPS_Final.toFixed(2), IPS: IPS.toFixed(2)
    };
}
