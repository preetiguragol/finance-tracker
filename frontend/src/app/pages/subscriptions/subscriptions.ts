import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatBadgeModule } from '@angular/material/badge';
import { RouterLink } from '@angular/router';
import { SubscriptionService, Subscription } from '../../services/subscription';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatDatepickerModule, MatNativeDateModule,
    MatIconModule, MatSnackBarModule, MatBadgeModule, RouterLink
  ],
  template: `
    <div class="page">
      <div class="header">
        <h1>Subscriptions</h1>
        <button mat-stroked-button routerLink="/dashboard">← Back to Dashboard</button>
      </div>

      <!-- Alert Banner -->
      <div class="alert-banner" *ngIf="dueSoon.length > 0">
        <mat-icon>warning</mat-icon>
        <span>{{ dueSoon.length }} subscription(s) renewing within 7 days!</span>
      </div>

      <div class="main-content">

        <!-- Add Subscription Form -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Subscription</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Service Name</mat-label>
                <input matInput formControlName="name" placeholder="Netflix, Spotify..." />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Amount (₹)</mat-label>
                <input matInput type="number" formControlName="amount" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Billing Cycle</mat-label>
                <mat-select formControlName="billing_cycle">
                  <mat-option value="monthly">Monthly</mat-option>
                  <mat-option value="yearly">Yearly</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Next Renewal Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="renewal_date" />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes (optional)</mat-label>
                <input matInput formControlName="notes" />
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" class="full-width">
                Add Subscription
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Subscription List -->
        <div class="list-section">
          <div *ngIf="subscriptions.length === 0" class="empty">
            No subscriptions added yet.
          </div>

          <mat-card *ngFor="let s of subscriptions" class="sub-card" [class.due-soon]="s.is_due_soon">
            <mat-card-content>
              <div class="sub-row">
                <div class="sub-info">
                  <div class="sub-name">
                    {{ s.name }}
                    <span class="due-badge" *ngIf="s.is_due_soon">Due in {{ s.days_until_renewal }} days!</span>
                  </div>
                  <div class="sub-meta">{{ s.billing_cycle | titlecase }} · Renews {{ s.renewal_date }}</div>
                  <div class="sub-notes" *ngIf="s.notes">{{ s.notes }}</div>
                </div>
                <div class="sub-right">
                  <span class="sub-amount">₹{{ s.amount | number:'1.1-1'}}</span>
                  <button mat-icon-button color="warn" (click)="delete(s.id!)">
                    <mat-icon>delete</mat-icon>
                  </button>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Monthly total -->
          <mat-card class="total-card" *ngIf="subscriptions.length > 0">
            <mat-card-content>
              <div class="total-row">
                <span>Monthly total</span>
                <span class="total-amount">₹{{ monthlyTotal | number:'1.1-1' }}</span>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .alert-banner { display: flex; align-items: center; gap: 10px; background: #fff3e0; border: 1px solid #ffb74d; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; color: #e65100; font-weight: 500; }
    .main-content { display: grid; grid-template-columns: 380px 1fr; gap: 24px; }
    .full-width { width: 100%; margin-bottom: 12px; }
    .sub-card { margin-bottom: 12px; border-left: 4px solid transparent; }
    .sub-card.due-soon { border-left: 4px solid #ff9800; background: #fffde7; }
    .sub-row { display: flex; justify-content: space-between; align-items: center; }
    .sub-name { font-weight: 500; font-size: 15px; display: flex; align-items: center; gap: 8px; }
    .sub-meta { font-size: 12px; color: #888; margin-top: 4px; }
    .sub-notes { font-size: 12px; color: #aaa; margin-top: 2px; }
    .sub-right { display: flex; align-items: center; gap: 8px; }
    .sub-amount { font-weight: 600; font-size: 16px; color: #333; }
    .due-badge { font-size: 11px; background: #ff9800; color: white; padding: 2px 8px; border-radius: 99px; }
    .total-card { background: #f5f5f5; }
    .total-row { display: flex; justify-content: space-between; align-items: center; font-weight: 500; }
    .total-amount { font-size: 18px; font-weight: 600; color: #c62828; }
    .empty { text-align: center; color: #aaa; padding: 32px 0; }
  `]
})
export class SubscriptionsComponent implements OnInit {
  form: FormGroup;
  subscriptions: Subscription[] = [];
  dueSoon: Subscription[] = [];
  monthlyTotal = 0;

  constructor(
    private fb: FormBuilder,
    private subscriptionService: SubscriptionService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      billing_cycle: ['monthly', Validators.required],
      renewal_date: ['', Validators.required],
      notes: ['']
    });
  }

  ngOnInit(): void {
    this.loadSubscriptions();
    this.loadDueSoon();
  }

  loadSubscriptions(): void {
    this.subscriptionService.getAll().subscribe(data => {
      this.subscriptions = data;
      this.monthlyTotal = data.reduce((sum, s) => {
        const amount = parseFloat(s.amount);
        return sum + (s.billing_cycle === 'yearly' ? amount / 12 : amount);
      }, 0);
      this.cdr.detectChanges();
    });
  }

  loadDueSoon(): void {
    this.subscriptionService.getDueSoon().subscribe(data => {
      this.dueSoon = data;
      this.cdr.detectChanges();
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const val = this.form.value;
      const payload = {
        ...val,
        renewal_date: new Date(val.renewal_date).toISOString().split('T')[0]
      };
      this.subscriptionService.create(payload).subscribe({
        next: () => {
          this.snackBar.open('Subscription added!', 'Close', { duration: 2000 });
          this.form.reset({ billing_cycle: 'monthly' });
          this.loadSubscriptions();
          this.loadDueSoon();
        },
        error: () => this.snackBar.open('Failed to add subscription', 'Close', { duration: 2000 })
      });
    }
  }

  delete(id: number): void {
    this.subscriptionService.delete(id).subscribe({
      next: () => {
        this.snackBar.open('Deleted!', 'Close', { duration: 2000 });
        this.loadSubscriptions();
        this.loadDueSoon();
      }
    });
  }
}