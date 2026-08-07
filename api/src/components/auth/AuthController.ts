import type { AwilixContainer } from "awilix";
import {
	type CookieOptions,
	type Request,
	type Response,
	Router,
} from "express";
import type { ConfigOptions } from "../../config/index.ts";
import type { Cradle } from "../../loaders/cradle.ts";
import type {
	LoginCallbackRequestParams,
	LoginRequestParams,
} from "../../types/index.ts";

const RefreshCookieName = "refresh";

const route = Router();

export default class AuthController {
	protected config: ConfigOptions;

	constructor({ config }: Cradle) {
		this.config = config;
	}

	public registerRoutes(app: Router) {
		app.use(route); // Auth controller uses top-level path prefix

		const getService = (res: Response) => {
			const requestScope = res.locals.container as AwilixContainer<Cradle>;
			return requestScope.cradle.authService;
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
				secure: !isLocal,
				domain: domain,
			};
			return cookieOptions;
		};

		route.get(
			"/login/callback",
			async (
				req: Request<unknown, unknown, unknown, LoginCallbackRequestParams>,
				res,
			) => {
				const service = getService(res);
				const { redirectUrl, refreshToken } = await service.handleLoginCallback(
					req.query,
				);

				// Set cookie
				const cookieOptions = getCookieOptions();
				cookieOptions.expires = new Date();
				cookieOptions.expires.setTime(Date.now() + 30 * 24 * 60 * 60 * 1000); // +30 days
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
