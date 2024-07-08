import * as dotenv from 'dotenv';

dotenv.config();

export const configDatabase = {
  DB_HOST: process.env.BD_HOST,
  DB_PORT: parseInt(process.env.BD_PORT, 10),
  MYSQL_USER: process.env.MYSQL_USER,
  MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,
  MYSQL_DATABASE: process.env.MYSQL_DATABASE,
};