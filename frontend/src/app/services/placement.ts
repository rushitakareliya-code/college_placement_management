import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlacementService {
  apiUrl = 'http://localhost:5000/api/placements';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(isJson = true): { headers: HttpHeaders } {
    const token = localStorage.getItem('token') || '';
    let headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
    if (isJson) {
      headers = headers.set('Content-Type', 'application/json');
    }
    return { headers };
  }

  getStudentApplications(studentId: string): Observable<any> {
    const url = `${this.apiUrl}?studentId=${studentId}`;
    return this.http.get<any>(url, this.getAuthHeaders());
  }

  getAllApplications(): Observable<any> {
    return this.http.get<any>(this.apiUrl, this.getAuthHeaders());
  }

  updateApplicationStatus(id: string, status: 'Pending' | 'Selected' | 'Rejected'): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}/status`, { status }, this.getAuthHeaders());
  }
}
