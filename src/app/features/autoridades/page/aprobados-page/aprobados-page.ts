import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { ReporteService, IncidenteResponse } from '../../../reporte/services/reporte.service';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";
import { FooterComponent } from "../../../../shared/components/footer/footer";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-aprobados-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './aprobados-page.html',
  styleUrl: './aprobados-page.css'
})
export class AprobadosPage implements OnInit {
  listaAprobados: IncidenteResponse[] = [];
  casosFiltrados: IncidenteResponse[] = [];
  ubicacionesDisponibles: string[] = [];
  
  // Filtros
  filtroEspecie: string = '';
  filtroUbicacion: string = '';
  filtroEstado: string = 'Todos'; // 'Todos', 'Aprobado', 'Resuelto'
  
  casoSeleccionado: IncidenteResponse | null = null;

  constructor(
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarAprobados();
  }

  cargarAprobados(): void {
    this.reporteService.obtenerReportes().subscribe({
      next: (datos) => {
        // Obtenemos tanto casos Aprobados (activos) como Resueltos
        this.listaAprobados = datos.filter(inc => inc.estado === 'Aprobado' || inc.estado === 'Resuelto');
        this.filtrarCasos();
        
        const ubicacionesSet = new Set(this.listaAprobados.map(i => i.ubicacion).filter(Boolean));
        this.ubicacionesDisponibles = Array.from(ubicacionesSet) as string[];

        this.cdr.detectChanges();
      }
    });
  }

  filtrarCasos(): void {
    const textoEspecie = this.filtroEspecie.toLowerCase().trim();
    const textoUbicacion = this.filtroUbicacion.toLowerCase().trim();

    this.casosFiltrados = this.listaAprobados.filter(inc => {
      const nombreEspecie = (inc.nombre_especie ?? '').toLowerCase();
      const ubicacionCaso = (inc.ubicacion ?? '').toLowerCase();

      const coincideEspecie = nombreEspecie.includes(textoEspecie);
      const coincideUbicacion = textoUbicacion === '' || ubicacionCaso.includes(textoUbicacion);
      const coincideEstado = this.filtroEstado === 'Todos' || inc.estado === this.filtroEstado;

      return coincideEspecie && coincideUbicacion && coincideEstado;
    });
  }

  seleccionarCaso(incidente: IncidenteResponse): void {
    this.casoSeleccionado = incidente;
  }

  cerrarDetalle(): void {
    this.casoSeleccionado = null;
  }

  getImagenSrc(base64: string | undefined): string {
    if (!base64 || base64.trim() === '') {
      return 'https://via.placeholder.com/400x250?text=Sin+Imagen+Evidencia';
    }
    return base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
  }

  // 🟢 Alternar estado entre Aprobado y Resuelto
  cambiarEstadoCaso(incidente: IncidenteResponse, nuevoEstado: 'Aprobado' | 'Resuelto'): void {
    this.reporteService.resolverIncidente(incidente.id_incidente, nuevoEstado, incidente.prioridad).subscribe({
      next: (res) => {
        incidente.estado = res.estado;
        if (this.casoSeleccionado?.id_incidente === incidente.id_incidente) {
          this.casoSeleccionado.estado = res.estado;
        }
        this.filtrarCasos();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error al actualizar estado:', err);
        alert('Ocurrió un error al actualizar el estado.');
      }
    });
  }

  // 🟡 Actualizar prioridad en la BD
  actualizarPrioridad(incidente: IncidenteResponse, nuevaPrioridad: 'Alta' | 'Media' | 'Baja'): void {
    this.reporteService.resolverIncidente(incidente.id_incidente, incidente.estado, nuevaPrioridad).subscribe({
      next: (res) => {
        incidente.prioridad = res.prioridad;
        if (this.casoSeleccionado?.id_incidente === incidente.id_incidente) {
          this.casoSeleccionado.prioridad = res.prioridad;
        }
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cambiar prioridad:', err)
    });
  }

  descargarPDF(): void {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Casos de Atención - BioGuard', 14, 15);
    
    autoTable(doc, {
      head: [['ID', 'Animal / Especie', 'Ubicación', 'Fecha', 'Estado']],
      body: this.casosFiltrados.map(c => [
        c.id_incidente, 
        c.nombre_especie ?? 'No especificado', 
        c.ubicacion, 
        new Date(c.fecha).toLocaleDateString(),
        c.estado
      ]),
      startY: 22
    });
    
    doc.save('reporte-casos-bioguard.pdf');
  }
}