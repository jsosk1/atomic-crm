import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Share2, Trash2 } from "lucide-react";
import {
  CreateBase,
  Form,
  type Identifier,
  RecordContextProvider,
  required,
  useDelete,
  useGetIdentity,
  useGetList,
  useNotify,
  useTranslate,
} from "ra-core";
import { AutocompleteInput } from "@/components/admin/autocomplete-input";
import { DateInput } from "@/components/admin/date-input";
import { SaveButton } from "@/components/admin/form";
import { ReferenceField } from "@/components/admin/reference-field";
import { ReferenceInput } from "@/components/admin/reference-input";
import { TextInput } from "@/components/admin/text-input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { contactOptionText } from "../misc/ContactOption";
import type { PropertyShare } from "../types";
import { formatShareDate, getTodayISODate } from "./propertyUtils";

type ShareTarget =
  | { property_id: Identifier; contact_id?: never }
  | { contact_id: Identifier; property_id?: never };

/**
 * List of shares for a property (shows contacts) or for a contact (shows
 * properties), with a button to share and a button to remove each share.
 */
export const PropertySharesList = (target: ShareTarget) => {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);
  const isForProperty = target.property_id != null;
  const { data: shares, isPending } = useGetList<PropertyShare>(
    "property_shares",
    {
      filter: target,
      sort: { field: "shared_at", order: "DESC" },
      pagination: { page: 1, perPage: 200 },
    },
  );

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        variant="outline"
        className="h-12 text-base self-stretch md:self-start"
        onClick={() => setOpen(true)}
      >
        <Share2 className="size-5" />
        {translate(
          isForProperty
            ? "resources.property_shares.action.share_with_contact"
            : "resources.property_shares.action.share_property",
        )}
      </Button>
      {!isPending && !shares?.length && (
        <p className="text-sm text-muted-foreground">
          {translate(
            isForProperty
              ? "resources.properties.not_shared"
              : "resources.property_shares.empty",
          )}
        </p>
      )}
      <div className="divide-y">
        {shares?.map((share) => (
          <RecordContextProvider key={share.id} value={share}>
            <ShareItem share={share} isForProperty={isForProperty} />
          </RecordContextProvider>
        ))}
      </div>
      <ShareDialog open={open} onOpenChange={setOpen} target={target} />
    </div>
  );
};

const ShareItem = ({
  share,
  isForProperty,
}: {
  share: PropertyShare;
  isForProperty: boolean;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const [deleteOne, { isPending }] = useDelete();

  const handleRemove = () => {
    if (!window.confirm(translate("resources.property_shares.confirm_remove")))
      return;
    deleteOne(
      "property_shares",
      { id: share.id, previousData: share },
      {
        mutationMode: "pessimistic",
        onSuccess: () => {
          notify("resources.property_shares.removed", { type: "info" });
          queryClient.invalidateQueries({ queryKey: ["property_shares"] });
        },
      },
    );
  };

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex-1 min-w-0">
        <div className="font-medium truncate">
          {isForProperty ? (
            <ReferenceField
              source="contact_id"
              reference="contacts"
              link="show"
            />
          ) : (
            <ReferenceField
              source="property_id"
              reference="properties"
              link="show"
            />
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          {formatShareDate(share.shared_at)}
        </div>
        {share.comment && (
          <p className="text-sm whitespace-pre-line mt-1">{share.comment}</p>
        )}
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-11 shrink-0 text-muted-foreground"
        aria-label={translate("resources.property_shares.action.remove")}
        disabled={isPending}
        onClick={handleRemove}
      >
        <Trash2 className="size-5" />
      </Button>
    </div>
  );
};

const ShareDialog = ({
  open,
  onOpenChange,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  target: ShareTarget;
}) => {
  const translate = useTranslate();
  const notify = useNotify();
  const queryClient = useQueryClient();
  const { identity } = useGetIdentity();
  const isForProperty = target.property_id != null;

  const handleSuccess = () => {
    notify("resources.property_shares.added", { type: "info" });
    queryClient.invalidateQueries({ queryKey: ["property_shares"] });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {translate(
              isForProperty
                ? "resources.property_shares.action.share_with_contact"
                : "resources.property_shares.action.share_property",
            )}
          </DialogTitle>
        </DialogHeader>
        {open && (
          <CreateBase
            resource="property_shares"
            redirect={false}
            mutationOptions={{ onSuccess: handleSuccess }}
          >
            <Form
              defaultValues={{
                ...target,
                shared_at: getTodayISODate(),
                sales_id: identity?.id,
              }}
              className="flex flex-col gap-4"
            >
              {isForProperty ? (
                <ReferenceInput
                  source="contact_id"
                  reference="contacts_summary"
                >
                  <AutocompleteInput
                    label="resources.property_shares.fields.contact_id"
                    optionText={contactOptionText}
                    validate={required()}
                    helperText={false}
                  />
                </ReferenceInput>
              ) : (
                <ReferenceInput source="property_id" reference="properties">
                  <AutocompleteInput
                    label="resources.property_shares.fields.property_id"
                    optionText="title"
                    validate={required()}
                    helperText={false}
                  />
                </ReferenceInput>
              )}
              <DateInput
                source="shared_at"
                label="resources.property_shares.fields.shared_at"
                validate={required()}
                helperText={false}
              />
              <TextInput
                source="comment"
                label="resources.property_shares.fields.comment"
                multiline
                rows={3}
                helperText={false}
              />
              <SaveButton
                className="h-12 text-base"
                label="resources.property_shares.action.share"
              />
            </Form>
          </CreateBase>
        )}
      </DialogContent>
    </Dialog>
  );
};
