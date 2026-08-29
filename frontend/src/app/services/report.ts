import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface CategoryBreakdown {
  category: string;
  type: string;
  total: number;
}

export interface TrendItem {
  month: string;
  income: number;
  expense: number;
}

export interface MonthlyReport {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  net_savings: number;
  category_breakdown: CategoryBreakdown[];
  trend: TrendItem[];
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private apiUrl = 'http://localhost:8000/api/transactions';

  constructor(private http: HttpClient) {}

  getReport(month: number, year: number): Observable<MonthlyReport> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<MonthlyReport>(`${this.apiUrl}/report/`, { params });
  }
}