import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { RouterLink } from '@angular/router';
import { SalaryService, SalarySplit } from '../../services/salary';

@Component({
  selector: 'app-salary-planner',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatProgressBarModule, MatIconModule, MatSnackBarModule, RouterLink
  ],
  template: `
    <div class="page">
      <div class="header">
        <h1>Salary Planner</h1>
        <button mat-stroked-button routerLink="/dashboard">← Back to Dashboard</button>
      </div>

      <!-- Set Salary -->
      <mat-card class="salary-card">
        <mat-card-content>
          <form [formGroup]="salaryForm" (ngSubmit)="saveSalary()" class="salary-form">
            <mat-form-field appearance="outline">
              <mat-label>Monthly Take-Home Salary (₹)</mat-label>
              <input matInput type="number" formControlName="monthly_salary" />
            </mat-form-field>
            <button mat-raised-button color="primary" type="submit">Save</button>
          </form>
          <p class="salary-hint">Based on the 50/30/20 rule — 50% needs, 30% wants, 20% savings</p>
        </mat-card-content>
      </mat-card>

      <!-- Split Breakdown -->
      <div class="buckets" *ngIf="split">
        <mat-card class="bucket-card needs">
          <mat-card-header>
            <mat-card-title>🏠 Needs (50%)</mat-card-title>
            <mat-card-subtitle>Rent, Food, Healthcare, EMI</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="bucket-amounts">
              <span>Spent: <strong>₹{{ split.needs.spent | number:'1.1-1' }}</strong></span>
              <span>Budget: <strong>₹{{ split.needs.budget | number:'1.1-1' }}</strong></span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getPercent(split.needs.spent, split.needs.budget)"
              [color]="getColor(split.needs.spent, split.needs.budget)">
            </mat-progress-bar>
            <div class="remaining" [class.over]="split.needs.remaining < 0">
              {{ split.needs.remaining >= 0 ? '₹' + split.needs.remaining + ' remaining' : '₹' + (split.needs.remaining * -1) + ' over budget!' }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="bucket-card wants">
          <mat-card-header>
            <mat-card-title>🛍️ Wants (30%)</mat-card-title>
            <mat-card-subtitle>Shopping, Entertainment, Travel, Subscriptions</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="bucket-amounts">
              <span>Spent: <strong>₹{{ split.wants.spent | number:'1.1-1' }}</strong></span>
              <span>Budget: <strong>₹{{ split.wants.budget | number:'1.1-1' }}</strong></span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getPercent(split.wants.spent, split.wants.budget)"
              [color]="getColor(split.wants.spent, split.wants.budget)">
            </mat-progress-bar>
            <div class="remaining" [class.over]="split.wants.remaining < 0">
              {{ split.wants.remaining >= 0 ? '₹' + (split.wants.remaining | number:'1.1-1') + ' remaining' : '₹' + (split.wants.remaining * -1 | number:'1.1-1') + ' over budget!' }}
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="bucket-card savings">
          <mat-card-header>
            <mat-card-title>💰 Savings (20%)</mat-card-title>
            <mat-card-subtitle>Target savings this month</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="bucket-amounts">
              <span>Spent: <strong>₹{{ split.savings.spent | number:'1.1-1'}}</strong></span>
              <span>Target: <strong>₹{{ split.savings.budget | number:'1.1-1' }}</strong></span>
            </div>
            <mat-progress-bar
              mode="determinate"
              [value]="getPercent(split.savings.spent, split.savings.budget)"
              color="primary">
            </mat-progress-bar>
            <div class="remaining" [class.over]="split.savings.remaining < 0">
              {{ split.savings.remaining >= 0 ? '₹' + (split.savings.remaining | number:'1.1-1') + ' left to save' : 'Savings goal exceeded! 🎉' }}
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!split && salarySet" class="loading">
        Loading your split...
      </div>
      <div *ngIf="!salarySet" class="no-salary">
        Enter your monthly salary above to see your 50/30/20 breakdown.
      </div>

    </div>
  `,
  styles: [`
    .page { padding: 24px; max-width: 900px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .salary-card { margin-bottom: 24px; }
    .salary-form { display: flex; gap: 16px; align-items: center; }
    .salary-form mat-form-field { flex: 1; }
    .salary-hint { margin: 8px 0 0; font-size: 12px; color: #888; }
    .buckets { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .bucket-card { border-radius: 12px; }
    .bucket-card.needs { border-top: 4px solid #ef5350; }
    .bucket-card.wants { border-top: 4px solid #ff9800; }
    .bucket-card.savings { border-top: 4px solid #66bb6a; }
    .bucket-amounts { display: flex; justify-content: space-between; margin-bottom: 10px; font-size: 13px; }
    .remaining { font-size: 13px; margin-top: 8px; color: #2e7d32; font-weight: 500; }
    .remaining.over { color: #c62828; }
    .no-salary { text-align: center; color: #aaa; padding: 40px; }
    .loading { text-align: center; color: #aaa; padding: 40px; }
  `]
})
export class SalaryPlannerComponent implements OnInit {
  salaryForm: FormGroup;
  split: SalarySplit | null = null;
  salarySet = false;
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private salaryService: SalaryService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) {
    this.salaryForm = this.fb.group({
      monthly_salary: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.salaryService.getProfile().subscribe(profile => {
      if (profile.monthly_salary) {
        this.salaryForm.patchValue({ monthly_salary: profile.monthly_salary });
        this.salarySet = true;
        this.loadSplit();
      }
    });
  }

  saveSalary(): void {
    if (this.salaryForm.valid) {
      const salary = this.salaryForm.value.monthly_salary;
      this.salaryService.setSalary(salary).subscribe({
        next: () => {
          this.snackBar.open('Salary saved!', 'Close', { duration: 2000 });
          this.salarySet = true;
          this.loadSplit();
        },
        error: () => this.snackBar.open('Failed to save salary', 'Close', { duration: 2000 })
      });
    }
  }

  loadSplit(): void {
    this.salaryService.getSplit(this.currentMonth, this.currentYear).subscribe(data => {
      this.split = data;
      this.cdr.detectChanges();
    });
  }

  getPercent(spent: number, budget: number): number {
    return Math.min((spent / budget) * 100, 100);
  }

  getColor(spent: number, budget: number): 'primary' | 'warn' {
    return spent > budget ? 'warn' : 'primary';
  }
}