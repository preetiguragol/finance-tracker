import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth-guard'

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'subscriptions',
    loadComponent: () => import('./pages/subscriptions/subscriptions').then(m => m.SubscriptionsComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'salary-planner',
    loadComponent: () => import('./pages/salary-planner/salary-planner').then(m => m.SalaryPlannerComponent),
    canActivate: [AuthGuard]
  },
  {
  path: 'reports',
  loadComponent: () => import('./pages/reports/reports').then(m => m.ReportsComponent),
  canActivate: [AuthGuard]
}
];