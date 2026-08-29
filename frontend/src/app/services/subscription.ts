import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Subscription {
  id?: number;
  name: string;
  amount: string;
  billing_cycle: 'monthly' | 'yearly';
  renewal_date: string;
  notes?: string;
  days_until_renewal?: number;
  is_due_soon?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
  private apiUrl = 'http://localhost:8000/api/subscriptions';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/`);
  }

  create(data: Subscription): Observable<Subscription> {
    return this.http.post<Subscription>(`${this.apiUrl}/`, data);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}/`);
  }

  getDueSoon(): Observable<Subscription[]> {
    return this.http.get<Subscription[]>(`${this.apiUrl}/due-soon/`);
  }
}