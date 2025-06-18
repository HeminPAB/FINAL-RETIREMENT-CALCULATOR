import { useEffect, useState } from 'react';
import { RetirementCalculator } from '../../lib/retirementCalculator';

const IncomeGoalsStep = ({ formData, updateFormData, onNext, onPrev, isCalculating }) => {
  const [localEstimate, setLocalEstimate] = useState(null);
  const [expandedSection, setExpandedSection] = useState(null);
  const [isEditingCustomRatio, setIsEditingCustomRatio] = useState(false);
  const [customRatioInput, setCustomRatioInput] = useState('');
  const [expandedQuestion, setExpandedQuestion] = useState('dependents');

  const handleInputChange = (field, value) => {
    let processedValue = value;
    
    if (field === 'currentIncome' || field === 'monthlyContribution') {
      processedValue = parseFloat(value) || 0;
    } else if (field === 'incomeReplacementRatio' || field === 'savingsRate' || field === 'inflationRate') {
      processedValue = parseFloat(value) || 0;
    }
    
    updateFormData({ [field]: processedValue });
    
    // Auto-open next relevant question based on selection
    if (field === 'hasDependents') {
      if (value === true) {
        setExpandedQuestion('whoDepends');
      } else {
        setExpandedQuestion('debt');
      }
    } else if (field === 'dependentTypes') {
      if (!Object.values(value).some(v => v)) {
        // If no dependent types selected, go to debt
        setExpandedQuestion('debt');
      }
      // Keep whoDepends open for all selections (including children)
    } else if (field === 'hasDebt') {
      if (value === true) {
        setExpandedQuestion('debtAmount');
      } else {
        setExpandedQuestion(null);
      }
    }
  };

  const toggleLearnMore = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleBenefitChange = (field, value) => {
    const numericValue = parseFloat(value) || 0;
    updateFormData({ [field]: numericValue });
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercentage = (value) => {
    return value ? `${value}%` : '0%';
  };

  const getEducationalContent = (type) => {
    const content = {
      cpp: {
        title: 'CPP/QPP Benefits Guide',
        points: [
          '2025 maximum monthly CPP: $1,433 at age 65 ($17,196 annually)',
          'Average monthly CPP: ~$810 ($9,720 annually)',
          'Taking CPP at age 60: 36% reduction ($917/month max)',
          'Delaying CPP to age 70: 42% increase ($2,035/month max)',
          'Benefits based on your contributions over working years'
        ],
        tip: 'Check your actual CPP estimate at canada.ca using your Social Insurance Number - this gives you precise projections.'
      },
      oas: {
        title: 'OAS Benefits Guide',
        points: [
          '2025 maximum monthly OAS: $727.67 at age 65 ($8,732 annually)',
          'Enhanced OAS at 75+: Additional $800.44/month for oldest seniors',
          'Full OAS requires 40+ years of Canadian residence after age 18',
          'Partial OAS: Available with 10+ years residence (prorated amount)',
          'OAS clawback: Begins at $90,997 income, fully clawed back at $148,451',
          'OAS deferral: Can delay up to age 70 for 0.6% monthly increase (36% total)'
        ],
        tip: 'OAS provides foundational retirement income for most Canadians, but high earners may lose benefits due to clawback.'
      }
    };
    return content[type] || null;
  };

  const investmentApproaches = [
    'Conservative',
    'Moderate',
    'Aggressive'
  ];

  const lifestyleChoices = [
    'Downsize',
    'Maintain current',
    'Upgrade'
  ];

  const handleCustomRatioSave = () => {
    const ratio = parseFloat(customRatioInput) / 100;
    if (ratio >= 0.1 && ratio <= 1.1) {
      handleInputChange('incomeReplacementRatio', ratio);
    }
    setIsEditingCustomRatio(false);
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestion(expandedQuestion === questionId ? null : questionId);
  };

  const getAnswerDisplay = (questionType) => {
    switch (questionType) {
      case 'dependents':
        return formData.hasDependents === true ? 'Yes' : formData.hasDependents === false ? 'No' : '';
      case 'whoDepends':
        if (!formData.dependentTypes) return '';
        const selected = Object.entries(formData.dependentTypes)
          .filter(([key, value]) => value)
          .map(([key]) => {
            switch (key) {
              case 'children': return 'Child(ren)';
              case 'spouse': return 'Spouse/Partner';
              case 'parents': return 'Aging Parents';
              case 'other': return 'Other';
              default: return key;
            }
          });
        let display = selected.join(', ');
        
        // Add children details if available
        if (formData.dependentTypes.children && formData.numberOfChildren && formData.youngestChildAge) {
          display += ` (${formData.numberOfChildren} children, youngest is ${formData.youngestChildAge})`;
        }
        
        return display;
      case 'debt':
        return formData.hasDebt === true ? 'Yes' : formData.hasDebt === false ? 'No' : '';
      case 'debtAmount':
        return formData.totalDebt ? `$${formData.totalDebt.toLocaleString()}` : '';
      default:
        return '';
    }
  };

  // Calculate quick estimate
  useEffect(() => {
    if (formData.currentAge && formData.retirementAge && formData.currentIncome && formData.monthlyContribution) {
      try {
        const totalSavings = (formData.rrspBalance || 0) + 
                           (formData.tfsaBalance || 0) + 
                           (formData.otherRegisteredSavings || 0) + 
                           (formData.nonRegisteredInvestments || 0);

        // Calculate actual savings rate from monthly contribution
        const monthlyContribution = formData.monthlyContribution || 0;
        const annualContribution = monthlyContribution * 12;
        const currentIncome = formData.currentIncome || 0;
        const calculatedSavingsRate = currentIncome > 0 ? (annualContribution / currentIncome) * 100 : 0;

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

        const estimateInputs = {
          currentAge: formData.currentAge,
          retirementAge: formData.retirementAge,
          yearsInRetirement: formData.yearsInRetirement || 25,
          currentIncome: formData.currentIncome,
          currentSavings: totalSavings,
          savingsRate: calculatedSavingsRate, // Use calculated savings rate
          incomeReplacementRatio: formData.incomeReplacementRatio || 70,
          cppBenefit: formData.cppBenefit || 0,
          oasBenefit: formData.oasBenefit || 0,
          companyPension: formData.companyPension || 0,
          otherIncome: formData.otherIncome || 0,
          preRetirementReturn: preRetirementReturnRate,
          retirementReturn: retirementReturnRate,
          incomeGrowthRate: (formData.incomeGrowthRate || 2) / 100,
          inflationRate: (formData.inflationRate || 2.5) / 100
        };

        const calculator = new RetirementCalculator(estimateInputs);
        const results = calculator.calculate();
        setLocalEstimate(results);
      } catch (error) {
        console.log('Error calculating estimate:', error);
        setLocalEstimate(null);
      }
    }
  }, [formData]);

  return (
    <div className="space-y-3">
      {/* Income Replacement Ratio Section */}
      <div>
        <h2 className="text-foreground text-xl font-bold mb-6">Income Replacement Ratio</h2>
        
        {/* Three-box style like Investment Approach */}
        <div className="grid grid-cols-3 gap-3 mb-3">
          {/* 60% Conservative */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              formData.incomeReplacementRatio === 0.6 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 bg-white hover:border-cyan-300'
            }`}
            onClick={() => handleInputChange('incomeReplacementRatio', 0.6)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`text-3xl font-bold ${
                formData.incomeReplacementRatio === 0.6 ? 'text-cyan-700' : 'text-gray-900'
              }`}>60%</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                formData.incomeReplacementRatio === 0.6 
                  ? 'text-cyan-700 bg-cyan-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                Conservative
              </span>
            </div>
            <h3 className="text-foreground text-base font-bold mb-2">Lower Lifestyle</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Lower expenses, mortgage paid off, downsizing
            </p>
          </div>

          {/* 80% Standard */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              formData.incomeReplacementRatio === 0.8 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 bg-white hover:border-cyan-300'
            }`}
            onClick={() => handleInputChange('incomeReplacementRatio', 0.8)}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`text-3xl font-bold ${
                formData.incomeReplacementRatio === 0.8 ? 'text-cyan-700' : 'text-gray-900'
              }`}>80%</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                formData.incomeReplacementRatio === 0.8 
                  ? 'text-cyan-700 bg-cyan-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                Standard
              </span>
            </div>
            <h3 className="text-foreground text-base font-bold mb-2">Maintain Lifestyle</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Maintain current lifestyle
            </p>
          </div>

          {/* Custom */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all relative ${
              formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 bg-white hover:border-cyan-300'
            }`}
            onClick={() => {
              if (formData.incomeReplacementRatio === 0.6 || formData.incomeReplacementRatio === 0.8) {
                handleInputChange('incomeReplacementRatio', 0.7);
              }
            }}
          >
            <div className="flex justify-between items-start mb-3">
              <div className={`text-3xl font-bold ${
                formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8 ? 'text-cyan-700' : 'text-gray-900'
              }`}>
                {formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8 
                  ? `${Math.round(formData.incomeReplacementRatio * 100)}%` 
                  : 'Custom'
                }
              </div>
              <div className="flex items-center gap-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8 
                    ? 'text-cyan-700 bg-cyan-100' 
                    : 'text-gray-700 bg-gray-100'
                }`}>
                  Custom
                </span>
                {formData.incomeReplacementRatio !== 0.6 && formData.incomeReplacementRatio !== 0.8 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingCustomRatio(true);
                      setCustomRatioInput((formData.incomeReplacementRatio * 100).toString());
                    }}
                    className="p-1 text-cyan-600 hover:text-cyan-800 transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            <h3 className="text-foreground text-base font-bold mb-2">Set Your Own</h3>
            <p className="text-gray-600 text-xs leading-relaxed">
              Set your own ratio
            </p>
            
            {/* Inline editing */}
            {isEditingCustomRatio && (
              <div className="absolute inset-0 bg-white border-2 border-cyan-500 rounded-lg p-4 flex flex-col justify-center items-center">
                <div className="relative w-full max-w-20">
                  <input
                    type="number"
                    value={customRatioInput}
                    onChange={(e) => setCustomRatioInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleCustomRatioSave();
                      } else if (e.key === 'Escape') {
                        setIsEditingCustomRatio(false);
                      }
                    }}
                    onBlur={handleCustomRatioSave}
                    className="w-full text-center text-lg font-bold border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    min="10"
                    max="110"
                    autoFocus
                  />
                  <span className="absolute -right-4 top-1/2 transform -translate-y-1/2 text-lg font-bold text-gray-600">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Press Enter to save</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Protection & Family Section */}
      <div className="pt-3 mt-4">
        <h2 className="text-foreground text-xl font-bold mb-6">Protection & Family</h2>
        
        <div className="space-y-4">
          {/* Question 1: Dependents */}
          <div className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
            expandedQuestion === 'dependents' ? 'border-cyan-500' : 'border-gray-200'
          } ${getAnswerDisplay('dependents') ? 'bg-cyan-50/30' : 'bg-white'}`}>
            <div 
              className={`p-4 cursor-pointer flex justify-between items-center transition-all duration-300 ${
                getAnswerDisplay('dependents') ? 'bg-cyan-50/50' : 'bg-gray-50'
              } hover:bg-gray-100`}
              onClick={() => toggleQuestion('dependents')}
            >
              <div>
                <div className="text-base font-medium text-gray-900">
                  Do you have anyone depending on your income?
                </div>
                {getAnswerDisplay('dependents') && (
                  <div className="text-xs text-cyan-600 mt-1">
                    {getAnswerDisplay('dependents')}
                  </div>
                )}
              </div>
              <div className={`text-sm text-gray-400 transition-transform duration-300 ${
                expandedQuestion === 'dependents' ? 'transform rotate-180' : ''
              }`}>
                ▼
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-400 ease-out ${
              expandedQuestion === 'dependents' ? 'max-h-96 p-5' : 'max-h-0'
            }`}>
              <div className="flex gap-2">
                <button
                  className={`flex-1 p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                    formData.hasDependents === true
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-700'
                      : 'bg-white border-gray-200 hover:border-cyan-500'
                  }`}
                  onClick={() => handleInputChange('hasDependents', true)}
                >
                  Yes
                </button>
                <button
                  className={`flex-1 p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                    formData.hasDependents === false
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-700'
                      : 'bg-white border-gray-200 hover:border-cyan-500'
                  }`}
                  onClick={() => handleInputChange('hasDependents', false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Question 2: Who Depends (Conditional) */}
          {formData.hasDependents === true && (
            <div className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
              expandedQuestion === 'whoDepends' ? 'border-cyan-500' : 'border-gray-200'
            } ${getAnswerDisplay('whoDepends') ? 'bg-cyan-50/30' : 'bg-white'}`}>
              <div 
                className={`p-4 cursor-pointer flex justify-between items-center transition-all duration-300 ${
                  getAnswerDisplay('whoDepends') ? 'bg-cyan-50/50' : 'bg-gray-50'
                } hover:bg-gray-100`}
                onClick={() => toggleQuestion('whoDepends')}
              >
                <div>
                  <div className="text-base font-medium text-gray-900">
                    Who depends on your income?
                  </div>
                  {getAnswerDisplay('whoDepends') && (
                    <div className="text-xs text-cyan-600 mt-1">
                      {getAnswerDisplay('whoDepends')}
                    </div>
                  )}
                </div>
                <div className={`text-sm text-gray-400 transition-transform duration-300 ${
                  expandedQuestion === 'whoDepends' ? 'transform rotate-180' : ''
                }`}>
                  ▼
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-400 ease-out ${
                expandedQuestion === 'whoDepends' ? 'max-h-[500px] p-5' : 'max-h-0'
              }`}>
                                 <div className="grid grid-cols-2 gap-2">
                   {[
                     { key: 'children', label: 'Child(ren)' },
                     { key: 'spouse', label: 'Spouse/Partner' },
                     { key: 'parents', label: 'Aging Parents' },
                     { key: 'other', label: 'Other' }
                   ].map((option) => (
                     <button
                       key={option.key}
                       className={`p-2 rounded-lg border-2 font-medium text-xs transition-all ${
                         formData.dependentTypes?.[option.key]
                           ? 'bg-cyan-50 border-cyan-500 text-cyan-700'
                           : 'bg-white border-gray-200 hover:border-cyan-500'
                       }`}
                       onClick={() => {
                         const currentTypes = formData.dependentTypes || {};
                         const updatedTypes = {
                           ...currentTypes,
                           [option.key]: !currentTypes[option.key]
                         };
                         handleInputChange('dependentTypes', updatedTypes);
                       }}
                     >
                       {option.label}
                     </button>
                   ))}
                 </div>
                 
                 {/* Children details inline when children is selected */}
                 {formData.dependentTypes?.children && (
                   <div className="border-t border-gray-100 pt-4 mt-4">
                     <h4 className="text-sm font-medium text-gray-900 mb-3">Tell us about your children</h4>
                     <div className="grid grid-cols-2 gap-3">
                       <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                           Number of children
                         </label>
                         <input
                           type="number"
                           value={formData.numberOfChildren || ''}
                           onChange={(e) => handleInputChange('numberOfChildren', parseInt(e.target.value) || 0)}
                           className="w-full p-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
                           min="0"
                           placeholder="2"
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-medium text-gray-600 mb-1">
                           Youngest child's age
                         </label>
                         <input
                           type="number"
                           value={formData.youngestChildAge || ''}
                           onChange={(e) => handleInputChange('youngestChildAge', parseInt(e.target.value) || 0)}
                           className="w-full p-2 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
                           min="0"
                           max="25"
                           placeholder="5"
                         />
                       </div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          )}

          {/* Question 4: Debt */}
          <div className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
            expandedQuestion === 'debt' ? 'border-cyan-500' : 'border-gray-200'
          } ${getAnswerDisplay('debt') ? 'bg-cyan-50/30' : 'bg-white'}`}>
            <div 
              className={`p-4 cursor-pointer flex justify-between items-center transition-all duration-300 ${
                getAnswerDisplay('debt') ? 'bg-cyan-50/50' : 'bg-gray-50'
              } hover:bg-gray-100`}
              onClick={() => toggleQuestion('debt')}
            >
              <div>
                <div className="text-base font-medium text-gray-900">
                  Do you have debt you'd want paid off?
                </div>
                {getAnswerDisplay('debt') && (
                  <div className="text-xs text-cyan-600 mt-1">
                    {getAnswerDisplay('debt')}
                  </div>
                )}
              </div>
              <div className={`text-sm text-gray-400 transition-transform duration-300 ${
                expandedQuestion === 'debt' ? 'transform rotate-180' : ''
              }`}>
                ▼
              </div>
            </div>
            <div className={`overflow-hidden transition-all duration-400 ease-out ${
              expandedQuestion === 'debt' ? 'max-h-96 p-5' : 'max-h-0'
            }`}>
              <div className="flex gap-2">
                <button
                  className={`flex-1 p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                    formData.hasDebt === true
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-700'
                      : 'bg-white border-gray-200 hover:border-cyan-500'
                  }`}
                  onClick={() => handleInputChange('hasDebt', true)}
                >
                  Yes
                </button>
                <button
                  className={`flex-1 p-3 rounded-lg border-2 font-medium text-sm transition-all ${
                    formData.hasDebt === false
                      ? 'bg-cyan-50 border-cyan-500 text-cyan-700'
                      : 'bg-white border-gray-200 hover:border-cyan-500'
                  }`}
                  onClick={() => handleInputChange('hasDebt', false)}
                >
                  No
                </button>
              </div>
            </div>
          </div>

          {/* Question 5: Debt Amount (Conditional) */}
          {formData.hasDebt === true && (
            <div className={`border-2 rounded-lg overflow-hidden transition-all duration-300 ${
              expandedQuestion === 'debtAmount' ? 'border-cyan-500' : 'border-gray-200'
            } ${getAnswerDisplay('debtAmount') ? 'bg-cyan-50/30' : 'bg-white'}`}>
              <div 
                className={`p-4 cursor-pointer flex justify-between items-center transition-all duration-300 ${
                  getAnswerDisplay('debtAmount') ? 'bg-cyan-50/50' : 'bg-gray-50'
                } hover:bg-gray-100`}
                onClick={() => toggleQuestion('debtAmount')}
              >
                <div>
                  <div className="text-base font-medium text-gray-900">
                    Total debt amount
                  </div>
                  {getAnswerDisplay('debtAmount') && (
                    <div className="text-xs text-cyan-600 mt-1">
                      {getAnswerDisplay('debtAmount')}
                    </div>
                  )}
                </div>
                <div className={`text-sm text-gray-400 transition-transform duration-300 ${
                  expandedQuestion === 'debtAmount' ? 'transform rotate-180' : ''
                }`}>
                  ▼
                </div>
              </div>
              <div className={`overflow-hidden transition-all duration-400 ease-out ${
                expandedQuestion === 'debtAmount' ? 'max-h-96 p-5' : 'max-h-0'
              }`}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={formData.totalDebt || ''}
                    onChange={(e) => handleInputChange('totalDebt', parseFloat(e.target.value) || 0)}
                    className="w-full pl-8 pr-3 py-3 border-2 border-gray-200 rounded-lg text-sm focus:outline-none focus:border-cyan-500"
                    placeholder="150,000"
                    min="0"
                  />
                  <div className="text-xs text-gray-500 mt-2">
                    Include mortgage, loans, credit cards, etc.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center border-t border-border pt-6 mt-8">
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-gray-100 hover:bg-gray-200 text-gray-700"
          onClick={onPrev}
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-accent hover:bg-primary-500 text-white shadow-sm hover:shadow-md"
          onClick={onNext}
          disabled={isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Calculate'}
        </button>
      </div>
    </div>
  );
};

export default IncomeGoalsStep; 