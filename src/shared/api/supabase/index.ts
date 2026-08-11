export { createClient } from "./client";
export { handleAuthConfirmation } from "./confirm";
export { updateSession } from "./middleware";
export {
  copyCookies,
  getAuthSuccessUrl,
  getEmailOtpParams,
} from "./response";
export { createClient as createServerClient } from "./server";
