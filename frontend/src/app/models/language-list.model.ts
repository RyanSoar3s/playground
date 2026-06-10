export type Languages = "javascript";
export type LanguageLabels = "JavaScript";

export type Runtime = "nodejs";

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
