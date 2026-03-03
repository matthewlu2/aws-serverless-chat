import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as lambdaNodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as apigwv2 from "aws-cdk-lib/aws-apigatewayv2";
import * as apigwv2Integrations from "aws-cdk-lib/aws-apigatewayv2-integrations";


export class AwsServerlessChatStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Stores chat messages
    const messagesTable = new dynamodb.Table(this, "MessagesTable", {
      partitionKey: { name: "roomId", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "ts", type: dynamodb.AttributeType.NUMBER },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });

    // Tracks active websocket connections
    const connectionsTable = new dynamodb.Table(this, "ConnectionsTable", {
      partitionKey: { name: "connectionId", type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY, // dev only
    });

    // WebSocket API
    const wsApi = new apigwv2.WebSocketApi(this, "ChatWebSocketApi", {
      apiName: "serverless-chat-ws",
    });

    const stage = new apigwv2.WebSocketStage(this, "DevStage", {
      webSocketApi: wsApi,
      stageName: "dev",
      autoDeploy: true,
    });

    const websocketEndpoint = `https://${wsApi.apiId}.execute-api.${this.region}.amazonaws.com/${stage.stageName}`;

  }
}
