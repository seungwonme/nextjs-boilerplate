import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Ignore Next.js routing directories
    ignores: ["app/**", "pages/**"],
  },
  {
    rules: {
      // Allow empty FSD layer placeholders (entities/, features/, widgets/)
      "fsd/insignificant-slice": "off",
      // Allow shared/hooks as a segment name (project convention)
      "fsd/segments-by-purpose": "off",
      // Allow segments and slices to share a name (e.g. "auth")
      "fsd/repetitive-naming": "off",
    },
  },
]);
