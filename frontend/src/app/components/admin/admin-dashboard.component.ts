import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { TicketService } from '../../services/ticket.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatToolbarModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatChipsModule,
    MatIconModule
  ],
  template: `
    <div class="gradient-bg min-h-screen">
      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-64 sidebar-glass">
        <div class="flex flex-col h-full">
          <div class="p-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">A</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-blue-900">Admin Portal</h1>
                <p class="text-xs text-blue-700">{{currentUser?.name}}</p>
              </div>
            </div>
          </div>
          
          <nav class="flex-1 px-4 space-y-2">
            <a (click)="setActiveView('dashboard')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'dashboard' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>Dashboard</span>
            </a>
            <a (click)="setActiveView('tickets')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'tickets' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>All Tickets</span>
            </a>
            <a (click)="setActiveView('reports')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'reports' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>Reports</span>
            </a>
            <a (click)="setActiveView('users')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'users' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>User Management</span>
            </a>
          </nav>
          
          <div class="p-4 border-t border-white/20">
            <button (click)="logout()" class="w-full text-left px-4 py-3 text-blue-800 hover:bg-white/10 rounded-lg transition-colors font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>

      <!-- Header -->
      <div class="ml-64 header-glass">
        <div class="container-fluid">
          <div class="flex items-center justify-between h-20">
            <div>
              <h1 class="text-2xl font-semibold text-white">{{getActiveViewTitle()}}</h1>
              <p class="text-sm text-white/80">{{getActiveViewSubtitle()}}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="ml-64 container-fluid section-padding">
        
        <!-- Dashboard View -->
        <div *ngIf="activeView === 'dashboard'">
          <!-- Stats Cards -->
          <div class="grid-responsive mb-10">
            <div class="stats-card animate-fade-in">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Total Tickets</p>
                  <p class="text-4xl font-bold gradient-text">{{stats.totalTickets}}</p>
                  <p class="text-xs text-gray-500 mt-2">All time</p>
                </div>
                <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-white text-2xl font-bold">📋</span>
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Open Tickets</p>
                  <p class="text-4xl font-bold text-red-600">{{stats.openTickets}}</p>
                  <p class="text-xs text-gray-500 mt-2">Needs attention</p>
                </div>
                <div class="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-white text-2xl font-bold">⚠️</span>
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">SLA Breaches</p>
                  <p class="text-4xl font-bold text-orange-600">{{stats.slaBreaches}}</p>
                  <p class="text-xs text-gray-500 mt-2">This month</p>
                </div>
                <div class="w-20 h-20 bg-gradient-to-r from-orange-500 to-red-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-white text-2xl font-bold">🚨</span>
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">SLA Compliance</p>
                  <p class="text-4xl font-bold text-green-600">{{stats.slaCompliance}}%</p>
                  <p class="text-xs text-gray-500 mt-2">This month</p>
                </div>
                <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <span class="text-white text-2xl font-bold">📈</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Real-time Monitoring Section -->
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-10">
            <!-- High Priority Tickets -->
            <div class="card-glass p-8">
              <h3 class="text-xl font-semibold text-gray-800 mb-6">High Priority Queue</h3>
              <div class="space-y-4 max-h-96 overflow-y-auto">
                <div *ngFor="let ticket of getHighPriorityTickets().slice(0, 5)" 
                     class="bg-white border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-800">#{{ticket.id.toString().padStart(3, '0')}}</h4>
                    <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="getSLAStatusClass(ticket)">
                      {{getSLAStatus(ticket)}}
                    </span>
                  </div>
                  <p class="text-sm text-gray-600 mb-2">{{ticket.subject}}</p>
                  <div class="flex items-center justify-between text-xs text-gray-500">
                    <span>{{ticket.priority | titlecase}}</span>
                    <span>SLA: {{getTimeRemaining(ticket)}}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Agent Performance -->
            <div class="card-glass p-8">
              <h3 class="text-xl font-semibold text-gray-800 mb-6">Agent Performance</h3>
              <div class="space-y-4">
                <div *ngFor="let agent of agentPerformance" class="bg-white border border-gray-200 rounded-lg p-4">
                  <div class="flex items-center justify-between mb-2">
                    <h4 class="font-semibold text-gray-800">{{agent.name}}</h4>
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">{{agent.status}}</span>
                  </div>
                  <div class="grid grid-cols-3 gap-4 text-sm">
                    <div class="text-center">
                      <p class="font-semibold text-blue-600">{{agent.ticketsResolved}}</p>
                      <p class="text-gray-500">Resolved</p>
                    </div>
                    <div class="text-center">
                      <p class="font-semibold text-purple-600">{{agent.avgResolutionTime}}</p>
                      <p class="text-gray-500">Avg Time</p>
                    </div>
                    <div class="text-center">
                      <p class="font-semibold text-green-600">{{agent.slaCompliance}}%</p>
                      <p class="text-gray-500">SLA</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- All Tickets View -->
        <div *ngIf="activeView === 'tickets'">
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">All Tickets</h2>
                <p class="text-gray-600">System-wide ticket overview and management</p>
              </div>
              <button (click)="loadTickets()" class="btn-secondary px-6 py-3">Refresh</button>
            </div>
            <div class="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
              <div *ngFor="let ticket of tickets" class="card-solid p-6">
                <div class="flex items-center justify-between">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-3">
                      <h4 class="text-lg font-semibold text-gray-800">#{{ticket.id.toString().padStart(3, '0')}} {{ticket.subject}}</h4>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="'priority-' + ticket.priority">{{ticket.priority | titlecase}}</span>
                      <span class="px-2 py-1 rounded-full text-xs font-medium" [ngClass]="getSLAStatusClass(ticket)">
                        {{getSLAStatus(ticket)}}
                      </span>
                    </div>
                    <p class="text-gray-600 mb-2">{{ticket.description}}</p>
                    <div class="flex items-center gap-6 text-sm text-gray-500">
                      <span>Customer: {{ticket.customer_id}}</span>
                      <span>Agent: {{ticket.agent_id || 'Unassigned'}}</span>
                      <span>{{ticket.created_at | date:'short'}}</span>
                      <span>SLA: {{getTimeRemaining(ticket)}}</span>
                    </div>
                  </div>
                  <div class="text-right">
                    <span class="status-badge" [ngClass]="'status-' + ticket.status">{{ticket.status | titlecase}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Reports View -->
        <div *ngIf="activeView === 'reports'">
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">System Reports</h2>
                <p class="text-gray-600">Comprehensive analytics and performance insights</p>
              </div>
              <button (click)="loadReports()" class="btn-primary px-6 py-3">Generate Reports</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div class="card-solid p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Monthly Statistics</h3>
                <div class="space-y-3" *ngIf="monthlyReport.length > 0">
                  <div *ngFor="let month of monthlyReport" class="flex justify-between items-center py-2">
                    <span class="text-gray-600 font-medium">{{month.month}}</span>
                    <div class="flex items-center gap-3">
                      <span class="font-semibold text-gray-800">{{month.total_tickets}}</span>
                      <span class="text-green-600 text-sm font-medium">{{month.resolved_tickets}} resolved</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card-solid p-6">
                <h3 class="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h3>
                <div class="space-y-4">
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600 font-medium">Average Resolution Time</span>
                    <span class="font-semibold text-gray-800">{{getAvgResolutionTime()}} hours</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600 font-medium">SLA Compliance</span>
                    <span class="font-semibold text-green-600">{{stats.slaCompliance}}%</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600 font-medium">SLA Breaches</span>
                    <span class="font-semibold text-red-600">{{stats.slaBreaches}}</span>
                  </div>
                  <div class="flex justify-between items-center py-2">
                    <span class="text-gray-600 font-medium">Today's Tickets</span>
                    <span class="font-semibold text-blue-600">{{stats.todayTickets}}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- User Management View -->
        <div *ngIf="activeView === 'users'">
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">User Management</h2>
                <p class="text-gray-600">Manage system users, agents, and administrators</p>
              </div>
              <button class="btn-primary px-6 py-3">Add New User</button>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div class="card-solid p-6 text-center">
                <h3 class="text-2xl font-bold text-blue-600 mb-2">{{userStats.customers}}</h3>
                <p class="text-gray-600 font-medium">Total Customers</p>
              </div>
              <div class="card-solid p-6 text-center">
                <h3 class="text-2xl font-bold text-green-600 mb-2">{{userStats.agents}}</h3>
                <p class="text-gray-600 font-medium">Active Agents</p>
              </div>
              <div class="card-solid p-6 text-center">
                <h3 class="text-2xl font-bold text-purple-600 mb-2">{{userStats.admins}}</h3>
                <p class="text-gray-600 font-medium">Administrators</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }
    .header-glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    }
    .container-fluid {
      padding: 0 2rem;
    }
    .section-padding {
      padding: 2rem;
    }
    .grid-responsive {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    .stats-card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card-glass {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(10px);
      border-radius: 1rem;
    }
    .card-solid {
      background: white;
      border-radius: 0.75rem;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .btn-secondary {
      background: #6b7280;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
    }
    .btn-secondary:hover {
      background: #4b5563;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.5rem;
      font-weight: 500;
    }
    .btn-primary:hover {
      background: #2563eb;
    }
    .gradient-text {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .animate-fade-in {
      animation: fadeIn 0.5s ease-in;
    }
    .animate-slide-up {
      animation: slideUp 0.3s ease-out;
    }
    .animate-delay-100 {
      animation-delay: 0.1s;
    }
    .animate-delay-200 {
      animation-delay: 0.2s;
    }
    .animate-delay-300 {
      animation-delay: 0.3s;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    .priority-low {
      background: #10b981;
      color: white;
    }
    .priority-medium {
      background: #3b82f6;
      color: white;
    }
    .priority-high {
      background: #f59e0b;
      color: white;
    }
    .priority-urgent {
      background: #ef4444;
      color: white;
    }
    .status-open {
      background: #ef4444;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-in_progress {
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-resolved {
      background: #10b981;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-closed {
      background: #6b7280;
      color: white;
      padding: 0.25rem 0.75rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .custom-scrollbar::-webkit-scrollbar {
      width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: linear-gradient(to bottom, #3b82f6, #8b5cf6);
      border-radius: 2px;
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  tickets: any[] = [];
  monthlyReport: any[] = [];
  activeView: string = 'dashboard';
  currentUser: any;
  userStats = {
    totalUsers: 0,
    customers: 0,
    agents: 0,
    admins: 0,
    activeAgents: 0
  };
  stats = {
    totalTickets: 0,
    openTickets: 0,
    slaBreaches: 0,
    resolvedTickets: 0,
    todayTickets: 0,
    avgResolutionTime: 'N/A',
    slaCompliance: 100
  };
  agentPerformance: any[] = [];

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private ticketService: TicketService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  ngOnInit(): void {
    this.loadDashboardStats();
    this.loadTickets();
    this.loadReports();
    this.loadAgentPerformance();
  }

  loadDashboardStats(): void {
    this.ticketService.getAdminStats().subscribe({
      next: (stats) => {
        console.log('Admin stats loaded:', stats);
        this.stats = {
          totalTickets: stats.totalTickets || 0,
          openTickets: stats.openTickets || 0,
          slaBreaches: stats.slaBreaches || 0,
          resolvedTickets: stats.resolvedTickets || 0,
          todayTickets: stats.todayTickets || 0,
          avgResolutionTime: stats.avgResolutionTime || 'N/A',
          slaCompliance: stats.slaCompliance || 100
        };
      },
      error: (error) => {
        console.error('Error loading admin stats:', error);
        this.calculateStatsFromTickets();
      }
    });
  }

  calculateStatsFromTickets(): void {
    const resolvedTickets = this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    let avgResolutionTime = 'N/A';
    let slaCompliance = 100;
    
    if (resolvedTickets.length > 0) {
      let totalHours = 0;
      let validTickets = 0;
      let slaMetTickets = 0;
      
      resolvedTickets.forEach(ticket => {
        if (ticket.resolved_at && ticket.created_at) {
          const hours = (new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60);
          totalHours += hours;
          validTickets++;
          
          if (ticket.sla_deadline && new Date(ticket.resolved_at) <= new Date(ticket.sla_deadline)) {
            slaMetTickets++;
          }
        }
      });
      
      if (validTickets > 0) {
        const avgHours = totalHours / validTickets;
        avgResolutionTime = avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`;
        slaCompliance = Math.round((slaMetTickets / validTickets) * 100);
      }
    }
    
    this.stats = {
      totalTickets: this.tickets.length,
      openTickets: this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
      slaBreaches: this.tickets.filter(t => t.sla_breached).length,
      resolvedTickets: resolvedTickets.length,
      todayTickets: this.tickets.filter(t => {
        const today = new Date().toDateString();
        return new Date(t.created_at).toDateString() === today;
      }).length,
      avgResolutionTime: avgResolutionTime,
      slaCompliance: slaCompliance
    };
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        console.log('Admin loaded tickets:', tickets);
        this.tickets = tickets;
        if (!this.stats.totalTickets) {
          this.calculateStatsFromTickets();
        }
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.tickets = [];
      }
    });
  }

  loadReports(): void {
    this.ticketService.getMonthlyReport().subscribe({
      next: (report) => {
        console.log('Monthly report loaded:', report);
        this.monthlyReport = report;
      },
      error: (error) => {
        console.error('Error loading monthly report:', error);
        this.monthlyReport = [];
      }
    });
    
    this.ticketService.getUserStats().subscribe({
      next: (stats) => {
        console.log('User stats loaded:', stats);
        this.userStats = stats;
      },
      error: (error) => {
        console.error('Error loading user stats:', error);
        this.userStats = {
          totalUsers: 0,
          customers: 0,
          agents: 0,
          admins: 0,
          activeAgents: 0
        };
      }
    });
  }

  loadAgentPerformance(): void {
    this.http.get('http://localhost:5001/api/reports/agent-performance', { headers: this.getHeaders() }).subscribe({
      next: (performance: any) => {
        console.log('Agent performance loaded:', performance);
        this.agentPerformance = performance;
      },
      error: (error) => {
        console.error('Error loading agent performance:', error);
        this.calculateAgentPerformanceFromTickets();
      }
    });
  }

  calculateAgentPerformanceFromTickets(): void {
    const agentMap = new Map();
    
    this.tickets.forEach(ticket => {
      if (ticket.agent_id) {
        if (!agentMap.has(ticket.agent_id)) {
          agentMap.set(ticket.agent_id, {
            name: `Agent ${ticket.agent_id}`,
            ticketsResolved: 0,
            totalTickets: 0,
            totalResolutionTime: 0,
            slaCompliance: 0,
            status: 'active'
          });
        }
        
        const agent = agentMap.get(ticket.agent_id);
        agent.totalTickets++;
        
        if (ticket.status === 'resolved' || ticket.status === 'closed') {
          agent.ticketsResolved++;
          
          if (ticket.resolved_at && ticket.created_at) {
            const resolutionTime = (new Date(ticket.resolved_at).getTime() - new Date(ticket.created_at).getTime()) / (1000 * 60 * 60);
            agent.totalResolutionTime += resolutionTime;
          }
        }
      }
    });
    
    this.agentPerformance = Array.from(agentMap.values()).map(agent => ({
      ...agent,
      avgResolutionTime: agent.ticketsResolved > 0 ? 
        `${(agent.totalResolutionTime / agent.ticketsResolved).toFixed(1)}h` : 'N/A',
      slaCompliance: agent.totalTickets > 0 ? 
        Math.round((agent.ticketsResolved / agent.totalTickets) * 100) : 0
    }));
  }

  getHighPriorityTickets(): any[] {
    return this.tickets.filter(t => t.priority === 'high' || t.priority === 'urgent');
  }

  getSLAStatus(ticket: any): string {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return ticket.resolved_at <= ticket.sla_deadline ? 'Met' : 'Breached';
    }
    
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    
    if (now > deadline) return 'Breached';
    
    const hoursRemaining = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);
    if (hoursRemaining <= 2) return 'Warning';
    
    return 'On Track';
  }

  getSLAStatusClass(ticket: any): string {
    const status = this.getSLAStatus(ticket);
    const classes = {
      'Met': 'bg-green-100 text-green-800',
      'On Track': 'bg-blue-100 text-blue-800',
      'Warning': 'bg-yellow-100 text-yellow-800',
      'Breached': 'bg-red-100 text-red-800'
    };
    return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800';
  }

  getTimeRemaining(ticket: any): string {
    if (ticket.status === 'resolved' || ticket.status === 'closed') {
      return 'Completed';
    }
    
    const now = new Date();
    const deadline = new Date(ticket.sla_deadline);
    const diff = deadline.getTime() - now.getTime();
    
    if (diff <= 0) return 'Overdue';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  getAvgResolutionTime(): string {
    return this.stats.avgResolutionTime;
  }

  setActiveView(view: string): void {
    this.activeView = view;
    if (view === 'tickets') {
      this.loadTickets();
    } else if (view === 'reports') {
      this.loadReports();
    } else if (view === 'dashboard') {
      this.loadDashboardStats();
      this.loadAgentPerformance();
    }
  }
  
  getActiveViewTitle(): string {
    const titles = {
      'dashboard': 'Admin Dashboard',
      'tickets': 'All Tickets',
      'reports': 'System Reports',
      'users': 'User Management'
    };
    return titles[this.activeView as keyof typeof titles] || 'Dashboard';
  }
  
  getActiveViewSubtitle(): string {
    const subtitles = {
      'dashboard': 'System overview and monitoring',
      'tickets': 'System-wide ticket management',
      'reports': 'Analytics and performance insights',
      'users': 'Manage users and permissions'
    };
    return subtitles[this.activeView as keyof typeof subtitles] || '';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}