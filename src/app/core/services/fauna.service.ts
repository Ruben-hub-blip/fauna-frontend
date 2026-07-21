import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
export class FaunaService {
  // Endpoint apuntando únicamente a especies
  private apiUrl = 'http://localhost:8000/api/v1/especies';

  constructor(private http: HttpClient) {}

  // 🔵 [READ] - Obtener Catálogo Completo para la Enciclopedia o Selects
  obtenerCatalogo(): Observable<EspecieResponse[]> {
    return this.http.get<EspecieResponse[]>(`${this.apiUrl}/`);
  }

  // 🟢 [CREATE] - Guardar Especie desde panel administrativo
  guardarNuevaEspecie(especie: any): Observable<EspecieResponse> {
    return this.http.post<EspecieResponse>(`${this.apiUrl}/`, especie);
  }

  // 🟡 [UPDATE] - Actualizar Especie
  actualizarEspecie(id: number, especie: any): Observable<EspecieResponse> {
    return this.http.put<EspecieResponse>(`${this.apiUrl}/${id}`, especie);
  }

  // 🔴 [DELETE] - Eliminar Especie
  eliminarEspecie(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}