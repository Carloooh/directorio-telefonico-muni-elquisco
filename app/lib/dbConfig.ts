import { ConnectionConfiguration } from "tedious";

const config: ConnectionConfiguration = {
  server: process.env.BD_HOST as string,
  authentication: {
    type: "default",
    options: {
      userName: process.env.BD_USER as string,
      password: process.env.BD_PASSWORD as string,
    },
  },
  options: {
    requestTimeout: 60000,
    connectTimeout: 60000,
    database: process.env.BD_NAME as string,
    encrypt: true,
    trustServerCertificate: true,
    cryptoCredentialsDetails: {
      minVersion: "TLSv1.2",
    },
  },
};

export default config;
