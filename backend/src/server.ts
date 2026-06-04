import { Port } from "@config/env";
import Execution from "@routes/executions";
import Health from "@routes/health";
import Languages from "@routes/languages";

const bootstrap = async () => {
  Bun.serve({
    port: Number(Port) || 3000,
    routes: {
      "/api/health": {
        GET: async () => Health()

      },
      "/api/languages": {
        GET: async () => Languages()

      },
      "/api/executions": {
        POST: async (req) => await Execution(req)

      }

    }

  });

};

export default bootstrap;
