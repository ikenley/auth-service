import { UserType } from "../../types/index.js";

export default class UserEntity implements UserType {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  created: Date;
  lastAccessed: Date | null;
}
