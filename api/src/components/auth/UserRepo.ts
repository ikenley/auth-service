import {
	type DynamoDBDocumentClient,
	GetCommand,
	PutCommand,
	UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import type { Cradle } from "../../loaders/cradle.ts";
import UserEntity from "./UserEntity.ts";

export default class UserRepo {
	private docClient: DynamoDBDocumentClient;
	private tableName: string;

	constructor({ docClient, config }: Cradle) {
		this.docClient = docClient;
		this.tableName = config.dynamo.userTableName;
	}

	async findById(id: string): Promise<UserEntity | null> {
		const result = await this.docClient.send(
			new GetCommand({
				TableName: this.tableName,
				Key: { id },
			}),
		);

		if (!result.Item) {
			return null;
		}

		const item = result.Item;
		const entity = new UserEntity();
		entity.id = item.id;
		entity.firstName = item.firstName;
		entity.lastName = item.lastName;
		entity.email = item.email;
		entity.created = new Date(item.created);
		entity.lastAccessed = item.lastAccessed
			? new Date(item.lastAccessed)
			: null;
		return entity;
	}

	async create(user: UserEntity): Promise<void> {
		await this.docClient.send(
			new PutCommand({
				TableName: this.tableName,
				Item: {
					id: user.id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					created: user.created.toISOString(),
					lastAccessed: user.lastAccessed
						? user.lastAccessed.toISOString()
						: null,
				},
			}),
		);
	}

	async updateLastAccessed(id: string, lastAccessed: Date): Promise<void> {
		await this.docClient.send(
			new UpdateCommand({
				TableName: this.tableName,
				Key: { id },
				UpdateExpression: "SET lastAccessed = :lastAccessed",
				ExpressionAttributeValues: {
					":lastAccessed": lastAccessed.toISOString(),
				},
			}),
		);
	}
}
