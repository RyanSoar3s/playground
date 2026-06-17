import { Origin } from "@config/env";
import type { HealthResult } from "@models/response.model";

const Health = () => {
  const reponse = JSON.stringify({
    status: "ok",
    error: null

  } satisfies HealthResult);

  return new Response(reponse, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": Origin || "http://localhost:4200",
      "Content-Type": "application/json"

    }

  })

};

export default Health
