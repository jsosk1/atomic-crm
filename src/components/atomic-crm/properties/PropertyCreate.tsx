import { CreateBase, EditBase, Form, useGetIdentity } from "ra-core";
import { Card, CardContent } from "@/components/ui/card";

import { FormToolbar } from "../layout/FormToolbar";
import { PropertyInputs } from "./PropertyInputs";

export const PropertyCreate = () => {
  const { identity } = useGetIdentity();
  return (
    <CreateBase redirect="show">
      <div className="mt-2 max-w-4xl">
        <Form defaultValues={{ sales_id: identity?.id }}>
          <Card>
            <CardContent>
              <PropertyInputs />
              <FormToolbar />
            </CardContent>
          </Card>
        </Form>
      </div>
    </CreateBase>
  );
};

export const PropertyEdit = () => (
  <EditBase redirect="show" mutationMode="pessimistic">
    <div className="mt-2 max-w-4xl">
      <Form>
        <Card>
          <CardContent>
            <PropertyInputs />
            <FormToolbar />
          </CardContent>
        </Card>
      </Form>
    </div>
  </EditBase>
);
