import { useState } from 'react';
import RetirementChart from '../RetirementChart';
import { generateRetirementReport } from '../../lib/pdfGenerator';

const ResultsStep = ({ results, formData, onPrev, onStartOver }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(3).replace(/\.?0+$/, '')}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const formatFullCurrency = (value) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Calculate key metrics using the CORRECT field names and logic
  const currentAge = parseInt(formData.currentAge) || 30;
  const retirementAge = parseInt(formData.retirementAge) || 65;
  const yearsToRetirement = retirementAge - currentAge;
  
  // Use the correct field name for annual income
  const currentAnnualIncome = parseFloat(formData.annualIncome) || 0;
  
  // Fix the income replacement ratio - handle both decimal and percentage formats
  let incomeReplacementRatio = parseFloat(formData.incomeReplacementRatio) || 70;
  if (incomeReplacementRatio > 1) {
    // Already a percentage, use as is
  } else {
    // Convert decimal to percentage
    incomeReplacementRatio = incomeReplacementRatio * 100;
  }
  
  // Calculate target retirement income based on current income grown to retirement
  const incomeGrowthRate = parseFloat(formData.incomeGrowthRate) || 0.03; // Use actual form data
  const finalAnnualIncome = currentAnnualIncome * Math.pow(1 + incomeGrowthRate, yearsToRetirement);
  const targetAnnualRetirementIncome = finalAnnualIncome * (incomeReplacementRatio / 100);
  const targetMonthlyRetirementIncome = targetAnnualRetirementIncome / 12;
  
  // Calculate government benefits (CPP, OAS, etc.)
  const monthlyGovernmentBenefits = ((parseFloat(formData.cppBenefit) || 0) + 
                                   (parseFloat(formData.oasBenefit) || 0) + 
                                   (parseFloat(formData.companyPension) || 0) + 
                                   (parseFloat(formData.otherIncome) || 0));
  
  // Net required withdrawal = Total lifestyle need - Government benefits
  const netRequiredMonthlyWithdrawal = Math.max(0, targetMonthlyRetirementIncome - monthlyGovernmentBenefits);
  
  // Calculate current savings using the array structure
  const currentSavings = (formData.savings || []).reduce((sum, entry) => {
    return sum + (parseFloat(entry.amount) || 0);
  }, 0);

  // Calculate monthly contributions
  const monthlyContributions = (parseFloat(formData.monthlyTfsa) || 0) + 
                              (parseFloat(formData.monthlyRrsp) || 0) + 
                              (parseFloat(formData.monthlyOtherRegistered) || 0) + 
                              (parseFloat(formData.monthlyNonRegistered) || 0);

  // Calculate expected return
  const expectedReturn = formData.expectedReturnType === 'conservative' ? 0.045 : 
                        formData.expectedReturnType === 'balanced' ? 0.065 : 0.085;

  // Calculate projected savings at retirement using proper compound interest
  const monthlyReturn = expectedReturn / 12;
  const totalMonths = yearsToRetirement * 12;
  
  let projectedSavings = 0;
  
  if (yearsToRetirement > 0) {
    // Future value of current savings
    const futureValueCurrentSavings = currentSavings * Math.pow(1 + expectedReturn, yearsToRetirement);
    
    // Future value of monthly contributions (annuity)
    let futureValueMonthlyContributions = 0;
    if (monthlyContributions > 0 && monthlyReturn > 0) {
      futureValueMonthlyContributions = monthlyContributions * 
        ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn);
    } else if (monthlyContributions > 0) {
      futureValueMonthlyContributions = monthlyContributions * totalMonths;
    }
    
    projectedSavings = futureValueCurrentSavings + futureValueMonthlyContributions;
  } else {
    projectedSavings = currentSavings;
  }

  // Calculate retirement income from savings (using 4% rule)
  const annualIncomeFromSavings = projectedSavings * 0.04;
  const monthlyIncomeFromSavings = annualIncomeFromSavings / 12;
  
  const totalMonthlyRetirementIncome = monthlyIncomeFromSavings + monthlyGovernmentBenefits;
  
  // Calculate sustainability rate based on whether we can afford our target lifestyle
  const sustainabilityRate = Math.min(100, Math.max(0, (monthlyIncomeFromSavings / netRequiredMonthlyWithdrawal) * 100));
  
  // Function to handle PDF generation
  const handleDownloadPDF = async () => {
    const calculations = {
      currentAge,
      retirementAge,
      yearsToRetirement,
      currentAnnualIncome,
      incomeGrowthRate,
      incomeReplacementRatio,
      targetMonthlyRetirementIncome,
      monthlyGovernmentBenefits,
      netRequiredMonthlyWithdrawal,
      currentSavings,
      monthlyContributions,
      expectedReturn,
      projectedSavings,
      monthlyIncomeFromSavings
    };
    
    try {
      await generateRetirementReport(formData, calculations);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <span className="text-primary-500">Planning</span>
          <span>/</span>
          <span>Retirement</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your retirement outlook</h1>
        <p className="text-gray-600">
          Based on your inputs, here's a projection of your retirement savings and income.
        </p>
      </div>

      <div className="space-y-8">
          {/* Key Metrics */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Projected Savings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-primary-500 text-sm font-medium mb-2">
                  Projected Savings at Retirement
                </h3>
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {formatCurrency(projectedSavings)}
                </div>
              </div>

              {/* Required Monthly Withdrawal */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-primary-500 text-sm font-medium mb-2">
                  Required Monthly Withdrawal
                </h3>
                <div className="text-4xl font-bold text-primary-600 mb-1">
                  {formatCurrency(netRequiredMonthlyWithdrawal)}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  From savings (after CPP/OAS: {formatCurrency(monthlyGovernmentBenefits)})
                </p>
              </div>
            </div>
          </div>

          {/* Retirement Coverage Chart */}
          <div>
            <RetirementChart
              currentAge={currentAge}
              retirementAge={retirementAge}
              projectedSavings={projectedSavings}
              netRequiredMonthlyWithdrawal={netRequiredMonthlyWithdrawal}
              monthlyIncomeFromSavings={monthlyIncomeFromSavings}
              sustainabilityRate={sustainabilityRate}
              expectedReturn={expectedReturn}
            />
          </div>

          {/* Complete Summary */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Summary</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Your Information */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Your Information</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Current Age: <span className="font-medium text-gray-900">{currentAge}</span></p>
                  <p>Retirement Age: <span className="font-medium text-gray-900">{retirementAge}</span></p>
                  <p>Years to Retirement: <span className="font-medium text-gray-900">{yearsToRetirement}</span></p>
                </div>
              </div>

              {/* Income & Savings */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Income & Savings</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Current Income: <span className="font-medium text-gray-900">{formatFullCurrency(currentAnnualIncome)}</span></p>
                  <p>Current Savings: <span className="font-medium text-gray-900">{formatFullCurrency(currentSavings)}</span></p>
                  <p>Monthly Contributions: <span className="font-medium text-gray-900">{formatFullCurrency(monthlyContributions)}</span></p>
                </div>
              </div>

              {/* Retirement Goals */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Retirement Goals</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Income Replacement: <span className="font-medium text-gray-900">{Math.round(incomeReplacementRatio)}%</span></p>
                  <p>Target Monthly Income: <span className="font-medium text-gray-900">{formatFullCurrency(targetMonthlyRetirementIncome)}</span></p>
                </div>
              </div>

              {/* Investments */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-medium text-gray-900 mb-4">Investments</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Risk Profile: <span className="font-medium text-gray-900 capitalize">{formData.expectedReturnType}</span></p>
                  <p>Expected Return: <span className="font-medium text-gray-900">{(expectedReturn * 100).toFixed(1)}%</span></p>
                </div>
              </div>
            </div>

          </div>

          {/* Actionable Items */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Actionable Items</h2>
            
            <div className="space-y-4">
              {/* Increase Contributions */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m-3-6h6m-3 0h.01" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Increase Contributions</h3>
                    <p className="text-gray-600">
                      Consider increasing your contributions by 5% to improve your sustainability rate.
                    </p>
                  </div>
                </div>
              </div>

              {/* Review Investments */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-50 rounded-lg p-3 flex-shrink-0">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Review Investments</h3>
                    <p className="text-gray-600">
                      Explore investment options with higher potential returns to accelerate savings growth.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* CTA Section */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 mt-8">
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Take the Next Step</h3>
          <p className="text-gray-600">Get your detailed report or speak with a retirement planning expert</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            className="flex items-center justify-center px-6 py-3 bg-white border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-sm hover:shadow-md"
            onClick={handleDownloadPDF}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download PDF Report
          </button>
          
          <button
            className="flex items-center justify-center px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            onClick={() => {
              // TODO: Implement scheduling functionality
              alert('Scheduling feature coming soon!');
            }}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Schedule Call with Advisor
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center border-t border-gray-200 pt-6 mt-8">
        <button
          className="px-6 py-3 rounded-lg font-medium text-sm transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={onPrev}
        >
          Previous
        </button>
        <button
          className="px-6 py-3 rounded-lg font-medium text-sm transition-all bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md"
          onClick={onStartOver}
        >
          Start Over
        </button>
      </div>
    </div>
  );
};

export default ResultsStep; 