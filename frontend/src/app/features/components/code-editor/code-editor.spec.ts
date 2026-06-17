import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { CodeEditor } from './code-editor';
import { Responsive } from '@core/services/responsive';
import { GetLanguages } from '@core/services/get-languages';
import { Health } from '@core/services/health';
import { ResponsiveMock } from '@mocks/responsive.mock';
import { GetLanguagesMock } from '@mocks/get-languages.mock';
import { HealthMock } from '@mocks/health.mock';
import { RouterMock } from '@mocks/router.mock';
import { ExecutionResult } from '@models/code-execution.model';
import { Router } from '@angular/router';
import { ExecutionWebSocket } from '@core/services/websocket';
import { ExecutionWebSocketMock } from '@mocks/websocket.mock';

describe('CodeEditor', () => {
  let component: CodeEditor;
  let fixture: ComponentFixture<CodeEditor>;
  let getLanguagesMock: GetLanguagesMock;
  let healthMock: HealthMock;
  let executionWebSocketMock: ExecutionWebSocketMock;
  let routerMock: RouterMock;

  const defaultProviders = [
    { provide: Responsive, useClass: ResponsiveMock },
    { provide: GetLanguages, useClass: GetLanguagesMock },
    { provide: Health, useClass: HealthMock },
    { provide: ExecutionWebSocket, useClass: ExecutionWebSocketMock },
    { provide: Router, useClass: RouterMock }

  ];

  function createComponent(): void {
    fixture = TestBed.createComponent(CodeEditor);
    component = fixture.componentInstance;

  }

  function detectChanges(): void {
    fixture.detectChanges();

  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CodeEditor],
      providers: defaultProviders

    }).compileComponents();

    getLanguagesMock = TestBed.inject(GetLanguages) as unknown as GetLanguagesMock;
    healthMock = TestBed.inject(Health) as unknown as HealthMock;
    executionWebSocketMock = TestBed.inject(ExecutionWebSocket) as unknown as ExecutionWebSocketMock;
    routerMock = TestBed.inject(Router) as unknown as RouterMock;

  });

  describe('initialization', () => {
    it('should create', () => {
      createComponent();
      expect(component).toBeTruthy();
    });

    it('should have default themes', () => {
      createComponent();
      expect(component['themes']()).toEqual([
        'vs-dark',
        'vs-light',
        'hc-black',
        'hc-light'

      ]);

    });

    it('should have three box selection entries with correct properties', () => {
      createComponent();
      expect(component['boxSelection'].length).toBe(3);
      expect(component['boxSelection'][0].name).toBe('linguagem');
      expect(component['boxSelection'][1].name).toBe('runtime');
      expect(component['boxSelection'][2].name).toBe('tema');

    });

    it('should initialize with empty code signal', () => {
      createComponent();
      expect(component['code']()).toBe('');

    });

    it('should initialize loading as false', () => {
      createComponent();
      expect(component['isLoadingCodeExecution']()).toBe(false);

    });

    it('should initialize error as false', () => {
      createComponent();
      expect(component['errorExecution']()).toBeUndefined();

    });

  });

  describe('language data population', () => {
    it('should populate language label and runtime when languages are set', () => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

      expect(component['languagesLabel']()).toBe('JavaScript');
      expect(component['languageRuntimeSelected']()).toBe('nodejs');
      expect(component['languageRuntimes']()?.length).toBe(2);
      expect(component['languageRuntimes']()![0]).toBe('nodejs (v20.0.0)');

    });

    it('should reflect language list from languages service', () => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

      expect(component['languageList']()?.length).toBe(1);
      expect(component['languageList']()![0]).toBe('JavaScript');

    });

    it('should set configs when languages are available', () => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

      const configs = component['configs']();
      expect(configs).not.toBeNull();
      expect(configs?.language).toBe('javascript');
      expect(configs?.theme).toBe('vs-dark');
      expect(configs?.fontSize).toBe(16);

    });

    it('should return null configs when no languages are available', () => {
      createComponent();
      detectChanges();

      expect(component['configs']()).toBeNull();

    });

    it('should set isErrorLanguageData to true when errors signal is set', () => {
      healthMock.seedOk();
      getLanguagesMock.seedErrors('failed to fetch');
      createComponent();
      detectChanges();

      expect(component['isErrorLanguageData']()).toBe(true);

    });

    it('should set isErrorLanguageData to false when errors signal is not set', () => {
      createComponent();
      detectChanges();

      expect(component['isErrorLanguageData']()).toBe(false);

    });

  });

  describe('box selection', () => {
    beforeEach(() => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();
    });

    it('should open a box when selectBox is called with its index', () => {
      component.selectBox(0);
      expect(component['boxSelection'][0].isOpen).toBe(true);
      expect(component['boxSelection'][1].isOpen).toBe(false);
      expect(component['boxSelection'][2].isOpen).toBe(false);

    });

    it('should close previously open box when selecting another', () => {
      component.selectBox(0);
      component.selectBox(1);

      expect(component['boxSelection'][0].isOpen).toBe(false);
      expect(component['boxSelection'][1].isOpen).toBe(true);

    });

    it('should toggle box open/close when clicking the same box twice', () => {
      component.selectBox(0);
      expect(component['boxSelection'][0].isOpen).toBe(true);

      component.selectBox(0);
      expect(component['boxSelection'][0].isOpen).toBe(false);

    });

    it('should set interacted to true after first interaction', () => {
      expect(component['boxSelection'][0].interacted).toBe(false);

      component.selectBox(0);
      expect(component['boxSelection'][0].interacted).toBe(true);

    });

  });

  describe('closeMenu', () => {
    beforeEach(() => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

    });

    it('should close open boxes when clicking outside the box', () => {
      component.selectBox(0);
      expect(component['boxSelection'][0].isOpen).toBe(true);

      const outsideElement = document.createElement('div');
      const event = new Event('click') as unknown as MouseEvent;
      Object.defineProperty(event, 'target', { value: outsideElement });

      component['closeMenu'](event);
      expect(component['boxSelection'][0].isOpen).toBe(false);

    });

    it('should keep box open when clicking inside the same box', () => {
      const container = document.createElement('div');
      container.setAttribute('box-name', 'linguagem');

      component.selectBox(0);
      expect(component['boxSelection'][0].isOpen).toBe(true);

      const event = new Event('click') as unknown as MouseEvent;
      Object.defineProperty(event, 'target', { value: container });

      component['closeMenu'](event);
      expect(component['boxSelection'][0].isOpen).toBe(true);

    });

  });

  describe('selectOption', () => {
    beforeEach(() => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

    });

    it('should change language when field is "linguagem"', () => {
      component.selectOption('linguagem', 'JavaScript');
      expect(component['languageSelected']()).toBe('JavaScript');

    });

    it('should change runtime when field is "runtime"', () => {
      component.selectOption('runtime', 'nodejs (v22.0.0)');
      expect(component['runtimeSelected']()).toBe('nodejs');

    });

    it('should change theme when field is "tema"', () => {
      component.selectOption('tema', 'hc-black');
      expect(component['themeSelected']()).toBe('hc-black');

    });

  });

  describe('changeLanguage', () => {
    beforeEach(() => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

    });

    it('should update language label and runtime list when switching language', () => {
      component['changeLanguage']('JavaScript');
      expect(component['languagesLabel']()).toBe('JavaScript');
      expect(component['languageRuntimes']()?.length).toBe(2);

    });

  });

  describe('changeTheme', () => {
    beforeEach(() => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

    });

    it('should update theme when configs is available', () => {
      component['changeTheme']('vs-light');
      expect(component['themeSelected']()).toBe('vs-light');

    });

    it('should not update theme when configs is null', () => {
      getLanguagesMock.languages.set(null);
      detectChanges();

      component['changeTheme']('vs-light');
      expect(component['themeSelected']()).toBe('vs-dark');

    });

  });

  describe('executeCode', () => {
    beforeEach(() => {
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

    });

    it('should not execute when code is empty', () => {
      component['code'].set('');
      component.executeCode();
      expect(executionWebSocketMock.executeCode).not.toHaveBeenCalled();

    });

    it('should not execute when already loading', () => {
      component['code'].set('console.log("test")');
      component['isLoadingCodeExecutionSignal'].set(true);
      component.executeCode();
      expect(executionWebSocketMock.executeCode).not.toHaveBeenCalled();

    });

    it('should set loading state and reset output before execution', () => {
      // Use a delayed observable so the loading state is still true after executeCode is called
      executionWebSocketMock.executeCode.mockReturnValue(new Observable(() => {}));

      component['code'].set('console.log("test")');
      component.executeCode();

      expect(component['isLoadingCodeExecution']()).toBe(true);
      expect(component['outputSignal']()).toEqual([]);
      expect(component['truncatedOutputSignal']()).toBe(false);
      expect(component['statusCodeSignal']()).toBeUndefined();
      expect(executionWebSocketMock.executeCode).toHaveBeenCalledWith({
        code: 'console.log("test")',
        language: 'javascript',
        runtime: 'nodejs'

      });

    });

    it('should handle successful execution', () => {
      const mockResult: ExecutionResult = {
        id: 'test-id',
        language: 'javascript',
        runtime: 'nodejs',
        status: 'success',
        stdout: { text: 'hello world\n', truncated: false },
        stderr: '',
        exitCode: 0,
        durationMs: 15

      };

      executionWebSocketMock.executeCode.mockReturnValue(of(
        { type: "output", stream: "stdout", text: mockResult.stdout.text },
        { type: "result", result: mockResult }

      ));

      component['code'].set('console.log("hello")');
      component.executeCode();

      expect(component['isLoadingCodeExecution']()).toBe(false);
      expect(component['output']()).toEqual(['hello world']);
      expect(component['durationMs']()).toBe('15ms');
      expect(component['statusCode']()).toEqual({ status: 'success', code: 0 });
      expect(component['truncatedOutput']()).toBe(false);

    });

    it('should handle empty stdout from execution', () => {
      const mockResult: ExecutionResult = {
        id: 'test-id',
        language: 'javascript',
        runtime: 'nodejs',
        status: 'success',
        stdout: { text: '', truncated: false },
        stderr: '',
        exitCode: 0,
        durationMs: 10

      };

      executionWebSocketMock.executeCode.mockReturnValue(of(
        { type: "result", result: mockResult }

      ));

      component['code'].set('console.log("")');
      component.executeCode();

      expect(component['output']()).toEqual(['EMPTY']);

    });

    it('should handle std error output', () => {
      const mockResult: ExecutionResult = {
        id: 'test-id',
        language: 'javascript',
        runtime: 'nodejs',
        status: 'error',
        stdout: { text: '', truncated: false },
        stderr: 'some error\n',
        exitCode: 1,
        durationMs: 5

      };

      executionWebSocketMock.executeCode.mockReturnValue(of(
        { type: "output", stream: "stderr", text: mockResult.stderr },
        { type: "result", result: mockResult }
      ));

      component['code'].set('throw new Error()');
      component.executeCode();

      expect(component['output']()).toEqual(['some error']);
      expect(component['statusCode']()).toEqual({ status: 'error', code: 1 });

    });

    it('should show stdin input when server requests input', () => {
      executionWebSocketMock.executeCode.mockReturnValue(of(
        { type: "input_request" }
      ));

      component['code'].set('const name = prompt()');
      component.executeCode();

      expect(component['inputRequested']()).toBe(true);

    });

    it('should show timeout message when execution times out', () => {
      const mockResult: ExecutionResult = {
        id: 'test-id',
        language: 'javascript',
        runtime: 'nodejs',
        status: 'timeout',
        stdout: { text: '', truncated: false },
        stderr: '',
        exitCode: null,
        durationMs: 10000

      };

      executionWebSocketMock.executeCode.mockReturnValue(of(
        { type: "result", result: mockResult }

      ));

      component['code'].set('while (true) {}');
      component.executeCode();

      expect(component['output']()).toEqual(['[timeout] execução interrompida por inatividade ou tempo limite.']);
      expect(component['statusCode']()).toEqual({ status: 'timeout', code: null });
    });

    it('should set truncated output flag when stdout is truncated', () => {
      const mockResult: ExecutionResult = {
        id: 'test-id',
        language: 'javascript',
        runtime: 'nodejs',
        status: 'success',
        stdout: { text: 'long output\n', truncated: true },
        stderr: '',
        exitCode: 0,
        durationMs: 20

      };

      executionWebSocketMock.executeCode.mockReturnValue(of(
        { type: "output", stream: "stdout", text: mockResult.stdout.text },
        { type: "result", result: mockResult }

      ));

      component['code'].set('console.log("long")');
      component.executeCode();

      expect(component['truncatedOutput']()).toBe(true);

    });

    it('should handle API error', () => {
      executionWebSocketMock.executeCode.mockReturnValue(
        throwError(() => ({ message: 'connection failed' }))
      );

      component['code'].set('invalid code');
      component.executeCode();

      expect(component['isLoadingCodeExecution']()).toBe(false);
      expect(component['errorExecution']()).toEqual({
        status: "internal_error",
        message: "connection failed",
        errors: []

      });

    });

  });

  describe('error navigation', () => {
    it('should navigate to /error when health check returns error', () => {
      healthMock.seedError('service unavailable');
      createComponent();
      detectChanges();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/error']);

    });

    it('should navigate to /error when language data has errors', () => {
      healthMock.seedOk();
      getLanguagesMock.seedErrors('failed to fetch');
      createComponent();
      detectChanges();

      expect(routerMock.navigate).toHaveBeenCalledWith(['/error']);

    });

    it('should not navigate to /error when health is ok and no language errors', () => {
      healthMock.seedOk();
      getLanguagesMock.seedLanguages();
      createComponent();
      detectChanges();

      expect(routerMock.navigate).not.toHaveBeenCalledWith(['/error']);

    });
  });

  describe('ngOnDestroy', () => {
    it('should destroy all effect refs on destroy', () => {
      createComponent();
      detectChanges();

      const destroySpy = vi.spyOn(component['effectRefs'][0], 'destroy');

      component.ngOnDestroy();
      expect(destroySpy).toHaveBeenCalled();

    });

  });
  
});
