# 🏦 RetireSmart - Comprehensive Retirement Calculator

A modern, interactive retirement planning application built with **Next.js** and **React**. Calculate your retirement savings needs with detailed projections, scenario analysis, and professional-grade insights.

## ✨ Features

### 📊 Complete Financial Projections
- **Pre-retirement accumulation** with compound interest calculations
- **Post-retirement withdrawal** modeling with sustainability analysis
- **Year-by-year breakdowns** for both phases
- **Multiple scenario comparisons** (Conservative vs Aggressive returns)

### 🎯 Advanced Calculations
- **Exact mathematical formulas** as specified in requirements
- **Income replacement ratio** analysis based on lifestyle goals
- **Government benefits integration** (CPP, OAS)
- **Withdrawal rate safety assessment** (4% rule compliance)
- **Fund depletion analysis** with age predictions

### 🎨 Beautiful UI/UX
- **Multi-step wizard** interface with progress tracking
- **Modern design** with professional color scheme
- **Responsive layout** that works on all devices
- **Interactive charts** and visual projections
- **Export capabilities** (JSON, CSV) for detailed reporting

### 🧮 Core Mathematical Formulas

#### Pre-Retirement (Accumulation):
1. `Annual_Income[year] = Annual_Income[year-1] × (1 + Income_Growth_Rate)`
2. `Annual_Contribution = Annual_Income × (Savings_Rate / 100)`
3. `Investment_Return = Beginning_Balance × Pre_Retirement_Return_Rate`
4. `Year_End_Balance = Beginning_Balance + Annual_Contribution + Investment_Return`

#### Post-Retirement (Withdrawal):
1. `Required_Annual_Income = Final_Annual_Income × (Income_Replacement_Ratio / 100)`
2. `Annual_Government_Benefits = (CPP + OAS + Company_Pension + Other_Income) × 12`
3. `Annual_Withdrawal_Needed = Required_Annual_Income - Annual_Government_Benefits`
4. `Investment_Return = (Beginning_Balance - Annual_Withdrawal) × Retirement_Return_Rate`
5. `Year_End_Balance = Beginning_Balance - Annual_Withdrawal + Investment_Return`
6. `Withdrawal_Rate = (Annual_Withdrawal / Beginning_Balance) × 100`

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18.0 or higher
- **npm** or **yarn** package manager

### Installation

1. **Clone or download** this project to your local machine

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser** and navigate to:
   ```
   http://localhost:3000
   ```

### Building for Production

```bash
npm run build
npm start
```

## 📱 How to Use

### Step 1: Personal Information
- Enter your current age and planned retirement age
- Select your province/territory and marital status
- Review your retirement timeline

### Step 2: Current Savings
- Input your RRSP, TFSA, and other savings balances
- Set expected government benefits (CPP, OAS)
- View your total current savings

### Step 3: Income & Goals
- Enter your current annual income
- Choose your investment approach (Conservative, Balanced, Growth)
- Select your desired retirement lifestyle
- Set your monthly contribution capacity

### Step 4: Results & Analysis
- **Overview Tab:** Key metrics and readiness score
- **Year-by-Year Tab:** Detailed annual projections
- **Scenarios Tab:** Conservative vs Aggressive comparison
- Export your complete retirement plan

## 🎯 Key Insights Provided

### 📈 Retirement Readiness Score
- Calculated based on savings adequacy and sustainability
- Color-coded assessment (Green: 75%+, Yellow: 50-75%, Red: <50%)

### 💰 Critical Metrics
- **Total savings at retirement**
- **Monthly contribution requirements**
- **Withdrawal rate analysis** with safety assessment
- **Fund sustainability** through retirement years

### ⚠️ Risk Assessment
- **Safe:** ≤4% withdrawal rate
- **Moderate:** 4-5% withdrawal rate  
- **High Risk:** >5% withdrawal rate

### 📊 Scenario Analysis
- Compare different return rate assumptions
- Understand the impact of market performance
- Make informed decisions about risk tolerance

## 💾 Export Features

- **JSON Export:** Complete data for spreadsheet analysis
- **CSV Export:** Importable format for other tools
- **Year-by-year projections** for detailed planning

## 🔧 Technical Architecture

### Frontend Stack
- **Next.js 14** - React framework with SSR
- **React 18** - Component-based UI
- **Tailwind CSS** - Utility-first styling
- **Chart.js** - Data visualization (ready for integration)

### Calculator Engine
- **Modular JavaScript class** (`RetirementCalculator`)
- **Comprehensive input validation**
- **Multiple calculation scenarios**
- **Export utilities** for data portability

### Design System
- **Custom color palette** with Canadian financial theme
- **Lexend & Noto Sans** font family for accessibility
- **Responsive grid layouts**
- **Progressive disclosure** for complex information

## 📋 Supported Input Parameters

```javascript
{
  currentAge: 27,
  retirementAge: 65,
  yearsInRetirement: 25,
  currentIncome: 65000,
  rrspBalance: 10000,
  tfsaBalance: 5000,
  cppBenefit: 1306,      // Monthly
  oasBenefit: 635,       // Monthly
  expectedReturnType: 'balanced',  // conservative, balanced, growth
  retirementLifestyle: 'comfortable', // basic, comfortable, luxury, ultra-luxury
  monthlyContribution: 500
}
```

## 🎨 UI Components

- **Layout.jsx** - Navigation and header
- **PersonalInfoStep.jsx** - Age and timeline inputs
- **CurrentSavingsStep.jsx** - Financial accounts and benefits
- **IncomeGoalsStep.jsx** - Income and investment preferences
- **ResultsStep.jsx** - Comprehensive results dashboard

## 📊 Output Structure

The calculator provides detailed analysis including:

- **Pre-retirement projections** (year-by-year accumulation)
- **Post-retirement projections** (year-by-year withdrawal)
- **Summary metrics** (totals, rates, assessments)
- **Scenario comparisons** (conservative vs aggressive)
- **Sustainability analysis** (fund depletion predictions)

## 🤝 Contributing

This is a comprehensive retirement planning tool. Feel free to:

1. **Enhance the UI** with additional visualizations
2. **Add new calculation features** (inflation adjustments, tax considerations)
3. **Improve accessibility** and mobile experience
4. **Integrate real-time data** (market rates, government benefit updates)

## 📄 License

This project is available for personal and educational use. The retirement calculation engine implements industry-standard formulas for accurate financial projections.

---

**Built with ❤️ for better retirement planning in Canada** 🇨🇦 