import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { ChatComponent } from '../shared/chat.component';
import { TicketService } from '../../services/ticket.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatToolbarModule,
    MatCardModule,
    MatTableModule,
    MatButtonModule,
    MatSelectModule,
    MatChipsModule,
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
              <div class="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <span class="text-white font-bold">A</span>
              </div>
              <div>
                <h1 class="text-lg font-bold text-blue-900">Agent Portal</h1>
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
            <a (click)="setActiveView('assigned')" class="flex items-center px-4 py-3 rounded-lg font-medium cursor-pointer transition-colors" [ngClass]="activeView === 'assigned' ? 'text-blue-900 bg-blue-200/30' : 'text-blue-800 hover:bg-white/10'">
              <span>My Tickets</span>
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
                  <p class="text-3xl font-bold text-red-600">{{getTicketsByStatus('open').length}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-200">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">In Progress</p>
                  <p class="text-3xl font-bold text-blue-600">{{getTicketsByStatus('in_progress').length}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>

            <div class="stats-card animate-fade-in animate-delay-300">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-gray-600 mb-1">Resolved</p>
                  <p class="text-3xl font-bold text-green-600">{{getTicketsByStatus('resolved').length}}</p>
                </div>
                <div class="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                </div>
              </div>
            </div>
          </div>

          <!-- Recent Activity -->
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">Recent Activity</h2>
                <p class="text-gray-600">Latest ticket updates and assignments</p>
              </div>
              <button (click)="loadTickets()" class="btn-secondary flex items-center gap-2 px-6 py-3">
                <span>Refresh</span>
              </button>
            </div>

            <div *ngIf="tickets.length === 0" class="text-center py-20">
              <h3 class="text-xl font-semibold text-gray-800 mb-3">No tickets available</h3>
              <p class="text-gray-600">All tickets are currently handled or no tickets exist.</p>
            </div>

            <div class="space-y-6" *ngIf="tickets.length > 0">
              <div *ngFor="let ticket of tickets.slice(0, 5)" class="card-solid p-6">
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
                      <span>Customer: {{ticket.customer_id}}</span>
                      <span>{{ticket.created_at | date:'short'}}</span>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <span class="status-badge" [ngClass]="'status-' + ticket.status">{{ticket.status | titlecase}}</span>
                    <button (click)="openChat(ticket.id)" class="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-sm">
                      Chat
                    </button>
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
                <p class="text-gray-600">Complete ticket queue for all customers</p>
              </div>
              <button (click)="loadTickets()" class="btn-secondary flex items-center gap-2 px-6 py-3">
                <span>Refresh</span>
              </button>
            </div>

            <div *ngIf="tickets.length === 0" class="text-center py-20">
              <h3 class="text-xl font-semibold text-gray-800 mb-3">No tickets available</h3>
              <p class="text-gray-600">All tickets are currently handled or no tickets exist.</p>
            </div>

            <div class="space-y-6" *ngIf="tickets.length > 0">
              <div *ngFor="let ticket of tickets" class="card-solid p-8">
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-3">
                      <h3 class="text-lg font-semibold text-gray-800">#{{ticket.id.toString().padStart(3, '0')}} {{ticket.subject}}</h3>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="'priority-' + ticket.priority">
                        {{ticket.priority | titlecase}}
                      </span>
                    </div>
                    <p class="text-gray-600 mb-4">{{ticket.description}}</p>
                    <div class="flex items-center gap-6 text-sm text-gray-500">
                      <span>Customer: {{ticket.customer_id}}</span>
                      <span>{{ticket.created_at | date:'short'}}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                  <div class="flex items-center gap-4">
                    <mat-form-field appearance="outline" class="w-48">
                      <mat-label>Update Status</mat-label>
                      <mat-select [(value)]="ticket.status" (selectionChange)="updateTicketStatus(ticket.id, $event.value)">
                        <mat-option value="open">Open</mat-option>
                        <mat-option value="in_progress">In Progress</mat-option>
                        <mat-option value="resolved">Resolved</mat-option>
                        <mat-option value="closed">Closed</mat-option>
                      </mat-select>
                    </mat-form-field>

                    <span *ngIf="ticket.agent_id === currentUser?.id" class="px-4 py-2 bg-green-100 text-green-800 rounded-xl text-sm font-medium">
                      Assigned to you
                    </span>
                  </div>
                  
                  <div class="flex items-center gap-3">
                    <button *ngIf="!ticket.agent_id" (click)="assignToMe(ticket.id)" class="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium shadow-lg">
                      Assign to Me
                    </button>
                    <button (click)="openChat(ticket.id)" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg">
                      Open Chat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- My Assigned Tickets View -->
        <div *ngIf="activeView === 'assigned'">
          <div class="card-glass p-8 animate-slide-up">
            <div class="flex items-center justify-between mb-8">
              <div>
                <h2 class="text-2xl font-semibold text-gray-800">My Assigned Tickets</h2>
                <p class="text-gray-600">Tickets currently assigned to you</p>
              </div>
              <button (click)="loadTickets()" class="btn-secondary flex items-center gap-2 px-6 py-3">
                <span>Refresh</span>
              </button>
            </div>

            <div *ngIf="getMyTickets().length === 0" class="text-center py-20">
              <h3 class="text-xl font-semibold text-gray-800 mb-3">No assigned tickets</h3>
              <p class="text-gray-600">You don't have any tickets assigned to you yet.</p>
            </div>

            <div class="space-y-6" *ngIf="getMyTickets().length > 0">
              <div *ngFor="let ticket of getMyTickets()" class="card-solid p-8">
                <div class="flex items-start justify-between mb-6">
                  <div class="flex-1">
                    <div class="flex items-center gap-4 mb-3">
                      <h3 class="text-lg font-semibold text-gray-800">#{{ticket.id.toString().padStart(3, '0')}} {{ticket.subject}}</h3>
                      <span class="px-3 py-1 rounded-full text-xs font-semibold" [ngClass]="'priority-' + ticket.priority">
                        {{ticket.priority | titlecase}}
                      </span>
                    </div>
                    <p class="text-gray-600 mb-4">{{ticket.description}}</p>
                    <div class="flex items-center gap-6 text-sm text-gray-500">
                      <span>Customer: {{ticket.customer_id}}</span>
                      <span>{{ticket.created_at | date:'short'}}</span>
                    </div>
                  </div>
                </div>

                <div class="flex items-center justify-between pt-6 border-t border-gray-100">
                  <mat-form-field appearance="outline" class="w-48">
                    <mat-label>Update Status</mat-label>
                    <mat-select [(value)]="ticket.status" (selectionChange)="updateTicketStatus(ticket.id, $event.value)">
                      <mat-option value="open">Open</mat-option>
                      <mat-option value="in_progress">In Progress</mat-option>
                      <mat-option value="resolved">Resolved</mat-option>
                      <mat-option value="closed">Closed</mat-option>
                    </mat-select>
                  </mat-form-field>
                  
                  <button (click)="openChat(ticket.id)" class="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg">
                    Open Chat
                  </button>
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
export class AgentDashboardComponent implements OnInit {
  tickets: any[] = [];
  currentUser: any;
  showChat: boolean = false;
  selectedTicketId: number | null = null;
  activeView: string = 'dashboard';

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadTickets();
  }

  loadTickets(): void {
    this.ticketService.getTickets().subscribe({
      next: (tickets) => {
        console.log('Agent loaded tickets:', tickets);
        this.tickets = tickets;
      },
      error: (error) => {
        console.error('Error loading tickets:', error);
        this.tickets = [];
      }
    });
  }

  getTicketsByStatus(status: string): any[] {
    return this.tickets.filter(ticket => ticket.status === status);
  }

  getMyTickets(): any[] {
    return this.tickets.filter(ticket => ticket.agent_id === this.currentUser?.id);
  }

  updateTicketStatus(ticketId: number, status: string): void {
    console.log('Updating ticket status:', ticketId, status);
    this.ticketService.updateTicket(ticketId, { status }).subscribe({
      next: (response) => {
        console.log('Ticket status updated:', response);
        this.loadTickets();
      },
      error: (error) => {
        console.error('Error updating ticket:', error);
        alert('Failed to update ticket status');
      }
    });
  }

  assignToMe(ticketId: number): void {
    if (!this.currentUser) return;
    
    console.log('Assigning ticket to agent:', ticketId, this.currentUser.id);
    this.ticketService.updateTicket(ticketId, { agent_id: this.currentUser.id }).subscribe({
      next: (response) => {
        console.log('Ticket assigned:', response);
        this.loadTickets();
      },
      error: (error) => {
        console.error('Error assigning ticket:', error);
        alert('Failed to assign ticket');
      }
    });
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
      'dashboard': 'Agent Dashboard',
      'tickets': 'All Tickets',
      'assigned': 'My Tickets'
    };
    return titles[this.activeView as keyof typeof titles] || 'Dashboard';
  }
  
  getActiveViewSubtitle(): string {
    const subtitles = {
      'dashboard': 'Overview and recent activity',
      'tickets': 'Complete ticket queue',
      'assigned': 'Your assigned tickets'
    };
    return subtitles[this.activeView as keyof typeof subtitles] || '';
  }

  logout(): void {
    this.authService.logout();
    window.location.href = '/login';
  }
}