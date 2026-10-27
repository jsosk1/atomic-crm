import { useEffect, useState } from "react";
import {
  FieldTitle,
  type InputProps,
  useInput,
  useResourceContext,
  type Validator,
} from "ra-core";
import {
  FormControl,
  FormError,
  FormField,
  FormLabel,
} from "@/components/admin/form";
import { InputHelperText } from "@/components/admin/input-helper-text";
import { Input } from "@/components/ui/input";

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DMY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** "1985-03-14" -> "14/03/1985" */
const isoToDayMonthYear = (value: unknown) => {
  if (typeof value !== "string") return "";
  const match = value.slice(0, 10).match(ISO_DATE);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
};

/** "14/03/1985" -> "1985-03-14", or null if it is not a real date */
const dayMonthYearToIso = (value: string) => {
  const match = value.match(DMY_DATE);
  if (!match) return null;
  const [, day, month, year] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  const isRealDate =
    date.getFullYear() === Number(year) &&
    date.getMonth() === Number(month) - 1 &&
    date.getDate() === Number(day);
  return isRealDate ? `${year}-${month}-${day}` : null;
};

/** Keep digits only and insert the slashes: "14031985" -> "14/03/1985" */
const maskDayMonthYear = (value: string) => {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4)]
    .filter(Boolean)
    .join("/");
};

// Incomplete or impossible dates are kept as typed so this validator flags them
const validDayMonthYear: Validator = (value) =>
  value == null || value === "" || ISO_DATE.test(String(value))
    ? undefined
    : "crm.validation.invalid_date";

/**
 * Date input that always uses the DD/MM/YYYY format, whatever the browser
 * language, and stores the date as YYYY-MM-DD.
 */
export const DateTextInput = (props: InputProps & { className?: string }) => {
  const resource = useResourceContext(props);
  const { label, source, className, helperText } = props;
  const validate = [
    validDayMonthYear,
    ...(Array.isArray(props.validate)
      ? props.validate
      : props.validate
        ? [props.validate]
        : []),
  ];
  const { id, field, isRequired } = useInput({ ...props, validate });
  const [text, setText] = useState(() => isoToDayMonthYear(field.value));

  // Follow value changes made outside the input (form reset, default values)
  useEffect(() => {
    if (typeof field.value === "string" && ISO_DATE.test(field.value)) {
      setText(isoToDayMonthYear(field.value));
    } else if (field.value == null || field.value === "") {
      setText("");
    }
  }, [field.value]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const masked = maskDayMonthYear(event.target.value);
    setText(masked);
    if (!masked) {
      field.onChange(null);
      return;
    }
    field.onChange(dayMonthYearToIso(masked) ?? masked);
  };

  return (
    <FormField id={id} className={className} name={field.name}>
      {label !== false && (
        <FormLabel>
          <FieldTitle
            label={label}
            source={source}
            resource={resource}
            isRequired={isRequired}
          />
        </FormLabel>
      )}
      <FormControl>
        <Input
          name={field.name}
          ref={field.ref}
          value={text}
          onChange={handleChange}
          onBlur={field.onBlur}
          inputMode="numeric"
          placeholder="DD/MM/AAAA"
          maxLength={10}
          autoComplete="off"
        />
      </FormControl>
      <InputHelperText helperText={helperText} />
      <FormError />
    </FormField>
  );
};
