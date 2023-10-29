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

---

## Git Submodules

For local development, this project uses the prediction-app repo as a submodule. 

```
git submodule add https://github.com/ikenley/prediction-app.git
```

---

## TODO

- /login
    - redirect URL param (restrict by domain or /)
- /login/callback
    - Cookie refreshToken
    - Upsert auth.iam.user
- /logout
- GET /token/refresh
- auth service account user + migration
- Terraform changes
    - Migrations separate codepipeline
    - lambda version
    - CI/CD
- handle federated duplicates
    - https://stackoverflow.com/questions/59635482/aws-cognito-best-practice-to-handle-same-user-with-same-email-address-signing
    - https://stackoverflow.com/questions/64811626/how-to-link-aws-cognito-native-user-to-the-federated-user

http://localhost:8088/auth/api/auth/login

