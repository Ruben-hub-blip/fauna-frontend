import { Component, OnInit, AfterViewInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService, IncidenteResponse } from '../../../reporte/services/reporte.service'; 
import * as L from 'leaflet';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";
import { FooterComponent } from "../../../../shared/components/footer/footer";

@Component({
  selector: 'app-principal-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent],
  templateUrl: './principal-page.html',
  styleUrl: './principal-page.css'
})
export class PrincipalPage implements OnInit, AfterViewInit, OnDestroy {
  listaReportes: IncidenteResponse[] = [];
  reporteSeleccionado: IncidenteResponse | null = null;
  
  private map!: L.Map;
  private marcadoresGroup!: L.LayerGroup;

  // Icono del CDN de Leaflet para garantizar la correcta renderización visual
  private iconoDefecto = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  constructor(
    // 🟢 Cambiado a ReporteService
    private reporteService: ReporteService,
    private cdr: ChangeDetectorRef, // ⚡ Inyección para forzar renderizado inmediato de la lista HTML
    private zone: NgZone             // ⚡ Inyección para mantener la sincronización de hilos asíncronos
  ) {}

  ngOnInit(): void {
    // 💡 Ejecutamos la carga de reportes de inmediato en el OnInit para ganar tiempo asíncrono
    this.cargarReportes();
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  private initMap(): void {
    this.map = L.map('map-leaflet', {
      center: [10.9878, -74.8070], // Barranquilla
      zoom: 12,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.marcadoresGroup = L.layerGroup().addTo(this.map);

    // Ajuste de tamaño físico y pintado inicial en caliente si la API ya respondió
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
        if (this.listaReportes.length > 0) {
          this.crearMarcadoresDinamicos();
        }
      }
    }, 150);
  }

  /**
   * 🔵 [READ] - Carga los reportes desde la DB de forma independiente
   */
  cargarReportes(): void {
    // 🟢 Cambiado a reporteService e inyectado tipado estricto para eliminar errores TS7006
    this.reporteService.obtenerReportes().subscribe({
      next: (datos: IncidenteResponse[]) => {
        // 🚨 CLAVE: Ejecutamos dentro de la zona de Angular para actualizar el HTML de inmediato
        this.zone.run(() => {
          this.listaReportes = datos; 
          console.log('📋 Reportes cargados en memoria de Angular:', this.listaReportes);
          
          this.crearMarcadoresDinamicos();
          this.cdr.detectChanges(); // Force angular change detection
        });
      },
      error: (err: any) => console.error('Error al cargar reportes desde FastAPI:', err)
    });
  }

  private crearMarcadoresDinamicos(): void {
    if (!this.map || !this.marcadoresGroup) return;

    this.marcadoresGroup.clearLayers();

    this.listaReportes.forEach(reporte => {
      const coords = this.obtenerCoordenadasValidas(reporte);
      
      // 🟢 Modificado: Ahora el Popup muestra el nombre común de la especie en vez del ID
      const nuevoMarcador = L.marker([coords.lat, coords.lng], { icon: this.iconoDefecto })
        .addTo(this.marcadoresGroup)
        .bindPopup(`
          <div style="font-family: sans-serif; padding: 5px; min-width: 150px;">
            <strong style="color: #198754; font-size: 1.1em;">${reporte.nombre_especie || 'Animal No Registrado'}</strong><br>
            <span style="font-size: 0.9em; color: #6c757d;">Prioridad: <b>${reporte.prioridad}</b></span><br>
            <span style="font-size: 0.9em; color: #6c757d;">Estado: <b>${reporte.estado}</b></span>
          </div>
        `);

      nuevoMarcador.on('click', () => {
        this.zone.run(() => {
          this.seleccionarReporte(reporte);
        });
      });
    });
  }

  seleccionarReporte(reporte: IncidenteResponse): void {
    this.reporteSeleccionado = reporte;
    const coords = this.obtenerCoordenadasValidas(reporte);
    
    if (this.map) {
      this.map.flyTo([coords.lat, coords.lng], 15);
    }
    this.cdr.detectChanges(); // Fuerza a que la tarjeta flotante de la derecha aparezca de inmediato
  }

  private obtenerCoordenadasValidas(reporte: IncidenteResponse): { lat: number, lng: number } {
    try {
      if (reporte.ubicacion && reporte.ubicacion.includes(',')) {
        const partes = reporte.ubicacion.split(',');
        const lat = parseFloat(partes[0].trim());
        const lng = parseFloat(partes[1].trim());
        if (!isNaN(lat) && !isNaN(lng)) {
          return { lat, lng };
        }
      }
    } catch (e) {
      console.warn('Fallo al parsear coordenadas de:', reporte.ubicacion);
    }

    return { lat: 10.9878, lng: -74.8070 };
  }
}