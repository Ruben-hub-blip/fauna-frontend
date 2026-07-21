import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IncidenteResponse {
  id_incidente: number;
  nombre_especie: string; 
  ubicacion: string;
  descripcion: string;
  estado: 'Recibido' | 'Aprobado' | 'Rechazado';
  imagen_base64?: string; 
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'http://localhost:8000/api/v1/incidentes';

  constructor(private http: HttpClient) {}

  obtenerReportes(): Observable<IncidenteResponse[]> {
    return this.http.get<IncidenteResponse[]>(this.apiUrl);
  }

  moderarIncidente(id: number, accion: 'Aprobado' | 'Rechazado', idOficial: number): Observable<any> {
    if (accion === 'Rechazado') {
      return this.http.delete(`${this.apiUrl}/${id}`);
    }
    return this.http.patch(`${this.apiUrl}/${id}/moderar`, { 
      nuevo_estado: accion, 
      id_usuario_oficial: idOficial 
    });
  }
}