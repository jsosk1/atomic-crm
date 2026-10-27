import type {
  Company,
  Contact,
  ContactNote,
  Deal,
  DealNote,
  Property,
  PropertyShare,
  Sale,
  Tag,
  Task,
} from "../../../types";
import type { ConfigurationContextValue } from "../../../root/ConfigurationContext";

export interface Db {
  companies: Company[];
  contacts: Contact[];
  contact_notes: ContactNote[];
  deals: Deal[];
  deal_notes: DealNote[];
  properties: Property[];
  property_shares: PropertyShare[];
  sales: Sale[];
  tags: Tag[];
  tasks: Task[];
  configuration: Array<{ id: number; config: ConfigurationContextValue }>;
}
