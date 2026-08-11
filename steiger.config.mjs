import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    ignores: ["app/**", "pages/**"],
  },
  {
    rules: {
      "fsd/insignificant-slice": "off",
      "fsd/segments-by-purpose": "off",
      "fsd/repetitive-naming": "off",
    },
  },
]);
