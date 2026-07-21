import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService, IncidenteResponse } from '../../services/reportes.service'; 
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";
import { FooterComponent } from "../../../../shared/components/footer/footer";

@Component({
  selector: 'app-autoridades-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './autoridades-page.html',
  styleUrl: './autoridades-page.css'
})
export class AutoridadesPage implements OnInit {
  listaIncidentes: IncidenteResponse[] = [];
  reporteSeleccionado: IncidenteResponse | null = null;
  cargando: boolean = false;
  idOficialLogueado: number = 1; 

  constructor(
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarIncidentes();
  }

  cargarIncidentes(): void {
    this.cargando = true;
    this.reporteService.obtenerReportes().subscribe({
      next: (datos) => {
        this.listaIncidentes = datos.filter(inc => inc.estado === 'Recibido');
        this.cargando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al cargar:', err);
        this.cargando = false;
      }
    });
  }

  seleccionarReporte(incidente: IncidenteResponse): void {
    this.reporteSeleccionado = incidente;
  }

  procesarIncidente(accion: 'Aprobado' | 'Rechazado'): void {
    if (!this.reporteSeleccionado) return;

    const id = this.reporteSeleccionado.id_incidente;
    this.reporteService.moderarIncidente(id, accion, this.idOficialLogueado).subscribe({
      next: () => {
        // Limpiamos la selección y quitamos de la lista
        this.listaIncidentes = this.listaIncidentes.filter(i => i.id_incidente !== id);
        this.reporteSeleccionado = null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error:', err);
        alert('Error al procesar el reporte.');
      }
    });
  }

  getImagenSrc(base64: string | undefined): string {
    if (!base64 || base64.trim() === '') {
      return 'https://via.placeholder.com/400x300?text=Sin+Imagen';
    }

    if (base64.startsWith('data:image')) {
      return base64;
    }

    // Si viene solo el hash Base64 crudo, agregar el prefijo correcto
    return `data:image/jpeg;base64,${base64}`;
  }
}