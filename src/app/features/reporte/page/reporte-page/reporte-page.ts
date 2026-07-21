import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms'; 
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { ReporteService } from '../../services/reporte.service'; 
import { FaunaService, EspecieResponse } from '../../../../core/services/fauna.service';
import { AuthService } from '../../../../core/services/auth.service';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";
import { FooterComponent } from "../../../../shared/components/footer/footer"; 
import * as L from 'leaflet'; 

export interface UsuarioDB {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
}

@Component({
  selector: 'app-reporte-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NavbarComponent, FooterComponent],
  templateUrl: './reporte-page.html',
  styleUrl: './reporte-page.css'
})
export class ReportePage implements OnInit, AfterViewInit {
  reporteForm!: FormGroup;
  mostrarExito: boolean = false;
  cargandoEnvio: boolean = false;
  listaEspecies: EspecieResponse[] = [];
  
  private mapSelector!: L.Map;
  private markerSelector!: L.Marker;

  imagenBase64: string = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROi2ySuePNfFIZLgrdrK7t4E9E4ZoSXiJPj2foJSpowm_vZpiekw6w058-c1yAw0rC66fH3wF4woErD-F_H8DTiJKHjoyzf0WVy2I_0OzmBA&s=10';

  constructor(
    private fb: FormBuilder,
    private reporteService: ReporteService,
    private faunaService: FaunaService,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.reporteForm = this.fb.group({
      especie: ['', [Validators.required, Validators.minLength(3)]],
      ubicacion: ['', [Validators.required, Validators.minLength(3)]],
      prioridad: ['Baja', [Validators.required]],
      descripcion: ['', [Validators.maxLength(250)]],
      contactoAnonimo: [false]
    });

    this.cargarSugerenciasEspecies();
  }

  ngAfterViewInit(): void {
    this.initSelectorMap();
  }

  cargarSugerenciasEspecies(): void {
    this.faunaService.obtenerCatalogo().subscribe({
      next: (data) => this.listaEspecies = data,
      error: (err) => console.error('Error al traer catálogo para el formulario', err)
    });
  }

  private initSelectorMap(): void {
    this.mapSelector = L.map('map-selector', {
      center: [10.9878, -74.8070],
      zoom: 13,
      zoomControl: true
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.mapSelector);

    this.markerSelector = L.marker([10.9878, -74.8070]).addTo(this.mapSelector);

    this.mapSelector.on('click', (e: L.LeafletMouseEvent) => {
      const lat = e.latlng.lat.toFixed(6);
      const lng = e.latlng.lng.toFixed(6);
      const coordenadasStr = `${lat},${lng}`;

      this.markerSelector.setLatLng(e.latlng);
      this.reporteForm.patchValue({ ubicacion: coordenadasStr });
    });

    setTimeout(() => {
      if (this.mapSelector) this.mapSelector.invalidateSize();
    }, 400);
  }

  alSeleccionarImagen(event: any): void {
    const archivo = event.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imagenBase64 = reader.result as string;
      };
      reader.readAsDataURL(archivo);
    }
  }

  async enviarFormulario(): Promise<void> {
    this.mostrarExito = false;

    if (this.reporteForm.invalid) {
      this.reporteForm.markAllAsTouched();
      return;
    }

    this.cargandoEnvio = true;

    try {
      // 1. Obtener el usuario autenticado de Firebase
      const user = await firstValueFrom(this.authService.usuario$);
      if (!user || !user.email) {
        alert('Debes estar autenticado para enviar un reporte.');
        this.cargandoEnvio = false;
        return;
      }

      // 2. Obtener el id_usuario real guardado en PostgreSQL (NeonDB)
      const correoLimpio = user.email.toLowerCase().trim();
      const usuarios = await firstValueFrom(this.http.get<UsuarioDB[]>('http://localhost:8000/api/v1/usuarios'));
      const usuarioDb = usuarios.find(u => u.correo_electronico.toLowerCase().trim() === correoLimpio);

      if (!usuarioDb) {
        alert('No se encontró el registro de tu usuario en la base de datos PostgreSQL.');
        this.cargandoEnvio = false;
        return;
      }

      const valores = this.reporteForm.value;

      const nuevoCaso = {
        id_usuario_ciudadano: usuarioDb.id_usuario, // 🎯 USA EL ID REAL DE POSTGRESQL
        nombre_especie: valores.especie, 
        ubicacion: valores.ubicacion, 
        prioridad: valores.prioridad,
        descripcion: valores.descripcion || '', 
        imagen_base64: this.imagenBase64 
      };

      console.log('✈️ Enviando payload con ID real al ReporteService:', nuevoCaso);

      // 3. Enviar a la API
      this.reporteService.agregarReporte(nuevoCaso).subscribe({
        next: (respuesta) => {
          console.log('🌱 ¡Incidente guardado exitosamente!', respuesta);
          this.cargandoEnvio = false;
          this.mostrarExito = true;

          setTimeout(() => {
            this.mostrarExito = false;
            this.reporteForm.reset({ prioridad: 'Baja', contactoAnonimo: false });
            this.imagenBase64 = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcROi2ySuePNfFIZLgrdrK7t4E9E4ZoSXiJPj2foJSpowm_vZpiekw6w058-c1yAw0rC66fH3wF4woErD-F_H8DTiJKHjoyzf0WVy2I_0OzmBA&s=10';
            this.router.navigate(['/principal']);
          }, 2500);
        },
        error: (err) => {
          this.cargandoEnvio = false;
          console.error('❌ Error al intentar guardar el reporte:', err);
          alert('Hubo un error al guardar el reporte en el servidor.');
        }
      });

    } catch (err) {
      this.cargandoEnvio = false;
      console.error('❌ Error obteniendo datos del usuario:', err);
      alert('Error al verificar las credenciales del usuario.');
    }
  }

  campoInvalido(campo: string): boolean {
    const control = this.reporteForm.get(campo);
    return !!(control && control.errors && (control.dirty || control.touched));
  }
}