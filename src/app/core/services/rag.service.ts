import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RagService {
  private apiUrl = 'http://localhost:8000/ask'; // Asegúrate que coincida con tu FastAPI

  constructor(private http: HttpClient) { }

  preguntar(pregunta: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { question: pregunta });
  }
}