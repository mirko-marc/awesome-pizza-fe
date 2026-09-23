import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SiteHeaderComponent } from './components/site-header/site-header.component';
import { CustomerStore } from './store/customer.store';

@Component({
  selector: 'app-customer-shell',
  imports: [RouterOutlet, SiteHeaderComponent],
  providers: [CustomerStore],
  templateUrl: './customer-shell.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerShellComponent {}
