export type UserType = {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	created: Date;
	lastAccessed: Date | null;
};

/** A const object rather than a TS `enum`: enums are not erasable syntax, so
 * they cannot be run directly by `node`. Usage is unchanged — `WorkflowType`
 * still works as both a value (`WorkflowType.login`) and a type.
 */
export const WorkflowType = {
	login: "login",
	logout: "logout",
} as const;

export type WorkflowType = (typeof WorkflowType)[keyof typeof WorkflowType];

export type OauthStateType = {
	id: string;
	redirectUrl: string;
	startedAt: Date;
	completedAt: Date | null;
	userId: string | null;
	workflowType: WorkflowType;
};

export type LoginRequestParams = {
	r: string;
};

export type LogoutRequestParams = LoginRequestParams;

export type LoginCallbackRequestParams = {
	code: string;
	state: string;
};
