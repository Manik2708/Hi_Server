import express from "express";
import http from "http";

export function getTestServerInsatnce() {
  return new Promise<ServerProperties>((resolve, reject) => {
    const app = express();
    app.use(express.json());
    const server = http.createServer(app);
    server.listen(3001, () => {
      resolve({
        server: server,
        app: app,
      });
    });
    setTimeout(() => {
      reject(new Error("failed to connect wihtin 5 seconds."));
    }, 5000);
  });
}

export function closeTestServer(server: ServerProperties) {
  server.server.close((err) => {
    if (err) {
      console.log(err.toString());
    }
  });
}

export interface ServerProperties {
  app: express.Express;
  server: http.Server;
}
