import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome'
import { faTriangleExclamation, faArrowRotateRight } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-error',
  imports: [
    FontAwesomeModule

  ],
  templateUrl: './error.html',
  styleUrl: './error.scss',
})
export class Error {
  protected readonly faTriangleExclamation = faTriangleExclamation;
  protected readonly faArrowRotateRight = faArrowRotateRight;

  private router = inject(Router);

  navigateToHomePage(): void {
    this.router.navigate([ "" ]).then(() => location.reload());

  }

}
