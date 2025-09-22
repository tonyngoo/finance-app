import { type ReactNode } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import { css } from '@emotion/css';

import { type CurrencyRate } from 'loot-core/types/prefs';

import { useGlobalPref } from '../../hooks/useGlobalPref';
import { theme as themeStyle } from '../../style';
import { tokens } from '../../tokens';
import { Select, type SelectOption } from '../common/Select';
import { Text } from '../common/Text';
import { View } from '../common/View';
import { useSidebar } from '../sidebar/SidebarProvider';

import { Setting } from './UI';

type ExchangeRatesResponse = {
  error: unknown;
  rates: Record<string, number>;
};

const RATE_SYMBOLS = { CAD: 'C$', USD: '$', EUR: '€', AUD: 'A$', JPY: '¥' };

const currencyOptions = (): SelectOption[] =>
  ['CAD', 'USD', 'EUR', 'AUD', 'JPY'].map(lang => [
    lang,
    new Intl.DisplayNames([lang], {
      type: 'currency',
    }).of(lang) || lang,
  ]);

function Column({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View
      style={{
        alignItems: 'flex-start',
        flexGrow: 1,
        gap: '0.5em',
        width: '100%',
      }}
    >
      <Text style={{ fontWeight: 500 }}>{title}</Text>
      <View style={{ alignItems: 'flex-start', gap: '1em' }}>{children}</View>
    </View>
  );
}

export function CurrencySettings() {
  const { t } = useTranslation();
  const sidebar = useSidebar();
  const [currencyRate, setCurrencyRatePref] = useGlobalPref('currencyRate');

  return (
    <Setting
      primaryAction={
        <View
          style={{
            flexDirection: 'column',
            gap: '1em',
            width: '100%',
            [`@media (min-width: ${
              sidebar.floating
                ? tokens.breakpoint_small
                : tokens.breakpoint_medium
            })`]: {
              flexDirection: 'row',
            },
          }}
        >
          <Column title={t('Currency')}>
            <Select
              onChange={async value => {
                const accessKey = '4bde4e5f051ee8b3ca87cc394535ac2b';
                const symbols = ['CAD', 'USD', 'EUR', 'AUD', 'JPY'].join(',');

                // Call API to get exchange rates
                const response = await fetch(
                  `https://api.exchangeratesapi.io/v1/latest?access_key=${accessKey}&symbols=${symbols}`,
                );

                const data = (await response.json()) as ExchangeRatesResponse;

                if (data.error) {
                  console.error('Error fetching exchange rates:', data.error);
                  return null;
                }

                const eurToCad = data.rates.CAD;

                const cadRates = {};
                for (const [currency, eurRate] of Object.entries(data.rates)) {
                  if (currency === 'CAD') continue;
                  cadRates[currency] = eurRate / eurToCad;
                }
                console.log(value);
                setCurrencyRatePref({
                  currency: value,
                  rate: cadRates[value],
                  symbol: RATE_SYMBOLS[value],
                } as CurrencyRate);
              }}
              value={currencyRate.currency}
              options={currencyOptions()}
              className={css({
                '&[data-hovered]': {
                  backgroundColor: themeStyle.buttonNormalBackgroundHover,
                },
              })}
            />
          </Column>
        </View>
      }
    >
      <Text>
        <Trans>
          <strong>Currencies</strong> change the currency to your preferred
          choice.
        </Trans>
      </Text>
    </Setting>
  );
}
