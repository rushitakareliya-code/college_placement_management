import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NoticeService {
  apiUrl = 'http://localhost:5000/api/notices';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(isJson = true): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    if (isJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return {
      headers
    };
  }

  getNotices(): Observable<any> {
    return this.http.get(this.apiUrl, this.getAuthHeaders());
  }

  addNotice(data: FormData): Observable<any> {
    return this.http.post(this.apiUrl, data, this.getAuthHeaders(false));
  }

  updateNotice(id: string, data: FormData): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, data, this.getAuthHeaders(false));
  }

  deleteNotice(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`, this.getAuthHeaders());
  }
}
