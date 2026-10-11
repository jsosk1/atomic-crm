import { useConfigurationContext } from "../root/ConfigurationContext";

/**
 * Format a deal amount the same way as the desktop deal show view
 * (compact notation with the configured currency).
 */
export const useFormatDealAmount = () => {
  const { currency } = useConfigurationContext();
  return (amount: number | null | undefined) =>
    amount == null
      ? ""
      : amount.toLocaleString("en-US", {
          notation: "compact",
          style: "currency",
          currency,
          currencyDisplay: "narrowSymbol",
          minimumSignificantDigits: 3,
        });
};
