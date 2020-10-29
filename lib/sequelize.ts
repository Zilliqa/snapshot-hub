import { Sequelize } from 'sequelize-typescript';

import {
  Hub,
  Message
} from './models';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  database: 'movies',
  storage: "storage.sql"
  // storage: ':memory:'
});

sequelize.addModels([
  Hub,
  Message
]);
