import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const RetirementChart = ({ 
  currentAge,
  retirementAge,
  projectedSavings,
  netRequiredMonthlyWithdrawal,
  monthlyIncomeFromSavings,
  sustainabilityRate,
  expectedReturn 
}) => {
  // Generate age range from current age to 95
  const maxAge = 95;
  const ages = [];
  const projectedValues = [];
  const requiredValues = [];
  
  for (let age = currentAge; age <= maxAge; age++) {
    ages.push(age);
    
    if (age < retirementAge) {
      // Accumulation phase - savings grow
      const yearsToRetirement = retirementAge - age;
      const currentAgeToRetirement = retirementAge - currentAge;
      const progress = 1 - (yearsToRetirement / currentAgeToRetirement);
      projectedValues.push(projectedSavings * progress / 1000); // Convert to thousands
      requiredValues.push(0);
    } else {
      // Retirement phase - calculate fund depletion
      const yearsIntoRetirement = age - retirementAge;
      const annualWithdrawal = netRequiredMonthlyWithdrawal * 12;
      
      // Calculate required total funds needed for remaining years
      const remainingYears = maxAge - age;
      const totalFundsNeeded = annualWithdrawal * remainingYears;
      requiredValues.push(totalFundsNeeded / 1000); // Convert to thousands
      
      // Calculate actual funds remaining (simple withdrawal model)
      let remainingFunds = projectedSavings - (annualWithdrawal * yearsIntoRetirement);
      remainingFunds = Math.max(0, remainingFunds); // Can't go below 0
      projectedValues.push(remainingFunds / 1000); // Convert to thousands
    }
  }
  
  // Find when funds run out
  const depletionAge = projectedValues.findIndex((value, index) => 
    index > (retirementAge - currentAge) && value <= 0
  );
  
  const actualDepletionAge = depletionAge > -1 ? currentAge + depletionAge : null;
  
  // Calculate shortfall and required monthly savings
  const totalRetirementNeeded = netRequiredMonthlyWithdrawal * 12 * (maxAge - retirementAge);
  const shortfallAtRetirement = Math.max(0, totalRetirementNeeded - projectedSavings);
  
  // Calculate monthly savings needed using compound interest formula
  // PMT = FV / [((1 + r)^n - 1) / r] where FV is the shortfall
  const yearsToRetirement = retirementAge - currentAge;
  const monthsToRetirement = yearsToRetirement * 12;
  const monthlyRate = expectedReturn / 12;
  
  let monthlyShortfall = 0;
  if (shortfallAtRetirement > 0 && monthsToRetirement > 0) {
    if (monthlyRate > 0) {
      // Use compound interest formula
      monthlyShortfall = shortfallAtRetirement / (((Math.pow(1 + monthlyRate, monthsToRetirement) - 1) / monthlyRate));
    } else {
      // Simple division if no interest
      monthlyShortfall = shortfallAtRetirement / monthsToRetirement;
    }
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          usePointStyle: true,
          boxWidth: 6,
          padding: 15,
          font: {
            size: 13
          },
          color: 'rgb(75, 85, 99)' // gray-600
        }
      },
      title: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'white',
        titleColor: 'rgb(17, 24, 39)',
        bodyColor: 'rgb(75, 85, 99)',
        borderColor: 'rgb(229, 231, 235)',
        borderWidth: 1,
        cornerRadius: 6,
        padding: 8,
        callbacks: {
          label: function(context) {
            const value = context.parsed.y;
            return `${context.dataset.label}: ${formatChartValue(value)}`;
          }
        }
      }
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age',
          font: {
            size: 12
          },
          color: 'rgb(107, 114, 128)' // gray-500
        },
        grid: {
          display: false
        },
        ticks: {
          color: 'rgb(107, 114, 128)' // gray-500
        }
      },
      y: {
        title: {
          display: true,
          text: 'Fund Value',
          font: {
            size: 12
          },
          color: 'rgb(107, 114, 128)' // gray-500
        },
        beginAtZero: true,
        grid: {
          color: 'rgba(229, 231, 235, 0.5)', // gray-200 with transparency
        },
        ticks: {
          color: 'rgb(107, 114, 128)', // gray-500
          callback: function(value) {
            return formatChartValue(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  const data = {
    labels: ages,
    datasets: [
      {
        label: 'What You\'ll Have',
        data: projectedValues,
        borderColor: 'rgb(14, 165, 233)', // primary-500 blue
        backgroundColor: 'rgba(14, 165, 233, 0.2)', // primary-500 with transparency
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(14, 165, 233)',
        pointBorderColor: 'white',
        pointBorderWidth: 3,
        borderWidth: 3,
      },
      {
        label: 'What You\'ll Need',
        data: requiredValues,
        borderColor: 'rgb(239, 68, 68)', // red-500 for needs
        backgroundColor: 'transparent',
        borderDash: [8, 4],
        fill: false,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 8,
        pointBackgroundColor: 'rgb(239, 68, 68)',
        pointBorderColor: 'white',
        pointBorderWidth: 3,
        borderWidth: 3,
      }
    ]
  };

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${Math.round(value).toLocaleString()}`;
    }
  };

  const formatChartValue = (value) => {
    // For chart display - convert from thousands back to actual value for formatting
    const actualValue = value * 1000;
    if (actualValue >= 1000000) {
      return `$${(actualValue / 1000000).toFixed(1)}M`;
    } else if (actualValue >= 1000) {
      return `$${(actualValue / 1000).toFixed(0)}K`;
    } else {
      return `$${Math.round(actualValue).toLocaleString()}`;
    }
  };

    return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header Section */}
      <div className="px-6 py-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Our forecast:</h3>
            <div className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
              sustainabilityRate >= 100 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {sustainabilityRate >= 100 ? 'On Track' : 'Improvement Needed'}
            </div>
          </div>
          <div className="text-right">
            <div className="text-gray-500 text-sm">Sustainability Rate</div>
            <div className="text-2xl font-semibold text-gray-900">{Math.round(sustainabilityRate)}%</div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        {sustainabilityRate < 100 && (
          <div className="mb-6 space-y-4">
            <div>
              <p className="text-gray-700">
                It looks like you'll be short by about{' '}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(shortfallAtRetirement)}
                </span>
              </p>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700 text-sm">
                You could get on track by saving at least{' '}
                <span className="font-semibold text-gray-900">
                  {formatCurrency(monthlyShortfall)}
                </span>{' '}
                more per month at {(expectedReturn * 100).toFixed(1)}% return for the next {yearsToRetirement} years
              </p>
            </div>

            {actualDepletionAge && (
              <div className="text-base font-bold text-red-600">
                Funds may be depleted around age {actualDepletionAge}
              </div>
            )}
          </div>
        )}
        
        {sustainabilityRate >= 100 && (
          <div className="mb-6">
            <p className="text-gray-700">Your retirement savings plan is on track to meet your goals!</p>
            <p className="text-gray-600 text-sm mt-1">You have a {(sustainabilityRate - 100).toFixed(0)}% buffer above your minimum requirements.</p>
          </div>
        )}

        <div className="mb-6">
          <div style={{ height: '400px' }}>
            <Line options={options} data={data} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-gray-500 text-sm mb-1">What you'll need</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(totalRetirementNeeded)}
            </div>
          </div>
          <div>
            <div className="text-gray-500 text-sm mb-1">What you'll have</div>
            <div className="text-xl font-semibold text-gray-900">
              {formatCurrency(projectedSavings)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetirementChart; 