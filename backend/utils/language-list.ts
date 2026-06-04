import type { Languages, Runtime } from "@models/languages.model";
import type { LanguageResult } from "@models/response.model";

const allowedLanguages: Record<Languages, Runtime[]> = {
  javascript: [ "nodejs" ]

};

const languageList: LanguageResult = {
  languages: [
    {
      id: "javascript",
      label: "JavaScript",
      runtimes: [ "nodejs" ],
      version: "",
      enabled: true

    }

  ]

};

export {
  languageList as default,
  allowedLanguages

};
