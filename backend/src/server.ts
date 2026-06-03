import { Port } from "../config/env";
import Health from "./routes/health";

const bootstrap = async () => {
  Bun.serve({
    port: Number(Port) || 3000,
    routes: {
      "/api/health": {
        GET: async () => Health()

      }

    }

  });

};

export default bootstrap;
