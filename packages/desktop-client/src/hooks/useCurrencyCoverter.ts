import { useGlobalPref } from './useGlobalPref';
const DEFAULT_RATE = 1;
const DEFAULT_SYMBOL = 'C$';

export function useCurrencyConverter() {
  const [currencyRate] = useGlobalPref('currencyRate');

  function convertAmount(amountInCad: number): string {
    // CAD is the base, so we just multiply the amount by the rate
    const convertedAmount = amountInCad * (currencyRate.rate ?? DEFAULT_RATE);

    return convertedAmount.toFixed(3);
  }

  return { convertAmount, symbol: currencyRate.symbol ?? DEFAULT_SYMBOL };
}
