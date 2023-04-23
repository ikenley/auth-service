# auth-service

Centralized authentication microservice for use with Amazon Cognito hosted UI.

This is also an example of the "dollar full stack app". The goal is to 
1. Have an app that can be hosted at zero marginal cost:
    - Data layer: Existing reserved RDS PostgreSQL instance
    - API layer: Express.js app hosted in a Lambda function behind an ALB listener rule
    - Front-end: Static React app on an S3 bucket behind a CloudFront CDN
2. Maintain the option value to convert it to an enterprise-ready Docker-based hosting strategy with minimal refactoring.

## IaC

See [https://github.com/ikenley/template-infrastructure](https://github.com/ikenley/template-infrastructure)

## TODO

- /login
    - dynamo OauthState {id: uuid, redirectUrl: string, startedAt: Date, completedAt Date | null}
- /login/callback
- /logout
- GET /token/refresh