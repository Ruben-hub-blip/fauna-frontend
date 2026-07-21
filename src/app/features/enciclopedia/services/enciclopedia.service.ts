import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Interfaz del Frontend (Mantenemos tus nombres para no dañar tu HTML)
export interface Especie {
  id?: number; 
  nombre: string;
  nombreCientifico: string;
  estadoConservacion: 'En Peligro Crítico' | 'Vulnerable' | 'Preocupación Menor';
  descripcion: string;
  imagen: string;
  zonaHabitat?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnciclopediaService {
  // URL de tu API de FastAPI para especies
  private apiUrl = 'https://fauna-backend.onrender.com/especies'; 

  constructor(private http: HttpClient) {}

  /**
   * 🔵 [READ] - Obtiene las especies reales desde la base de datos de FastAPI
   * Transforma dinámicamente el formato snake_case del Backend a CamelCase para el Frontend.
   */
  obtenerEspecies(): Observable<Especie[]> {
    return this.http.get<any[]>(`${this.apiUrl}/`).pipe(
      map((especiesBackend: any[]) => {
        return especiesBackend.map(e => ({
          id: e.id_especie,
          nombre: e.nombre_comun,
          nombreCientifico: e.nombre_cientifico || 'No registrado',
          estadoConservacion: e.estado_conservacion as any,
          descripcion: e.descripcion || 'Sin descripción disponible',
          imagen: e.url_imagen || 'assets/default-animal.png'
        }));
      })
    );
  }

  // Alias para mantener compatibilidad con cualquier otra parte del sistema
  obtenerCatalogo(): Observable<Especie[]> {
    return this.obtenerEspecies();
  }
}
