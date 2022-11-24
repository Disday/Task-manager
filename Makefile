setup: prepare install db-migrate

install:
	npm install

db-migrate:
	npx knex migrate:latest

build:
	npm run build

prepare:
	cp -n .env.example .env || true

start:
	heroku local -f Procfile.dev

start-backend:
	npm start -- --watch --verbose-watch --ignore-watch='node_modules .git .sqlite'

start-frontend:
	npx webpack --watch

lint:
	npx eslint . --fix

test:
	npm test -s

test-coverage:
	npm test -- --coverage --coverageProvider=v8

docker:
	docker build -t task-manager .
	docker run -it -p 3000:3000 -p 80:80 task-manager
