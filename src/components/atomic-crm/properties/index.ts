import React from "react";

import type { Property } from "../types";
import { PropertyCreate, PropertyEdit } from "./PropertyCreate";
import { PropertyShow } from "./PropertyShow";

const PropertyList = React.lazy(() => import("./PropertyList"));

export default {
  list: PropertyList,
  show: PropertyShow,
  create: PropertyCreate,
  edit: PropertyEdit,
  recordRepresentation: (record: Property) => record?.title,
};
