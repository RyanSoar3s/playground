import { Origin } from "../../config/env";
import LanguageList from "../../utils/language-list";

const Languages = () => {
  const response = JSON.stringify(LanguageList);

  return new Response(response, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": Origin || "http://localhost:4200",
      "Content-Type": "application/json"

    }

  });

};

export default Languages;
