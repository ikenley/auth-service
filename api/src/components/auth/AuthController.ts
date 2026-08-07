import {
	type CookieOptions,
	type Request,
	type Response,
	Router,
} from "express";
import { type DependencyContainer, injectable } from "tsyringe";
import type { ConfigOptions } from "../../config/index.js";
import type {
	LoginCallbackRequestParams,
	LoginRequestParams,
} from "../../types/index.js";
import AuthService from "./AuthService.js";

const RefreshCookieName = "refresh";

const route = Router();

@injectable()
export default class AuthController {
	constructor(protected config: ConfigOptions) {}

	public registerRoutes(app: Router) {
		app.use(route); // Auth controller uses top-level path prefix

		const getService = (res: Response) => {
			const container = res.locals.container as DependencyContainer;
			return container.resolve(AuthService);
		};

		route.get(
			"/login",
			async (
				req: Request<unknown, unknown, unknown, LoginRequestParams>,
				res,
			) => {
				const service = getService(res);
				const redirectUrl = await service.initiateLogin(req.query);
				res.redirect(redirectUrl);
			},
		);

		const getCookieOptions = () => {
			const isLocal = this.config.app.env === "local";
			const domain = isLocal ? undefined : `.${this.config.baseDomain}`;
			const cookieOptions: CookieOptions = {
				httpOnly: true,
				sameSite: "strict",
				// enable http for localhost only
				secure: isLocal ? false : true,
				domain: domain,
			};
			return cookieOptions;
		};

		route.get(
			"/login/callback",
			async (req: Request<{}, {}, {}, LoginCallbackRequestParams>, res) => {
				const service = getService(res);
				const { redirectUrl, refreshToken } = await service.handleLoginCallback(
					req.query,
				);

				// Set cookie
				const cookieOptions = getCookieOptions();
				cookieOptions.expires = new Date();
				cookieOptions.expires.setTime(
					new Date().getTime() + 30 * 24 * 60 * 60 * 1000,
				); // +30 days
				res.cookie(RefreshCookieName, refreshToken, cookieOptions);

				res.redirect(redirectUrl);
			},
		);

		route.get(
			"/logout",
			async (
				req: Request<unknown, unknown, unknown, LoginRequestParams>,
				res,
			) => {
				const service = getService(res);
				const redirectUrl = await service.initiateLogout(req.query);

				const cookieOptions = getCookieOptions();
				res.clearCookie(RefreshCookieName, cookieOptions);

				res.redirect(redirectUrl);
			},
		);

		route.post("/refresh", async (req, res) => {
			const refreshToken = req.cookies[RefreshCookieName];
			const service = getService(res);
			const idToken = await service.refresh(refreshToken);
			res.send(idToken);
		});
	}
}
