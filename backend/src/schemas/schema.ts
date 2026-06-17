import * as z from "zod";
import languageList, { allowedLanguages } from "@utils/language-list";
import type { Languages, Runtime } from "@models/languages.model";

const executionRequestSchema = z.object({
  language: z.string(),
  runtime: z.string(),
  code: z.string().min(1, "Code cannot be empty").max(20000, "Code exceeds 20KB limit")
  
})
.superRefine((data, ctx) => {
  const lang = languageList.languages.find((lang) => lang.id === data.language);

  if (!lang) {
    ctx.addIssue({
      code: "invalid_type",
      expected: "language",
      path: [ "language" ],
      message: `Language '${data.language}' is not valid`

    });

  }

  const runtime = allowedLanguages[data.language as Languages].includes(data.runtime as Runtime);

  if (!runtime) {
    ctx.addIssue({
      code: "invalid_type",
      expected: "runtime",
      path: [ "runtime" ],
      message: `Runtime '${data.runtime}' is not valid`

    });

  }

});

export default executionRequestSchema;
