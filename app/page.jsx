'use client';

import { useState } from 'react';
import Layout from './components/Layout';
import PersonalInfoStep from './components/steps/PersonalInfoStep';
import CurrentSavingsStep from './components/steps/CurrentSavingsStep';
import IncomeGoalsStep from './components/steps/IncomeGoalsStep';
import ResultsStep from './components/steps/ResultsStep';
import { RetirementCalculator } from './lib/retirementCalculator';

const STEPS = {
  PERSONAL_INFO: 1,
  CURRENT_SAVINGS: 2,
  INCOME_GOALS: 3,
  RESULTS: 4,
};

const STEP_TITLES = {
  [STEPS.PERSONAL_INFO]: 'About You',
  [STEPS.CURRENT_SAVINGS]: 'Current Savings',
  [STEPS.INCOME_GOALS]: 'Income & Goals',
  [STEPS.RESULTS]: 'Your Results',
};

const initialFormData = {
  // Personal Info
  currentAge: 0,
  retirementAge: 0,
  yearsInRetirement: 25,
  province: '',
  maritalStatus: '',
  annualIncome: 0,
  incomeGrowthRate: 0.021,
  
  // Current Savings - new array structure
  savings: [{ type: '', amount: 0, id: Date.now() }],
  monthlyContributions: [{ type: '', amount: 0, id: Date.now() }],
  
  // Government Benefits - Keep CPP and OAS as requested
  cppBenefit: 1433,
  oasBenefit: 728,
  
  // Income & Goals
  currentIncome: 0,
  expectedReturnType: '', // conservative, balanced, growth
  retirementLifestyle: '', // basic, comfortable, luxury, ultra-luxury
  monthlyContribution: 0,
  savingsRate: 0,
  incomeReplacementRatio: 0, // Reset to 0
  
  // Calculated fields
  preRetirementReturn: 0.07,
  retirementReturn: 0.04,
  incomeGrowthRate: 0.021,
  inflationRate: 2.5,
  
  // Additional fields for comprehensive calculation
  employerMatch: 0,
  companyPension: 0,
  otherIncome: 0,
};

export default function HomePage() {
  const [currentStep, setCurrentStep] = useState(STEPS.PERSONAL_INFO);
  const [formData, setFormData] = useState(initialFormData);
  const [results, setResults] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState({});
  const [isEditingPersonalInfo, setIsEditingPersonalInfo] = useState(false);
  const [isEditingCurrentSavings, setIsEditingCurrentSavings] = useState(false);
  const [isEditingIncomeGoals, setIsEditingIncomeGoals] = useState(false);

  // Format number with commas
  const formatNumberWithCommas = (value) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Remove commas from input
  const removeCommas = (value) => {
    return value.replace(/,/g, '');
  };

  // Handle currency input formatting
  const handleCurrencyInput = (value, updateFunction) => {
    const cleanValue = removeCommas(value);
    const numericValue = parseFloat(cleanValue) || 0;
    updateFunction(numericValue);
  };

  const updateFormData = (newData) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    if (currentStep < STEPS.RESULTS) {
      if (currentStep === STEPS.INCOME_GOALS) {
        // Calculate results before going to results step
        calculateResults();
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > STEPS.PERSONAL_INFO) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateResults = async () => {
    setIsCalculating(true);
    
    try {
      // Calculate total current savings from all savings entries
      const totalCurrentSavings = formData.savings.reduce((sum, entry) => {
        return sum + (parseFloat(entry.amount) || 0);
      }, 0);

      // Calculate total monthly contributions
      const totalMonthlyContributions = 
        (parseFloat(formData.monthlyTfsa) || 0) +
        (parseFloat(formData.monthlyRrsp) || 0) +
        (parseFloat(formData.monthlyOtherRegistered) || 0) +
        (parseFloat(formData.monthlyNonRegistered) || 0);
      
      const annualContributions = totalMonthlyContributions * 12;
      const currentIncome = formData.annualIncome || 0;
      const calculatedSavingsRate = currentIncome > 0 ? (annualContributions / currentIncome) * 100 : 0;

      // Convert investment approach to specific return rates
      let preRetirementReturnRate;
      let retirementReturnRate;
      
      if (formData.expectedReturnType === 'conservative') {
        preRetirementReturnRate = 0.045; // 4.5% (middle of 4-5% range)
        retirementReturnRate = 0.045;    // 4.5% (same as pre-retirement)
      } else if (formData.expectedReturnType === 'balanced') {
        preRetirementReturnRate = 0.065; // 6.5% (middle of 6-7% range)
        retirementReturnRate = 0.065;    // 6.5% (same as pre-retirement)
      } else if (formData.expectedReturnType === 'growth') {
        preRetirementReturnRate = 0.085; // 8.5% (middle of 8-9% range)
        retirementReturnRate = 0.085;    // 8.5% (same as pre-retirement)
      } else {
        // Fallback to form data or defaults
        preRetirementReturnRate = (formData.preRetirementReturn || 6) / 100;
        retirementReturnRate = (formData.retirementReturn || 5) / 100;
      }

      // Prepare inputs for RetirementCalculator
      const calculatorInputs = {
        currentAge: formData.currentAge,
        retirementAge: formData.retirementAge,
        yearsInRetirement: formData.yearsInRetirement || (101 - formData.retirementAge),
        currentIncome: formData.annualIncome,
        currentSavings: totalCurrentSavings,
        savingsRate: calculatedSavingsRate,
        incomeReplacementRatio: (formData.incomeReplacementRatio * 100) || 70,
        cppBenefit: formData.cppBenefit || 0,
        oasBenefit: formData.oasBenefit || 0,
        companyPension: formData.companyPension || 0,
        otherIncome: formData.otherIncome || 0,
        preRetirementReturn: preRetirementReturnRate,
        retirementReturn: retirementReturnRate,
        incomeGrowthRate: (formData.incomeGrowthRate || 2) / 100,
        inflationRate: (formData.inflationRate || 2.5) / 100
      };

      // Use RetirementCalculator for consistent logic
      const calculator = new RetirementCalculator(calculatorInputs);
      const calculatorResults = calculator.calculate();

      // Transform results to match the expected format for the UI
      const calculationResults = {
        // Calculated variables
        yearsToRetirement: calculatorInputs.retirementAge - calculatorInputs.currentAge,
        yearsInRetirement: calculatorInputs.yearsInRetirement,
        totalCurrentSavings,
        totalMonthlyContributions,
        annualContributions,
        returnRate: calculatorInputs.preRetirementReturn,
        
        // Pre-retirement results
        preRetirementProjections: calculatorResults.preRetirementProjections,
        retirementSavings: calculatorResults.summary.totalSavingsAtRetirement,
        finalWorkingIncome: calculatorResults.preRetirementProjections[calculatorResults.preRetirementProjections.length - 1]?.annualIncome || 0,
        
        // Post-retirement results
        requiredAnnualIncome: calculatorResults.summary.requiredAnnualIncome,
        totalAnnualBenefits: (calculatorInputs.cppBenefit + calculatorInputs.oasBenefit + calculatorInputs.companyPension + calculatorInputs.otherIncome) * 12,
        annualWithdrawalNeeded: calculatorResults.postRetirementProjections[0]?.annualWithdrawal || 0,
        withdrawalRate: calculatorResults.summary.averageWithdrawalRate,
        retirementProjections: calculatorResults.postRetirementProjections,
        fundsDepletedAge: calculatorResults.depletionAge,
        
        // Status indicators
        safetyStatus: calculatorResults.summary.safeWithdrawalAssessment.level === 'SAFE' ? 'Safe' : 
                     calculatorResults.summary.safeWithdrawalAssessment.level === 'MODERATE' ? 'Moderate Risk' : 'High Risk',
        indicatorColor: calculatorResults.summary.safeWithdrawalAssessment.color === 'green' ? 'Green' :
                       calculatorResults.summary.safeWithdrawalAssessment.color === 'yellow' ? 'Yellow' : 'Red',
        statusMessage: calculatorResults.fundsLastThroughRetirement ? 
          `Funds last entire retirement with $${Math.round(calculatorResults.finalBalance).toLocaleString()} remaining` :
          `Funds depleted at age ${calculatorResults.depletionAge}`,
        showProjections: (totalCurrentSavings > 0) || (totalMonthlyContributions > 0),
        
        // Input summary
        inputs: formData,
        
        // Add the full calculator results for advanced features
        calculatorResults
      };
      
      setResults(calculationResults);
      setCurrentStep(STEPS.RESULTS);
      
    } catch (error) {
      console.error('Calculation error:', error);
      alert('Error calculating retirement projections: ' + error.message);
    } finally {
      setIsCalculating(false);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case STEPS.PERSONAL_INFO:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case STEPS.CURRENT_SAVINGS:
        return (
          <CurrentSavingsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case STEPS.INCOME_GOALS:
        return (
          <IncomeGoalsStep
            formData={formData}
            updateFormData={updateFormData}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case STEPS.RESULTS:
        return (
          <ResultsStep
            formData={formData}
            results={results}
            isCalculating={isCalculating}
            onPrev={() => setCurrentStep(STEPS.INCOME_GOALS)}
            onStartOver={() => {
              setCurrentStep(STEPS.PERSONAL_INFO);
              setFormData({});
              setResults(null);
            }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="px-4 sm:px-8 lg:px-40 flex flex-1 justify-center py-4">
        <div className="w-full max-w-7xl flex gap-6">
          {/* Main Content */}
          <div className="flex-1 bg-white rounded-lg shadow-sm border border-border">
            {/* Breadcrumb */}
            <div className="flex flex-wrap gap-2 p-4">
              <a className="text-muted text-base font-medium leading-normal" href="#">Planning</a>
              <span className="text-muted text-base font-medium leading-normal">/</span>
              <span className="text-foreground text-base font-medium leading-normal">Retirement Calculator</span>
            </div>

            {/* Header - Only show on first step */}
            {currentStep === STEPS.PERSONAL_INFO && (
              <div className="px-4 pb-3">
                <div className="flex min-w-72 flex-col gap-2">
                  <p className="text-foreground tracking-light text-[28px] font-bold leading-tight">
                    Retirement Calculator
                  </p>
                  <p className="text-muted text-sm font-normal leading-normal">
                    Plan your retirement savings and see if you're on track to meet your goals.
                  </p>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            <div className="px-4 pb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Step {currentStep} of {Object.keys(STEPS).length}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round((currentStep / Object.keys(STEPS).length) * 100)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-accent h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / Object.keys(STEPS).length) * 100}%` }}
                ></div>
                  </div>
              <div className="flex justify-between mt-2">
                {Object.entries(STEP_TITLES).map(([stepNum, title]) => (
                  <span 
                    key={stepNum}
                    className={`text-xs ${
                      parseInt(stepNum) <= currentStep 
                        ? 'text-accent font-medium' 
                        : 'text-gray-400'
                    }`}
                  >
                    {title}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div className="px-4 pb-6">
              {renderCurrentStep()}
            </div>
          </div>

          {/* Right Sidebar - Summary */}
          {currentStep < STEPS.RESULTS && (
            <div className="w-80 bg-white rounded-lg shadow-sm border border-border p-4 h-fit sticky top-8">
              {/* Progress Header */}
              <div className="mb-4">
                <p className="text-foreground text-base font-medium leading-normal mb-2">
                  Step {currentStep} of {Object.keys(STEPS).length - 1}
                </p>
                <div className="rounded bg-gray-200 h-2">
                  <div 
                    className="h-2 rounded bg-cyan-500 transition-all duration-300" 
                    style={{ width: `${(currentStep / (Object.keys(STEPS).length - 1)) * 100}%` }}
                  />
                </div>
              </div>

              {/* Summary Title */}
              <div className="mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Your Information</h3>
                <p className="text-sm text-gray-600">Summary of your entries</p>
              </div>

              {/* Summary Content */}
              <div className="space-y-3">
                {/* Personal Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      About You
                    </div>
                    <button
                      onClick={() => setIsEditingPersonalInfo(!isEditingPersonalInfo)}
                      className="text-cyan-500 hover:text-cyan-600 transition-colors p-1"
                      title={isEditingPersonalInfo ? "Save changes" : "Edit information"}
                    >
                      {isEditingPersonalInfo ? (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      )}
                    </button>
                  </h4>
                  <div className="space-y-3 text-sm">
                    {/* Current Age */}
                    <div className="flex justify-between items-center min-h-[32px]">
                      <span className="text-gray-600 flex-shrink-0">Current Age:</span>
                      {isEditingPersonalInfo ? (
                        <input
                          type="text"
                          value={formData.currentAge || ''}
                          onChange={(e) => updateFormData({ currentAge: parseInt(e.target.value) || 0 })}
                          className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min="18"
                          max="100"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{formData.currentAge || '-'}</span>
                      )}
                    </div>
                    
                    {/* Retirement Age */}
                    <div className="flex justify-between items-center min-h-[32px]">
                      <span className="text-gray-600 flex-shrink-0">Retirement Age:</span>
                      {isEditingPersonalInfo ? (
                        <input
                          type="text"
                          value={formData.retirementAge || ''}
                          onChange={(e) => updateFormData({ retirementAge: parseInt(e.target.value) || 0 })}
                          className="w-20 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          min={formData.currentAge + 1}
                          max="75"
                        />
                      ) : (
                        <span className="font-medium text-gray-900">{formData.retirementAge || '-'}</span>
                      )}
                    </div>
                    
                    {/* Annual Income */}
                    <div className="flex justify-between items-center min-h-[32px]">
                      <span className="text-gray-600 flex-shrink-0">Annual Income:</span>
                      {isEditingPersonalInfo ? (
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-xs">$</span>
                          <input
                            type="text"
                            value={formData.annualIncome ? formatNumberWithCommas(formData.annualIncome.toString()) : ''}
                            onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ annualIncome: value }))}
                            className="w-28 pl-5 pr-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            min="0"
                          />
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">
                          {formData.annualIncome ? `$${formData.annualIncome.toLocaleString()}` : '-'}
                        </span>
                      )}
                    </div>
                    
                    {/* Province */}
                    <div className="flex justify-between items-center min-h-[32px]">
                      <span className="text-gray-600 flex-shrink-0">Province:</span>
                      <span className="font-medium text-gray-900">{formData.province || '-'}</span>
                        </div>

                    {/* Marital Status */}
                    <div className="flex justify-between items-center min-h-[32px]">
                      <span className="text-gray-600 flex-shrink-0">Marital Status:</span>
                      <span className="font-medium text-gray-900 capitalize">{formData.maritalStatus || '-'}</span>
                    </div>
                  </div>
                </div>

                {/* Current Savings */}
                {currentStep >= STEPS.CURRENT_SAVINGS && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" />
                        </svg>
                        Current Savings
                      </div>
                      <button
                        onClick={() => setIsEditingCurrentSavings(!isEditingCurrentSavings)}
                        className="text-cyan-500 hover:text-cyan-600 transition-colors p-1"
                      >
                        {isEditingCurrentSavings ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        )}
                      </button>
                    </h4>
                    <div className="space-y-2 text-sm">
                      {/* Total Current Savings */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Total Savings:</span>
                        <span className="font-medium text-gray-900">
                          ${((formData.savings || []).reduce((sum, entry) => sum + (parseFloat(entry.amount) || 0), 0)).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Investment Approach */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Investment Approach:</span>
                        <span className="font-medium text-gray-900 capitalize">{formData.expectedReturnType || '-'}</span>
                            </div>

                      {/* Monthly Contributions */}
                      <div className="flex justify-between items-center">
                              <span className="text-gray-600">Monthly Contributions:</span>
                        <span className="font-medium text-gray-900">
                          ${((formData.monthlyTfsa || 0) + (formData.monthlyRrsp || 0) + (formData.monthlyOtherRegistered || 0) + (formData.monthlyNonRegistered || 0)).toLocaleString()}
                        </span>
                            </div>

                      {/* Government Benefits */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">CPP Monthly:</span>
                        <span className="font-medium text-gray-900">${(formData.cppBenefit || 0).toLocaleString()}</span>
                                </div>

                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">OAS Monthly:</span>
                        <span className="font-medium text-gray-900">${(formData.oasBenefit || 0).toLocaleString()}</span>
                        </div>
                    </div>
                  </div>
                )}

                {/* Income Goals */}
                {currentStep >= STEPS.INCOME_GOALS && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Income Goals
                      </div>
                      <button
                        onClick={() => setIsEditingIncomeGoals(!isEditingIncomeGoals)}
                        className="text-cyan-500 hover:text-cyan-600 transition-colors p-1"
                      >
                        {isEditingIncomeGoals ? (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                          </svg>
                        )}
                      </button>
                    </h4>
                    <div className="space-y-2 text-sm">
                      {/* Income Replacement Ratio */}
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Income Replacement:</span>
                        <span className="font-medium text-gray-900">
                          {formData.incomeReplacementRatio ? `${Math.round(formData.incomeReplacementRatio * 100)}%` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
} 