import { handler } from "./index-lambda.js";
import { ALBEvent, Context } from "aws-lambda";

const event: ALBEvent = {
  requestContext: {
    elb: {
      targetGroupArn:
        "arn:aws:elasticloadbalancing:us-east-1:924586450630:targetgroup/ik-dev-auth/e3c4a5b32826fae1",
    },
  },
  httpMethod: "GET",
  path: "/api/status",
  queryStringParameters: {},
  headers: {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9",
    "cache-control": "max-age=0",
    host: "api.auth-service.ikenley.com",
    "sec-ch-ua":
      '"Google Chrome";v="119", "Chromium";v="119", "Not?A_Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Linux"',
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "none",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "user-agent":
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
    "x-amzn-trace-id": "Root=1-6547e40e-38c7ca5c21c9371d060ffe9c",
    "x-forwarded-for": "72.66.80.29",
    "x-forwarded-port": "443",
    "x-forwarded-proto": "https",
  },
  body: "",
  isBase64Encoded: false,
};

const context: Context = {
  callbackWaitsForEmptyEventLoop: false,
  functionName: "",
  functionVersion: "",
  invokedFunctionArn: "",
  memoryLimitInMB: "",
  awsRequestId: "",
  logGroupName: "",
  logStreamName: "",
  getRemainingTimeInMillis: () => 1000,
  done: (_error?: Error | undefined, _result?: any) => {},
  fail: () => {
    throw new Error("Function not implemented.");
  },
  succeed: () => {},
};

const invoke = async () => {
  const res = await handler(event, context);
  console.log("res", res);
};

console.log("test");
invoke();
