import { useState } from "react";
import { useRecordContext, useTranslate, WithRecord } from "ra-core";
import { ArrayField } from "@/components/admin/array-field";
import { SingleFieldList } from "@/components/admin/single-field-list";
import { TextField } from "@/components/admin/text-field";
import { EmailField } from "@/components/admin/email-field";
import {
  Briefcase,
  Cake,
  Check,
  Heart,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";
import type { ReactNode } from "react";
import { translatePersonalInfoTypeLabel } from "./contactModel";
import { formatShareDate } from "../properties/propertyUtils";
import type { Contact } from "../types";

export const ContactPersonalInfo = () => {
  const record = useRecordContext<Contact>();
  const translate = useTranslate();

  if (!record) return null;

  return (
    <div>
      <ArrayField source="email_jsonb">
        <SingleFieldList className="flex-col gap-y-0">
          <EmailRow />
        </SingleFieldList>
      </ArrayField>

      <ArrayField source="phone_jsonb">
        <SingleFieldList className="flex-col gap-y-0">
          <PersonalInfoRow
            icon={<Phone className="w-4 h-4 text-muted-foreground" />}
            primary={<TextField source="number" />}
          />
        </SingleFieldList>
      </ArrayField>
      {record.workplace && (
        <PersonalInfoRow
          icon={<Briefcase className="w-4 h-4 text-muted-foreground" />}
          primary={<span>{record.workplace}</span>}
        />
      )}
      {(record.address || record.city) && (
        <PersonalInfoRow
          icon={<MapPin className="w-4 h-4 text-muted-foreground" />}
          primary={
            <span>
              {[record.address, record.city].filter(Boolean).join(", ")}
            </span>
          }
        />
      )}
      {record.birthday && (
        <PersonalInfoRow
          icon={<Cake className="w-4 h-4 text-muted-foreground" />}
          primary={
            <span>
              {translate("resources.contacts.fields.birthday")}:{" "}
              {formatShareDate(record.birthday)}
            </span>
          }
        />
      )}
      {record.anniversary && (
        <PersonalInfoRow
          icon={<Heart className="w-4 h-4 text-muted-foreground" />}
          primary={
            <span>
              {translate("resources.contacts.fields.anniversary")}:{" "}
              {formatShareDate(record.anniversary)}
            </span>
          }
        />
      )}
    </div>
  );
};

const EmailRow = () => {
  const record = useRecordContext<{ email: string }>();
  const translate = useTranslate();
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(record.email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <PersonalInfoRow
      icon={
        <button
          type="button"
          onClick={handleCopy}
          title={translate("crm.common.copy")}
          className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
        </button>
      }
      primary={<EmailField source="email" />}
    />
  );
};

const PersonalInfoRow = ({
  icon,
  primary,
  showType,
}: {
  icon: ReactNode;
  primary: ReactNode;
  showType?: boolean;
}) => {
  const translate = useTranslate();

  return (
    <div className="flex flex-row items-center gap-x-2 py-1 min-h-6">
      {icon}
      <div className="flex flex-wrap gap-x-2 gap-y-0 text-sm">
        {primary}
        {showType ? (
          <WithRecord
            render={(row) =>
              row.type !== "Other" && (
                <span className="text-muted-foreground">
                  {translatePersonalInfoTypeLabel(row.type, translate)}
                </span>
              )
            }
          />
        ) : null}
      </div>
    </div>
  );
};
