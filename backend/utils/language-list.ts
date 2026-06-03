import type { LanguageResult } from "../src/models/response.model";

const LanguageList: LanguageResult = {
  languages: [
    {
      id: "javascript",
      label: "JavaScript",
      runtime: "nodejs",
      version: "",
      enabled: true

    },
    {
      id: "typescript",
      label: "TypeScript",
      runtime: "tsc",
      version: "",
      enabled: false

    }

  ]

};

export default LanguageList;
