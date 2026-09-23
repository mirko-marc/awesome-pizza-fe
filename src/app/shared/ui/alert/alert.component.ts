import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  readonly title = input('Qualcosa è andato storto');
  readonly message = input.required<string>();
  readonly retryable = input(false);
  readonly retry = output<void>();
}
