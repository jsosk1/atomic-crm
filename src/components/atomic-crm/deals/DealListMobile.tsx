import {
  ListBase,
  RecordContextProvider,
  useListContext,
  useTimeout,
  useTranslate,
} from "ra-core";
import { RotateCcw } from "lucide-react";
import { Link } from "react-router";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { getDealsByStage } from "./stages";
import { useFormatDealAmount } from "./useFormatDealAmount";

export const DealListMobile = () => {
  const translate = useTranslate();
  return (
    <ListBase
      resource="deals"
      perPage={1000}
      filter={{ "archived_at@is": null }}
      sort={{ field: "index", order: "ASC" }}
      disableSyncWithLocation
      queryOptions={{
        onError: () => {
          /* Disable error notification as DealListContentMobile handles it */
        },
      }}
    >
      <MobileHeader>
        <h1 className="text-xl font-semibold">
          {translate("resources.deals.name", { smart_count: 2 })}
        </h1>
      </MobileHeader>
      <MobileContent>
        <DealListContentMobile />
      </MobileContent>
    </ListBase>
  );
};

const DealListContentMobile = () => {
  const translate = useTranslate();
  const { dealStages } = useConfigurationContext();
  const { data: deals, error, isPending, refetch } = useListContext<Deal>();
  const oneSecondHasPassed = useTimeout(1000);

  if (isPending) {
    if (!oneSecondHasPassed) return null;
    return (
      <div className="flex flex-col gap-4">
        {[...Array(5)].map((_, index) => (
          <Skeleton key={index} className="w-full h-14" />
        ))}
      </div>
    );
  }

  if (error && !deals) {
    return (
      <div className="p-4 text-center">
        <div className="text-muted-foreground mb-4">
          {translate("ra.notification.http_error")}
        </div>
        <Button onClick={() => refetch()}>
          <RotateCcw />
          {translate("crm.common.retry")}
        </Button>
      </div>
    );
  }

  if (!deals?.length) {
    return (
      <div className="p-4 text-center">
        <p className="font-medium">
          {translate("resources.deals.empty.title")}
        </p>
        <p className="text-sm text-muted-foreground">
          {translate("resources.deals.empty.description")}
        </p>
      </div>
    );
  }

  const dealsByStage = getDealsByStage(deals, dealStages);

  return (
    <div className="flex flex-col gap-6">
      {dealStages.map((stage) => (
        <section key={stage.value} aria-label={stage.label}>
          <h2 className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-1">
            {stage.label} ({dealsByStage[stage.value].length})
          </h2>
          <div className="divide-y">
            {dealsByStage[stage.value].map((deal) => (
              <RecordContextProvider key={deal.id} value={deal}>
                <DealItemMobile deal={deal} />
              </RecordContextProvider>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

const DealItemMobile = ({ deal }: { deal: Deal }) => {
  const formatAmount = useFormatDealAmount();
  return (
    <Link
      to={`/deals/${deal.id}/show`}
      className="flex flex-row gap-3 items-center py-3 min-h-14 active:bg-muted transition-colors"
    >
      <ReferenceField source="company_id" reference="companies" link={false}>
        <CompanyAvatar width={40} height={40} />
      </ReferenceField>
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">{deal.name}</div>
        <div className="text-sm text-muted-foreground truncate">
          <ReferenceField
            source="company_id"
            reference="companies"
            link={false}
          >
            <TextField source="name" />
          </ReferenceField>
        </div>
      </div>
      <div className="text-sm font-medium shrink-0">
        {formatAmount(deal.amount)}
      </div>
    </Link>
  );
};
