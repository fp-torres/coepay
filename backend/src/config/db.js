import { Sequelize } from "sequelize";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env"), override: true });

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
      process.env.DB_NAME || "coepay",
      process.env.DB_USER || "coepay_user",
      process.env.DB_PASS || "coepay_dev",
      {
        ...baseOptions,
        host: process.env.DB_HOST || "localhost",
        port: Number(process.env.DB_PORT || 5432),
      }
    );
