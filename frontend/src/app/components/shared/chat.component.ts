import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TicketService } from '../../services/ticket.service';
import { SocketService } from '../../services/socket.service';
import { AuthService } from '../../services/auth.service';
import { Subscription } from 'rxjs';

interface ChatMessage {
  id?: number;
  ticket_id?: number;
  sender_id: number;
  message: string;
  timestamp: string | Date;
  sender_name?: string;
  sender_role?: string;
  name?: string;
  role?: string;
}

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
      <!-- Chat Header -->
      <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-4">
            <div class="relative">
              <div class="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <mat-icon class="text-lg">support_agent</mat-icon>
              </div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            <div>
              <h3 class="font-semibold text-lg">Support Team</h3>
              <p class="text-xs opacity-90 flex items-center gap-2">
                <span class="w-2 h-2 bg-green-400 rounded-full"></span>
                Online • Ticket #{{ticketId}}
              </p>
            </div>
          </div>
          <button 
            (click)="closeChat()" 
            class="p-1 hover:bg-white/10 rounded-full transition-all duration-200">
            <mat-icon class="text-lg">close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Messages Area -->
      <div class="h-[350px] overflow-y-auto p-4 bg-gradient-to-b from-gray-50 to-white space-y-3 custom-scrollbar">
        <!-- Welcome Message -->
        <div *ngIf="messages.length === 0" class="text-center py-20 animate-fade-in">
          <div class="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce-in">
            <mat-icon class="text-white text-4xl">chat_bubble_outline</mat-icon>
          </div>
          <h4 class="text-xl font-semibold text-gray-800 mb-3">Start your conversation</h4>
          <p class="text-gray-600 text-lg">We're here to help you with any questions</p>
        </div>

        <!-- Chat Messages -->
        <div *ngFor="let message of messages; let i = index" 
             class="flex animate-fade-in mb-4"
             [style.animation-delay]="i * 0.1 + 's'"
             [class.justify-end]="message.sender_id === currentUser?.id"
             [class.justify-start]="message.sender_id !== currentUser?.id">
          
          <!-- Other user avatar -->
          <div *ngIf="message.sender_id !== currentUser?.id" class="flex-shrink-0 mr-4">
            <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
              {{getInitials(message.sender_name || 'Support')}}
            </div>
          </div>

          <!-- Message bubble -->
          <div class="max-w-sm px-5 py-4 rounded-2xl shadow-md transition-all duration-200 hover:shadow-lg"
               [ngClass]="{
                 'chat-message-sent': message.sender_id === currentUser?.id,
                 'chat-message-received': message.sender_id !== currentUser?.id
               }">
            
            <!-- Sender name for incoming messages -->
            <div *ngIf="message.sender_id !== currentUser?.id" class="text-xs font-medium text-gray-600 mb-1">
              {{message.sender_name || 'Support'}}
            </div>
            
            <p class="text-sm leading-relaxed mb-2">{{message.message}}</p>
            
            <div class="flex items-center justify-end space-x-2">
              <span class="text-xs opacity-75">{{message.timestamp | date:'shortTime'}}</span>
              <mat-icon *ngIf="message.sender_id === currentUser?.id" 
                        class="text-xs opacity-75 w-4 h-4">
                done_all
              </mat-icon>
            </div>
          </div>
          
          <!-- Current user avatar -->
          <div *ngIf="message.sender_id === currentUser?.id" class="flex-shrink-0 ml-4">
            <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold shadow-lg">
              {{getInitials(currentUser?.name || 'You')}}
            </div>
          </div>
        </div>

        <!-- Typing indicator -->
        <div *ngIf="isTyping" class="flex justify-start animate-fade-in">
          <div class="bg-white rounded-2xl px-4 py-3 shadow-md border border-gray-100">
            <div class="flex items-center space-x-2">
              <div class="flex space-x-1">
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
                <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
              </div>
              <span class="text-xs text-gray-500">Support is typing...</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Message Input -->
      <div class="p-4 bg-white border-t border-gray-100">
        <div class="flex items-center space-x-3 bg-gray-50 rounded-xl px-4 py-3 border border-gray-200 focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all duration-200">
          <button class="text-gray-400 hover:text-gray-600 transition-colors p-1">
            <mat-icon class="text-lg">attach_file</mat-icon>
          </button>
          
          <input 
            [(ngModel)]="newMessage"
            (keydown.enter)="sendMessage()"
            (input)="onTyping()"
            placeholder="Type your message..."
            [disabled]="!isConnected"
            class="flex-1 bg-transparent border-none outline-none text-gray-800 placeholder-gray-500 text-base py-1">
          
          <button 
            (click)="sendMessage()"
            [disabled]="!newMessage.trim() || !isConnected"
            class="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full flex items-center justify-center hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg">
            <mat-icon class="text-sm">{{newMessage.trim() ? 'send' : 'mic'}}</mat-icon>
          </button>
        </div>

        <!-- Connection status -->
        <div *ngIf="!isConnected" class="flex items-center justify-center mt-3 text-orange-600 text-sm font-medium">
          <mat-icon class="text-base mr-2">wifi_off</mat-icon>
          <span>Connecting...</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
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
export class ChatComponent implements OnInit, OnDestroy {
  @Input() ticketId!: number;
  @Output() chatClosed = new EventEmitter<void>();
  
  messages: ChatMessage[] = [];
  newMessage: string = '';
  currentUser: any;
  isConnected: boolean = false;
  isTyping: boolean = false;
  private messageSubscription?: Subscription;
  private errorSubscription?: Subscription;
  private typingTimeout?: any;

  constructor(
    private ticketService: TicketService,
    private socketService: SocketService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    if (!this.ticketId) {
      console.error('No ticket ID provided for chat');
      return;
    }

    this.loadMessages();
    this.initializeSocket();
  }

  ngOnDestroy(): void {
    if (this.ticketId) {
      this.socketService.leaveRoom(this.ticketId);
    }
    if (this.messageSubscription) {
      this.messageSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
  }

  initializeSocket(): void {
    this.socketService.joinRoom(this.ticketId);
    this.isConnected = true;
    
    this.messageSubscription = this.socketService.onReceiveMessage().subscribe(
      (message: any) => {
        console.log('Received message:', message);
        
        // Normalize the message format to ensure sender_id is correct
        const normalizedMessage = {
          ...message,
          sender_id: message.sender_id || message.senderId,
          sender_name: message.sender_name || message.senderName,
          sender_role: message.sender_role || message.senderRole
        };
        
        this.messages.push(normalizedMessage);
        this.scrollToBottom();
      }
    );

    this.errorSubscription = this.socketService.onMessageError().subscribe(
      (error: any) => {
        console.error('Chat error:', error);
      }
    );
  }

  loadMessages(): void {
    this.ticketService.getMessages(this.ticketId).subscribe({
      next: (messages: ChatMessage[]) => {
        console.log('Loaded messages:', messages);
        this.messages = messages.map((msg: ChatMessage) => ({
          ...msg,
          sender_name: msg.sender_name || msg.name || 'User',
          sender_role: msg.sender_role || msg.role || 'customer'
        }));
        this.scrollToBottom();
      },
      error: (error: any) => {
        console.error('Error loading messages:', error);
        this.messages = [];
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.currentUser || !this.isConnected) {
      return;
    }

    const messageData = {
      ticketId: this.ticketId,
      senderId: this.currentUser.id,
      message: this.newMessage.trim(),
      senderName: this.currentUser.name,
      senderRole: this.currentUser.role
    };

    console.log('Sending message:', messageData);
    this.socketService.sendMessage(messageData);
    this.newMessage = '';
  }

  onTyping(): void {
    // Simulate typing indicator
    if (this.typingTimeout) {
      clearTimeout(this.typingTimeout);
    }
    
    this.typingTimeout = setTimeout(() => {
      this.isTyping = false;
    }, 1000);
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  closeChat(): void {
    this.chatClosed.emit();
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = document.querySelector('.custom-scrollbar');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }
}