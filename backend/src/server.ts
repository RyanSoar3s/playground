import { Origin, Port } from "@config/env";
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
      "/api/execute": {
        POST: async (req) => await Execution(req),
        OPTIONS: async () => {
          return new Response(null, {
            status: 200,
            headers: {
              "Access-Control-Allow-Origin": Origin || "http://localhost:4200",
              "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
              "Access-Control-Allow-Credentials": "true",
              "Access-Control-Allow-Headers": "Content-Type",
              "Content-Type": "application/json"

            }

          })

        }

      }

    }

  });

};

export default bootstrap;
