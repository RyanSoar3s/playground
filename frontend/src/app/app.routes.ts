import { Routes } from '@angular/router';
import { CodeEditor } from './features/components/code-editor/code-editor';
import { getLanguagesResolver } from './core/resolvers/get-languages-resolver';

export const routes: Routes = [
  {
    path: "",
    component: CodeEditor,
    resolve: {
      languageList: getLanguagesResolver

    }

  }

];
