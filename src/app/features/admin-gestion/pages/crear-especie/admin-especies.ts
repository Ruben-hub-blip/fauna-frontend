import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FaunaService, EspecieResponse } from '../../../../core/services/fauna.service';
import { AdminFormService } from '../../services/admin-form.service'; 
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";
import { FooterComponent } from "../../../../shared/components/footer/footer";

@Component({
  selector: 'app-admin-especies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavbarComponent, FooterComponent],
  templateUrl: './admin-especies.html',
  styleUrl: './admin-especies.css'
})
export class AdminEspeciesComponent implements OnInit {
  especiesList: EspecieResponse[] = [];
  cargando: boolean = false;
  especieForm!: FormGroup;
  
  editando: boolean = false;
  especieIdSeleccionada: number | null = null;
  mensajeAlerta: string = '';
  tipoAlerta: string = 'success';

  constructor(
    private fb: FormBuilder,
    private faunaService: FaunaService,
    private adminFormService: AdminFormService,
    private cdr: ChangeDetectorRef // Inyectamos para forzar actualización de vista
  ) {}

  ngOnInit(): void {
    this.initFormulario();
    // Delay para permitir renderizado del layout antes de la petición
    setTimeout(() => {
      this.cargarCatalogo();
    }, 150);
  }

  private initFormulario(): void {
    this.especieForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nombreCientifico: [''],
      estadoConservacion: ['Preocupación Menor', [Validators.required]],
      descripcion: ['', [Validators.maxLength(300)]],
      imagen: ['']
    });
  }

  cargarCatalogo(): void {
    this.cargando = true;
    this.faunaService.obtenerCatalogo().subscribe({
      next: (data) => {
        this.especiesList = data;
        this.cargando = false;
        // Forzamos a Angular a detectar el cambio y pintar la tabla inmediatamente
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('❌ Error al cargar catálogo:', err);
        this.cargando = false;
        this.cdr.detectChanges();
      }
    });
  }

  guardarEspecie(): void {
    if (this.especieForm.invalid) {
      this.especieForm.markAllAsTouched();
      return;
    }

    if (this.editando && this.especieIdSeleccionada !== null) {
      this.adminFormService.actualizarEspecie(this.especieIdSeleccionada, this.especieForm.value).subscribe(() => {
        this.mostrarAlerta('Actualizada con éxito!', 'success');
        this.cargarCatalogo();
        this.resetearModulo();
      });
    } else {
      this.adminFormService.guardarNuevaEspecie(this.especieForm.value).subscribe(() => {
        this.mostrarAlerta('Registrada con éxito!', 'success');
        this.cargarCatalogo();
        this.resetearModulo();
      });
    }
  }

  confirmarEliminacion(especie: EspecieResponse): void {
    if (confirm(`¿Eliminar a "${especie.nombre_comun}"?`)) {
      this.adminFormService.eliminarEspecie(especie.id_especie).subscribe(() => {
        this.cargarCatalogo();
        this.mostrarAlerta('Especie removida.', 'warning');
      });
    }
  }

  seleccionarParaEditar(especie: EspecieResponse): void {
    this.editando = true;
    this.especieIdSeleccionada = especie.id_especie;
    this.especieForm.patchValue({
      nombre: especie.nombre_comun,
      nombreCientifico: especie.nombre_cientifico,
      estadoConservacion: especie.estado_conservacion,
      descripcion: especie.descripcion,
      imagen: especie.url_imagen
    });
  }

  resetearModulo(): void {
    this.editando = false;
    this.especieIdSeleccionada = null;
    this.especieForm.reset({ estadoConservacion: 'Preocupación Menor' });
  }

  mostrarAlerta(mensaje: string, tipo: string): void {
    this.mensajeAlerta = mensaje;
    this.tipoAlerta = tipo;
    setTimeout(() => {
      this.mensajeAlerta = '';
      this.cdr.detectChanges();
    }, 3000);
  }

  campoInvalido(campo: string): boolean {
    const control = this.especieForm.get(campo);
    return !!(control && control.errors && (control.dirty || control.touched));
  }
}