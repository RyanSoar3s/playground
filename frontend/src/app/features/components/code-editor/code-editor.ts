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
import { LanguageLabels, LanguageList, Runtime } from '../../../models/language-list.model';

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
  styleUrl: './code-editor.scss',
  host: {
    '(click)': 'void closeMenu($event)'

  }

})
export class CodeEditor implements OnDestroy {
  protected responsive = inject(Responsive);
  private languagesServices = inject(GetLanguages);

  protected readonly themes = signal([ "vs-dark", "vs-light", "hc-black", "hc-light" ]);

  private languages = this.languagesServices.languages;
  private errors = this.languagesServices.errors;

  private languagesLabel = signal<LanguageList["languages"][number]["label"] | undefined>(undefined);
  private languageRuntimes = signal<`${Runtime} (v${string})`[] | undefined>(undefined);
  private languageRuntimeSelected = signal<LanguageList["languages"][number]["runtimes"][number]["type"] | undefined>(undefined);

  private theme = signal(this.themes()[0]);
  private fontSize = signal(16);

  protected languageSelected = computed(() => this.languagesLabel());
  protected runtimeSelected = computed(() => this.languageRuntimeSelected());
  protected themeSelected = computed(() => this.theme());
  protected fonteSizeSelected = computed(() => this.fontSize());

  protected languageList = computed(() => this.languages()?.languages.map((data) => data.label));
  protected runtimeList = computed(() => this.languageRuntimes());

  protected readonly isLoadingLanguageData = computed(() => (this.languages()) ? false : true);
  protected readonly isErrorLanguageData = computed(() => (this.errors()) ? true : false);

  protected readonly isLoadingCodeExecution = signal(false);
  protected readonly isErrorCodeExecution = signal(false);

  protected code = signal("");

  private outputSignal = signal("");
  output = computed(() => this.outputSignal());

  protected configs = computed<monaco.editor.IStandaloneEditorConstructionOptions | null>(() => {
    const langs = this.languages();

    if (langs) {
      return {
        language: (this.languageSelected())?.toLowerCase(),
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
    list: Signal<string[] | undefined>
    isOpen: boolean,
    interacted: boolean

  }> = [
    {
      name: "linguagem",
      label: this.languageSelected,
      list: this.languageList,
      isOpen: false,
      interacted: false

    },
    {
      name: "runtime",
      label: this.runtimeSelected,
      list: this.runtimeList,
      isOpen: false,
      interacted: false


    },
    {
      name: "tema",
      label: this.themeSelected,
      list: this.themes,
      isOpen: false,
      interacted: false

    }

  ];

  private effectRef!: EffectRef;

  constructor() {
    this.effectRef = effect(() => {
      const lang = this.languages();

      if (lang && !this.languagesLabel()) {
        const initialLanguage = lang.languages[0];
        const initialRuntime = initialLanguage.runtimes[0];
        this.languagesLabel.set(initialLanguage.label);
        this.languageRuntimes.set([ `${initialRuntime.type} (v${initialRuntime.version})` ]);
        this.languageRuntimeSelected.set(initialRuntime.type);


      }

    })

  }

  selectBox(idx: number): void {
    this.boxSelection.forEach((el, index) => {
      if (idx === index) {
        el.isOpen = !el.isOpen;

        if (!el.interacted) el.interacted = true;

      }
      else el.isOpen = false;

    })

  }

  selectOption(field: string, opt: string): void {
    switch (field) {
      case "linguagem":
        this.changeLanguage(opt);
        break;

      case "runtime":
        this.changeRuntime(opt);
        break;

      default:
        this.changeTheme(opt);
        break;

    }

  }

  private changeLanguage(label: string): void {
    this.languagesLabel.set(label as LanguageLabels);

    const langs = this.languages();

    if (langs) {
      const lang = langs.languages.filter((lang) => lang.label === label);

      if (lang.length !== 0) {
        const runtimes = lang[0].runtimes;

        this.languageRuntimes.set([ `${runtimes[0].type} (v${runtimes[0].version})` ]);

      }

    }


  }

  private changeRuntime(runtime: string): void {
    const [ type, _ ] = runtime.split(" ");
    this.languageRuntimeSelected.set(type as Runtime);

  }

  private changeTheme(theme: string): void {
    const configs = this.configs();

    if (configs) this.theme.set(theme);

  }

  protected closeMenu(event: Event): void {
    const target = event.target as HTMLElement;

    const containerWrapper = target.closest("[box-name]");

    this.boxSelection.forEach((box) => {
      if (
        box.isOpen &&
        containerWrapper?.getAttribute("box-name") !== box.name

      ) {

        box.isOpen = false;

      }

    });

  }

  ngOnDestroy(): void {
    if (this.effectRef) this.effectRef.destroy();

  }

}
