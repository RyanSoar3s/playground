import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadingSkeleton } from './loading-skeleton';

describe('LoadingSkeleton', () => {
  let component: LoadingSkeleton;
  let fixture: ComponentFixture<LoadingSkeleton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSkeleton],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSkeleton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the loading indicator text', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skeleton__indicator-text')?.textContent)
      .toContain('Carregando Playground');
  });

  it('should render the header skeleton pills', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headerPills = compiled.querySelectorAll('.skeleton__header .skeleton__pill');
    expect(headerPills.length).toBeGreaterThan(0);
  });

  it('should render the body panels (editor + output)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const panels = compiled.querySelectorAll('.skeleton__panel');
    expect(panels.length).toBe(2);
  });

  it('should render a spin loader in the indicator area', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skeleton__indicator app-spin-loader')).toBeTruthy();
  });
});
