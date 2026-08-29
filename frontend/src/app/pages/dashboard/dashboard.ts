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
import { TransactionService, Transaction, Category, MonthlySummary } from '../../services/transaction.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatSnackBarModule,
    RouterLink
  ],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="header">
        <h1>Finance Tracker</h1>
        <div class="nav-links">
          <button mat-stroked-button routerLink="/subscriptions">Subscriptions</button>
          <button mat-stroked-button routerLink="/salary-planner">Salary Planner</button>
          <button mat-stroked-button routerLink="/reports">Reports</button>
          <button mat-stroked-button (click)="logout()">Logout</button>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="summary-cards">
        <mat-card class="summary-card income">
          <mat-card-content>
            <p class="label">Total Income</p>
            <p class="amount">₹{{ summary?.total_income | number:'1.1-1' }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="summary-card expense">
          <mat-card-content>
            <p class="label">Total Expenses</p>
            <p class="amount">₹{{ summary?.total_expense | number:'1.1-1' }}</p>
          </mat-card-content>
        </mat-card>
        <mat-card class="summary-card savings">
          <mat-card-content>
            <p class="label">Net Savings</p>
            <p class="amount">₹{{ summary?.net_savings | number:'1.1-1' }}</p>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="main-content">
        <!-- Add Transaction Form -->
        <mat-card class="form-card">
          <mat-card-header>
            <mat-card-title>Add Transaction</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <form [formGroup]="form" (ngSubmit)="onSubmit()">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Type</mat-label>
                <mat-select formControlName="transaction_type" (selectionChange)="onTypeChange()">
                  <mat-option value="income">Income</mat-option>
                  <mat-option value="expense">Expense</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Category</mat-label>
                <mat-select formControlName="category">
                  <mat-option *ngFor="let cat of filteredCategories" [value]="cat.id">
                    {{ cat.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Amount (₹)</mat-label>
                <input matInput type="number" formControlName="amount" />
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Date</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="date" />
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Note (optional)</mat-label>
                <input matInput formControlName="note" />
              </mat-form-field>

              <button mat-raised-button color="primary" type="submit" class="full-width">
                Add Transaction
              </button>
            </form>
          </mat-card-content>
        </mat-card>

        <!-- Transaction List -->
        <mat-card class="list-card">
          <mat-card-header>
            <mat-card-title>This Month's Transactions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="transactions.length === 0" class="empty">No transactions yet. Add one!</div>
            <div *ngFor="let t of transactions" class="transaction-row">
              <div class="t-left">
                <span class="t-category">{{ t.category_name }}</span>
                <span class="t-note">{{ t.note }}</span>
                <span class="t-date">{{ t.date }}</span>
              </div>
              <div class="t-right">
                <span
                  class="t-amount"
                  [class.income]="t.transaction_type === 'income'"
                  [class.expense]="t.transaction_type === 'expense'"
                >
                  {{ t.transaction_type === 'income' ? '+' : '-' }}₹{{ t.amount | number:'1.1-1' }}
                </span>
                <button mat-icon-button color="warn" (click)="deleteTransaction(t.id!)">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        padding: 24px;
        max-width: 1100px;
        margin: 0 auto;
      }
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .header h1 {
        margin: 0;
        font-size: 24px;
      }
      .summary-cards {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin-bottom: 24px;
      }
      .summary-card {
        text-align: center;
      }
      .summary-card .label {
        font-size: 13px;
        color: #666;
        margin: 0;
      }
      .summary-card .amount {
        font-size: 26px;
        font-weight: 600;
        margin: 8px 0 0;
      }
      .summary-card.income .amount {
        color: #2e7d32;
      }
      .summary-card.expense .amount {
        color: #c62828;
      }
      .summary-card.savings .amount {
        color: #1565c0;
      }
      .main-content {
        display: grid;
        grid-template-columns: 400px 1fr;
        gap: 24px;
      }
      .full-width {
        width: 100%;
        margin-bottom: 12px;
      }
      .transaction-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px solid #f0f0f0;
      }
      .t-left {
        display: flex;
        flex-direction: column;
      }
      .t-category {
        font-weight: 500;
        font-size: 14px;
      }
      .t-note {
        font-size: 12px;
        color: #888;
      }
      .t-date {
        font-size: 11px;
        color: #aaa;
      }
      .t-right {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .t-amount {
        font-weight: 600;
        font-size: 15px;
      }
      .t-amount.income {
        color: #2e7d32;
      }
      .t-amount.expense {
        color: #c62828;
      }
      .empty {
        text-align: center;
        color: #aaa;
        padding: 32px 0;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  form: FormGroup;
  transactions: Transaction[] = [];
  categories: Category[] = [];
  filteredCategories: Category[] = [];
  summary: MonthlySummary | null = null;
  currentMonth = new Date().getMonth() + 1;
  currentYear = new Date().getFullYear();

  constructor(
    private fb: FormBuilder,
    private transactionService: TransactionService,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef,
  ) {
    this.form = this.fb.group({
      transaction_type: ['expense', Validators.required],
      category: ['', Validators.required],
      amount: ['', [Validators.required, Validators.min(1)]],
      date: [new Date(), Validators.required],
      note: [''],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
    this.loadTransactions();
    this.loadSummary();
  }

  loadCategories(): void {
    this.transactionService.getCategories().subscribe((cats) => {
      this.categories = cats;
      this.filterCategories();
    });
  }

  loadTransactions(): void {
    this.transactionService
      .getTransactions({
        month: this.currentMonth,
        year: this.currentYear,
      })
      .subscribe((data) => {
        this.transactions = data;
        this.cdr.detectChanges();
      });
  }

  loadSummary(): void {
    this.transactionService
      .getMonthlySummary(this.currentMonth, this.currentYear)
      .subscribe((data) => {
        this.summary = data;
        this.cdr.detectChanges();
      });
  }

  onTypeChange(): void {
    this.form.patchValue({ category: '' });
    this.filterCategories();
  }

  filterCategories(): void {
    const type = this.form.get('transaction_type')?.value;
    this.filteredCategories = this.categories.filter((c) => c.category_type === type);
  }

  onSubmit(): void {
    if (this.form.valid) {
      const val = this.form.value;
      const payload: Transaction = {
        ...val,
        date: new Date(val.date).toISOString().split('T')[0],
      };

      this.transactionService.createTransaction(payload).subscribe({
        next: () => {
          this.snackBar.open('Transaction added!', 'Close', { duration: 2000 });
          this.form.patchValue({ amount: '', note: '', date: new Date() });
          this.loadTransactions();
          this.loadSummary();
        },
        error: () => this.snackBar.open('Failed to add transaction', 'Close', { duration: 2000 }),
      });
    }
  }

  deleteTransaction(id: number): void {
    this.transactionService.deleteTransaction(id).subscribe({
      next: () => {
        this.snackBar.open('Deleted!', 'Close', { duration: 2000 });
        this.loadTransactions();
        this.loadSummary();
      },
    });
  }

  logout(): void {
    this.authService.logout();
  }
}