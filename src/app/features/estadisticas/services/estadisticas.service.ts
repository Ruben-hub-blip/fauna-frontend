import { Injectable } from '@angular/core';
// 🟢 CORRECCIÓN CLAVE: Cambiamos FaunaService por el nuevo ReporteService independiente
import { ReporteService, IncidenteResponse } from '../../reporte/services/reporte.service'; 
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // 🧠 Importamos el operador reactivo 'map' para transformar flujos

export interface MetricaZona {
  zona: string;
  totalReportes: number;
  porcentaje: number;
  percentage: number; // 🟢 Doble mapeo por compatibilidad con el HTML
  colorBarra: string;
}

@Injectable({
  providedIn: 'root'
})
export class EstadisticasService {

  // 🟢 CORRECCIÓN CLAVE: Inyectamos el ReporteService dedicado a incidentes
  constructor(private reporteService: ReporteService) {}

  /**
   * 📊 METRICAS DE ZONAS REALES (ASÍNCRONO):
   * Mapea y calcula de forma dinámica analizando las coordenadas numéricas de NeonDB.
   */
  obtenerMétricasZonas(): Observable<MetricaZona[]> {
    // 🟢 Cambiado de 'this.faunaService' a 'this.reporteService'
    return this.reporteService.obtenerReportes().pipe(
      map((reportesReales: IncidenteResponse[]) => {
        const totalGlobal = reportesReales.length;

        // Moldes de inicialización para el conteo por cuadrantes geográficos
        let conteoNorte = 0;       
        let conteoRiomar = 0;      
        let conteoSuroccidente = 0;
        let conteoViaAlMar = 0;    

        reportesReales.forEach((r: IncidenteResponse) => {
          try {
            if (r.ubicacion && r.ubicacion.includes(',')) {
              const partes = r.ubicacion.split(',');
              const lat = parseFloat(partes[0].trim());
              const lng = parseFloat(partes[1].trim());

              if (!isNaN(lat) && !isNaN(lng)) {
                // Algoritmo de demarcación por cuadrantes numéricos
                if (lat > 11.00) {
                  if (lng < -74.82) {
                    conteoViaAlMar++;
                  } else {
                    conteoRiomar++;
                  }
                } else {
                  if (lng < -74.815) {
                    conteoSuroccidente++;
                  } else {
                    conteoNorte++;
                  }
                }
                return;
              }
            }
          } catch (e) {
            console.warn('Ubicación mal formateada en estadística:', r.ubicacion);
          }
          
          // Respaldo por si hay algún registro viejo con texto plano
          const texto = (r.ubicacion || '').toLowerCase();
          if (texto.includes('riomar')) conteoRiomar++;
          else if (texto.includes('suroccidente')) conteoSuroccidente++;
          else if (texto.includes('mar')) conteoViaAlMar++;
          else conteoNorte++;
        });

        const zonasPlantilla = [
          { nombre: 'Localidad Norte-Centro Histórico', conteo: conteoNorte, color: 'bg-success' },
          { nombre: 'Localidad Riomar', conteo: conteoRiomar, color: 'bg-info' },
          { nombre: 'Localidad Suroccidente', conteo: conteoSuroccidente, color: 'bg-warning' },
          { nombre: 'Vía al Mar y Zonas de Reserva', conteo: conteoViaAlMar, color: 'bg-danger' }
        ];

        return zonasPlantilla.map(z => {
          const porcentajeCalculado = totalGlobal > 0 ? Math.round((z.conteo / totalGlobal) * 100) : 0;

          return {
            zona: z.nombre,
            totalReportes: z.conteo,
            porcentaje: porcentajeCalculado,
            percentage: porcentajeCalculado, 
            colorBarra: z.color
          };
        });
      })
    );
  }

  /**
   * 📈 RESUMEN DE ESTADOS REALES (ASÍNCRONO):
   * Segmenta el total global y los contadores en caliente leyendo los atributos de prioridad y estado
   */
  obtenerResumenGeneral(): Observable<{ totalCasos: number; atendidos: number; enProceso: number; criticos: number }> {
    // 🟢 Cambiado de 'this.faunaService' a 'this.reporteService'
    return this.reporteService.obtenerReportes().pipe(
      map((reportesReales: IncidenteResponse[]) => {
        const total = reportesReales.length;
        const resueltos = reportesReales.filter((r: IncidenteResponse) => (r.estado || '').toLowerCase() === 'resuelto').length;
        const enProceso = reportesReales.filter((r: IncidenteResponse) => (r.estado || '').toLowerCase() === 'en proceso').length;
        const recibidos = reportesReales.filter((r: IncidenteResponse) => (r.estado || '').toLowerCase() === 'recibido').length;
        
        const criticos = reportesReales.filter((r: IncidenteResponse) => (r.prioridad || '').toLowerCase() === 'alta').length;

        return {
          totalCasos: total,
          atendidos: resueltos + enProceso,
          enProceso: recibidos, 
          criticos: criticos
        };
      })
    );
  }
}