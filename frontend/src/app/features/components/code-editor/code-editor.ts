import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, Signal, effect, OnDestroy, EffectRef } from '@angular/core';
import { NuMonacoEditorComponent } from "@ng-util/monaco-editor"
import { GetLanguages } from '../../../core/services/get-languages';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { SpinLoader } from '../../shared/spin-loader/spin-loader';
import { Responsive } from '../../../core/services/responsive';
import { LanguageList } from '../../../models/language-list.model';

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
export class CodeEditor implements OnDestroy {
  protected responsive = inject(Responsive);
  private languagesServices = inject(GetLanguages);

  protected readonly themes = signal([ "vs-dark", "vs-light", "hc-black", "hc-light" ]);

  private languages = this.languagesServices.languages;
  private errors = this.languagesServices.errors;

  private languagesInfo = signal<LanguageList["languages"][number] | undefined>(undefined);

  private runtimeListCurrent = signal(this.languagesInfo()?.runtimes);
  private theme = signal(this.themes()[0]);
  private fontSize = signal(16);

  protected languageSelected = computed(() => this.languagesInfo()?.label);
  protected runtimeSelected = computed(() => this.languagesInfo()?.runtimes[0].type);
  protected themeSelected = computed(() => this.theme());
  protected fonteSizeSelected = computed(() => this.fontSize());

  protected languageList = computed(() => this.languages()?.languages.map((data) => data.label));
  protected runtimeList = computed(() => this.runtimeListCurrent());

  protected readonly isLoadingLanguageData = computed(() => (this.languages()) ? false : true);
  protected readonly isErrorLanguageData = computed(() => (this.errors()) ? true : false);

  protected readonly isLoadingCodeExecution = signal(false);
  protected readonly isErrorCodeExecution = signal(false);

  protected code = "";

  protected configs = computed<monaco.editor.IStandaloneEditorConstructionOptions | null>(() => {
    const langs = this.languages();

    if (langs) {
      return {
        language: langs.languages[0].id,
        theme: this.themeSelected(),
        fontFamily: "Fira Code",
        fontSize: this.fonteSizeSelected(),
        fontLigatures: true,
        automaticLayout: true,
        folding: true,
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true

      } satisfies monaco.editor.IStandaloneEditorConstructionOptions;

    }

    return null;

  });

  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCaretDown = faCaretDown;

  protected boxSelection: Array<{
    name: string,
    label: Signal<string | undefined>,
    list: Signal<(string | { type: string, version: string })[] | undefined>
    isCarretRotate: boolean,
    interacted: boolean

  }> = [
    {
      name: "linguagem",
      label: this.languageSelected,
      list: this.languageList,
      isCarretRotate: false,
      interacted: false



    },
    {
      name: "runtime",
      label: this.runtimeSelected,
      list: this.runtimeList,
      isCarretRotate: false,
      interacted: false


    },
    {
      name: "tema",
      label: this.themeSelected,
      list: this.themes,
      isCarretRotate: false,
      interacted: false


    }

  ];

  private effectRef!: EffectRef;

  constructor() {
    this.effectRef = effect(() => {
      const lang = this.languages();

      if (lang && !this.languagesInfo()) {
        this.languagesInfo.set(lang.languages[0]);

      }

    })

  }

  selectBox(idx: number): void {
    this.boxSelection.forEach((el, index) => {
      if (idx === index) {
        el.isCarretRotate = !el.isCarretRotate;

        if (!el.interacted) el.interacted = true;

      }
      else el.isCarretRotate = false;

    })

  }

  ngOnDestroy(): void {
    if (this.effectRef) this.effectRef.destroy();

  }

}
