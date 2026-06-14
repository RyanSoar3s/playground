import { Component } from '@angular/core';
import { SpinLoader } from '@features/shared/spin-loader/spin-loader';

@Component({
  selector: 'app-loading-skeleton',
  imports: [
    SpinLoader
  ],
  templateUrl: './loading-skeleton.html',
  styleUrl: './loading-skeleton.scss'
})
export class LoadingSkeleton {}
