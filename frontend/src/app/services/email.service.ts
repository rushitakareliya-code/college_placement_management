import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SmtpConfig {
  _id?: string;
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  isActive?: boolean;
  updatedAt?: string;
}

export interface QueueStatus {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  redisOffline?: boolean;
  error?: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly base = 'http://localhost:5000/api/email-settings';

  constructor(private http: HttpClient) {}

  private headers(): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      }),
    };
  }

  /** Fetch current active SMTP config (password excluded). */
  getConfig(): Observable<SmtpConfig | null> {
    return this.http.get<SmtpConfig | null>(this.base, this.headers());
  }

  /** Save / upsert the SMTP config. */
  saveConfig(config: SmtpConfig): Observable<{ message: string; config: SmtpConfig }> {
    return this.http.post<{ message: string; config: SmtpConfig }>(this.base, config, this.headers());
  }

  /** Delete / reset the SMTP config. */
  deleteConfig(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(this.base, this.headers());
  }

  /** Send a test email using saved config. */
  sendTestEmail(to: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/test`, { to }, this.headers());
  }

  /** Get Bull queue job counts. */
  getQueueStatus(): Observable<QueueStatus> {
    return this.http.get<QueueStatus>(`${this.base}/queue-status`, this.headers());
  }
}
