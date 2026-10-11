import { useState } from "react";
import { isValid } from "date-fns";
import { Check, ChevronDown } from "lucide-react";
import {
  InfiniteListBase,
  ShowBase,
  useDataProvider,
  useNotify,
  useRefresh,
  useShowContext,
  useTranslate,
} from "ra-core";
import { ReferenceArrayField } from "@/components/admin/reference-array-field";
import { ReferenceField } from "@/components/admin/reference-field";
import { TextField } from "@/components/admin/text-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { CompanyAvatar } from "../companies/CompanyAvatar";
import { MobileContent } from "../layout/MobileContent";
import MobileHeader from "../layout/MobileHeader";
import { MobileBackButton } from "../misc/MobileBackButton";
import { NoteCreate } from "../notes/NoteCreate";
import { NotesIterator } from "../notes/NotesIterator";
import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Deal } from "../types";
import { ContactList } from "./ContactList";
import { findDealLabel, formatISODateString } from "./dealUtils";
import { moveDealToStage } from "./moveDealToStage";
import { useFormatDealAmount } from "./useFormatDealAmount";

export const DealShowMobile = () => (
  <ShowBase
    queryOptions={{
      onError: () => {
        /* Disable error notification as the content handles offline */
      },
    }}
  >
    <DealShowContentMobile />
  </ShowBase>
);

const DealShowContentMobile = () => {
  const translate = useTranslate();
  const { dealCategories } = useConfigurationContext();
  const formatAmount = useFormatDealAmount();
  const { record, isPending } = useShowContext<Deal>();
  if (isPending || !record) return null;

  return (
    <>
      <MobileHeader>
        <MobileBackButton />
        <h1 className="flex-1 min-w-0 truncate text-xl font-semibold">
          {record.name}
        </h1>
      </MobileHeader>
      <MobileContent>
        <div className="flex flex-col gap-6">
          {record.company_id != null && (
            <ReferenceField
              source="company_id"
              reference="companies"
              link="show"
            >
              <div className="flex items-center gap-3">
                <CompanyAvatar width={40} height={40} />
                <TextField source="name" className="font-medium" />
              </div>
            </ReferenceField>
          )}

          {record.archived_at ? (
            <Badge variant="secondary" className="self-start">
              {translate("resources.deals.archived.title")}
            </Badge>
          ) : (
            <DealStageSelector deal={record} />
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label={translate("resources.deals.fields.amount")}>
              {formatAmount(record.amount)}
            </Field>
            <Field
              label={translate("resources.deals.fields.expected_closing_date")}
            >
              <span className="flex flex-wrap items-center gap-2">
                {isValid(new Date(record.expected_closing_date))
                  ? formatISODateString(record.expected_closing_date)
                  : translate("resources.deals.invalid_date")}
                {new Date(record.expected_closing_date) < new Date() ? (
                  <Badge variant="destructive">
                    {translate("crm.common.past")}
                  </Badge>
                ) : null}
              </span>
            </Field>
            {record.category && (
              <Field label={translate("resources.deals.fields.category")}>
                {dealCategories.find((c) => c.value === record.category)
                  ?.label ?? record.category}
              </Field>
            )}
          </div>

          {!!record.contact_ids?.length && (
            <Field label={translate("resources.deals.fields.contact_ids")}>
              <ReferenceArrayField
                source="contact_ids"
                reference="contacts_summary"
              >
                <ContactList />
              </ReferenceArrayField>
            </Field>
          )}

          {record.description && (
            <Field label={translate("resources.deals.fields.description")}>
              <p className="whitespace-pre-line leading-6">
                {record.description}
              </p>
            </Field>
          )}

          <div>
            <Separator className="mb-4" />
            <InfiniteListBase
              resource="deal_notes"
              filter={{ deal_id: record.id }}
              sort={{ field: "date", order: "DESC" }}
              perPage={25}
              disableSyncWithLocation
              storeKey={false}
              empty={<NoteCreate reference="deals" />}
            >
              <NotesIterator reference="deals" />
            </InfiniteListBase>
          </div>
        </div>
      </MobileContent>
    </>
  );
};

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col gap-1 min-w-0">
    <span className="text-xs text-muted-foreground tracking-wide">{label}</span>
    <div className="text-sm">{children}</div>
  </div>
);

const DealStageSelector = ({ deal }: { deal: Deal }) => {
  const translate = useTranslate();
  const { dealStages } = useConfigurationContext();
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSelect = async (stage: string) => {
    setOpen(false);
    if (stage === deal.stage) return;
    setIsSaving(true);
    try {
      await moveDealToStage(deal, stage, dataProvider);
      notify("resources.deals.updated", { type: "info", undoable: false });
    } catch {
      notify("ra.notification.http_error", { type: "error" });
    } finally {
      setIsSaving(false);
      refresh();
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground tracking-wide">
        {translate("resources.deals.fields.stage")}
      </span>
      <Button
        type="button"
        variant="outline"
        className="h-12 justify-between text-base"
        disabled={isSaving}
        onClick={() => setOpen(true)}
      >
        {findDealLabel(dealStages, deal.stage) ?? deal.stage}
        <ChevronDown className="size-5" />
      </Button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="max-h-[80dvh] flex flex-col pb-6"
          aria-describedby={undefined}
        >
          <SheetHeader className="border-b">
            <SheetTitle className="text-xl">
              {translate("resources.deals.fields.stage")}
            </SheetTitle>
          </SheetHeader>
          <div className="overflow-y-auto flex flex-col px-2">
            {dealStages.map((stage) => {
              const isCurrent = stage.value === deal.stage;
              return (
                <Button
                  key={stage.value}
                  type="button"
                  variant="ghost"
                  className={cn(
                    "h-14 justify-between text-base px-4",
                    isCurrent && "font-semibold",
                  )}
                  aria-current={isCurrent ? "true" : undefined}
                  onClick={() => handleSelect(stage.value)}
                >
                  {stage.label}
                  {isCurrent && <Check className="size-5" />}
                </Button>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};
