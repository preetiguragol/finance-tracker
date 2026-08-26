import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Transaction {
  id?: number;
  transaction_type: 'income' | 'expense';
  category: number;
  category_name?: string;
  amount: string;
  note?: string;
  date: string;
  created_at?: string;
}

export interface Category {
  id: number;
  name: string;
  category_type: 'income' | 'expense';
}

export interface MonthlySummary {
  month: number;
  year: number;
  total_income: number;
  total_expense: number;
  net_savings: number;
}

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private apiUrl = 'http://localhost:8000/api/transactions';

  constructor(private http: HttpClient) {}

  getTransactions(filters?: any): Observable<Transaction[]> {
    let params = new HttpParams();
    if (filters?.month) params = params.set('month', filters.month);
    if (filters?.year) params = params.set('year', filters.year);
    if (filters?.type) params = params.set('type', filters.type);
    return this.http.get<Transaction[]>(`${this.apiUrl}/`, { params });
  }

  createTransaction(data: Transaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/`, data);
  }

  deleteTransaction(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiUrl}/categories/`);
  }

  getMonthlySummary(month: number, year: number): Observable<MonthlySummary> {
    let params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<MonthlySummary>(`${this.apiUrl}/summary/`, { params });
  }
}