import { required, useTranslate, useUnique } from "ra-core";
import { useState, type ReactNode } from "react";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";

import { DateTextInput } from "../misc/DateTextInput";
import {
  DEFAULT_CURRENCY,
  generatePropertyCode,
  getTodayISODate,
  PROPERTY_CURRENCIES,
  usePropertyChoices,
} from "./propertyUtils";

const parseCode = (value: string) => value.toUpperCase().replace(/\s/g, "");

export const PropertyInputs = () => {
  const { typeChoices, operationChoices, listingAgencyChoices } =
    usePropertyChoices();
  const unique = useUnique();
  // Only used when creating: an existing property keeps its own code
  const [defaultCode] = useState(generatePropertyCode);
  const [today] = useState(getTodayISODate);
  return (
    <div className="flex flex-col gap-8">
      <Section title="resources.properties.field_categories.basics">
        <TextInput
          source="code"
          defaultValue={defaultCode}
          parse={parseCode}
          validate={[
            required(),
            unique({ message: "resources.properties.validation.code_taken" }),
          ]}
          autoComplete="off"
          helperText={false}
        />
        <TextInput source="title" validate={required()} helperText={false} />
        <div className="grid grid-cols-2 gap-4">
          <SelectInput
            source="property_type"
            choices={typeChoices}
            helperText={false}
          />
          <SelectInput
            source="operation"
            choices={operationChoices}
            helperText={false}
          />
          <NumberInput source="price" helperText={false} />
          <SelectInput
            source="currency"
            choices={PROPERTY_CURRENCIES}
            defaultValue={DEFAULT_CURRENCY}
            helperText={false}
          />
        </div>
      </Section>

      <Section title="resources.properties.field_categories.location">
        <TextInput source="address" helperText={false} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput source="neighborhood" helperText={false} />
          <TextInput source="city" helperText={false} />
        </div>
      </Section>

      <Section title="resources.properties.field_categories.features">
        <div className="grid grid-cols-2 gap-4">
          <NumberInput source="bedrooms" helperText={false} />
          <NumberInput source="bathrooms" helperText={false} />
          <NumberInput source="built_area" helperText={false} />
          <NumberInput source="land_area" helperText={false} />
          <NumberInput source="parking_spaces" helperText={false} />
        </div>
      </Section>

      <Section title="resources.properties.field_categories.listing">
        <TextInput source="agency" helperText={false} />
        <SelectInput
          source="listing_agency"
          choices={listingAgencyChoices}
          helperText={false}
        />
        <div className="grid grid-cols-2 gap-4">
          <DateTextInput
            source="listed_at"
            defaultValue={today}
            helperText={false}
          />
          <DateTextInput
            source="status_updated_at"
            defaultValue={today}
            helperText={false}
          />
        </div>
      </Section>

      <Section title="resources.properties.fields.description">
        <TextInput
          source="description"
          label={false}
          multiline
          rows={4}
          helperText={false}
        />
      </Section>
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-base font-medium">{translate(title)}</h3>
      {children}
    </div>
  );
};
