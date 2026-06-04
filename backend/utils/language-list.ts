import type { Languages, Runtime } from "../src/models/languages.model";
import type { LanguageResult } from "../src/models/response.model";

const allowedLanguages: Record<Languages, Runtime[]> = {
  javascript: [ "nodejs", "bun" ],
  typescript: [ "nodejs", "bun" ]

};

const languageList: LanguageResult = {
  languages: [
    {
      id: "javascript",
      label: "JavaScript",
      runtimes: [ "nodejs", "bun" ],
      version: "",
      enabled: true

    },
    {
      id: "typescript",
      label: "TypeScript",
      runtimes: [ "nodejs", "bun" ],
      version: "",
      enabled: false

    }

  ]

};

export {
  languageList as default,
  allowedLanguages

};
