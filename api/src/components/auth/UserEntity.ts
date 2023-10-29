import { Column, Entity, PrimaryColumn } from "typeorm";
import { UserType } from "../../types";

@Entity({ schema: "auth", name: "user" })
export default class UserEntity implements UserType {
  @PrimaryColumn({ type: "uuid" })
  id: string;

  @Column({ type: "varchar", name: "first_name" })
  firstName: string;

  @Column({ type: "varchar", name: "last_name" })
  lastName: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "timestamp" })
  created: Date;

  @Column({ type: "timestamp", name: "last_accessed", nullable: true })
  lastAccessed: Date | null;
}
