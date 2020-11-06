#!/bin/bash

echo "Postgres Database: POSTGRES_DATABASE"
echo "Postgres Host: $POSTGRES_HOST"
echo "Postgres username: $POSTGRES_USERNAME"

echo "Environment is $DEPLOY_ENV"
echo "run script $SCRIPT"
echo "Callback: $CALLBACK"
date
npm run db:create
npm run db:migrate
npm run db:seed
npm run $SCRIPT
