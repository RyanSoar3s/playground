import { Routes } from '@angular/router';
import { getLanguagesResolver } from './core/resolvers/get-languages-resolver';
import { Error } from './features/shared/error/error';
import { healthGuard } from './core/guards/health-guard';
import { CodeEditor } from './features/components/code-editor/code-editor';
import { errorGuard } from './core/guards/error-guard';

export const routes: Routes = [
  {
    path: "",
    component: CodeEditor,
    canActivate: [ healthGuard ],
    resolve: {
      languageList: getLanguagesResolver

    }

  },
  {
    path: "error",
    component: Error,
    canActivate: [ errorGuard ]

  },
  {
    path: "**",
    redirectTo: ""

  }

];
