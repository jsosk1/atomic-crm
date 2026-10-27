import { required, useTranslate } from "ra-core";
import type { ReactNode } from "react";
import { NumberInput } from "@/components/admin/number-input";
import { SelectInput } from "@/components/admin/select-input";
import { TextInput } from "@/components/admin/text-input";

import {
  DEFAULT_CURRENCY,
  PROPERTY_CURRENCIES,
  usePropertyChoices,
} from "./propertyUtils";

export const PropertyInputs = () => {
  const { typeChoices, operationChoices } = usePropertyChoices();
  return (
    <div className="flex flex-col gap-8">
      <Section title="resources.properties.field_categories.basics">
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

      <Section title="resources.properties.field_categories.other">
        <TextInput source="agency" helperText={false} />
        <TextInput source="description" multiline rows={4} helperText={false} />
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
