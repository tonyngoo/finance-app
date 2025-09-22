//import { useEffect, useMemo, useState } from 'react';

//mport { useEffect, useMemo, useState } from 'react';

import { envelopeBudget } from 'loot-core/client/queries';

import { useEnvelopeSheetValue } from '../components/budget/envelope/EnvelopeBudgetComponents';
import { useFormat } from '../components/spreadsheet/useFormat';

import { useCategories } from './useCategories';
import { useCurrencyConverter } from './useCurrencyCoverter';
import { useLocalPref } from './useLocalPref';

export function useBudgetData() {
  const format = useFormat();
  const { convertAmount, symbol } = useCurrencyConverter();
  const [budgetDate] = useLocalPref('budget.startMonth');
  const [year, month] = budgetDate.split('-');
  const { grouped: categoryGroups } = useCategories();

  const groups = categoryGroups.reduce((acc, g) => {
    acc[g.name] = {
      id: g.id,
      categories: g.categories.reduce((catAcc, c) => {
        const categoryBudgeted = useEnvelopeSheetValue({
          name: envelopeBudget.catBudgeted(c.id),
        });
        const categoryBalance = useEnvelopeSheetValue({
          name: envelopeBudget.catBalance(c.id),
        });
        const spentBalance = useEnvelopeSheetValue({
          name: envelopeBudget.catSumAmount(c.id),
        });

        catAcc[c.name] = {
          budgeted: format(categoryBudgeted, 'financial'),
          balance: format(categoryBalance, 'financial'),
          spent: format(spentBalance, 'financial'),
        };
        return catAcc;
      }, {}),
    };
    return acc;
  }, {});

  const budgetData = {
    month,
    year,
    currency: symbol,
    available_funds: format(
      convertAmount(
        useEnvelopeSheetValue({
          name: envelopeBudget.incomeAvailable,
        }),
      ),
      'financial',
    ),
    overspent_previous_month: format(
      convertAmount(
        useEnvelopeSheetValue({
          name: envelopeBudget.lastMonthOverspent,
        }),
      ),
      'financial',
    ),
    budgeted: format(
      convertAmount(
        useEnvelopeSheetValue({
          name: envelopeBudget.totalBudgeted,
        }),
      ),
      'financial',
    ),
    next_month_funds: format(
      convertAmount(
        useEnvelopeSheetValue({
          name: envelopeBudget.forNextMonth,
        }),
      ),
      'financial',
    ),
    groups,
  };

  return budgetData;
}
