import { Component, input } from '@angular/core';

@Component({
  selector: 'app-spin-loader',
  imports: [],
  template: "",
  styleUrl: './spin-loader.scss',
  host: {
    '[style.height]': 'height()',
    '[style.width]': 'width()',
    '[style.borderWidth]': 'borderWidth()'

  }
})
export class SpinLoader {
  height = input.required<string>();
  width = input.required<string>();

  borderWidth = input<string>("3px");

}
