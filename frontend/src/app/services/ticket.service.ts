import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = 'http://localhost:5001/api/tickets';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  createTicket(ticketData: any): Observable<any> {
    return this.http.post(this.apiUrl, ticketData, { headers: this.getHeaders() });
  }

  getTickets(): Observable<any> {
    return this.http.get(this.apiUrl, { headers: this.getHeaders() });
  }

  updateTicket(ticketId: number, updateData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${ticketId}`, updateData, { headers: this.getHeaders() });
  }

  getSLAStatus(ticketId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${ticketId}/sla-status`, { headers: this.getHeaders() });
  }

  sendMessage(ticketId: number, message: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/${ticketId}/chat`, { message }, { headers: this.getHeaders() });
  }

  getMessages(ticketId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${ticketId}/chat`, { headers: this.getHeaders() });
  }

  getDashboardStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard-stats`, { headers: this.getHeaders() });
  }

  getAgentStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/agent-stats`, { headers: this.getHeaders() });
  }

  getAdminStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin-stats`, { headers: this.getHeaders() });
  }

  getMonthlyReport(): Observable<any> {
    return this.http.get(`${this.apiUrl}/monthly-report`, { headers: this.getHeaders() });
  }

  getUserStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-stats`, { headers: this.getHeaders() });
  }
}