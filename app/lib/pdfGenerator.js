import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateRetirementReport = (formData, calculations) => {
  const doc = new jsPDF();
  
  // Helper function to format currency
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const formatFullCurrency = (value) => {
    return `$${Math.round(value).toLocaleString()}`;
  };

  // Extract calculations
  const {
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
  } = calculations;

  // PAGE 1: SUMMARY
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Retirement Planning Report', 20, 30);
  
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 40);

  // Personal Information Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Personal Information', 20, 60);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  const personalInfo = [
    ['Current Age:', `${currentAge} years`],
    ['Retirement Age:', `${retirementAge} years`],
    ['Years to Retirement:', `${yearsToRetirement} years`],
    ['Current Annual Income:', formatFullCurrency(currentAnnualIncome)],
    ['Income Growth Rate:', `${(incomeGrowthRate * 100).toFixed(1)}%`]
  ];
  
  let yPos = 70;
  personalInfo.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 120, yPos);
    yPos += 8;
  });

  // Retirement Goals Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Retirement Goals', 20, yPos + 10);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  yPos += 20;
  const retirementGoals = [
    ['Income Replacement Target:', `${Math.round(incomeReplacementRatio)}%`],
    ['Target Monthly Retirement Income:', formatFullCurrency(targetMonthlyRetirementIncome)],
    ['Monthly Government Benefits:', formatFullCurrency(monthlyGovernmentBenefits)],
    ['Required Monthly Withdrawal:', formatFullCurrency(netRequiredMonthlyWithdrawal)]
  ];
  
  retirementGoals.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 120, yPos);
    yPos += 8;
  });

  // Current Financial Position Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Current Financial Position', 20, yPos + 10);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  yPos += 20;
  const currentPosition = [
    ['Current Total Savings:', formatFullCurrency(currentSavings)],
    ['Monthly Contributions:', formatFullCurrency(monthlyContributions)],
    ['Expected Return:', `${(expectedReturn * 100).toFixed(1)}%`],
    ['Investment Risk Profile:', formData.expectedReturnType?.charAt(0).toUpperCase() + formData.expectedReturnType?.slice(1) || 'Not specified']
  ];
  
  currentPosition.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 120, yPos);
    yPos += 8;
  });

  // Projection Results Section
  doc.setFontSize(16);
  doc.setTextColor(40, 40, 40);
  doc.text('Projection Results', 20, yPos + 10);
  
  doc.setFontSize(11);
  doc.setTextColor(60, 60, 60);
  yPos += 20;
  const projectionResults = [
    ['Projected Savings at Retirement:', formatCurrency(projectedSavings)],
    ['Monthly Income from Savings:', formatFullCurrency(monthlyIncomeFromSavings)],
    ['Total Monthly Retirement Income:', formatFullCurrency(monthlyIncomeFromSavings + monthlyGovernmentBenefits)],
    ['Sustainability Rate:', `${Math.min(100, Math.max(0, (monthlyIncomeFromSavings / netRequiredMonthlyWithdrawal) * 100)).toFixed(1)}%`]
  ];
  
  projectionResults.forEach(([label, value]) => {
    doc.text(label, 25, yPos);
    doc.text(value, 120, yPos);
    yPos += 8;
  });

  // PAGE 2: PRE-RETIREMENT PROJECTIONS
  doc.addPage();
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Year-by-Year Projections', 20, 30);
  
  doc.setFontSize(14);
  doc.text('Pre-Retirement Phase', 20, 45);

  // Generate year-by-year data for pre-retirement
  const preRetirementData = [];
  const currentYear = new Date().getFullYear();
  
  for (let i = 0; i <= yearsToRetirement; i++) {
    const year = currentYear + i;
    const age = currentAge + i;
    const annualIncome = currentAnnualIncome * Math.pow(1 + incomeGrowthRate, i);
    
    // Calculate year-end balance with compound interest
    let yearEndBalance = 0;
    let investmentReturn = 0;
    
    if (i === 0) {
      investmentReturn = currentSavings * expectedReturn;
      yearEndBalance = currentSavings * (1 + expectedReturn) + (monthlyContributions * 12);
    } else {
      // Previous year's balance - need to extract numeric value from formatted string
      const prevBalanceStr = preRetirementData[i-1][5];
      const prevBalance = parseFloat(prevBalanceStr.replace(/[$,]/g, ''));
      investmentReturn = prevBalance * expectedReturn;
      yearEndBalance = prevBalance * (1 + expectedReturn) + (monthlyContributions * 12);
    }
    
    preRetirementData.push([
      year,
      age,
      formatFullCurrency(annualIncome),
      formatFullCurrency(monthlyContributions * 12),
      formatFullCurrency(investmentReturn),
      formatFullCurrency(yearEndBalance)
    ]);
  }

  // Create table for pre-retirement projections
  autoTable(doc, {
    head: [['Year', 'Age', 'Annual Income', 'Annual Contribution', 'Investment Return', 'Year-End Balance']],
    body: preRetirementData,
    startY: 55,
    theme: 'grid',
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 }
    }
  });

  // PAGE 3: POST-RETIREMENT WITHDRAWALS
  doc.addPage();
  doc.setFontSize(20);
  doc.setTextColor(40, 40, 40);
  doc.text('Post-Retirement Withdrawals', 20, 30);
  
  doc.setFontSize(14);
  doc.text('Retirement Phase (Age 70-95)', 20, 45);

  // Generate post-retirement withdrawal data
  const postRetirementData = [];
  let remainingBalance = projectedSavings;
  const annualWithdrawal = netRequiredMonthlyWithdrawal * 12;
  const monthlyWithdrawal = netRequiredMonthlyWithdrawal;
  
  for (let age = retirementAge; age <= 95; age++) {
    const year = currentYear + (age - currentAge);
    
    // Calculate balance after withdrawal and growth
    const balanceAfterWithdrawal = Math.max(0, remainingBalance - annualWithdrawal);
    const growthOnRemainingBalance = balanceAfterWithdrawal * expectedReturn;
    const yearEndBalance = balanceAfterWithdrawal + growthOnRemainingBalance;
    
    postRetirementData.push([
      year,
      age,
      formatFullCurrency(annualWithdrawal),
      formatFullCurrency(monthlyWithdrawal),
      formatFullCurrency(growthOnRemainingBalance),
      formatFullCurrency(yearEndBalance)
    ]);
    
    remainingBalance = yearEndBalance;
    
    // Stop if balance reaches zero
    if (remainingBalance <= 0) break;
  }

  // Create table for post-retirement withdrawals
  autoTable(doc, {
    head: [['Year', 'Age', 'Annual Withdrawal', 'Monthly Withdrawal', 'Investment Growth', 'Year-End Balance']],
    body: postRetirementData,
    startY: 55,
    theme: 'grid',
    headStyles: { fillColor: [231, 76, 60], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 25 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35 },
      4: { cellWidth: 35 },
      5: { cellWidth: 35 }
    }
  });

  // Add footer to all pages
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Page ${i} of ${pageCount}`, 20, 285);
    doc.text('This report is for illustrative purposes only and should not be considered as financial advice.', 20, 292);
  }

  // Save the PDF
  doc.save('retirement-planning-report.pdf');
}; 