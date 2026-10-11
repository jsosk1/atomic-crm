import { useQueryClient } from "@tanstack/react-query";
import {
  type Identifier,
  useDataProvider,
  useGetIdentity,
  useNotify,
  useRedirect,
  useTranslate,
} from "ra-core";

import { CreateSheet } from "../misc/CreateSheet";
import type { Deal } from "../types";
import { DealInputs } from "./DealInputs";

export interface DealCreateSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contact_id?: Identifier;
}

export const DealCreateSheet = ({
  open,
  onOpenChange,
  contact_id,
}: DealCreateSheetProps) => {
  const { identity } = useGetIdentity();
  const translate = useTranslate();
  const dataProvider = useDataProvider();
  const queryClient = useQueryClient();
  const notify = useNotify();
  const redirect = useRedirect();

  if (!identity) return null;

  const handleSuccess = async (deal: Deal) => {
    // The new deal is created with index 0: shift the other deals of the
    // same stage down, like the desktop DealCreate does.
    const { data: stageDeals } = await dataProvider.getList<Deal>("deals", {
      sort: { field: "index", order: "ASC" },
      pagination: { page: 1, perPage: 1000 },
      filter: { stage: deal.stage },
    });
    await Promise.all(
      stageDeals
        .filter((d) => d.id !== deal.id)
        .map((d) =>
          dataProvider.update("deals", {
            id: d.id,
            data: { index: d.index + 1 },
            previousData: d,
          }),
        ),
    );
    queryClient.invalidateQueries({ queryKey: ["deals"] });
    notify("ra.notification.created", {
      type: "info",
      messageArgs: { smart_count: 1 },
    });
    onOpenChange(false);
    redirect(`/deals/${deal.id}/show`);
  };

  return (
    <CreateSheet
      resource="deals"
      title={translate("resources.deals.action.create")}
      redirect={false}
      defaultValues={{
        sales_id: identity.id,
        contact_ids: contact_id != null ? [toId(contact_id)] : [],
        index: 0,
      }}
      mutationOptions={{ onSuccess: handleSuccess }}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DealInputs />
    </CreateSheet>
  );
};

// Ids read from the URL are strings, while contact ids are numbers
const toId = (id: Identifier): Identifier =>
  typeof id === "string" && /^\d+$/.test(id) ? Number(id) : id;
