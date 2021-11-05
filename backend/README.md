## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Add migration
```bash
yarn typeorm:migration:generate -- da_init
```

## Run migration
```bash
yarn typeorm:migration:run
```

## Schema
https://dbdiagram.io/d/6171793b6239e146477c1a8c


## REDIS 
redis-cli -a changeme  -p 6379 -h da_redis