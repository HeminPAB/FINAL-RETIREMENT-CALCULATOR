import { useState } from 'react';

const PersonalInfoStep = ({ formData, updateFormData, onNext, onPrev }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  const handleInputChange = (field, value) => {
    updateFormData({ [field]: value });
  };

  const toggleLearnMore = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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

  const provinces = [
    'Alberta', 'British Columbia', 'Manitoba', 'New Brunswick', 'Newfoundland and Labrador',
    'Northwest Territories', 'Nova Scotia', 'Nunavut', 'Ontario', 'Prince Edward Island',
    'Quebec', 'Saskatchewan', 'Yukon'
  ];

  const maritalStatuses = ['Single', 'Married', 'Common-law', 'Divorced', 'Widowed'];

  // Validation
  const isValid = formData.currentAge > 0 && 
                  formData.retirementAge > formData.currentAge && 
                  formData.annualIncome > 0 &&
                  formData.incomeGrowthRate >= 0;

  return (
    <div className="space-y-4">
      {/* Current Age Input */}
      <div>
        <label className="block">
          <p className="text-foreground text-base font-medium mb-2">Current Age</p>
          <input
            type="text"
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={formData.currentAge}
            onChange={(e) => handleInputChange('currentAge', parseInt(e.target.value) || 0)}
            min="18"
            max="65"
          />
          <button 
            className="text-accent text-sm mt-2 flex items-center gap-1 hover:text-primary-500 transition-colors"
            onClick={() => toggleLearnMore('currentAge')}
          >
            Learn more
            <svg className={`w-4 h-4 transition-transform ${expandedSection === 'currentAge' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSection === 'currentAge' && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Why Your Age Matters</h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Determines how many years you have to save and grow your investments</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Affects compound growth potential - starting early makes a huge difference</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Influences retirement account contribution limits and catch-up contributions</p>
                </div>
              </div>

              <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-pink-700 font-semibold">Quick Tip:</p>
                    <p className="text-pink-700 mt-1">Every year you delay saving for retirement can require significantly higher monthly contributions later.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Retirement Age Input */}
      <div>
        <label className="block">
          <p className="text-foreground text-base font-medium mb-2">Planned Retirement Age</p>
          <input
            type="text"
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            value={formData.retirementAge}
            onChange={(e) => handleInputChange('retirementAge', parseInt(e.target.value) || 0)}
            min={formData.currentAge + 1}
            max="75"
          />
          <button 
            className="text-accent text-sm mt-2 flex items-center gap-1 hover:text-primary-500 transition-colors"
            onClick={() => toggleLearnMore('retirementAge')}
          >
            Learn more
            <svg className={`w-4 h-4 transition-transform ${expandedSection === 'retirementAge' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSection === 'retirementAge' && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Choosing Your Retirement Age</h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Age 60: Earliest CPP reduced benefits (36% reduction from full amount)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Age 65: Full CPP and OAS benefits available at standard rates</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Age 70: Maximum CPP benefits (42% increase from age 65 amount)</p>
                </div>
              </div>

              <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-pink-700 font-semibold">Quick Tip:</p>
                    <p className="text-pink-700 mt-1">Later retirement means you need a smaller nest egg since you have more time to save and fewer retirement years to fund.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Province/Territory */}
      <div>
        <label className="block">
          <p className="text-foreground text-base font-medium mb-2">Province/Territory</p>
          <select
            className="w-full bg-white border border-border rounded-lg px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all appearance-none"
            value={formData.province}
            onChange={(e) => handleInputChange('province', e.target.value)}
          >
            <option value="">Select Province/Territory</option>
            {provinces.map(province => (
              <option key={province} value={province}>{province}</option>
            ))}
          </select>
          <button 
            className="text-accent text-sm mt-2 flex items-center gap-1 hover:text-primary-500 transition-colors"
            onClick={() => toggleLearnMore('province')}
          >
            Learn more
            <svg className={`w-4 h-4 transition-transform ${expandedSection === 'province' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          {expandedSection === 'province' && (
            <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Provincial Impact on Retirement</h3>
              
              <div className="space-y-2 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Tax rates vary significantly by province (Alberta lowest, Quebec highest)</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Additional benefits like QPP in Quebec, different healthcare coverage</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p className="text-gray-700">Cost of living differences in housing, utilities, and services</p>
                </div>
              </div>

              <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-pink-700 font-semibold">Quick Tip:</p>
                    <p className="text-pink-700 mt-1">Consider where you plan to retire when calculating your needs - you might move to a lower-cost province.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Income Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Annual Income */}
        <div>
          <label className="block">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-foreground text-base font-medium">Current Annual Income</p>
              <div className="relative group">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  Include all income sources: salary, bonuses, self-employment, and investment income
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                placeholder="65,000"
                className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.annualIncome ? formatNumberWithCommas(formData.annualIncome.toString()) : ''}
                onChange={(e) => handleCurrencyInput(e.target.value, (value) => handleInputChange('annualIncome', value))}
              />
            </div>
          </label>
        </div>

        {/* Expected Income Increase */}
        <div>
          <label className="block">
            <p className="text-foreground text-base font-medium mb-2">Expected Annual Income Increase</p>
            <div className="relative">
              <input
                type="text"
                placeholder="2.1"
                className="w-full bg-white border border-border rounded-lg px-4 py-3 pr-8 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.incomeGrowthRate ? formData.incomeGrowthRate * 100 : ''}
                onChange={(e) => handleInputChange('incomeGrowthRate', (parseFloat(e.target.value) || 0) / 100)}
                min="0"
                max="10"
                step="0.1"
              />
              <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
            </div>
            <button 
              className="text-accent text-sm mt-2 flex items-center gap-1 hover:text-primary-500 transition-colors"
              onClick={() => toggleLearnMore('incomeGrowthRate')}
            >
              Learn more
              <svg className={`w-4 h-4 transition-transform ${expandedSection === 'incomeGrowthRate' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </label>
        </div>
      </div>

      {/* Income Growth Learn More - Full Width */}
      {expandedSection === 'incomeGrowthRate' && (
        <div className="mt-3 p-6 bg-white rounded-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Income Growth Expectations</h3>
          
          <div className="space-y-3 mb-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Historical average: Canadian wages grow 2-3% annually</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Career stage: Early career often sees higher growth rates</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
              <p className="text-gray-700">Industry factors: Tech and healthcare typically above average</p>
            </div>
          </div>

          <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-pink-700 font-semibold">Quick Tip:</p>
                <p className="text-pink-700 mt-1">Be conservative in your estimate. It's better to exceed expectations than fall short of retirement goals.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Marital Status */}
      <div>
        <p className="text-foreground text-base font-medium mb-4">Marital Status</p>
        <div className="flex flex-wrap gap-3">
          {maritalStatuses.map(status => (
            <label
              key={status}
              className={`text-sm font-medium flex items-center justify-center rounded-lg border px-6 py-3 cursor-pointer transition-all ${
                formData.maritalStatus === status.toLowerCase()
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white border-border text-foreground hover:border-accent'
              }`}
            >
              {status}
              <input
                type="radio"
                className="sr-only"
                name="maritalStatus"
                checked={formData.maritalStatus === status.toLowerCase()}
                onChange={() => handleInputChange('maritalStatus', status.toLowerCase())}
              />
            </label>
          ))}
        </div>
        <button 
          className="text-accent text-sm mt-3 flex items-center gap-1 hover:text-primary-500 transition-colors"
          onClick={() => toggleLearnMore('maritalStatus')}
        >
          Learn more
          <svg className={`w-4 h-4 transition-transform ${expandedSection === 'maritalStatus' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
        {expandedSection === 'maritalStatus' && (
          <div className="mt-3 p-6 bg-white rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How Marital Status Affects Retirement</h3>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Married/Common-law: Income splitting opportunities and joint savings strategies</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Single: Need higher individual savings, no survivor benefits available</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-gray-700">Divorced: May receive portion of ex-spouse's CPP credits through credit splitting</p>
              </div>
            </div>

            <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-pink-700 font-semibold">Quick Tip:</p>
                  <p className="text-pink-700 mt-1">Couples can coordinate their retirement savings to maximize government benefits and minimize taxes.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Projected Final Working Year Income - Blue Highlight Box */}
      {formData.annualIncome > 0 && formData.incomeGrowthRate > 0 && formData.retirementAge > formData.currentAge && (
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <p className="text-gray-900 text-sm font-bold mb-1">Projected final working year income</p>
          <p className="text-blue-600 text-2xl font-bold mb-2">
            ${Math.round(formData.annualIncome * Math.pow(1 + formData.incomeGrowthRate, (formData.retirementAge - formData.currentAge))).toLocaleString()}
          </p>
          <p className="text-gray-900 text-sm">
            Based on your current income and growth expectation.
          </p>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center border-t border-border pt-6 mt-8">
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-gray-100 text-gray-400 cursor-not-allowed"
          disabled
        >
          Previous
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium text-sm transition-all bg-accent hover:bg-primary-500 text-white shadow-sm hover:shadow-md"
          onClick={onNext}
        >
          Next: Current Savings
        </button>
      </div>
    </div>
  );
};

export default PersonalInfoStep; 