import { format } from "date-fns";
import { useTranslate } from "ra-core";

export const PROPERTY_TYPES = [
  "house",
  "apartment",
  "land",
  "commercial",
  "office",
  "other",
];
export const PROPERTY_OPERATIONS = ["sale", "rent"];
export const PROPERTY_CURRENCIES = [
  { id: "PYG", name: "₲ (PYG)" },
  { id: "USD", name: "US$ (USD)" },
];
export const DEFAULT_CURRENCY = "PYG";

/** Translated { id, name } choices for the property type and operation selects. */
export const usePropertyChoices = () => {
  const translate = useTranslate();
  return {
    typeChoices: PROPERTY_TYPES.map((id) => ({
      id,
      name: translate(`resources.properties.types.${id}`),
    })),
    operationChoices: PROPERTY_OPERATIONS.map((id) => ({
      id,
      name: translate(`resources.properties.operations.${id}`),
    })),
  };
};

/** Price in Paraguayan format, e.g. "₲ 850.000.000" or "US$ 120.000". */
export const formatPrice = (
  price: number | null | undefined,
  currency: string | null | undefined,
) =>
  price == null
    ? ""
    : price.toLocaleString("es-PY", {
        style: "currency",
        currency: currency || DEFAULT_CURRENCY,
        maximumFractionDigits: 0,
      });

/** Today's date as YYYY-MM-DD in the user's local timezone. */
export const getTodayISODate = () => format(new Date(), "yyyy-MM-dd");

/** "2026-10-27" -> "27/10/2026" */
export const formatShareDate = (date: string | null | undefined) => {
  if (!date) return "";
  const [year, month, day] = date.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
};
