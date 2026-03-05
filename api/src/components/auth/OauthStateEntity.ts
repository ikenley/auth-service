import { OauthStateType, WorkflowType } from "../../types/index.js";

export default class OauthStateEntity implements OauthStateType {
  id: string;
  redirectUrl: string;
  startedAt: Date;
  completedAt: Date | null;
  userId: string | null;
  workflowType: WorkflowType;
  ttl: number; // epoch seconds, for DynamoDB TTL
}
