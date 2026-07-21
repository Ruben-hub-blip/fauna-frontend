import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { ReporteService, IncidenteResponse } from '../../../reporte/services/reporte.service';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../../shared/components/footer/footer';

@Component({
  selector: 'app-mis-reportes-page',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: 'mis-reportes-page.html',
  styleUrl: 'mis-reportes-page.css'
})
export class MisReportesPage implements OnInit {
  misReportes: IncidenteResponse[] = [];
  cargando: boolean = true;

  constructor(
    private authService: AuthService,
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.cargarMisReportesCiudadano();
  }

  cargarMisReportesCiudadano(): void {
    this.cargando = true;
    this.authService.usuario$.subscribe(user => {
      if (!user) {
        this.cargando = false;
        return;
      }

      this.reporteService.obtenerReportes().subscribe({
        next: (reportes) => {
          this.misReportes = reportes.filter(r => r.id_usuario_ciudadano === Number(user.uid));
          this.cargando = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error al cargar mis reportes:', err);
          this.cargando = false;
        }
      });
    });
  }

  getImagenSrc(base64: string | undefined): string {
    if (!base64) return 'https://via.placeholder.com/150?text=Sin+Imagen';
    return base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
  }
}