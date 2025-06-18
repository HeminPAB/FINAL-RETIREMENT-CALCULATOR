/**
 * Comprehensive Retirement Calculator
 * Implements pre-retirement accumulation and post-retirement withdrawal calculations
 * with support for multiple scenarios and detailed projections.
 */

/**
 * @typedef {Object} RetirementInputs
 * @property {number} currentAge - Current age
 * @property {number} retirementAge - Planned retirement age
 * @property {number} yearsInRetirement - Expected years in retirement
 * @property {number} currentIncome - Current annual income
 * @property {number} currentSavings - Current savings balance
 * @property {number} savingsRate - Annual savings rate as percentage
 * @property {number} incomeReplacementRatio - Desired income replacement percentage
 * @property {number} cppBenefit - Monthly CPP benefit
 * @property {number} oasBenefit - Monthly OAS benefit
 * @property {number} companyPension - Monthly company pension
 * @property {number} otherIncome - Monthly other income
 * @property {number} preRetirementReturn - Pre-retirement return rate (decimal)
 * @property {number} retirementReturn - Retirement return rate (decimal)
 * @property {number} incomeGrowthRate - Annual income growth rate (decimal)
 * @property {number} inflationRate - Annual inflation rate (decimal)
 */

/**
 * @typedef {Object} YearlyProjection
 * @property {number} year - Calendar year
 * @property {number} age - Age at year end
 * @property {number} annualIncome - Annual income for the year
 * @property {number} annualContribution - Annual contribution
 * @property {number} investmentReturn - Investment return for the year
 * @property {number} beginningBalance - Balance at beginning of year
 * @property {number} yearEndBalance - Balance at end of year
 * @property {number} withdrawalRate - Withdrawal rate (retirement only)
 * @property {number} annualWithdrawal - Annual withdrawal (retirement only)
 */

/**
 * @typedef {Object} RetirementResults
 * @property {Array<YearlyProjection>} preRetirementProjections - Year-by-year pre-retirement projections
 * @property {Array<YearlyProjection>} postRetirementProjections - Year-by-year post-retirement projections
 * @property {Object} summary - Summary metrics
 * @property {boolean} fundsLastThroughRetirement - Whether funds last through retirement
 * @property {number|null} depletionAge - Age when funds deplete (null if funds last)
 * @property {number} finalBalance - Final balance at end of retirement
 */

export class RetirementCalculator {
    /**
     * Creates a new RetirementCalculator instance
     * @param {RetirementInputs} inputs - Input parameters for the calculation
     */
    constructor(inputs) {
        this.validateInputs(inputs);
        this.inputs = { ...inputs };
        this.currentYear = new Date().getFullYear();
    }

    /**
     * Validates input parameters
     * @param {RetirementInputs} inputs - Input parameters to validate
     * @throws {Error} If validation fails
     */
    validateInputs(inputs) {
        const required = [
            'currentAge', 'retirementAge', 'yearsInRetirement', 'currentIncome',
            'currentSavings', 'savingsRate', 'incomeReplacementRatio',
            'preRetirementReturn', 'retirementReturn', 'incomeGrowthRate', 'inflationRate'
        ];

        for (const field of required) {
            if (typeof inputs[field] !== 'number' || inputs[field] < 0) {
                throw new Error(`Invalid ${field}: must be a non-negative number`);
            }
        }

        if (inputs.currentAge >= inputs.retirementAge) {
            throw new Error('Retirement age must be greater than current age');
        }

        if (inputs.savingsRate > 100) {
            throw new Error('Savings rate cannot exceed 100%');
        }

        if (inputs.incomeReplacementRatio > 200) {
            throw new Error('Income replacement ratio seems unrealistic (>200%)');
        }
    }

    /**
     * Calculates complete retirement projections
     * @returns {RetirementResults} Complete retirement calculation results
     */
    calculate() {
        const preRetirementProjections = this.calculatePreRetirement();
        const postRetirementProjections = this.calculatePostRetirement(
            preRetirementProjections[preRetirementProjections.length - 1].yearEndBalance
        );

        const summary = this.generateSummary(preRetirementProjections, postRetirementProjections);
        const fundsLastThroughRetirement = postRetirementProjections.every(p => p.yearEndBalance >= 0);
        const depletionAge = fundsLastThroughRetirement ? null : 
            this.findDepletionAge(postRetirementProjections);
        const finalBalance = postRetirementProjections[postRetirementProjections.length - 1]?.yearEndBalance || 0;

        return {
            preRetirementProjections,
            postRetirementProjections,
            summary,
            fundsLastThroughRetirement,
            depletionAge,
            finalBalance
        };
    }

    /**
     * Calculates pre-retirement accumulation phase
     * @returns {Array<YearlyProjection>} Year-by-year pre-retirement projections
     */
    calculatePreRetirement() {
        const projections = [];
        const yearsToRetirement = this.inputs.retirementAge - this.inputs.currentAge;
        
        let currentIncome = this.inputs.currentIncome;
        let beginningBalance = this.inputs.currentSavings;

        for (let year = 0; year < yearsToRetirement; year++) {
            const calendarYear = this.currentYear + year;
            const age = this.inputs.currentAge + year;

            // Formula 1: Annual_Income[year] = Annual_Income[year-1] × (1 + Income_Growth_Rate)
            if (year > 0) {
                currentIncome = currentIncome * (1 + this.inputs.incomeGrowthRate);
            }

            // Formula 2: Annual_Contribution = Annual_Income × (Savings_Rate / 100)
            const annualContribution = currentIncome * (this.inputs.savingsRate / 100);

            // Formula 3: Investment_Return = Beginning_Balance × Pre_Retirement_Return_Rate
            // (contributions made at year-end, no growth in contribution year)
            const investmentReturn = beginningBalance * this.inputs.preRetirementReturn;

            // Formula 4: Year_End_Balance = Beginning_Balance + Annual_Contribution + Investment_Return
            const yearEndBalance = beginningBalance + annualContribution + investmentReturn;

            projections.push({
                year: calendarYear,
                age: age + 1, // Age at year end
                annualIncome: currentIncome,
                annualContribution: annualContribution,
                investmentReturn: investmentReturn,
                beginningBalance: beginningBalance,
                yearEndBalance: yearEndBalance,
                withdrawalRate: 0,
                annualWithdrawal: 0
            });

            beginningBalance = yearEndBalance;
        }

        return projections;
    }

    /**
     * Calculates post-retirement withdrawal phase
     * @param {number} initialRetirementBalance - Starting balance at retirement
     * @returns {Array<YearlyProjection>} Year-by-year post-retirement projections
     */
    calculatePostRetirement(initialRetirementBalance) {
        const projections = [];
        const finalAnnualIncome = this.inputs.currentIncome * 
            Math.pow(1 + this.inputs.incomeGrowthRate, this.inputs.retirementAge - this.inputs.currentAge);

        // Formula 1: Required_Annual_Income = Final_Annual_Income × (Income_Replacement_Ratio / 100)
        const baseRequiredAnnualIncome = finalAnnualIncome * (this.inputs.incomeReplacementRatio / 100);

        // Formula 2: Annual_Government_Benefits = (CPP + OAS + Company_Pension + Other_Income) × 12
        const annualGovernmentBenefits = (
            (this.inputs.cppBenefit || 0) + 
            (this.inputs.oasBenefit || 0) + 
            (this.inputs.companyPension || 0) + 
            (this.inputs.otherIncome || 0)
        ) * 12;

        // Formula 3: Base_Annual_Withdrawal_Needed = Required_Annual_Income - Annual_Government_Benefits
        const baseAnnualWithdrawalNeeded = Math.max(0, baseRequiredAnnualIncome - annualGovernmentBenefits);

        let beginningBalance = initialRetirementBalance;

        for (let year = 0; year < this.inputs.yearsInRetirement; year++) {
            const calendarYear = this.currentYear + (this.inputs.retirementAge - this.inputs.currentAge) + year;
            const age = this.inputs.retirementAge + year;

            // Formula 4: Inflation_Adjusted_Income = Base_Required_Income × (1 + Inflation_Rate)^year
            const inflationAdjustedIncome = baseRequiredAnnualIncome * Math.pow(1 + this.inputs.inflationRate, year);
            
            // Formula 5: Inflation_Adjusted_Withdrawal = Base_Withdrawal × (1 + Inflation_Rate)^year
            const inflationAdjustedWithdrawal = baseAnnualWithdrawalNeeded * Math.pow(1 + this.inputs.inflationRate, year);

            // Ensure we don't withdraw more than available
            const annualWithdrawal = Math.min(inflationAdjustedWithdrawal, Math.max(0, beginningBalance));

            // Formula 6: Investment_Return = (Beginning_Balance - Annual_Withdrawal) × Retirement_Return_Rate
            const investmentReturn = Math.max(0, beginningBalance - annualWithdrawal) * this.inputs.retirementReturn;

            // Formula 7: Year_End_Balance = Beginning_Balance - Annual_Withdrawal + Investment_Return
            const yearEndBalance = beginningBalance - annualWithdrawal + investmentReturn;

            // Formula 8: Withdrawal_Rate = (Annual_Withdrawal / Beginning_Balance) × 100
            const withdrawalRate = beginningBalance > 0 ? (annualWithdrawal / beginningBalance) * 100 : 0;

            projections.push({
                year: calendarYear,
                age: age + 1, // Age at year end
                annualIncome: inflationAdjustedIncome,
                annualContribution: 0, // No contributions in retirement
                investmentReturn: investmentReturn,
                beginningBalance: beginningBalance,
                yearEndBalance: Math.max(0, yearEndBalance), // Can't go below 0
                withdrawalRate: withdrawalRate,
                annualWithdrawal: annualWithdrawal
            });

            beginningBalance = Math.max(0, yearEndBalance);

            // Stop if funds are depleted
            if (beginningBalance <= 0) {
                break;
            }
        }

        return projections;
    }

    /**
     * Generates summary metrics
     * @param {Array<YearlyProjection>} preRetirement - Pre-retirement projections
     * @param {Array<YearlyProjection>} postRetirement - Post-retirement projections
     * @returns {Object} Summary metrics
     */
    generateSummary(preRetirement, postRetirement) {
        const totalSavingsAtRetirement = preRetirement[preRetirement.length - 1]?.yearEndBalance || 0;
        const totalContributions = preRetirement.reduce((sum, p) => sum + p.annualContribution, 0);
        const totalInvestmentGrowth = totalSavingsAtRetirement - this.inputs.currentSavings - totalContributions;
        
        const averageWithdrawalRate = postRetirement.length > 0 ? 
            postRetirement.reduce((sum, p) => sum + p.withdrawalRate, 0) / postRetirement.length : 0;

        const safeWithdrawalAssessment = this.assessWithdrawalSafety(averageWithdrawalRate);

        return {
            totalSavingsAtRetirement: totalSavingsAtRetirement,
            totalContributions: totalContributions,
            totalInvestmentGrowth: totalInvestmentGrowth,
            averageWithdrawalRate: averageWithdrawalRate,
            safeWithdrawalAssessment: safeWithdrawalAssessment,
            yearsUntilRetirement: this.inputs.retirementAge - this.inputs.currentAge,
            monthlyContributionNeeded: totalContributions / (12 * (this.inputs.retirementAge - this.inputs.currentAge)),
            requiredAnnualIncome: this.inputs.currentIncome * 
                Math.pow(1 + this.inputs.incomeGrowthRate, this.inputs.retirementAge - this.inputs.currentAge) * 
                (this.inputs.incomeReplacementRatio / 100)
        };
    }

    /**
     * Assesses withdrawal rate safety
     * @param {number} withdrawalRate - Average withdrawal rate
     * @returns {Object} Safety assessment
     */
    assessWithdrawalSafety(withdrawalRate) {
        if (withdrawalRate <= 4) {
            return { level: 'SAFE', description: 'Safe withdrawal rate (≤4%)', color: 'green' };
        } else if (withdrawalRate <= 5) {
            return { level: 'MODERATE', description: 'Moderate risk (4-5%)', color: 'yellow' };
        } else {
            return { level: 'HIGH_RISK', description: 'High risk (>5%)', color: 'red' };
        }
    }

    /**
     * Finds the age when funds are depleted
     * @param {Array<YearlyProjection>} projections - Post-retirement projections
     * @returns {number|null} Age when funds deplete, or null if they don't
     */
    findDepletionAge(projections) {
        const depletedProjection = projections.find(p => p.yearEndBalance <= 0);
        return depletedProjection ? depletedProjection.age : null;
    }

    /**
     * Calculates scenario comparison (Conservative vs Aggressive)
     * @returns {Object} Comparison between 4% and 7% retirement returns
     */
    calculateScenarioComparison() {
        // Conservative scenario (4% retirement return)
        const conservativeInputs = { ...this.inputs, retirementReturn: 0.04 };
        const conservativeCalculator = new RetirementCalculator(conservativeInputs);
        const conservativeResults = conservativeCalculator.calculate();

        // Aggressive scenario (7% retirement return)
        const aggressiveInputs = { ...this.inputs, retirementReturn: 0.07 };
        const aggressiveCalculator = new RetirementCalculator(aggressiveInputs);
        const aggressiveResults = aggressiveCalculator.calculate();

        return {
            conservative: conservativeResults,
            aggressive: aggressiveResults,
            comparison: {
                finalBalanceDifference: aggressiveResults.finalBalance - conservativeResults.finalBalance,
                withdrawalRateDifference: aggressiveResults.summary.averageWithdrawalRate - 
                    conservativeResults.summary.averageWithdrawalRate,
                sustainabilityImprovement: aggressiveResults.fundsLastThroughRetirement && 
                    !conservativeResults.fundsLastThroughRetirement
            }
        };
    }

    /**
     * Exports results to JSON
     * @param {RetirementResults} results - Calculation results
     * @returns {string} JSON string
     */
    static exportToJSON(results) {
        return JSON.stringify(results, null, 2);
    }

    /**
     * Exports results to CSV format
     * @param {RetirementResults} results - Calculation results
     * @returns {string} CSV string
     */
    static exportToCSV(results) {
        const headers = [
            'Year', 'Age', 'Phase', 'Annual Income', 'Annual Contribution', 
            'Investment Return', 'Beginning Balance', 'Year End Balance', 
            'Withdrawal Rate', 'Annual Withdrawal'
        ];

        const rows = [headers.join(',')];

        // Add pre-retirement data
        results.preRetirementProjections.forEach(p => {
            rows.push([
                p.year, p.age, 'Accumulation', 
                RetirementCalculator.formatCurrency(p.annualIncome),
                RetirementCalculator.formatCurrency(p.annualContribution),
                RetirementCalculator.formatCurrency(p.investmentReturn),
                RetirementCalculator.formatCurrency(p.beginningBalance),
                RetirementCalculator.formatCurrency(p.yearEndBalance),
                '0%', '$0'
            ].join(','));
        });

        // Add post-retirement data
        results.postRetirementProjections.forEach(p => {
            rows.push([
                p.year, p.age, 'Withdrawal',
                RetirementCalculator.formatCurrency(p.annualIncome),
                '$0',
                RetirementCalculator.formatCurrency(p.investmentReturn),
                RetirementCalculator.formatCurrency(p.beginningBalance),
                RetirementCalculator.formatCurrency(p.yearEndBalance),
                `${p.withdrawalRate.toFixed(2)}%`,
                RetirementCalculator.formatCurrency(p.annualWithdrawal)
            ].join(','));
        });

        return rows.join('\n');
    }

    /**
     * Formats a number as currency
     * @param {number} amount - Amount to format
     * @returns {string} Formatted currency string
     */
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    }

    /**
     * Formats a percentage
     * @param {number} percentage - Percentage to format
     * @param {number} decimals - Number of decimal places
     * @returns {string} Formatted percentage string
     */
    static formatPercentage(percentage, decimals = 1) {
        return `${percentage.toFixed(decimals)}%`;
    }

    /**
     * Prepares data for chart visualization
     * @param {RetirementResults} results - Calculation results
     * @returns {Object} Chart-ready data structure
     */
    static prepareChartData(results) {
        const allProjections = [
            ...results.preRetirementProjections.map(p => ({ ...p, phase: 'Accumulation' })),
            ...results.postRetirementProjections.map(p => ({ ...p, phase: 'Withdrawal' }))
        ];

        return {
            labels: allProjections.map(p => p.year),
            datasets: [
                {
                    label: 'Portfolio Balance',
                    data: allProjections.map(p => p.yearEndBalance),
                    borderColor: '#e5196e',
                    backgroundColor: 'rgba(229, 25, 110, 0.1)',
                    fill: true
                },
                {
                    label: 'Annual Contribution/Withdrawal',
                    data: allProjections.map(p => p.phase === 'Accumulation' ? p.annualContribution : -p.annualWithdrawal),
                    borderColor: '#974e6d',
                    backgroundColor: 'rgba(151, 78, 109, 0.1)',
                    fill: false
                }
            ],
            phases: allProjections.map(p => p.phase),
            withdrawalRates: allProjections.map(p => p.withdrawalRate)
        };
    }
} 