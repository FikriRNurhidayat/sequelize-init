# Sequelize Init
An example project that using Sequelize as their ORM.

## Requirement
* ```Postgresql 9.0^```
* ```node:10.16^```

## How to run
In order to run this repository, you need ```Node``` at least version ```10.16```
```
# Setup environment
touch .env
echo 'DB_USERNAME=YOUR_DB_USERNAME' >> .env
echo 'DB_PASSWORD=YOUR_DB_PASSWORD' >> .env
echo 'JWT_SIGNATURE_KEY=YOUR_JWT_SIGNATURE_KEY' >> .env
echo 'DB_NAME=YOUR_DB_NAME' >> .env
echo 'DB_NAME_TEST=YOUR_DB_NAME_TEST' >> .env
echo 'DB_NAME_PRODUCTION=YOUR_DB_NAME_PRODUCTION' >> .env

# Setup repository for development environment 
npm install
npm run db:create
npm run db:migrate
npm run dev

# Setup repository for testing environment
npm install
NODE_ENV=test npm run db:create
NODE_ENV=test npm run db:migrate
npm test

# Setup repository for production environment
NODE_ENV=production npm install
NODE_ENV=production npm run db:create
NODE_ENV=production npm run db:migrate
npm start
```

## How to run with docker
It is simple, but you need to install this following application first:
* ```docker.io```
* ```docker-compose```
And also you need to setup the docker-compose.yml as well,
Set it up accordingly.

Then just simply run:
```bash ./scripts/run.sh```
