export type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  created: Date;
  lastAccessed: Date | null;
};

export enum WorkflowType {
  login = "login",
  logout = "logout",
}

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
