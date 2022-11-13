import { DateResolver } from "graphql-scalars";

import { builder } from "../builder.js";

export const registerScalars = () => builder.addScalarType("Date", DateResolver, {});
