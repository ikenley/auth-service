import { DataSource } from "typeorm";
import { DatabaseOptions } from "../config";
import OauthStateEntity from "../components/auth/OauthStateEntity";
import UserEntity from "../components/auth/UserEntity";
import { Logger } from "winston";

export const entities = [OauthStateEntity, UserEntity];

/** Database connection pool for typeorm */
export const initializeDataSource = async (
  logger: Logger,
  db: DatabaseOptions
) => {
  const dataSource = new DataSource({
    type: "postgres",
    host: db.host,
    port: db.port,
    username: db.user,
    password: db.password,
    database: db.database,
    synchronize: false,
    logging: false,
    entities: entities,
  });
  try {
    await dataSource.initialize();
    logger.info("DataSource initialized");
  } catch (e: any) {
    logger.error("Error initializing DataSource", { error: e });
  }

  return dataSource;
};

export default initializeDataSource;
