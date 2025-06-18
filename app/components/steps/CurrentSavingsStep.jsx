import { useState } from 'react';

const CurrentSavingsStep = ({ formData, updateFormData, onNext, onPrev }) => {
  const [expandedSection, setExpandedSection] = useState(null);

  // Initialize savings array if it doesn't exist - always start with one entry
  const savings = formData.savings || [];
  
  // Ensure there's always at least one savings entry
  if (savings.length === 0) {
    const initialEntry = { type: '', amount: 0, id: Date.now() };
    updateFormData({ savings: [initialEntry] });
    return null; // Re-render with the new entry
  }

  const investmentTypes = [
    { value: 'rrsp', label: 'RRSP' },
    { value: 'tfsa', label: 'TFSA' },
    { value: 'otherRegistered', label: 'Other Registered Savings' },
    { value: 'nonRegistered', label: 'Non-Registered Investments' }
  ];

  const addSavingsEntry = () => {
    const newSavings = [...savings, { type: '', amount: 0, id: Date.now() }];
    updateFormData({ savings: newSavings });
  };

  const updateSavingsEntry = (id, field, value) => {
    const updatedSavings = savings.map(entry => 
      entry.id === id ? { ...entry, [field]: value } : entry
    );
    updateFormData({ savings: updatedSavings });
  };

  const removeSavingsEntry = (id) => {
    const updatedSavings = savings.filter(entry => entry.id !== id);
    updateFormData({ savings: updatedSavings });
  };

  const toggleLearnMore = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
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

  const totalSavings = savings.reduce((total, entry) => {
    const amount = parseFloat(entry.amount) || 0;
    return total + amount;
  }, 0);

  const getEducationalContent = (type) => {
    const content = {
      rrsp: {
        title: 'RRSP Benefits',
        points: [
          'Contributions are tax-deductible',
          'Investments grow tax-free until withdrawal',
          '2025 contribution limit: 18% of income up to $31,560'
        ],
        tip: 'RRSP contributions reduce your current year\'s taxes while building retirement wealth.'
      },
      tfsa: {
        title: 'TFSA Advantages',
        points: [
          'Investment growth is completely tax-free',
          'Withdrawals don\'t affect government benefits',
          '2025 contribution room: $7,000 annually'
        ],
        tip: 'TFSAs are perfect for retirement - no taxes on withdrawals!'
      },
      otherRegistered: {
        title: 'Other Registered Accounts',
        points: [
          'Locked-In Retirement Accounts (LIRAs)',
          'Registered Pension Plans (RPPs)',
          'Deferred Profit Sharing Plans (DPSPs)'
        ],
        tip: 'These accounts typically have withdrawal restrictions but offer tax advantages.'
      },
      nonRegistered: {
        title: 'Non-Registered Investments',
        points: [
          'Complete flexibility for withdrawals',
          'Capital gains are 50% taxable',
          'Canadian dividends receive tax credits'
        ],
        tip: 'Great for bridging early retirement before accessing registered accounts.'
      },
    };
    return content[type] || null;
  };

  return (
    <div className="space-y-8">
      {/* Subheading */}
      <div className="text-left mb-6">
        <p className="text-gray-600 text-base">Start by adding your existing investments like RRSP, TFSA, non-registered accounts, and pension plans</p>
      </div>

      {/* Investment Fields in horizontal layout */}
      <div className="space-y-4">
        {savings.map((entry, index) => (
          <div key={entry.id} className="flex gap-3 items-start">
            {/* Investment Type */}
            <div className="flex-1">
              <label className="block">
                <p className="text-foreground text-base font-medium mb-2">Investment Type</p>
                <select
                  className="w-full bg-white border border-border rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all appearance-none text-sm"
                  value={entry.type}
                  onChange={(e) => updateSavingsEntry(entry.id, 'type', e.target.value)}
                >
                  <option value="">Select Investment Type</option>
                  {investmentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Current Balance */}
            <div className="flex-1">
              <label className="block">
                <p className="text-foreground text-base font-medium mb-2">Current Balance</p>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                  <input
                    type="text"
                    placeholder="0"
                    className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    value={entry.amount ? formatNumberWithCommas(entry.amount.toString()) : ''}
                    onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateSavingsEntry(entry.id, 'amount', value))}
                  />
                </div>
              </label>
            </div>

            {/* Add More Button (only show on last row) or Delete Button */}
            <div className="flex-shrink-0 pt-8">
              {index === savings.length - 1 ? (
                <button
                  onClick={addSavingsEntry}
                  className="w-10 h-10 bg-accent text-white rounded-lg hover:bg-primary-500 transition-colors flex items-center justify-center"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={() => removeSavingsEntry(entry.id)}
                  className="w-10 h-10 text-red-500 hover:text-red-700 transition-colors flex items-center justify-center"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Investment Approach Section */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <h2 className="text-foreground text-xl font-bold mb-6">Investment Approach</h2>
        
        {/* Investment Approach Cards - Number-First Design */}
        <div className="grid grid-cols-3 gap-6">
          {/* Conservative */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              formData.expectedReturnType === 'conservative' 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 bg-white hover:border-cyan-300'
            }`}
            onClick={() => updateFormData({ expectedReturnType: 'conservative' })}
          >
            {/* Risk Tag */}
            <div className="flex justify-between items-start mb-3">
              <div className={`text-3xl font-bold ${
                formData.expectedReturnType === 'conservative' ? 'text-cyan-700' : 'text-gray-900'
              }`}>4-5%</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                formData.expectedReturnType === 'conservative' 
                  ? 'text-cyan-700 bg-cyan-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                Low Risk
              </span>
            </div>
            
            {/* Approach Name */}
            <h3 className="text-foreground text-base font-bold mb-2">Conservative</h3>
            
            {/* Description */}
            <p className="text-gray-600 text-xs leading-relaxed">
              Steady growth with lower volatility. Ideal for risk-averse investors.
            </p>
          </div>

          {/* Balanced */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              formData.expectedReturnType === 'balanced' 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 bg-white hover:border-cyan-300'
            }`}
            onClick={() => updateFormData({ expectedReturnType: 'balanced' })}
          >
            {/* Risk Tag */}
            <div className="flex justify-between items-start mb-3">
              <div className={`text-3xl font-bold ${
                formData.expectedReturnType === 'balanced' ? 'text-cyan-700' : 'text-gray-900'
              }`}>6-7%</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                formData.expectedReturnType === 'balanced' 
                  ? 'text-cyan-700 bg-cyan-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                Medium Risk
              </span>
            </div>
            
            {/* Approach Name */}
            <h3 className="text-foreground text-base font-bold mb-2">Balanced</h3>
            
            {/* Description */}
            <p className="text-gray-600 text-xs leading-relaxed">
              Mix of stability and growth. Best of both worlds approach.
            </p>
          </div>

          {/* Growth */}
          <div 
            className={`p-4 rounded-lg border cursor-pointer transition-all ${
              formData.expectedReturnType === 'growth' 
                ? 'border-cyan-500 bg-cyan-50' 
                : 'border-gray-200 bg-white hover:border-cyan-300'
            }`}
            onClick={() => updateFormData({ expectedReturnType: 'growth' })}
          >
            {/* Risk Tag */}
            <div className="flex justify-between items-start mb-3">
              <div className={`text-3xl font-bold ${
                formData.expectedReturnType === 'growth' ? 'text-cyan-700' : 'text-gray-900'
              }`}>8-9%</div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                formData.expectedReturnType === 'growth' 
                  ? 'text-cyan-700 bg-cyan-100' 
                  : 'text-gray-700 bg-gray-100'
              }`}>
                High Risk
              </span>
            </div>
            
            {/* Approach Name */}
            <h3 className="text-foreground text-base font-bold mb-2">Growth</h3>
            
            {/* Description */}
            <p className="text-gray-600 text-xs leading-relaxed">
              Maximum growth potential with higher volatility. For long-term investors.
            </p>
          </div>
        </div>
      </div>

      {/* Monthly Contributions Section */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <h2 className="text-foreground text-xl font-bold mb-6">Monthly Contributions</h2>
        
        {/* Horizontal layout with all investment types in one row */}
        <div className="grid grid-cols-4 gap-4">
          {/* TFSA */}
          <div>
            <label className="block">
              <p className="text-foreground text-base font-medium mb-2">TFSA</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.monthlyTfsa ? formatNumberWithCommas(formData.monthlyTfsa.toString()) : ''}
                  onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ monthlyTfsa: value }))}
                />
              </div>
            </label>
          </div>

          {/* RRSP */}
          <div>
            <label className="block">
              <p className="text-foreground text-base font-medium mb-2">RRSP</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.monthlyRrsp ? formatNumberWithCommas(formData.monthlyRrsp.toString()) : ''}
                  onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ monthlyRrsp: value }))}
                />
              </div>
            </label>
          </div>

          {/* Other Registered Savings */}
          <div>
            <label className="block">
              <p className="text-foreground text-base font-medium mb-2">Other Registered</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.monthlyOtherRegistered ? formatNumberWithCommas(formData.monthlyOtherRegistered.toString()) : ''}
                  onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ monthlyOtherRegistered: value }))}
                />
              </div>
            </label>
          </div>

          {/* Non-Registered */}
          <div>
            <label className="block">
              <p className="text-foreground text-base font-medium mb-2">Non-Registered</p>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                <input
                  type="text"
                  placeholder=""
                  className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.monthlyNonRegistered ? formatNumberWithCommas(formData.monthlyNonRegistered.toString()) : ''}
                  onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ monthlyNonRegistered: value }))}
                />
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Other Income Section */}
      <div className="border-t border-gray-200 pt-8 mt-8">
        <h2 className="text-foreground text-xl font-bold mb-6">Other Income</h2>
        
        {/* Additional Income Box */}
        <div className="mb-6">
          <label className="block">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-foreground text-base font-medium">Additional Income (Monthly)</p>
              <div className="relative group">
                <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 w-80 max-w-sm">
                  <div className="text-center">
                    Include other sources of income such as rental income, royalties, dividends, business income, annuities, part-time work, or other passive income
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                placeholder="500"
                className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.otherIncome ? formatNumberWithCommas(formData.otherIncome.toString()) : ''}
                onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ otherIncome: value }))}
              />
            </div>
          </label>
        </div>

        {/* CPP */}
        <div className="mb-3">
          <label className="block">
            <p className="text-foreground text-base font-medium mb-2">Canada Pension Plan (CPP) - Monthly</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                placeholder="1,433"
                className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.cppBenefit ? formatNumberWithCommas(formData.cppBenefit.toString()) : '1,433'}
                onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ cppBenefit: value || 1433 }))}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default is maximum payable amount. If you know your expected CPP benefits, please enter that amount instead.
            </p>
            <button 
              className="text-accent text-sm mt-2 flex items-center gap-1 hover:text-primary-500 transition-colors"
              onClick={() => toggleLearnMore('cpp')}
            >
              Learn more
              <svg className={`w-4 h-4 transition-transform ${expandedSection === 'cpp' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {expandedSection === 'cpp' && (
              <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">CPP/QPP Benefits Guide</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">2025 maximum monthly CPP: $1,433 at age 65 ($17,196 annually)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Average monthly CPP: ~$810 ($9,720 annually)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Taking CPP at age 60: 36% reduction ($917/month max)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Delaying CPP to age 70: 42% increase ($2,035/month max)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Benefits based on your contributions over working years</p>
                  </div>
                </div>
                <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-pink-700 font-semibold">Quick Tip:</p>
                      <p className="text-pink-700 mt-1">Check your actual CPP estimate at canada.ca using your Social Insurance Number - this gives you precise projections.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </label>
        </div>
        
        {/* OAS */}
        <div>
          <label className="block">
            <p className="text-foreground text-base font-medium mb-2">Old Age Security (OAS) - Monthly</p>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="text"
                placeholder="727.67"
                className="w-full bg-white border border-border rounded-lg pl-7 pr-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                value={formData.oasBenefit ? formatNumberWithCommas(formData.oasBenefit.toString()) : '727.67'}
                onChange={(e) => handleCurrencyInput(e.target.value, (value) => updateFormData({ oasBenefit: value || 727.67 }))}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Default is maximum payable amount. If you know your expected OAS benefits, please enter that amount instead.
            </p>
            <button 
              className="text-accent text-sm mt-2 flex items-center gap-1 hover:text-primary-500 transition-colors"
              onClick={() => toggleLearnMore('oas')}
            >
              Learn more
              <svg className={`w-4 h-4 transition-transform ${expandedSection === 'oas' ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            {expandedSection === 'oas' && (
              <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200">
                <h3 className="text-lg font-bold text-gray-900 mb-3">OAS Benefits Guide</h3>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">2025 maximum monthly OAS: $727.67 at age 65 ($8,732 annually)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Enhanced OAS at 75+: Additional $800.44/month for oldest seniors</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Full OAS requires 40+ years of Canadian residence after age 18</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">Partial OAS: Available with 10+ years residence (prorated amount)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">OAS clawback: Begins at $90,997 income, fully clawed back at $148,451</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700">OAS deferral: Can delay up to age 70 for 0.6% monthly increase (36% total)</p>
                  </div>
                </div>
                <div className="bg-pink-50 border-l-4 border-pink-400 p-4 rounded-r-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-pink-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM15.657 6.343a1 1 0 011.414 0A9.972 9.972 0 0119 12a9.972 9.972 0 01-1.929 5.657 1 1 0 11-1.414-1.414A7.971 7.971 0 0017 12a7.971 7.971 0 00-1.343-4.243 1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-pink-700 font-semibold">Quick Tip:</p>
                      <p className="text-pink-700 mt-1">OAS provides foundational retirement income for most Canadians, but high earners may lose benefits due to clawback.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </label>
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
        >
          Next: Income & Goals
        </button>
      </div>
    </div>
  );
};

export default CurrentSavingsStep; 