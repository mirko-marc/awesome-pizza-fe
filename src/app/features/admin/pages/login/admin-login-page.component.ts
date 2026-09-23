import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import {FormBuilder, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '@app/core/auth/auth.store';
import { ThemeService } from '@app/core/theme/theme.service';

@Component({
  selector: 'app-admin-login-page',
  imports: [ReactiveFormsModule, RouterLink, FormsModule],
  templateUrl: './admin-login-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLoginPageComponent implements OnInit {
  readonly authStore = inject(AuthStore);
  readonly themeService = inject(ThemeService);
  readonly showPassword = signal(false);
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly loginForm = this.formBuilder.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', [Validators.required]],
  });

  ngOnInit(): void {
    this.themeService.initialize();
    if (this.authStore.isAuthenticated()) void this.router.navigate(['/admin']);
  }

  async submit(): Promise<void> {
    this.loginForm.markAllAsTouched();
    console.log('loginForm');
    if (this.loginForm.invalid) return;
    console.log('loginForm', this.loginForm.getRawValue());

    const authenticated = await this.authStore.login(this.loginForm.getRawValue());
    if (!authenticated) return;

    const requestedUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    const returnUrl = requestedUrl?.startsWith('/admin') && requestedUrl !== '/admin/login'
      ? requestedUrl
      : '/admin';
    await this.router.navigateByUrl(returnUrl);
  }
}
