import { useState } from "react";
import { Pencil } from "lucide-react";
import { ShowBase, useShowContext, useTranslate } from "ra-core";
import type { ReactNode } from "react";
import { EditButton } from "@/components/admin/edit-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";

import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { EditSheet } from "../misc/EditSheet";
import { MobileBackButton } from "../misc/MobileBackButton";
import type { Property } from "../types";
import { PropertyInputs } from "./PropertyInputs";
import { PropertySharesList } from "./PropertyShares";
import { formatPrice } from "./propertyUtils";

export const PropertyShow = () => {
  const isMobile = useIsMobile();
  return (
    <ShowBase
      queryOptions={{
        onError: isMobile
          ? () => {
              /* Disable error notification as the content handles offline */
            }
          : undefined,
      }}
    >
      {isMobile ? <PropertyShowMobile /> : <PropertyShowDesktop />}
    </ShowBase>
  );
};

const PropertyShowMobile = () => {
  const translate = useTranslate();
  const { record, isPending } = useShowContext<Property>();
  const [editOpen, setEditOpen] = useState(false);
  if (isPending || !record) return null;

  return (
    <>
      <MobileHeader>
        <MobileBackButton />
        <h1 className="flex-1 min-w-0 truncate text-xl font-semibold">
          {record.title}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={translate("ra.action.edit")}
          onClick={() => setEditOpen(true)}
        >
          <Pencil className="size-5" />
        </Button>
      </MobileHeader>
      <MobileContent>
        <PropertyDetails property={record} />
        <Separator className="my-6" />
        <SharesSection property={record} />
      </MobileContent>
      <EditSheet
        resource="properties"
        id={record.id}
        title={translate("resources.properties.action.edit")}
        open={editOpen}
        onOpenChange={setEditOpen}
      >
        <PropertyInputs />
      </EditSheet>
    </>
  );
};

const PropertyShowDesktop = () => {
  const { record, isPending } = useShowContext<Property>();
  if (isPending || !record) return null;

  return (
    <div className="mt-2 mb-2 flex flex-col gap-4 max-w-4xl">
      <Card>
        <CardContent>
          <div className="flex justify-between items-start gap-4 mb-6">
            <h2 className="text-2xl font-semibold">{record.title}</h2>
            <EditButton />
          </div>
          <PropertyDetails property={record} />
        </CardContent>
      </Card>
      <Card>
        <CardContent>
          <SharesSection property={record} />
        </CardContent>
      </Card>
    </div>
  );
};

const SharesSection = ({ property }: { property: Property }) => {
  const translate = useTranslate();
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">
        {translate("resources.properties.shared_with")}
      </h3>
      <PropertySharesList property_id={property.id} />
    </div>
  );
};

const PropertyDetails = ({ property }: { property: Property }) => {
  const translate = useTranslate();
  const t = (field: string) =>
    translate(`resources.properties.fields.${field}`);
  const location = [property.address, property.neighborhood, property.city]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-2">
        {property.price != null && (
          <span className="text-2xl font-semibold mr-2">
            {formatPrice(property.price, property.currency)}
          </span>
        )}
        {property.operation && (
          <Badge>
            {translate(`resources.properties.operations.${property.operation}`)}
          </Badge>
        )}
        {property.property_type && (
          <Badge variant="secondary">
            {translate(`resources.properties.types.${property.property_type}`)}
          </Badge>
        )}
      </div>

      {location && <Field label={t("address")}>{location}</Field>}

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {property.bedrooms != null && (
          <Field label={t("bedrooms")}>{property.bedrooms}</Field>
        )}
        {property.bathrooms != null && (
          <Field label={t("bathrooms")}>{property.bathrooms}</Field>
        )}
        {property.built_area != null && (
          <Field label={t("built_area")}>{property.built_area}</Field>
        )}
        {property.land_area != null && (
          <Field label={t("land_area")}>{property.land_area}</Field>
        )}
        {property.parking_spaces != null && (
          <Field label={t("parking_spaces")}>{property.parking_spaces}</Field>
        )}
      </div>

      {property.agency && <Field label={t("agency")}>{property.agency}</Field>}

      {property.description && (
        <Field label={t("description")}>
          <p className="whitespace-pre-line leading-6">
            {property.description}
          </p>
        </Field>
      )}
    </div>
  );
};

const Field = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-xs text-muted-foreground tracking-wide">{label}</span>
    <div className="text-sm">{children}</div>
  </div>
);
