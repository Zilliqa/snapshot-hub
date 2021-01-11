# snapshot-hub 

REST API for snapshot frontend.

## Installation
```
npm install
```

## Start server
```
npm start
```

### Environment variables.
  * `PINATA_API_KEY` - API key of [pinata](https://pinata.cloud/).
  * `PINATA_SECRET_API_KEY` - SECRET key of [pinata](https://pinata.cloud/).
  * `NODE_ENV` - development, test, production
  * `POSTGRES_DB` # DataBase name.
  * `POSTGRES_PASSWORD` # DataBase password.
  * `POSTGRES_USER` # DataBase username.
  * `POSTGRES_HOST` # DataBase host for example (127.0.0.1) for production build use 'postgres'.

## setup database:
  * sequelize config - `lib/config/sequelize.ts`

## Build docker container.

```bash
$ docker-compose build # run building.
$ docker-compose up -d # runing.
```


