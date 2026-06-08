import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NuMonacoEditorComponent } from "@ng-util/monaco-editor"
import { GetLanguages } from '../../../core/services/get-languages';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { SpinLoader } from '../../shared/spin-loader/spin-loader';
import { Responsive } from '../../../core/services/responsive';

@Component({
  selector: 'app-code-editor',
  imports: [
    CommonModule,
    FormsModule,
    NuMonacoEditorComponent,
    FontAwesomeModule,
    SpinLoader

  ],
  templateUrl: './code-editor.html',
  styleUrl: './code-editor.scss'

})
export class CodeEditor implements OnInit {
  protected readonly themes = [ "vs-dark", "vs-light", "hc-black", "hc-light" ];

  protected responsive = inject(Responsive);

  private languagesServices = inject(GetLanguages);
  protected languages = this.languagesServices.languaguages;

  protected languageSelected = computed(() => this.languages()?.languages[0].label);
  protected runtimeSelected = computed(() => this.languages()?.languages[0].runtimes[0].type);
  protected themeSelected = signal(this.themes[0]);

  protected readonly isLoadingLanguageData = signal((this.languages()) ? false : true);
  protected readonly isErrorLanguageData = signal(false);

  protected readonly isLoadingCodeExecution = signal(false);
  protected readonly isErrorCodeExecution = signal(false);

  protected code = "";

  protected configs = computed<monaco.editor.IStandaloneEditorConstructionOptions | null>(() => {
    const langs = this.languages();

    if (langs) {
      return {
        language: langs.languages[0].id,
        theme: this.themes[0],
        automaticLayout: true,
        glyphMargin: false,
        folding: false,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true

      } satisfies monaco.editor.IStandaloneEditorConstructionOptions;

    }

    return null;

  });

  protected readonly faCircleCheck = faCircleCheck;

  ngOnInit(): void {

  }

}
