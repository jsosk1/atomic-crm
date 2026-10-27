import { useState } from "react";
import { Plus, RotateCcw, Search } from "lucide-react";
import {
  ListBase,
  useGetIdentity,
  useListContext,
  useTimeout,
  useTranslate,
} from "ra-core";
import { CreateButton } from "@/components/admin/create-button";
import { FilterButton } from "@/components/admin/filter-form";
import { List } from "@/components/admin/list";
import { SearchInput } from "@/components/admin/search-input";
import { SelectInput } from "@/components/admin/select-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsMobile } from "@/hooks/use-mobile";

import { TopToolbar } from "../layout/TopToolbar";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { CreateSheet } from "../misc/CreateSheet";
import type { Property } from "../types";
import { PropertyCard } from "./PropertyCard";
import { PropertyInputs } from "./PropertyInputs";
import { usePropertyChoices } from "./propertyUtils";

const PropertyList = () => {
  const isMobile = useIsMobile();
  return isMobile ? <PropertyListMobile /> : <PropertyListDesktop />;
};

const PropertyListDesktop = () => {
  const { typeChoices, operationChoices } = usePropertyChoices();
  const filters = [
    <SearchInput source="q" alwaysOn />,
    <SelectInput source="operation" choices={operationChoices} />,
    <SelectInput source="property_type" choices={typeChoices} />,
  ];
  return (
    <List
      title={false}
      perPage={100}
      sort={{ field: "created_at", order: "DESC" }}
      filters={filters}
      actions={
        <TopToolbar>
          <FilterButton />
          <CreateButton label="resources.properties.action.new" />
        </TopToolbar>
      }
      pagination={null}
    >
      <PropertyGrid />
    </List>
  );
};

const PropertyListMobile = () => {
  const translate = useTranslate();
  const [createOpen, setCreateOpen] = useState(false);
  return (
    <ListBase
      resource="properties"
      perPage={1000}
      sort={{ field: "created_at", order: "DESC" }}
      disableSyncWithLocation
      queryOptions={{
        onError: () => {
          /* Disable error notification as PropertyGrid handles it */
        },
      }}
    >
      <MobileHeader>
        <h1 className="flex-1 text-xl font-semibold">
          {translate("resources.properties.name", { smart_count: 2 })}
        </h1>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-full"
          aria-label={translate("resources.properties.action.new")}
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="size-6" />
        </Button>
      </MobileHeader>
      <MobileContent>
        <MobileSearch />
        <PropertyGrid />
      </MobileContent>
      <PropertyCreateSheet open={createOpen} onOpenChange={setCreateOpen} />
    </ListBase>
  );
};

const MobileSearch = () => {
  const translate = useTranslate();
  const { filterValues, setFilters } = useListContext();
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        type="search"
        className="pl-9 h-11 text-base"
        placeholder={translate("ra.action.search")}
        defaultValue={filterValues.q ?? ""}
        onChange={(event) =>
          setFilters(
            event.target.value ? { q: event.target.value } : {},
            undefined,
          )
        }
      />
    </div>
  );
};

const PropertyGrid = () => {
  const translate = useTranslate();
  const { data, error, isPending, refetch, filterValues } =
    useListContext<Property>();
  const oneSecondHasPassed = useTimeout(1000);

  if (isPending) {
    if (!oneSecondHasPassed) return null;
    return (
      <div className="flex flex-col gap-3">
        {[...Array(4)].map((_, index) => (
          <Skeleton key={index} className="w-full h-24" />
        ))}
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="p-4 text-center">
        <Button onClick={() => refetch()}>
          <RotateCcw />
          {translate("crm.common.retry")}
        </Button>
      </div>
    );
  }

  if (!data?.length) {
    const hasFilters = filterValues && Object.keys(filterValues).length > 0;
    return (
      <div className="p-4 text-center">
        <p className="font-medium">
          {hasFilters
            ? translate("ra.navigation.no_results")
            : translate("resources.properties.empty.title")}
        </p>
        {!hasFilters && (
          <p className="text-sm text-muted-foreground">
            {translate("resources.properties.empty.description")}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
      {data.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};

export const PropertyCreateSheet = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => {
  const translate = useTranslate();
  const { identity } = useGetIdentity();
  return (
    <CreateSheet
      resource="properties"
      title={translate("resources.properties.action.create")}
      defaultValues={{ sales_id: identity?.id }}
      open={open}
      onOpenChange={onOpenChange}
    >
      <PropertyInputs />
    </CreateSheet>
  );
};

export default PropertyList;
