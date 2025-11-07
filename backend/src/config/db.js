import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

export const sequelize = new Sequelize(
  process.env.DB_NAME || "coepay_status_pgto_2.0",
  process.env.DB_USER || "postgres",
  process.env.DB_PASS || "crase",
  {
    host: process.env.DB_HOST || "1.0.90.90",
    dialect: "postgres",
    port: 5432,
    logging: false,
  }
);

