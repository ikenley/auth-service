export type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  created: Date;
  lastAccessed: Date | null;
};

export type OauthStateType = {
  id: string;
  redirectUrl: string;
  startedAt: Date;
  completedAt: Date | null;
  userId: string | null;
};

export type CallbackRequestParams = {
  code: string;
  state: string;
};
