// @ts-strict-ignore
import React, { useEffect, useState, type ComponentProps } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import AutoSizer from 'react-virtualized-auto-sizer';

import { envelopeBudget } from 'loot-core/client/queries';
import { generateMonthlyReportResponse } from 'loot-core/server/ai-handler/monthly-report-handler';
import * as monthUtils from 'loot-core/src/shared/months';

//import { useBudgetData } from '../../hooks/useBudgetData';
import { useBudgetData } from '../../hooks/useBudgetData';
import { View } from '../common/View';

import AiMonthlyInsights from './AiMonthlyInsights';
import { useBudgetMonthCount } from './BudgetMonthCountContext';
import { BudgetPageHeader } from './BudgetPageHeader';
import { BudgetTable } from './BudgetTable';
import { useEnvelopeSheetValue } from './envelope/EnvelopeBudgetComponents';

function getNumPossibleMonths(width: number) {
  const estimatedTableWidth = width - 200;

  if (estimatedTableWidth < 500) {
    return 1;
  } else if (estimatedTableWidth < 750) {
    return 2;
  } else if (estimatedTableWidth < 1000) {
    return 3;
  } else if (estimatedTableWidth < 1250) {
    return 4;
  } else if (estimatedTableWidth < 1500) {
    return 5;
  }

  return 6;
}

type DynamicBudgetTableInnerProps = {
  width: number;
  height: number;
} & DynamicBudgetTableProps;

const DynamicBudgetTableInner = ({
  type,
  width,
  height,
  prewarmStartMonth,
  startMonth,
  maxMonths = 3,
  monthBounds,
  onMonthSelect,
  ...props
}: DynamicBudgetTableInnerProps) => {
  const { setDisplayMax } = useBudgetMonthCount();

  const numPossible = getNumPossibleMonths(width);
  const numMonths = Math.min(numPossible, maxMonths);
  const maxWidth = 200 + 500 * numMonths;
  const budgetData = useBudgetData();
  const budgetKey = Object;

  // State variables for AI response
  const [aiSnapshot, setAiSnapshot] = useState<string[] | null>();
  const [aiHighlights, setAiHighlights] = useState<string[] | null>();
  const [aiImprovements, setAiImprovements] = useState<string[] | null>();
  const [aiActionableInsights, setAiActionableInsights] = useState<
    string[] | null
  >();
  const isBudgetSet =
    useEnvelopeSheetValue({
      name: envelopeBudget.totalBudgeted,
    }) !== 0;

  useEffect(() => {
    setDisplayMax(numPossible);
  }, [numPossible]);

  useEffect(() => {
    // Convert budgetData to a stable key (string) for comparison
    //const budgetKey = JSON.stringify(budgetData);

    // Ensure budgetData is valid and contains data before making a request
    if (!budgetData || Object.keys(budgetData).length === 0) return;

    generateMonthlyReportResponse(budgetData)
      .then(response => {
        const parsedResponse = JSON.parse(response.message);

        setAiSnapshot(parsedResponse['Overall Outlook']);
        setAiHighlights(parsedResponse['Positive Aspects']);
        setAiImprovements(parsedResponse['Negative Aspects']);
        setAiActionableInsights(parsedResponse['Recommendations']);
      })
      .catch(error => {
        console.error('Error fetching AI insights:', error);
      });
  }, [budgetKey, startMonth]); // Runs only when budgetData changes

  function getValidMonth(month) {
    const start = monthBounds.start;
    const end = monthUtils.subMonths(monthBounds.end, numMonths - 1);

    if (month < start) {
      return start;
    } else if (month > end) {
      return end;
    }
    return month;
  }

  function _onMonthSelect(month) {
    onMonthSelect(getValidMonth(month), numMonths);
  }

  useHotkeys(
    'left',
    () => {
      _onMonthSelect(monthUtils.prevMonth(startMonth));
    },
    {
      preventDefault: true,
      scopes: ['app'],
    },
    [_onMonthSelect, startMonth],
  );
  useHotkeys(
    'right',
    () => {
      _onMonthSelect(monthUtils.nextMonth(startMonth));
    },
    {
      preventDefault: true,
      scopes: ['app'],
    },
    [_onMonthSelect, startMonth],
  );
  useHotkeys(
    '0',
    () => {
      _onMonthSelect(
        monthUtils.subMonths(
          monthUtils.currentMonth(),
          type === 'rollover'
            ? Math.floor((numMonths - 1) / 2)
            : numMonths === 2
              ? 1
              : Math.max(numMonths - 2, 0),
        ),
      );
    },
    {
      preventDefault: true,
      scopes: ['app'],
    },
    [_onMonthSelect, startMonth, numMonths],
  );

  return (
    <View
      style={{
        width,
        height,
        alignItems: 'center',
        opacity: width <= 0 || height <= 0 ? 0 : 1,
      }}
    >
      <View style={{ width: '100%', maxWidth, flexShrink: 0 }}>
        <BudgetPageHeader
          startMonth={prewarmStartMonth}
          numMonths={numMonths}
          monthBounds={monthBounds}
          onMonthSelect={_onMonthSelect}
        />
        <BudgetTable
          type={type}
          prewarmStartMonth={prewarmStartMonth}
          startMonth={startMonth}
          numMonths={numMonths}
          monthBounds={monthBounds}
          {...props}
        />
      </View>
      <View style={{ width: '100%', maxWidth }}>
        {!isBudgetSet ? (
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: '600',
              color: '#FFF',
              marginBottom: '0.75rem',
              paddingBottom: '0.25rem',
            }}
          >
            🤖 <i>Set a Budget to Unlock AI-Powered Insights…</i>
          </h2>
        ) : (
          <AiMonthlyInsights
            snapshot={aiSnapshot}
            highlights={aiHighlights}
            improvements={aiImprovements}
            actionableInsights={aiActionableInsights}
          />
        )}
      </View>
    </View>
  );
};

DynamicBudgetTableInner.displayName = 'DynamicBudgetTableInner';

type DynamicBudgetTableProps = Omit<
  ComponentProps<typeof BudgetTable>,
  'numMonths'
> & {
  maxMonths: number;
  onMonthSelect: (month: string, numMonths: number) => void;
};

export const DynamicBudgetTable = (props: DynamicBudgetTableProps) => {
  return (
    <AutoSizer>
      {({ width, height }) => (
        <DynamicBudgetTableInner width={width} height={height} {...props} />
      )}
    </AutoSizer>
  );
};

DynamicBudgetTable.displayName = 'DynamicBudgetTable';
