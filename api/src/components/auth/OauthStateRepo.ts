import { injectable, inject } from "tsyringe";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ConfigOptions } from "../../config/index.js";
import { DynamoClientToken } from "../../loaders/loadGlobalDependencies.js";
import OauthStateEntity from "./OauthStateEntity.js";

@injectable()
export default class OauthStateRepo {
  private tableName: string;

  constructor(
    @inject(DynamoClientToken) private docClient: DynamoDBDocumentClient,
    config: ConfigOptions
  ) {
    this.tableName = config.dynamo.oauthStateTableName;
  }

  async create(state: OauthStateEntity): Promise<void> {
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: {
          id: state.id,
          redirectUrl: state.redirectUrl,
          startedAt: state.startedAt.toISOString(),
          completedAt: state.completedAt ? state.completedAt.toISOString() : null,
          userId: state.userId,
          workflowType: state.workflowType,
          ttl: state.ttl,
        },
      })
    );
  }

  async getById(id: string): Promise<OauthStateEntity> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id },
      })
    );

    if (!result.Item) {
      throw new Error(`OauthState not found: ${id}`);
    }

    const item = result.Item;
    const entity = new OauthStateEntity();
    entity.id = item.id;
    entity.redirectUrl = item.redirectUrl;
    entity.startedAt = new Date(item.startedAt);
    entity.completedAt = item.completedAt ? new Date(item.completedAt) : null;
    entity.userId = item.userId ?? null;
    entity.workflowType = item.workflowType;
    entity.ttl = item.ttl;
    return entity;
  }

  async complete(
    id: string,
    userId: string,
    completedAt: Date
  ): Promise<void> {
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id },
        UpdateExpression:
          "SET userId = :userId, completedAt = :completedAt",
        ExpressionAttributeValues: {
          ":userId": userId,
          ":completedAt": completedAt.toISOString(),
        },
      })
    );
  }
}
