import type { DataProvider } from "ra-core";

import type { Deal } from "../types";
import { updateDealStage } from "./updateDealStage";

/**
 * Move a deal to the top of another stage, keeping the indexes of the
 * other deals consistent (same logic as the drag and drop on the Kanban board).
 */
export const moveDealToStage = async (
  deal: Deal,
  stage: string,
  dataProvider: DataProvider,
) => {
  if (deal.stage === stage) return;
  const { data: firstDeals } = await dataProvider.getList<Deal>("deals", {
    sort: { field: "index", order: "ASC" },
    pagination: { page: 1, perPage: 1 },
    filter: { stage },
  });
  await updateDealStage(
    deal,
    { stage, index: firstDeals[0]?.index },
    dataProvider,
  );
};
