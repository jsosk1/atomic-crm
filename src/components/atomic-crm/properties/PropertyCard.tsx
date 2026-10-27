import { useTranslate } from "ra-core";
import { Link } from "react-router";
import { Card, CardContent } from "@/components/ui/card";

import type { Property } from "../types";
import { formatPrice } from "./propertyUtils";

export const PropertyCard = ({ property }: { property: Property }) => {
  const translate = useTranslate();
  const kind = [
    property.property_type &&
      translate(`resources.properties.types.${property.property_type}`),
    property.operation &&
      translate(`resources.properties.operations.${property.operation}`),
  ]
    .filter(Boolean)
    .join(" · ");
  const location = [property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <Link to={`/properties/${property.id}/show`} className="block">
      <Card className="py-3 h-full shadow-sm hover:shadow-md active:bg-muted transition-shadow">
        <CardContent className="px-4 flex flex-col gap-1">
          <div className="flex justify-between gap-2">
            <span className="font-medium truncate">{property.title}</span>
            <span className="font-medium shrink-0">
              {formatPrice(property.price, property.currency)}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            <span className="font-mono tracking-wider">{property.code}</span>
            {kind && ` · ${kind}`}
          </span>
          {location && (
            <span className="text-sm text-muted-foreground truncate">
              {location}
            </span>
          )}
          <PropertyFeaturesSummary property={property} />
        </CardContent>
      </Card>
    </Link>
  );
};

/** One-line summary like "3 bedrooms · 2 bathrooms · 120 m²". */
export const PropertyFeaturesSummary = ({
  property,
}: {
  property: Property;
}) => {
  const translate = useTranslate();
  const parts = [
    property.bedrooms != null &&
      `${property.bedrooms} ${translate("resources.properties.fields.bedrooms").toLowerCase()}`,
    property.bathrooms != null &&
      `${property.bathrooms} ${translate("resources.properties.fields.bathrooms").toLowerCase()}`,
    property.built_area != null && `${property.built_area} m²`,
  ].filter(Boolean);
  if (!parts.length) return null;
  return (
    <span className="text-xs text-muted-foreground">{parts.join(" · ")}</span>
  );
};
