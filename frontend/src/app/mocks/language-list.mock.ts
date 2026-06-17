import { LanguageList } from '@models/language-list.model';

export const MOCK_LANGUAGE_LIST: LanguageList = {
  languages: [
    {
      id: 'javascript',
      label: 'JavaScript',
      runtimes: [
        { type: 'nodejs', version: '20.0.0' },
        { type: 'nodejs', version: '22.0.0' }
      ],
      enabled: true
    }
  ]
};

export const MOCK_HEALTH_OK = { status: 'ok' as const, error: null };
export const MOCK_HEALTH_ERROR = { status: 'error' as const, error: 'service unavailable' };
