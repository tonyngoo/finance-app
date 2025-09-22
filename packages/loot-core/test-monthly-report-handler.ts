import { generateMonthlyReportResponse } from './src/server/ai-handler/monthly-report-handler.js';

async function testGemini() {
  try {
    const reportData = {
      month: 'March',
      year: 2025,
      currency: 'CAD',
      available_funds: 250.0,
      overspent_previous_month: -50.0,
      budgeted: 5000.0,
      next_month_funds: 250.0,
      categories: {
        'Usual Expenses': {
          Food: { budgeted: 800.0, spent: 750.0, balance: 50.0 },
          General: { budgeted: 1200.0, spent: 1150.0, balance: 50.0 },
          Bills: { budgeted: 1500.0, spent: 1500.0, balance: 0.0 },
          'Bills (Flexible)': { budgeted: 500.0, spent: 450.0, balance: 50.0 },
        },
        'Investments and Savings': {
          Savings: { budgeted: 1000.0, spent: 1000.0, balance: 0.0 },
          Investments: { budgeted: 500.0, spent: 500.0, balance: 0.0 },
        },
      },
      income: {
        total_received: 5250.0,
        starting_balances: 50.0,
      },
    };

    const response = await generateMonthlyReportResponse(reportData);
    console.log('Gemini Response:\n\n', response.message);
  } catch (error) {
    console.error('Test failed:', error);
  }
}

testGemini();
