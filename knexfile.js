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
  connection: 'postgres://ywtsuazdjlrkaq:d79940d698f9f3f9351d8e820e8c95fab142a46f50f14ca77f3ae11e0f981a6a@ec2-54-228-125-183.eu-west-1.compute.amazonaws.com:5432/d8u02tbuj7nr3i',
  useNullAsDefault: true,
  migrations,
  ssl: true
};
