import { address, datatype, lorem, random } from "faker/locale/en_US";

import type { Property, PropertyShare } from "../../../types";
import type { Db } from "./types";
import { randomDate } from "./utils";

const PROPERTY_TYPES = ["house", "apartment", "land", "commercial", "office"];
const NEIGHBORHOODS = [
  "Villa Morra",
  "Carmelitas",
  "Recoleta",
  "Mburucuyá",
  "Las Lomas",
  "Sajonia",
];

export const generateProperties = (db: Db): Property[] =>
  Array.from(Array(20).keys()).map((id) => {
    const propertyType = random.arrayElement(PROPERTY_TYPES);
    const operation = random.arrayElement(["sale", "rent"]);
    const currency = random.arrayElement(["PYG", "USD"]);
    const created_at = randomDate().toISOString();
    const price =
      currency === "USD"
        ? datatype.number({ min: 300, max: 900 }) *
          (operation === "sale" ? 500 : 2)
        : datatype.number({ min: 30, max: 900 }) *
          (operation === "sale" ? 5_000_000 : 50_000);
    return {
      id,
      title: `${propertyType[0].toUpperCase()}${propertyType.slice(1)} ${lorem.word()}`,
      property_type: propertyType,
      operation,
      price,
      currency,
      address: address.streetAddress(),
      neighborhood: random.arrayElement(NEIGHBORHOODS),
      city: "Asunción",
      bedrooms:
        propertyType === "land" ? null : datatype.number({ min: 1, max: 5 }),
      bathrooms:
        propertyType === "land" ? null : datatype.number({ min: 1, max: 4 }),
      built_area:
        propertyType === "land" ? null : datatype.number({ min: 40, max: 400 }),
      land_area: datatype.number({ min: 200, max: 1500 }),
      parking_spaces: datatype.number({ min: 0, max: 3 }),
      agency: datatype.boolean() ? null : `${lorem.word()} Propiedades`,
      description: lorem.paragraph(),
      sales_id: random.arrayElement(db.sales).id,
      created_at,
      updated_at: created_at,
    };
  });

export const generatePropertyShares = (db: Db): PropertyShare[] =>
  Array.from(Array(40).keys()).map((id) => {
    const shared_at = randomDate().toISOString();
    return {
      id,
      property_id: random.arrayElement(db.properties).id,
      contact_id: random.arrayElement(db.contacts).id,
      shared_at: shared_at.split("T")[0],
      comment: datatype.boolean() ? lorem.sentence() : null,
      sales_id: random.arrayElement(db.sales).id,
      created_at: shared_at,
    };
  });
