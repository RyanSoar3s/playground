import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, computed, Signal, effect, OnDestroy, EffectRef, viewChild } from '@angular/core';
import { NuMonacoEditorComponent } from "@ng-util/monaco-editor";
import { GetLanguages } from '@core/services/get-languages';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck } from '@fortawesome/free-regular-svg-icons';
import { faCaretDown, faCaretRight, faTerminal, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { SpinLoader } from '@features/shared/spin-loader/spin-loader';
import { Responsive } from '@core/services/responsive';
import { LanguageLabels, Languages, Runtime } from '@models/language-list.model';
import { ErrorResult, ExecutionCode, ExecutionServerMessage, ExecutionStatus } from '@models/code-execution.model';
import { Health } from '@core/services/health';
import { Router } from '@angular/router';
import { ExecutionWebSocket } from '@core/services/websocket';
import { Subscription } from 'rxjs';

const CODE_TEMPLATES: Record<LanguageLabels, string> = {
  JavaScript: `console.log("Hello, playground!");`,
  TypeScript: `const greeting: string = "Hello, playground!";
console.log(greeting);`,
  Python: `print("Hello, playground!")`
};

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
    '(document:keydown)': 'void handleKeyboard($event)'

  }

})
export class CodeEditor implements OnDestroy {
  protected responsive = inject(Responsive);
  private languagesServices = inject(GetLanguages);
  private executionWebSocket = inject(ExecutionWebSocket);
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

  private isLoadingCodeExecutionSignal = signal(false);
  private errorExecutionSignal = signal<ErrorResult | undefined>(undefined);

  protected readonly isLoadingCodeExecution = computed(() => this.isLoadingCodeExecutionSignal());
  protected readonly errorExecution = computed(() => this.errorExecutionSignal());

  protected code = signal("");

  private durationMsSignal = signal<string | undefined>(undefined);
  protected durationMs = computed(() => this.durationMsSignal());

  private statusCodeSignal = signal<{ status: ExecutionStatus, code: number | null } | undefined>(undefined);
  protected statusCode = computed(() => this.statusCodeSignal());
  protected hasExecutionFailure = computed(() => {
    const status = this.statusCodeSignal()?.status;

    return Boolean(status && status !== "success");

  });

  private outputSignal = signal<string[]>([]);

  private truncatedOutputSignal = signal(false);
  protected truncatedOutput = computed(() => this.truncatedOutputSignal());

  private inputRequestedSignal = signal(false);
  protected inputRequested = computed(() => this.inputRequestedSignal());

  protected stdinValue = signal("");
  protected stdinInput = viewChild<ElementRef<HTMLInputElement>>("stdinInput");

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
  private executionSubscription?: Subscription;

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
          const runtimes: `${Runtime} (v${string})`[] = [];

          initialLanguage.runtimes.forEach((runtime) => runtimes.push(`${runtime.type} (v${runtime.version})`));

          this.languagesLabel.set(initialLanguage.label);
          this.languageRuntimes.set(runtimes);
          this.languageRuntimeSelected.set(initialRuntime.type);
          this.code.set(CODE_TEMPLATES[initialLanguage.label] ?? "");

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

    if (!code || this.isLoadingCodeExecutionSignal()) return;

    const payload = {
      code,
      language: (this.languageSelected())?.toLocaleLowerCase() as Languages,
      runtime: this.runtimeSelected() as Runtime

    } satisfies ExecutionCode;

    this.executionSubscription?.unsubscribe();
    this.isLoadingCodeExecutionSignal.set(true);
    this.errorExecutionSignal.set(undefined);
    this.outputSignal.set([]);
    this.truncatedOutputSignal.set(false);
    this.statusCodeSignal.set(undefined);
    this.durationMsSignal.set(undefined);
    this.inputRequestedSignal.set(false);
    this.stdinValue.set("");

    this.executionSubscription = this.executionWebSocket.executeCode(payload)
    .subscribe({
      next: (message) => {
        this.handleExecutionMessage(message);

      },
      error: (err) => {
        this.handleExecutionError({
          status: "internal_error",
          message: err?.message ?? "WebSocket connection failed",
          errors: []

        });

      }

    });

  }

  handleKeyboard(event: KeyboardEvent): void {
    const key = event.key;

    if (!key) return;

    if (key === "Enter") this.submitStdin();

    else if (/^(Backspace|[a-zA-Z0-9])$/.test(key)) this.stdinInput()?.nativeElement.focus();

  }

  private submitStdin(): void {
    if (!this.isLoadingCodeExecutionSignal()) return;

    this.appendConsoleLine(`> ${this.stdinValue()}\n`);
    this.executionWebSocket.sendStdin(this.stdinValue().trim());
    this.stdinValue.set("");
    this.inputRequestedSignal.set(false);

  }

  private handleExecutionMessage(message: ExecutionServerMessage): void {
    if (message.type === "output") {
      this.appendOutput(message.text);
      return;

    }

    if (message.type === "input_request") {
      this.inputRequestedSignal.set(true);
      return;

    }

    if (message.type === "result") {
      const output = message.result;

      if (output.status === "timeout") {
        this.appendConsoleLine("[timeout] execução interrompida por inatividade ou tempo limite.");

      }

      if (this.outputSignal().length === 0) this.outputSignal.set([ "EMPTY" ]);
      else this.trimTrailingOutputLine();

      this.inputRequestedSignal.set(false);
      this.isLoadingCodeExecutionSignal.set(false);
      this.durationMsSignal.set(`${output.durationMs}ms`);
      this.statusCodeSignal.set({ status: output.status, code: output.exitCode });
      this.truncatedOutputSignal.set(output.stdout.truncated);
      return;

    }

    if (message.type === "error") {
      this.handleExecutionError(message.error);

    }

  }

  private appendConsoleLine(text: string): void {
    const lines = [ ...this.outputSignal() ];

    if (lines.at(-1) === "") {
      lines[lines.length - 1] = text;

    }
    else {
      lines.push(text);

    }

    this.outputSignal.set(lines);

  }

  private appendOutput(text: string): void {
    const lines = [ ...this.outputSignal() ];
    const chunks = text.split("\n");

    if (lines.length === 0) lines.push("");

    lines[lines.length - 1] = `${lines[lines.length - 1]}${chunks[0]}`;

    for (const chunk of chunks.slice(1)) {
      lines.push(chunk);

    }

    this.outputSignal.set(lines);

  }

  private trimTrailingOutputLine(): void {
    const lines = [ ...this.outputSignal() ];

    if (lines.at(-1) === "") {
      lines.pop();
      this.outputSignal.set(lines);

    }

  }

  private handleExecutionError(error: ErrorResult): void {
    this.errorExecutionSignal.set(error);
    this.inputRequestedSignal.set(false);
    this.isLoadingCodeExecutionSignal.set(false);

    this.statusCodeSignal.set({
      code: 500,
      status: "error"

    });

  }

  private changeLanguage(label: string): void {
    const langLabel = label as LanguageLabels;
    this.code.set(CODE_TEMPLATES[langLabel] ?? "");
    this.outputSignal.set([]);
    this.durationMsSignal.set(undefined);
    this.languagesLabel.set(langLabel);

    const langs = this.languages();

    if (langs) {
      const lang = langs.languages.filter((lang) => lang.label === label);

      if (lang.length !== 0) {
        const runtimes = lang[0].runtimes;
        const runtimeList: `${Runtime} (v${string})`[] = [];

        runtimes.forEach((runtime) => runtimeList.push(`${runtime.type} (v${runtime.version})`));

        this.languageRuntimeSelected.set(runtimes[0].type);
        this.languageRuntimes.set(runtimeList);

      }

    }

  }

  private changeRuntime(runtime: string): void {
    const [ type, _ ] = runtime.split(" ");
    this.languageRuntimeSelected.set(type as Runtime);

    this.outputSignal.set([]);
    this.durationMsSignal.set(undefined);

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
    this.executionSubscription?.unsubscribe();
    this.executionWebSocket.cancel();

  }

}
