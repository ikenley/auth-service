import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DataSource } from "typeorm";
import { DatabaseOptions } from "../config/index.js";
import OauthStateEntity from "../components/auth/OauthStateEntity.js";
import UserEntity from "../components/auth/UserEntity.js";
import { Logger } from "winston";

export const entities = [OauthStateEntity, UserEntity];

let dataSource: DataSource | null = null;

/** Database connection pool for typeorm */
export const initializeDataSource = async (
  logger: Logger,
  db: DatabaseOptions
) => {
  if (dataSource === null) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const certPath = path.resolve(__dirname, "../../certs/global-bundle.pem");
    logger.info("Resolved SSL certificate path", { certPath });
    const ca = fs.readFileSync(certPath).toString();

    dataSource = new DataSource({
      type: "postgres",
      host: db.host,
      port: db.port,
      username: db.user,
      password: db.password,
      database: db.database,
      synchronize: false,
      logging: false,
      entities: entities,
      ssl: { rejectUnauthorized: true, ca },
    });
  }
  try {
    await dataSource.initialize();
    logger.info("DataSource initialized");
  } catch (e: any) {
    logger.error("Error initializing DataSource", { error: e });
  }

  return dataSource;
};

export const closeDataSource = async () => {
  if (dataSource) {
    await dataSource.destroy();
  }
};

export default initializeDataSource;
