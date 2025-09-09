import { Connection, Request, TYPES } from "tedious";
import config from "@/app/lib/dbConfig";

interface ITediousColumn {
  value: any;
  metadata: {
    colName: string;
  };
}

export const executeQuery = <T = any>(
  query: string,
  parameters: any[] = []
): Promise<T[]> => {
  return new Promise((resolve, reject) => {
    const connection = new Connection(config);
    const results: T[] = [];

    connection.on("connect", (err) => {
      if (err) {
        reject(err);
        return;
      }

      const request = new Request(query, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
        connection.close();
      });

      parameters.forEach((param, index) => {
        request.addParameter(`param${index + 1}`, param.type, param.value);
      });

      request.on("row", (columns: ITediousColumn[]) => {
        const row: any = {};
        columns.forEach((column) => {
          row[column.metadata.colName] = column.value;
        });
        results.push(row);
      });

      connection.execSql(request);
    });

    connection.connect();
  });
};
