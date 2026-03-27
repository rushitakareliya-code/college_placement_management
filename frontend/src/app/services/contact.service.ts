import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = 'http://localhost:5000/api/contact';

  constructor(private http: HttpClient) {}

  submitContact(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, data);
  }

  getContacts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateContactStatus(id: string, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/status`, { status });
  }
}
