import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface EspecieResponse {
  id_especie: number;
  nombre_comun: string;
  nombre_cientifico?: string;
  estado_conservacion: string;
  descripcion?: string;
  url_imagen?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminFormService {
  private apiUrl = `${environment.apiUrl}/especies`;

  constructor(private http: HttpClient) {}

  // ==========================================
  // 🟢 [CREATE] - Guardar Especie Real en DB
  // ==========================================
  guardarNuevaEspecie(datosFormulario: any): Observable<EspecieResponse> {
    const payloadEspecie = {
      nombre_comun: datosFormulario.nombre,
      nombre_cientifico: datosFormulario.nombreCientifico || null,
      estado_conservacion: datosFormulario.estadoConservacion,
      descripcion: datosFormulario.descripcion || null,
      url_imagen: datosFormulario.imagen || null
    };

    return this.http.post<EspecieResponse>(`${this.apiUrl}/`, payloadEspecie);
  }

  // ==========================================
  // 🔵 [READ] - Obtener Catálogo Completo
  // ==========================================
  obtenerCatalogo(): Observable<EspecieResponse[]> {
    return this.http.get<EspecieResponse[]>(`${this.apiUrl}/`);
  }

  // ==========================================
  // 🟡 [UPDATE] - Actualizar Especie por su ID
  // ==========================================
  actualizarEspecie(idEspecie: number, datosFormulario: any): Observable<EspecieResponse> {
    const payloadEspecie = {
      nombre_comun: datosFormulario.nombre,
      nombre_cientifico: datosFormulario.nombreCientifico || null,
      estado_conservacion: datosFormulario.estadoConservacion,
      descripcion: datosFormulario.descripcion || null,
      url_imagen: datosFormulario.imagen || null
    };

    return this.http.put<EspecieResponse>(`${this.apiUrl}/${idEspecie}`, payloadEspecie);
  }

  // ==========================================
  // 🔴 [DELETE] - Eliminar Especie por su ID
  // ==========================================
  eliminarEspecie(idEspecie: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${idEspecie}`);
  }
}
