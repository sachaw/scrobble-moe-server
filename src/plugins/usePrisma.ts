import { Plugin } from "@envelop/types";

export const usePrisma: Plugin = {
  onParse({ extendContext }) {
    extendContext({
      myVar: "test",
    });
  },
};
