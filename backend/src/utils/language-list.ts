import type { Languages, Runtime } from "@models/languages.model";
import type { LanguageResult } from "@models/response.model";

const allowedLanguages: Record<Languages, Runtime[]> = {
  javascript: [ "nodejs", "bun" ],
  typescript: [ "nodejs", "bun" ],
  python: [ "cpython", "pypy" ]

};

const languageList: LanguageResult = {
  languages: [
    {
      id: "javascript",
      label: "JavaScript",
      runtimes: [
        {
          type: "nodejs",
          version: "24"

        },
        {
          type: "bun",
          version: "1.3"

        }

      ],
      enabled: true

    },
    {
      id: "typescript",
      label: "TypeScript",
      runtimes: [
        {
          type: "nodejs",
          version: "24"

        },
        {
          type: "bun",
          version: "1.3"

        }

      ],
      enabled: true

    },
    {
      id: "python",
      label: "Python",
      runtimes: [
        {
          type: "cpython",
          version: "3.14"

        },
        {
          type: "pypy",
          version: "3.11"

        }

      ],
      enabled: true

    }

  ]

};

export {
  languageList as default,
  allowedLanguages

};
