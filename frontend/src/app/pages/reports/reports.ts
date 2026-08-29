import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { ReportService, MonthlyReport } from '../../services/report';
import { Chart, registerables } from 'chart.js';
import jsPDF from 'jspdf';
Chart.register(...registerables);

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule,
    MatSelectModule, MatIconModule, FormsModule,
    RouterLink, DecimalPipe
  ],
  template: `
  <div class="page">
    <div class="header">
      <h1>Monthly Report</h1>
      <div class="header-actions">
        <button mat-raised-button color="primary" (click)="exportPDF()" *ngIf="report">
          <mat-icon>download</mat-icon> Export PDF
        </button>
        <button mat-stroked-button routerLink="/dashboard">← Back to Dashboard</button>
      </div>
    </div>

    <!-- Month/Year selector -->
    <mat-card class="filter-card">
      <mat-card-content>
        <div class="filters">
          <mat-select [(ngModel)]="selectedMonth" (selectionChange)="loadReport()">
            <mat-option [value]="1">January</mat-option>
            <mat-option [value]="2">February</mat-option>
            <mat-option [value]="3">March</mat-option>
            <mat-option [value]="4">April</mat-option>
            <mat-option [value]="5">May</mat-option>
            <mat-option [value]="6">June</mat-option>
            <mat-option [value]="7">July</mat-option>
            <mat-option [value]="8">August</mat-option>
            <mat-option [value]="9">September</mat-option>
            <mat-option [value]="10">October</mat-option>
            <mat-option [value]="11">November</mat-option>
            <mat-option [value]="12">December</mat-option>
          </mat-select>
          <mat-select [(ngModel)]="selectedYear" (selectionChange)="loadReport()">
            <mat-option [value]="2024">2024</mat-option>
            <mat-option [value]="2025">2025</mat-option>
            <mat-option [value]="2026">2026</mat-option>
          </mat-select>
        </div>
      </mat-card-content>
    </mat-card>

    <!-- Summary Cards -->
    <div class="summary-cards" *ngIf="report">
      <mat-card class="summary-card income">
        <mat-card-content>
          <p class="label">Total Income</p>
          <p class="amount">₹{{ report.total_income | number:'1.1-1' }}</p>
        </mat-card-content>
      </mat-card>
      <mat-card class="summary-card expense">
        <mat-card-content>
          <p class="label">Total Expenses</p>
          <p class="amount">₹{{ report.total_expense | number:'1.1-1' }}</p>
        </mat-card-content>
      </mat-card>
      <mat-card class="summary-card savings">
        <mat-card-content>
          <p class="label">Net Savings</p>
          <p class="amount">₹{{ report.net_savings | number:'1.1-1' }}</p>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Charts -->
    <div class="charts-grid" *ngIf="report">
      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Spending by Category</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div *ngIf="report.category_breakdown.length === 0" class="empty">
            No expense data for this month
          </div>
          <canvas #pieChart *ngIf="report.category_breakdown.length > 0"></canvas>
        </mat-card-content>
      </mat-card>

      <mat-card class="chart-card">
        <mat-card-header>
          <mat-card-title>Last 6 Months Trend</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <canvas #barChart></canvas>
        </mat-card-content>
      </mat-card>
    </div>

    <!-- Category Breakdown Table -->
    <mat-card class="table-card" *ngIf="report && report.category_breakdown.length > 0">
      <mat-card-header>
        <mat-card-title>Category Breakdown</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <div class="table-row header-row">
          <span>Category</span>
          <span>Type</span>
          <span>Amount</span>
        </div>
        <div class="table-row" *ngFor="let item of report.category_breakdown">
          <span>{{ item.category }}</span>
          <span class="type-badge" [class.income]="item.type === 'income'" [class.expense]="item.type === 'expense'">
            {{ item.type }}
          </span>
          <span class="item-amount" [class.income]="item.type === 'income'" [class.expense]="item.type === 'expense'">
            ₹{{ item.total | number:'1.1-1' }}
          </span>
        </div>
      </mat-card-content>
    </mat-card>

    <div *ngIf="!report" class="loading">Loading report...</div>
  </div>
`,
  styles: [`
    .page { padding: 24px; max-width: 1100px; margin: 0 auto; }
    .header-actions { display: flex; gap: 12px; align-items: center; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .filter-card { margin-bottom: 24px; }
    .filters { display: flex; gap: 16px; }
    .filters mat-select { min-width: 150px; }
    .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
    .summary-card { text-align: center; }
    .summary-card .label { font-size: 13px; color: #666; margin: 0; }
    .summary-card .amount { font-size: 26px; font-weight: 600; margin: 8px 0 0; }
    .summary-card.income .amount { color: #2e7d32; }
    .summary-card.expense .amount { color: #c62828; }
    .summary-card.savings .amount { color: #1565c0; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
    .chart-card canvas { max-height: 300px; }
    .table-card { margin-bottom: 24px; }
    .table-row { display: grid; grid-template-columns: 1fr 1fr 1fr; padding: 10px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
    .header-row { font-weight: 600; color: #666; font-size: 12px; text-transform: uppercase; }
    .type-badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 11px; font-weight: 500; width: fit-content; }
    .type-badge.income { background: #e8f5e9; color: #2e7d32; }
    .type-badge.expense { background: #ffebee; color: #c62828; }
    .item-amount.income { color: #2e7d32; font-weight: 500; }
    .item-amount.expense { color: #c62828; font-weight: 500; }
    .empty { text-align: center; color: #aaa; padding: 32px 0; }
    .loading { text-align: center; color: #aaa; padding: 40px; }
  `]
})
export class ReportsComponent implements OnInit, AfterViewInit {
  @ViewChild('pieChart') pieChartRef!: ElementRef;
  @ViewChild('barChart') barChartRef!: ElementRef;

  report: MonthlyReport | null = null;
  selectedMonth = new Date().getMonth() + 1;
  selectedYear = new Date().getFullYear();

  pieChartInstance: Chart | null = null;
  barChartInstance: Chart | null = null;

  constructor(
    private reportService: ReportService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadReport();
  }

  ngAfterViewInit(): void {}

  loadReport(): void {
    if (this.pieChartInstance) {
      this.pieChartInstance.destroy();
      this.pieChartInstance = null;
    }
    if (this.barChartInstance) {
      this.barChartInstance.destroy();
      this.barChartInstance = null;
    }

    this.reportService.getReport(this.selectedMonth, this.selectedYear).subscribe(data => {
      this.report = data;
      this.cdr.detectChanges();
      setTimeout(() => {
        this.renderPieChart();
        this.renderBarChart();
      }, 100);
    });
  }

  renderPieChart(): void {
    if (!this.pieChartRef || !this.report) return;

    const expenses = this.report.category_breakdown.filter(c => c.type === 'expense');
    if (expenses.length === 0) return;

    const colors = [
      '#ef5350', '#ff7043', '#ffa726', '#ffca28',
      '#66bb6a', '#26c6da', '#42a5f5', '#ab47bc',
      '#ec407a', '#8d6e63'
    ];

    this.pieChartInstance = new Chart(this.pieChartRef.nativeElement, {
      type: 'pie',
      data: {
        labels: expenses.map(e => e.category),
        datasets: [{
          data: expenses.map(e => e.total),
          backgroundColor: colors.slice(0, expenses.length),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' }
        }
      }
    });
  }

  renderBarChart(): void {
    if (!this.barChartRef || !this.report) return;

    this.barChartInstance = new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: this.report.trend.map(t => t.month),
        datasets: [
          {
            label: 'Income',
            data: this.report.trend.map(t => t.income),
            backgroundColor: '#66bb6a',
            borderRadius: 4
          },
          {
            label: 'Expense',
            data: this.report.trend.map(t => t.expense),
            backgroundColor: '#ef5350',
            borderRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => '₹' + value
            }
          }
        }
      }
    });
  }
exportPDF(): void {
  if (!this.report) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  // Title
  doc.setFontSize(20);
  doc.setTextColor(33, 33, 33);
  doc.text('Finance Report', pageWidth / 2, 20, { align: 'center' });

  // Month Year
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(`${monthNames[this.selectedMonth - 1]} ${this.selectedYear}`, pageWidth / 2, 30, { align: 'center' });

  // Divider
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 35, pageWidth - 14, 35);

  // Summary
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Summary', 14, 45);

  doc.setFontSize(11);
  doc.setTextColor(46, 125, 50);
  doc.text(`Total Income:   Rs ${this.report.total_income.toFixed(1)}`, 14, 55);
  doc.setTextColor(198, 40, 40);
  doc.text(`Total Expense:  Rs ${this.report.total_expense.toFixed(1)}`, 14, 63);
  doc.setTextColor(21, 101, 192);
  doc.text(`Net Savings:    Rs ${this.report.net_savings.toFixed(1)}`, 14, 71);

  doc.setDrawColor(200, 200, 200);
  doc.line(14, 77, pageWidth - 14, 77);

  // Category Breakdown Table
  let y = 87;
  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('Category Breakdown', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Category', 14, y);
  doc.text('Type', 90, y);
  doc.text('Amount', 150, y);
  y += 6;

  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  this.report.category_breakdown.forEach(item => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(33, 33, 33);
    doc.text(item.category, 14, y);
    doc.setTextColor(item.type === 'income' ? 46 : 198, item.type === 'income' ? 125 : 40, item.type === 'income' ? 50 : 40);
    doc.text(item.type, 90, y);
    doc.setTextColor(33, 33, 33);
    doc.text(`Rs ${item.total.toFixed(1)}`, 150, y);
    y += 8;
  });

  // 6 Month Trend Table
  y += 6;
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 10;

  doc.setFontSize(14);
  doc.setTextColor(33, 33, 33);
  doc.text('6 Month Trend', 14, y);
  y += 10;

  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text('Month', 14, y);
  doc.text('Income', 80, y);
  doc.text('Expense', 140, y);
  y += 6;

  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, pageWidth - 14, y);
  y += 6;

  this.report.trend.forEach(item => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.setTextColor(33, 33, 33);
    doc.text(item.month, 14, y);
    doc.setTextColor(46, 125, 50);
    doc.text(`Rs ${item.income.toFixed(1)}`, 80, y);
    doc.setTextColor(198, 40, 40);
    doc.text(`Rs ${item.expense.toFixed(1)}`, 140, y);
    y += 8;
  });

  // --- Charts on new page ---
  doc.addPage();
  y = 20;

  // Pie Chart
  if (this.pieChartInstance) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('Spending by Category', pageWidth / 2, y, { align: 'center' });
    y += 6;

    const pieCanvas = this.pieChartRef.nativeElement as HTMLCanvasElement;
    const pieImage = pieCanvas.toDataURL('image/png');
    const pieWidth = 140;
    const pieHeight = 110;
    doc.addImage(pieImage, 'PNG', (pageWidth - pieWidth) / 2, y, pieWidth, pieHeight);
    y += pieHeight + 16;
  }

  // Divider between charts
  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, pageWidth - 14, y);
  y += 12;

  // Bar Chart
  if (this.barChartInstance) {
    doc.setFontSize(14);
    doc.setTextColor(33, 33, 33);
    doc.text('6 Month Income vs Expense', pageWidth / 2, y, { align: 'center' });
    y += 6;

    const barCanvas = this.barChartRef.nativeElement as HTMLCanvasElement;
    const barImage = barCanvas.toDataURL('image/png');
    const barWidth = 170;
    const barHeight = 100;
    doc.addImage(barImage, 'PNG', (pageWidth - barWidth) / 2, y, barWidth, barHeight);
    y += barHeight + 10;
  }

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Finance Tracker', pageWidth / 2, 285, { align: 'center' });

  doc.save(`finance-report-${monthNames[this.selectedMonth - 1]}-${this.selectedYear}.pdf`);
}
}