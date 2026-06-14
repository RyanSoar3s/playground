import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { Error } from './error';
import { RouterMock } from '@mocks/router.mock';

describe('Error', () => {
  let component: Error;
  let fixture: ComponentFixture<Error>;
  let routerMock: RouterMock;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Error],
      providers: [{ provide: Router, useClass: RouterMock }]
    }).compileComponents();

    routerMock = TestBed.inject(Router) as unknown as RouterMock;

    fixture = TestBed.createComponent(Error);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have faTriangleExclamation icon defined', () => {
    expect(component['faTriangleExclamation']).toBeDefined();
  });

  it('should have faArrowRotateRight icon defined', () => {
    expect(component['faArrowRotateRight']).toBeDefined();
  });

  describe('navigateToHomePage', () => {
    it('should navigate to root path when called', () => {
      component.navigateToHomePage();

      expect(routerMock.navigate).toHaveBeenCalledWith(['']);
    });
  });
});
