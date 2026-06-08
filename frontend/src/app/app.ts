import { Component, inject, OnInit } from '@angular/core';
import { CodeEditor } from './features/components/code-editor/code-editor';
import { Api } from './core/services/api';

@Component({
  selector: 'app-root',
  imports: [
    CodeEditor

  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private api = inject(Api);

  ngOnInit(): void {
    this.api.checkHealth().subscribe({
      next: (data) => {
        console.log(`[Server] {\n  status: '${data.status}',\n  error: ${data.error}\n}`);

      },
      error: (err) => {
        const status = ("status" in err && typeof err.status === "string") ? (err.status) : "error";
        const error = (typeof err === "object") ? JSON.stringify(err) : err;

        console.error(`[Server] {\n  status: '${status}',\n  error: ${error}\n}`);

      }

    });

  }

}
