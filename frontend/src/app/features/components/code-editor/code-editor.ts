import { CommonModule } from '@angular/common';
import { Component, inject, signal, computed, Signal, effect, OnDestroy, EffectRef } from '@angular/core';
import { NuMonacoEditorComponent } from "@ng-util/monaco-editor";
import { GetLanguages } from '@core/services/get-languages';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faCaretDown, faCaretRight, faTerminal, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { SpinLoader } from '@features/shared/spin-loader/spin-loader';
import { Responsive } from '@core/services/responsive';
import { LanguageLabels, Languages, Runtime } from '@models/language-list.model';
import { ErrorResult, ExecutionCode, ExecutionStatus } from '@models/code-execution.model';
import { Api } from '@core/services/api';
import { finalize } from 'rxjs';
import { Health } from '@core/services/health';
import { Router } from '@angular/router';

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
    '(click)': 'void closeMenu($event)',

  }

})
export class CodeEditor implements OnDestroy {
  protected responsive = inject(Responsive);
  private languagesServices = inject(GetLanguages);
  private api = inject(Api);
  private health = inject(Health);
  private router = inject(Router);

  protected readonly themes = signal([ "vs-dark", "vs-light", "hc-black", "hc-light" ]);

  checkHealth = this.health.checkHealth;

  private languages = this.languagesServices.languages;
  private errors = this.languagesServices.errors;

  private languagesLabel = signal<LanguageLabels | undefined>(undefined);
  private languageRuntimes = signal<`${Runtime} (v${string})`[] | undefined>(undefined);
  private languageRuntimeSelected = signal<Runtime | undefined>(undefined);

  private theme = signal(this.themes()[0]);
  fontSize = signal(16);

  protected languageSelected = computed(() => this.languagesLabel());
  protected runtimeSelected = computed(() => this.languageRuntimeSelected());
  protected themeSelected = computed(() => this.theme());

  protected languageList = computed(() => this.languages()?.languages.map((data) => data.label));
  protected runtimeList = computed(() => this.languageRuntimes());

  protected readonly isErrorLanguageData = computed(() => (this.errors()) ? true : false);

  protected readonly isLoadingCodeExecution = signal(false);
  protected readonly isErrorCodeExecution = signal(false);

  protected code = signal("");

  private durationMsSignal = signal<string | undefined>(undefined);
  protected durationMs = computed(() => this.durationMsSignal());

  private statusCodeSignal = signal<{ status: ExecutionStatus, code: number | null } | undefined>(undefined);
  protected statusCode = computed(() => this.statusCodeSignal());

  private outputSignal = signal<string[]>([]);

  private truncatedOutputSignal = signal(false);
  protected truncatedOutput = computed(() => this.truncatedOutputSignal());

  output = computed(() => this.outputSignal());

  protected configs = computed<monaco.editor.IStandaloneEditorConstructionOptions | null>(() => {
    const langs = this.languages();

    if (langs) {
      return {
        language: (this.languageSelected())?.toLowerCase(),
        theme: this.themeSelected(),
        fontFamily: "Fira Code",
        fontSize: this.fontSize(),
        fontLigatures: true,
        tabSize: 2,
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
  protected readonly faCaretRight = faCaretRight;
  protected readonly faTerminal = faTerminal;
  protected readonly faTriangleExclamation = faTriangleExclamation;

  protected boxSelection: Array<{
    name: string,
    label: Signal<string | undefined>,
    list: Signal<string[] | undefined>,
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

  private effectRefs!: EffectRef[];

  constructor() {
    this.effectRefs = [
      effect(() => {
        if ((this.checkHealth() && this.checkHealth()?.status === "error") || this.isErrorLanguageData()) {
          this.router.navigate([ "/error" ]);

        }

      }),
      effect(() => {
        const lang = this.languages();

        if (lang && !this.languagesLabel()) {
          const initialLanguage = lang.languages[0];
          const initialRuntime = initialLanguage.runtimes[0];

          this.languagesLabel.set(initialLanguage.label);
          this.languageRuntimes.set([ `${initialRuntime.type} (v${initialRuntime.version})` ]);
          this.languageRuntimeSelected.set(initialRuntime.type);

        }

      })

    ];

  }

  selectBox(idx: number): void {
    this.boxSelection.forEach((el, index) => {
      if (idx === index) {
        el.isOpen = !el.isOpen;

        if (!el.interacted) el.interacted = true;

      }
      else el.isOpen = false;

    });

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

  executeCode(): void {
    const code = this.code();

    if (!code || this.isLoadingCodeExecution()) return;

    const payload = {
      code,
      language: (this.languageSelected())?.toLocaleLowerCase() as Languages,
      runtime: this.runtimeSelected() as Runtime,
      stdin: ""

    } satisfies ExecutionCode;

    this.isLoadingCodeExecution.set(true);
    this.outputSignal.set([]);
    this.truncatedOutputSignal.set(false);
    this.statusCodeSignal.set(undefined);

    this.api.executeCode(payload)
    .pipe(
      finalize(() => this.isLoadingCodeExecution.set(false))

    )
    .subscribe({
      next: (output) => {
        const stdout = output.stdout.text;
        const stderr = output.stderr;

        const outputMsg = stdout + stderr;

        this.outputSignal.set(((outputMsg) ? outputMsg : "EMPTY\n").split("\n").slice(0, -1));

        this.durationMsSignal.set(`${output.durationMs}ms`);
        this.statusCodeSignal.set({ status: output.status, code: output.exitCode });
        this.truncatedOutputSignal.set(output.stdout.truncated);
      },
      error: (err: ErrorResult) => {
        console.error(err);

      }

    });

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
    if (this.effectRefs) this.effectRefs.forEach((ref) => ref.destroy());

  }

}
