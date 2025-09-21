import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket;
  private connectionStatus = new BehaviorSubject<boolean>(false);

  constructor() {
    this.socket = io('http://localhost:5001', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.connectionStatus.next(true);
    });

    this.socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      this.connectionStatus.next(false);
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error);
      this.connectionStatus.next(false);
    });
  }

  isConnected(): Observable<boolean> {
    return this.connectionStatus.asObservable();
  }

  joinRoom(ticketId: number): void {
    console.log('🏠 Joining room for ticket:', ticketId);
    this.socket.emit('joinRoom', ticketId);
  }

  leaveRoom(ticketId: number): void {
    console.log('🚪 Leaving room for ticket:', ticketId);
    this.socket.emit('leaveRoom', ticketId);
  }

  sendMessage(messageData: any): void {
    console.log('📤 Sending message:', messageData);
    this.socket.emit('sendMessage', messageData);
  }

  onReceiveMessage(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('receiveMessage', (data) => {
        console.log('📥 Received message:', data);
        observer.next(data);
      });
    });
  }

  onMessageError(): Observable<any> {
    return new Observable(observer => {
      this.socket.on('messageError', (error) => {
        console.error('💬 Message error:', error);
        observer.next(error);
      });
    });
  }

  disconnect(): void {
    console.log('🔌 Disconnecting socket');
    this.socket.disconnect();
  }

  reconnect(): void {
    console.log('🔄 Reconnecting socket');
    this.socket.connect();
  }
}