export { createClient } from "./client";
export { updateSession } from "./middleware";
export { copyCookies, getAuthSuccessUrl } from "./response";
export { createClient as createServerClient } from "./server";
export type {
  Database,
  Json,
  Tables,
  TablesInsert as Insertable,
  TablesUpdate as Updatable,
} from "./types";
