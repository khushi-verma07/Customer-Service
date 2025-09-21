import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login.component';
import { RegisterComponent } from './components/auth/register.component';
import { CustomerDashboardComponent } from './components/customer/customer-dashboard.component';
import { AgentDashboardComponent } from './components/agent/agent-dashboard.component';
import { AdminDashboardComponent } from './components/admin/admin-dashboard.component';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'customer', component: CustomerDashboardComponent, canActivate: [RoleGuard], data: { role: 'customer' } },
  { path: 'agent', component: AgentDashboardComponent, canActivate: [RoleGuard], data: { role: 'agent' } },
  { path: 'admin', component: AdminDashboardComponent, canActivate: [RoleGuard], data: { role: 'admin' } },
  { path: '**', redirectTo: '/login' }
];