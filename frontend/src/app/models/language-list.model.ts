type Languages = "javascript";
type LanguageLabels = "JavaScript";

type Runtime = "nodejs";

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
