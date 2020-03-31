import { DynamoDBDocumentClient, QueryOutput } from './dynamodb';
import 'source-map-support/register';
import { Installation } from '../types';

const INSTALLATIONS_TABLE_NAME = process.env.INSTALLATIONS_TABLE_NAME || 'installations';

export const makeInstallationPk = (teamId: string): string => `PK#${teamId}`;
export const makeInstallationSk = (enterpriseId: string): string => `#SK#${enterpriseId}`;

export const saveInstallation = async (installation: Installation): Promise<void> => {
  await DynamoDBDocumentClient.put({
    TableName: INSTALLATIONS_TABLE_NAME,
    Item: installation,
  }).promise();
};

export const deleteInstallation = async (installation: Installation): Promise<void> => {
  await DynamoDBDocumentClient.delete({
    TableName: INSTALLATIONS_TABLE_NAME,
    Key: installation,
  }).promise();
};

export const listInstallations = async (teamId: string, enterpriseId: string = null): Promise<QueryOutput> => {
  const response = await DynamoDBDocumentClient.query({
    TableName: INSTALLATIONS_TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND SK >= :key',
    ExpressionAttributeValues: {
      ':pk': makeInstallationPk(teamId),
      ':key': makeInstallationSk(enterpriseId),
    },
  }).promise();

  return response;
};
