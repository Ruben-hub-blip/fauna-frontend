import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IncidenteResponse {
  id_incidente: number;
  id_usuario_ciudadano: number;
  id_especie: number;
  nombre_especie?: string;
  ubicacion: string;
  fecha: string;
  prioridad: string;
  estado: string;
  id_usuario_oficial?: number;
  descripcion?: string;     
  imagen_base64?: string;   
}

@Injectable({
  providedIn: 'root'
})
export class ReporteService {
  private apiUrl = 'https://fauna-backend.onrender.com/incidentes';

  constructor(private http: HttpClient) {}

  // 🟢 [CREATE] - Crear Incidente en Base de Datos
  agregarReporte(nuevoReporte: any): Observable<IncidenteResponse> {
    const payloadIncidente = {
      id_usuario_ciudadano: nuevoReporte.id_usuario_ciudadano,
      nombre_especie: nuevoReporte.nombre_especie,       
      ubicacion: nuevoReporte.ubicacion,                 
      prioridad: nuevoReporte.prioridad,                 
      descripcion: nuevoReporte.descripcion || '',       
      imagen_base64: nuevoReporte.imagen_base64          
    };

    return this.http.post<IncidenteResponse>(`${this.apiUrl}/`, payloadIncidente);
  }

  // 🔵 [READ] - Listar todos los incidentes
  obtenerReportes(): Observable<IncidenteResponse[]> {
    return this.http.get<IncidenteResponse[]>(`${this.apiUrl}/`);
  }

  // 🟡 [UPDATE] - Actualizar Estado (Panel Oficial)
  actualizarEstadoReporte(idIncidente: number, nuevoEstado: string): Observable<IncidenteResponse> {
    return this.http.put<IncidenteResponse>(`${this.apiUrl}/${idIncidente}/estado`, { estado: nuevoEstado });
  }

  // 🔴 [DELETE] - Eliminar Reporte
  eliminarReporte(idIncidente: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idIncidente}`);
  }

  moderarIncidente(idIncidente: number, nuevoEstado: string, idOficial?: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/${idIncidente}/moderar`, {
      nuevo_estado: nuevoEstado,
      id_usuario_oficial: idOficial || null
    });
  }

  resolverIncidente(id: number, nuevoEstado: string, prioridad?: string): Observable<IncidenteResponse> {
    return this.http.patch<IncidenteResponse>(`${this.apiUrl}/${id}/resolver`, {
      nuevo_estado: nuevoEstado,
      prioridad: prioridad
    });
  }
}
