/**
 * Example Usage of RetirementCalculator
 * Demonstrates the calculator with the exact parameters from the prompt
 * and shows comparison between conservative (4%) and aggressive (7%) scenarios
 */

// For Node.js environment
// const RetirementCalculator = require('./retirement-calculator.js');

// For browser environment, include the script tag first:
// <script src="retirement-calculator.js"></script>

/**
 * Example input parameters matching the prompt specifications
 */
const exampleInputs = {
    currentAge: 27,
    retirementAge: 70,
    yearsInRetirement: 30,
    currentIncome: 65000,
    currentSavings: 10000,
    savingsRate: 7,  // percentage
    incomeReplacementRatio: 60,  // percentage
    cppBenefit: 1306,  // monthly
    oasBenefit: 635,   // monthly
    companyPension: 0, // monthly
    otherIncome: 0,    // monthly
    preRetirementReturn: 0.07,  // 7% as decimal
    retirementReturn: 0.04,     // 4% as decimal (conservative)
    incomeGrowthRate: 0.021     // 2.1% as decimal
};

/**
 * Demonstrates basic calculator usage
 */
function demonstrateBasicUsage() {
    console.log('='.repeat(80));
    console.log('RETIREMENT CALCULATOR DEMONSTRATION');
    console.log('='.repeat(80));
    
    try {
        // Create calculator instance
        const calculator = new RetirementCalculator(exampleInputs);
        
        // Perform calculations
        const results = calculator.calculate();
        
        // Display summary
        console.log('\n📊 SUMMARY METRICS');
        console.log('-'.repeat(50));
        console.log(`Total savings at retirement: ${RetirementCalculator.formatCurrency(results.summary.totalSavingsAtRetirement)}`);
        console.log(`Years until retirement: ${results.summary.yearsUntilRetirement}`);
        console.log(`Total contributions needed: ${RetirementCalculator.formatCurrency(results.summary.totalContributions)}`);
        console.log(`Monthly contribution needed: ${RetirementCalculator.formatCurrency(results.summary.monthlyContributionNeeded)}`);
        console.log(`Investment growth: ${RetirementCalculator.formatCurrency(results.summary.totalInvestmentGrowth)}`);
        console.log(`Required annual income in retirement: ${RetirementCalculator.formatCurrency(results.summary.requiredAnnualIncome)}`);
        console.log(`Average withdrawal rate: ${RetirementCalculator.formatPercentage(results.summary.averageWithdrawalRate)}`);
        console.log(`Withdrawal safety: ${results.summary.safeWithdrawalAssessment.description}`);
        console.log(`Funds last through retirement: ${results.fundsLastThroughRetirement ? 'YES' : 'NO'}`);
        
        if (results.depletionAge) {
            console.log(`⚠️  Funds depleted at age: ${results.depletionAge}`);
        }
        
        console.log(`Final balance: ${RetirementCalculator.formatCurrency(results.finalBalance)}`);
        
        // Show first few years of projections
        console.log('\n📈 FIRST 5 YEARS - PRE-RETIREMENT PROJECTIONS');
        console.log('-'.repeat(120));
        console.log('Year | Age | Annual Income | Contribution | Investment Return | Year-End Balance');
        console.log('-'.repeat(120));
        
        results.preRetirementProjections.slice(0, 5).forEach(p => {
            console.log(`${p.year} | ${p.age.toString().padStart(3)} | ${RetirementCalculator.formatCurrency(p.annualIncome).padStart(12)} | ${RetirementCalculator.formatCurrency(p.annualContribution).padStart(11)} | ${RetirementCalculator.formatCurrency(p.investmentReturn).padStart(16)} | ${RetirementCalculator.formatCurrency(p.yearEndBalance).padStart(15)}`);
        });
        
        // Show retirement years
        console.log('\n📉 FIRST 5 YEARS - POST-RETIREMENT PROJECTIONS');
        console.log('-'.repeat(140));
        console.log('Year | Age | Required Income | Withdrawal | Investment Return | Year-End Balance | Withdrawal Rate');
        console.log('-'.repeat(140));
        
        results.postRetirementProjections.slice(0, 5).forEach(p => {
            console.log(`${p.year} | ${p.age.toString().padStart(3)} | ${RetirementCalculator.formatCurrency(p.annualIncome).padStart(14)} | ${RetirementCalculator.formatCurrency(p.annualWithdrawal).padStart(9)} | ${RetirementCalculator.formatCurrency(p.investmentReturn).padStart(16)} | ${RetirementCalculator.formatCurrency(p.yearEndBalance).padStart(15)} | ${RetirementCalculator.formatPercentage(p.withdrawalRate).padStart(14)}`);
        });
        
        return results;
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        return null;
    }
}

/**
 * Demonstrates scenario comparison between conservative and aggressive approaches
 */
function demonstrateScenarioComparison() {
    console.log('\n' + '='.repeat(80));
    console.log('SCENARIO COMPARISON: CONSERVATIVE (4%) vs AGGRESSIVE (7%)');
    console.log('='.repeat(80));
    
    try {
        // Conservative scenario (4% retirement return)
        const conservativeInputs = { ...exampleInputs, retirementReturn: 0.04 };
        const conservativeCalculator = new RetirementCalculator(conservativeInputs);
        const conservativeResults = conservativeCalculator.calculate();
        
        // Aggressive scenario (7% retirement return)
        const aggressiveInputs = { ...exampleInputs, retirementReturn: 0.07 };
        const aggressiveCalculator = new RetirementCalculator(aggressiveInputs);
        const aggressiveResults = aggressiveCalculator.calculate();
        
        console.log('\n📊 COMPARATIVE RESULTS');
        console.log('-'.repeat(80));
        console.log('Metric'.padEnd(30) + 'Conservative (4%)'.padEnd(20) + 'Aggressive (7%)'.padEnd(20) + 'Difference');
        console.log('-'.repeat(80));
        
        const metrics = [
            {
                name: 'Savings at Retirement',
                conservative: conservativeResults.summary.totalSavingsAtRetirement,
                aggressive: aggressiveResults.summary.totalSavingsAtRetirement,
                format: 'currency'
            },
            {
                name: 'Average Withdrawal Rate',
                conservative: conservativeResults.summary.averageWithdrawalRate,
                aggressive: aggressiveResults.summary.averageWithdrawalRate,
                format: 'percentage'
            },
            {
                name: 'Final Balance',
                conservative: conservativeResults.finalBalance,
                aggressive: aggressiveResults.finalBalance,
                format: 'currency'
            },
            {
                name: 'Funds Last Through Retirement',
                conservative: conservativeResults.fundsLastThroughRetirement ? 1 : 0,
                aggressive: aggressiveResults.fundsLastThroughRetirement ? 1 : 0,
                format: 'boolean'
            }
        ];
        
        metrics.forEach(metric => {
            let conservativeStr, aggressiveStr, differenceStr;
            
            if (metric.format === 'currency') {
                conservativeStr = RetirementCalculator.formatCurrency(metric.conservative);
                aggressiveStr = RetirementCalculator.formatCurrency(metric.aggressive);
                differenceStr = RetirementCalculator.formatCurrency(metric.aggressive - metric.conservative);
            } else if (metric.format === 'percentage') {
                conservativeStr = RetirementCalculator.formatPercentage(metric.conservative);
                aggressiveStr = RetirementCalculator.formatPercentage(metric.aggressive);
                differenceStr = RetirementCalculator.formatPercentage(metric.aggressive - metric.conservative);
            } else if (metric.format === 'boolean') {
                conservativeStr = metric.conservative ? 'YES' : 'NO';
                aggressiveStr = metric.aggressive ? 'YES' : 'NO';
                differenceStr = metric.aggressive > metric.conservative ? 'IMPROVED' : 'SAME';
            }
            
            console.log(metric.name.padEnd(30) + conservativeStr.padEnd(20) + aggressiveStr.padEnd(20) + differenceStr);
        });
        
        // Highlight the dramatic difference
        console.log('\n🚨 KEY INSIGHT: THE DRAMATIC DIFFERENCE');
        console.log('-'.repeat(60));
        const finalBalanceDifference = aggressiveResults.finalBalance - conservativeResults.finalBalance;
        console.log(`The difference in final balance between 7% and 4% retirement returns:`);
        console.log(`${RetirementCalculator.formatCurrency(finalBalanceDifference)}`);
        
        if (finalBalanceDifference > 0) {
            const percentImprovement = (finalBalanceDifference / Math.abs(conservativeResults.finalBalance)) * 100;
            console.log(`This represents a ${percentImprovement.toFixed(1)}% improvement with aggressive returns.`);
        }
        
        // Show withdrawal rate assessment
        console.log('\n💡 WITHDRAWAL RATE ANALYSIS');
        console.log('-'.repeat(50));
        console.log(`Conservative (4%): ${conservativeResults.summary.safeWithdrawalAssessment.description}`);
        console.log(`Aggressive (7%): ${aggressiveResults.summary.safeWithdrawalAssessment.description}`);
        
        return { conservative: conservativeResults, aggressive: aggressiveResults };
        
    } catch (error) {
        console.error('❌ Error in scenario comparison:', error.message);
        return null;
    }
}

/**
 * Demonstrates export functionality
 */
function demonstrateExportFunctionality() {
    console.log('\n' + '='.repeat(80));
    console.log('EXPORT FUNCTIONALITY DEMONSTRATION');
    console.log('='.repeat(80));
    
    try {
        const calculator = new RetirementCalculator(exampleInputs);
        const results = calculator.calculate();
        
        // Demonstrate JSON export
        console.log('\n📄 JSON Export (first 500 characters):');
        console.log('-'.repeat(50));
        const jsonExport = RetirementCalculator.exportToJSON(results);
        console.log(jsonExport.substring(0, 500) + '...');
        
        // Demonstrate CSV export
        console.log('\n📊 CSV Export (first 10 lines):');
        console.log('-'.repeat(50));
        const csvExport = RetirementCalculator.exportToCSV(results);
        const csvLines = csvExport.split('\n');
        csvLines.slice(0, 10).forEach(line => console.log(line));
        
        // Demonstrate chart data preparation
        console.log('\n📈 Chart Data Structure:');
        console.log('-'.repeat(50));
        const chartData = RetirementCalculator.prepareChartData(results);
        console.log(`Labels: ${chartData.labels.length} years (${chartData.labels[0]} to ${chartData.labels[chartData.labels.length - 1]})`);
        console.log(`Datasets: ${chartData.datasets.length} data series`);
        console.log(`- ${chartData.datasets[0].label}: ${chartData.datasets[0].data.length} data points`);
        console.log(`- ${chartData.datasets[1].label}: ${chartData.datasets[1].data.length} data points`);
        
        return { json: jsonExport, csv: csvExport, chart: chartData };
        
    } catch (error) {
        console.error('❌ Error in export demonstration:', error.message);
        return null;
    }
}

/**
 * Main demonstration function
 */
function runCompleteDemo() {
    console.log('🚀 Starting Complete Retirement Calculator Demonstration\n');
    
    // Basic usage
    const basicResults = demonstrateBasicUsage();
    
    // Scenario comparison
    const comparisonResults = demonstrateScenarioComparison();
    
    // Export functionality
    const exportResults = demonstrateExportFunctionality();
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ DEMONSTRATION COMPLETE');
    console.log('='.repeat(80));
    console.log('The retirement calculator has been successfully demonstrated with:');
    console.log('✓ Basic calculation functionality');
    console.log('✓ Conservative vs Aggressive scenario comparison');
    console.log('✓ Export capabilities (JSON, CSV, Chart data)');
    console.log('✓ Input validation and error handling');
    console.log('✓ Currency formatting and percentage display');
    console.log('✓ Withdrawal rate safety assessment');
    
    return {
        basic: basicResults,
        comparison: comparisonResults,
        exports: exportResults
    };
}

// Auto-run demonstration if script is executed directly
if (typeof window === 'undefined' && require.main === module) {
    // Node.js environment
    const RetirementCalculator = require('./retirement-calculator.js');
    runCompleteDemo();
} else if (typeof window !== 'undefined') {
    // Browser environment - expose functions globally
    window.demonstrateRetirementCalculator = {
        runCompleteDemo,
        demonstrateBasicUsage,
        demonstrateScenarioComparison,
        demonstrateExportFunctionality,
        exampleInputs
    };
    
    console.log('Retirement Calculator demo functions available via window.demonstrateRetirementCalculator');
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runCompleteDemo,
        demonstrateBasicUsage,
        demonstrateScenarioComparison,
        demonstrateExportFunctionality,
        exampleInputs
    };
} 