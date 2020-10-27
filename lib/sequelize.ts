import { Sequelize } from 'sequelize-typescript';

import {
  Hub,
  Message
} from './models';

export const sequelize = new Sequelize({
  dialect: 'sqlite',
  database: 'movies',
  storage: ':memory:'
});

sequelize.addModels([
  Hub,
  Message
]);
