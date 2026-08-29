import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SalaryProfile {
  monthly_salary: number | null;
}

export interface SalarySplit {
  salary: number;
  month: number;
  year: number;
  needs: { budget: number; spent: number; remaining: number };
  wants: { budget: number; spent: number; remaining: number };
  savings: { budget: number; spent: number; remaining: number };
}

@Injectable({ providedIn: 'root' })
export class SalaryService {
  private apiUrl = 'http://localhost:8000/api/salary';

  constructor(private http: HttpClient) {}

  getProfile(): Observable<SalaryProfile> {
    return this.http.get<SalaryProfile>(`${this.apiUrl}/profile/`);
  }

  setSalary(monthly_salary: number): Observable<SalaryProfile> {
    return this.http.post<SalaryProfile>(`${this.apiUrl}/profile/`, { monthly_salary });
  }

  getSplit(month: number, year: number): Observable<SalarySplit> {
    const params = new HttpParams().set('month', month).set('year', year);
    return this.http.get<SalarySplit>(`${this.apiUrl}/split/`, { params });
  }
}