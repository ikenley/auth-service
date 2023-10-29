import { DataSource } from "typeorm";
import { config } from "../config";
import OauthStateEntity from "../components/auth/OauthStateEntity";
import UserEntity from "../components/auth/UserEntity";
import { Logger } from "winston";

export const entities = [OauthStateEntity, UserEntity];

/** Database connection pool for typeorm */
export const initializeDataSource = async (logger: Logger) => {
  const dataSource = new DataSource({
    type: "postgres",
    host: config.db.host,
    port: config.db.port,
    username: config.db.user,
    password: config.db.password,
    database: config.db.database,
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
