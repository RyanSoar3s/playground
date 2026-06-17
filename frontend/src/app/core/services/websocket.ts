import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { environment } from '@environments/environment';
import { ExecutionCode, ExecutionServerMessage } from '@models/code-execution.model';
import type { ExecutionSocketMessage } from '@models/execution-socket.model';

@Injectable({
  providedIn: 'root',
})
export class ExecutionWebSocket {
  private socket?: WebSocketSubject<ExecutionSocketMessage>;

  executeCode(payload: ExecutionCode): Observable<ExecutionServerMessage> {
    this.close();

    this.socket = webSocket<ExecutionSocketMessage>({
      url: `${this.getBaseUrl()}/executions`,
      serializer: (message) => JSON.stringify(message),
      deserializer: (event) => JSON.parse(event.data)

    });

    const messages$ = this.socket.asObservable() as Observable<ExecutionServerMessage>;

    const execution$ = messages$.pipe(
      tap((message) => {
        if (message.type === "result" || message.type === "error") {
          this.close();

        }

      })

    );

    return new Observable<ExecutionServerMessage>((subscriber) => {
      const subscription = execution$.subscribe(subscriber);

      this.socket?.next({
        type: "execute",
        payload

      });

      return () => subscription.unsubscribe();

    });
  }

  sendStdin(value: string): void {
    this.socket?.next({
      type: "stdin",
      value

    });

  }

  cancel(): void {
    this.socket?.next({
      type: "cancel"

    });
    
    this.close();

  }

  private close(): void {
    this.socket?.complete();
    this.socket = undefined;

  }

  private getBaseUrl(): string {
    if (environment.wsUrl) return environment.wsUrl;

    return environment.apiUrl.replace(/^http/, "ws");

  }

}
