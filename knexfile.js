// @ts-check

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

export const development = {
  client: 'sqlite3',
  connection: {
    filename: './database.sqlite',
  },
  useNullAsDefault: true,
  migrations,
};

export const test = {
  client: 'sqlite3',
  connection: ':memory:',
  useNullAsDefault: true,
  // debug: true,
  migrations,
};

export const production = {
  client: 'pg',
  connection: 'postgres://ffcbpmkcukpzxv:99b9ec2b98b5c112689969ccec771956f5412613fda56b3a1dee3f8f990f9c20@ec2-54-228-125-183.eu-west-1.compute.amazonaws.com:5432/de8ojbt32u5t2r',
  useNullAsDefault: true,
  migrations,
  ssl: {
  rejectUnauthorized: false
  }
};
