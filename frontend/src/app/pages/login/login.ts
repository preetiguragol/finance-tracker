import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatInputModule, MatButtonModule, MatCardModule, RouterLink],
  template: `
    <div class="auth-container">
      <mat-card class="auth-card">
        <mat-card-header>
          <mat-card-title>Login</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="onSubmit()">
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Username</mat-label>
              <input matInput formControlName="username" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" />
            </mat-form-field>
            <p class="error" *ngIf="error">{{ error }}</p>
            <button mat-raised-button color="primary" type="submit" class="full-width">Login</button>
            <p class="link">Don't have an account? <a routerLink="/register">Register</a></p>
          </form>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .auth-container { 
  display: flex; 
  justify-content: center; 
  align-items: center; 
  height: 100vh; 
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.auth-card { 
  width: 400px; 
  padding: 32px;
  border-radius: 16px !important;
}
.auth-card mat-card-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
}
.full-width { width: 100%; margin-bottom: 16px; }
.error { color: #c62828; font-size: 13px; margin-bottom: 8px; }
.link { text-align: center; margin-top: 16px; font-size: 13px; color: #666; }
.link a { color: #667eea; text-decoration: none; font-weight: 500; }
  `]
})
export class LoginComponent {
  form: FormGroup;
  error = '';

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
    this.form = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.authService.login(this.form.value).subscribe({
        next: () => this.router.navigate(['/dashboard']),
        error: () => this.error = 'Invalid username or password'
      });
    }
  }
}