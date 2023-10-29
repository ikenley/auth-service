import { Column, Entity, PrimaryColumn } from "typeorm";
import { OauthStateType } from "../../types";

@Entity({ schema: "auth", name: "oauth_state" })
export default class OauthStateEntity implements OauthStateType {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ type: "varchar", name: "redirect_url" })
  redirectUrl: string;

  @Column({ type: "timestamp", name: "started_at" })
  startedAt: Date;

  @Column({ type: "timestamp", name: "completed_at", nullable: true })
  completedAt: Date | null;

  @Column({ type: "varchar", name: "user_id", nullable: true })
  userId: string | null;
}
