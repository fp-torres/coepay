import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();
dotenv.config({ path: "../.env" });

const databaseUrl = process.env.DATABASE_URL;
const shouldUseSsl =
  process.env.DATABASE_SSL === "true" ||
  process.env.DB_SSL === "true" ||
  databaseUrl?.includes("render.com");

const baseOptions = {
  dialect: "postgres",
  logging: false,
  ...(shouldUseSsl
    ? {
        dialectOptions: {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
        },
      }
    : {}),
};

export const sequelize = databaseUrl
  ? new Sequelize(databaseUrl, baseOptions)
  : new Sequelize(
      process.env.DB_NAME || "coepay_status_pgto_2.0",
      process.env.DB_USER || "postgres",
      process.env.DB_PASS || "crase",
      {
        ...baseOptions,
        host: process.env.DB_HOST || "1.0.90.90",
        port: Number(process.env.DB_PORT || 5432),
      }
    );
