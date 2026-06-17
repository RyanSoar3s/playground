export type Languages = "javascript" | "typescript" | "python";
export type LanguageLabels = "JavaScript" | "TypeScript" | "Python";

export type Runtime = "nodejs" | "bun" | "cpython" | "pypy";

export type LanguageList = {
  languages: Array<{
    id: Languages,
    label: LanguageLabels,
    runtimes: {
      type: Runtime,
      version: string

    }[],
    enabled: boolean

  }>

};
