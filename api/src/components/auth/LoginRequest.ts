import { LoginRequestParams } from "../../types/index.js";

/** Sanitizes LoginRequestParams */
export default class LoginRequest {
  redirectUrl: string;

  constructor(params: LoginRequestParams, baseDomain: string | null) {
    const { r } = params;

    if (!r) {
      throw new Error(`No redirect URL found`);
    }

    if (r.startsWith("/")) {
      this.redirectUrl = r;
    } else if (baseDomain) {
      const url = new URL(r);
      if (url.host.endsWith(baseDomain)) {
        this.redirectUrl = r;
      }
    } else {
      throw new Error(`Invalid redirect URL: ${r}`);
    }
  }
}
