type Dialect =
  | "mysql"
  | "postgres"
  | "sqlite"
  | "mariadb"
  | "mssql"
  | "db2"
  | "snowflake"
  | "oracle";
declare module NodeJS {
  interface ProcessEnv {
    APP_NAME: string;
    APP_URL: string;
    APP_PORT: string;

    DB_CONNECTION: string;
    DB_LOGGING: string;
    PUBLIC_VAPID_KEY: string;
    PRIVATE_VAPID_KEY: string;
    WUB_PUSH_SERVER_KEY: string;
    AUTH_BASE_URI: string;
  }
}
