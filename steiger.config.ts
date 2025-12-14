import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // Ignore Next.js routing directories
    ignores: ["app/**", "pages/**"],
  },
]);
