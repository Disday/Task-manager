# Task manager

## [Live demo](https://task-manager-dmitrii-temin.up.railway.app)

### Tests and linter status:
[![Node CI](https://github.com/Disday/Task-manager/actions/workflows/nodejs.yml/badge.svg)](https://github.com/Disday/Task-manager/actions/workflows/nodejs.yml)

## Description
Complete task manager (ToDo-list) for tracking tasks and planning

## Features
- Authentication based on cookie user sessions and authorization for private actions
- Persistent data storage on Postgres and data-mapping via Obection ORM
- CRUDs for tasks, users, statuses, labels on Fastify.js

## Main dependencies
- Fastify 3.29.0
- Pg 8.8.0
- Sqlite3 5.0.8
- Objection 3.0.1
- Pug 3.0.2
- Bootstrap 5.1.3
- Webpack 5.72.1
- Eslint 8.21.0
- Jest 28.1.3
- Lodash 4.17.21

## Requirements
1. **Nodejs** v16.0 or higher. For install you can follow  https://nodejs.org/en/
2. **Make** utility. For install use ```sudo apt install make```

## Setup
1. Clone repository to your system with ```git clone https://github.com/Disday/Task-manager.git```
2. Enter project directory
3. If you use Docker just ```make docker``` for build Docker image and run application in container\
**OR**\
Run installation with ```make setup```

## Run
Run application with ```make start```  
Browse http://localhost:5000
