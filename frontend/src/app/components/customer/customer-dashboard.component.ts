import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from '../shared/chat.component';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatToolbarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTabsModule,
    MatIconModule,
    ChatComponent
  ],
  template: `
    <div class="gradient-bg min-h-screen">
      <!-- Sidebar -->
      <div class="fixed inset-y-0 left-0 z-50 w-64 sidebar-glass">
        <div class="flex flex-col h-full">
          <div class="p-6">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">C</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-blue-900">Customer Portal</h1>
                <p class="text-xs text-blue-700">{{currentUser?.name}}</p>
              </div>
            </div>
          </div>
          
          <nav class="flex-1 px-4 space-y-2">
            <a (click)="setActiveView('dashboard')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'dashboard' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>Dashboard</span>
            </a>
            <a (click)="setActiveView('tickets')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'tickets' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>My Tickets</span>
            </a>
            <a (click)="setActiveView('create')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'create' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>Create Ticket</span>
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
      <div class="ml-64 container-fluid section-padding" *ngIf="!showChat">
        
        <!-- Dashboard View -->
        <div *ngIf="activeView === 'dashboard'">
          <!-- Stats Cards -->
          <div class="grid-responsive mb-10">
            <div class="stats-card animate-fade-in">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Total Tickets</p>
                  <p class="text-3xl font-bold gradient-text">{{tickets.length}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-100">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Open Tickets</p>
                  <p class="text-3xl font-bold text-red-600">{{getOpenTickets()}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Resolved</p>
                  <p class="text-3xl font-bold text-green-600">{{getResolvedTickets()}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Avg Response</p>
                  <p class="text-3xl font-bold text-blue-600">{{getAvgResponseTime()}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Tickets -->
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div class="flex items-center space-x-4">
                <div class="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
                <div>
                  <h2 class="text-2xl font-semibold text-gray-800">Recent Tickets</h2>
                  <p class="text-gray-600">Your latest support requests</p>
                </div>
              </div>
              <button (click)="loadTickets()" class="btn-secondary flex items-center gap-2 px-6 py-3">
                <span>Refresh</span>
              </button>
            </div>

            <div *ngIf="tickets.length === 0" class="text-center py-20 animate-fade-in">
              <div class="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              </div>
              <h3 class="text-xl font-semibold text-gray-800 mb-3">No tickets yet</h3>
              <p class="text-gray-600 text-lg">Create your first support ticket to get started.</p>
            </div>

            <div class="space-y-6" *ngIf="tickets.length > 0">
              <div *ngFor="let ticket of getRecentTickets(); let i = index" 
                   class="card-solid p-6 animate-fade-in"
                   [style.animation-delay]="i * 0.05 + 's'">
                
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-3">
                      <h3 class="text-lg font-semibold text-gray-800">#{{ticket.id.toString().padStart(3, '0')}} {{ticket.subject}}</h3>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" 
                            [ngClass]="'priority-' + ticket.priority">
                        {{ticket.priority | titlecase}}
                      </span>
                    </div>
                    <p class="text-gray-600 mb-3 line-clamp-2">{{ticket.description}}</p>
                    <div class="flex items-center gap-6 text-sm text-gray-500">
                      <span class="flex items-center gap-2">
                        <span>{{ticket.created_at | date:'short'}}</span>
                      </span>
                      <span class="flex items-center gap-2" *ngIf="ticket.agent_id">
                        <span>Agent assigned</span>
                      </span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-3">
                    <span class="status-badge" [ngClass]="'status-' + ticket.status">
                      {{ticket.status | titlecase}}
                    </span>
                    <button 
                      (click)="openChat(ticket.id)"
                      class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm flex items-center gap-2">
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Create Ticket View -->
        <div *ngIf="activeView === 'create'">
          <div class="max-w-2xl mx-auto">
            <div class="card-glass p-8 animate-slide-up">
              <div class="flex items-center space-x-4 mb-8">
                <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
                <div>
                  <h2 class="text-2xl font-semibold text-gray-800">Create New Ticket</h2>
                  <p class="text-gray-600">Submit a new support request</p>
                </div>
              </div>

              <form (ngSubmit)="createTicket()" class="space-y-6">
                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Subject</mat-label>
                  <input matInput [(ngModel)]="newTicket.subject" name="subject" required>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Description</mat-label>
                  <textarea matInput [(ngModel)]="newTicket.description" name="description" rows="4" required></textarea>
                </mat-form-field>

                <mat-form-field appearance="outline" class="w-full">
                  <mat-label>Priority</mat-label>
                  <mat-select [(ngModel)]="newTicket.priority" name="priority" required>
                    <mat-option value="low">
                      <div class="flex items-center gap-3">
                        <div class="w-4 h-4 bg-green-500 rounded-full"></div>
                        <span>Low</span>
                      </div>
                    </mat-option>
                    <mat-option value="medium">
                      <div class="flex items-center gap-3">
                        <div class="w-4 h-4 bg-blue-500 rounded-full"></div>
                        <span>Medium</span>
                      </div>
                    </mat-option>
                    <mat-option value="high">
                      <div class="flex items-center gap-3">
                        <div class="w-4 h-4 bg-orange-500 rounded-full"></div>
                        <span>High</span>
                      </div>
                    </mat-option>
                    <mat-option value="urgent">
                      <div class="flex items-center gap-3">
                        <div class="w-4 h-4 bg-red-500 rounded-full"></div>
                        <span>Urgent</span>
                      </div>
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <button type="submit" 
                        class="btn-primary w-full h-14 flex items-center justify-center gap-3 text-lg">
                  <span>Submit Ticket</span>
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- All Tickets View -->
        <div *ngIf="activeView === 'tickets'">
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">All My Tickets</h2>
                <p class="text-gray-600">Complete list of your support requests</p>
              </div>
              <button (click)="loadTickets()" class="btn-secondary flex items-center gap-2 px-6 py-3">
                <span>Refresh</span>
              </button>
            </div>
            
            <div *ngIf="tickets.length === 0" class="text-center py-20">
              <h3 class="text-xl font-semibold text-gray-800 mb-3">No tickets yet</h3>
              <p class="text-gray-600">Create your first support ticket to get started.</p>
            </div>
            
            <div class="space-y-6" *ngIf="tickets.length > 0">
              <div *ngFor="let ticket of tickets" class="card-solid p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-3">
                      <h3 class="text-lg font-semibold text-gray-800">#{{ticket.id.toString().padStart(3, '0')}} {{ticket.subject}}</h3>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="'priority-' + ticket.priority">
                        {{ticket.priority | titlecase}}
                      </span>
                    </div>
                    <p class="text-gray-600 mb-3">{{ticket.description}}</p>
                    <div class="flex items-center gap-6 text-sm text-gray-500">
                      <span>{{ticket.created_at | date:'short'}}</span>
                      <span *ngIf="ticket.agent_id">Agent assigned</span>
                    </div>
                  </div>
                  <div class="flex flex-col items-end gap-3">
                    <span class="status-badge" [ngClass]="'status-' + ticket.status">
                      {{ticket.status | titlecase}}
                    </span>
                    <button (click)="openChat(ticket.id)" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm">
                      <span>Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Chat Overlay -->
      <div *ngIf="showChat && selectedTicketId" 
           class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <app-chat 
          [ticketId]="selectedTicketId"
          (chatClosed)="closeChat()">
        </app-chat>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-glass {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      border-right: 1px solid rgba(255, 255, 255, 0.2);
    }
    .line-clamp-2 {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
  `]
})
export class CustomerDashboardComponent implements OnInit {
  tickets: any[] = [];
  currentUser: any;
  showChat: boolean = false;
  selectedTicketId: number | null = null;
  activeView: string = 'dashboard';
  dashboardStats: any = {
    total_tickets: 0,
    open_tickets: 0,
    resolved_tickets: 0,
    avg_response_time: 'N/A'
  };
  
  newTicket = {
    subject: '',
    description: '',
    priority: 'medium'
  };

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadTickets();
    this.loadDashboardStats();
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets: any) => {
        console.log('Customer loaded tickets:', tickets);
        this.tickets = tickets.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      },
      error: (error: any) => {
        console.error('Error loading tickets:', error);
        this.tickets = [];
      }
    });
  }

  createTicket(): void {
    if (!this.newTicket.subject || !this.newTicket.description) {
      alert('Please fill in all required fields');
      return;
    }

    console.log('Creating ticket:', this.newTicket);
    this.ticketService.createTicket(this.newTicket).subscribe({
      next: (response) => {
        console.log('Ticket created:', response);
        this.newTicket = { subject: '', description: '', priority: 'medium' };
        this.loadTickets();
        alert('Ticket created successfully!');
        this.setActiveView('tickets');
      },
      error: (error) => {
        console.error('Error creating ticket:', error);
        alert('Failed to create ticket. Please try again.');
      }
    });
  }

  getOpenTickets(): number {
    return this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
  }

  getResolvedTickets(): number {
    return this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;
  }

  getAvgResponseTime(): string {
    return this.dashboardStats.avg_response_time;
  }

  loadDashboardStats(): void {
    this.ticketService.getDashboardStats().subscribe({
      next: (stats: any) => {
        this.dashboardStats = {
          total_tickets: stats.total_tickets || 0,
          open_tickets: stats.open_tickets || 0,
          resolved_tickets: stats.resolved_tickets || 0,
          avg_response_time: stats.avg_response_time || 'N/A'
        };
      },
      error: (error: any) => {
        console.error('Error loading dashboard stats:', error);
        this.calculateStatsFromTickets();
      }
    });
  }

  calculateStatsFromTickets(): void {
    const resolvedTickets = this.tickets.filter(t => t.status === 'resolved' && t.resolved_at);
    let avgResponseTime = 'N/A';
    
    if (resolvedTickets.length > 0) {
      let totalHours = 0;
      resolvedTickets.forEach(ticket => {
        const created = new Date(ticket.created_at);
        const resolved = new Date(ticket.resolved_at);
        const hours = (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      });
      
      const avgHours = totalHours / resolvedTickets.length;
      avgResponseTime = avgHours < 1 ? `${Math.round(avgHours * 60)}m` : `${avgHours.toFixed(1)}h`;
    }
    
    this.dashboardStats = {
      total_tickets: this.tickets.length,
      open_tickets: this.tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
      resolved_tickets: this.tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
      avg_response_time: avgResponseTime
    };
  }

  getRecentTickets(): any[] {
    return this.tickets.slice(0, 5);
  }

  openChat(ticketId: number): void {
    console.log('Opening chat for ticket:', ticketId);
    this.selectedTicketId = ticketId;
    this.showChat = true;
  }

  closeChat(): void {
    this.showChat = false;
    this.selectedTicketId = null;
  }

  setActiveView(view: string): void {
    this.activeView = view;
  }
  
  getActiveViewTitle(): string {
    const titles = {
      'dashboard': 'Dashboard',
      'tickets': 'My Tickets', 
      'create': 'Create Ticket'
    };
    return titles[this.activeView as keyof typeof titles] || 'Dashboard';
  }
  
  getActiveViewSubtitle(): string {
    const subtitles = {
      'dashboard': 'Overview of your support requests',
      'tickets': 'All your support tickets',
      'create': 'Submit a new support request'
    };
    return subtitles[this.activeView as keyof typeof subtitles] || '';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}