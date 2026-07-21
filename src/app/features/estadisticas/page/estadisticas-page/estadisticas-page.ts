import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EstadisticasService, MetricaZona } from '../../services/estadisticas.service'; 
import { FooterComponent } from "../../../../shared/components/footer/footer";
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";

// Interfaz explícita para tipar la variable del resumen y complacer al compilador estricto
export interface ResumenGeneral {
  totalCasos: number;
  atendidos: number;
  enProceso: number;
  criticos: number;
}

@Component({
  selector: 'app-estadisticas-page',
  standalone: true,
  imports: [CommonModule, FooterComponent, NavbarComponent],
  templateUrl: './estadisticas-page.html',
  styleUrl: './estadisticas-page.css'
})
export class EstadisticasPage implements OnInit {
  // Mantienen tus mismos nombres exactos de variables para que el HTML no sufra
  zonasMetrics: MetricaZona[] = [];
  resumen: Partial<ResumenGeneral> = {}; 

  constructor(private statsService: EstadisticasService) {}

  ngOnInit(): void {
    this.cargarMetricasReales();
  }

  /**
   * Consulta al servicio en caliente de forma asíncrona para pintar 
   * los gráficos de barras y los contadores en tiempo real desde FastAPI.
   */
  cargarMetricasReales(): void {
    // 🟢 1. Nos suscribimos de manera asíncrona a las métricas de zonas de la base de datos
    this.statsService.obtenerMétricasZonas().subscribe({
      next: (datos: MetricaZona[]) => { // 🟢 Tipado explícito para eliminar error TS7006
        this.zonasMetrics = datos; // Se asigna el array procesado en tiempo real
        console.log('📊 Métricas de zonas cargadas con éxito:', this.zonasMetrics);
      },
      error: (err: any) => { // 🟢 Tipado explícito para eliminar error TS7006
        console.error('Error al obtener métricas de zonas desde FastAPI:', err);
      }
    });

    // 🟢 2. Nos suscribimos de manera asíncrona al resumen general de estados
    this.statsService.obtenerResumenGeneral().subscribe({
      next: (datos: ResumenGeneral) => { // 🟢 Tipado explícito para eliminar error TS7006
        this.resumen = datos; // Se asigna el objeto con los contadores de casos
        console.log('📈 Resumen general de incidentes cargado:', this.resumen);
      },
      error: (err: any) => { // 🟢 Tipado explícito para eliminar error TS7006
        console.error('Error al obtener el resumen de incidentes desde FastAPI:', err);
      }
    });
  }
}