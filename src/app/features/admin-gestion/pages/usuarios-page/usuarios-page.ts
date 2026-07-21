import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../../shared/components/navbar/navbar';
import { FooterComponent } from '../../../../shared/components/footer/footer';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface Usuario {
  id_usuario?: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: 'administrador' | 'autoridad' | 'ciudadano';
  contrasena?: string;
}

@Component({
  selector: 'app-admin-usuarios-page',
  standalone: true,
  imports: [CommonModule, FormsModule, NavbarComponent, FooterComponent],
  templateUrl: './usuarios-page.html'
})
export class AdminUsuariosPage implements OnInit {
  listaUsuarios: Usuario[] = [];
  usuarioForm: Usuario = { 
    nombre_completo: '', 
    correo_electronico: '', 
    rol: 'ciudadano', 
    contrasena: '' 
  };
  editando: boolean = false;
  idEdicion: number | null = null;
  cargando: boolean = false;
  apiUrl = 'https://fauna-backend.onrender.com/usuarios';

  constructor(
    private http: HttpClient, 
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
  }

  cargarUsuarios(): void {
    this.http.get<Usuario[]>(this.apiUrl).subscribe({
      next: (res) => {
        this.listaUsuarios = res;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error al cargar usuarios:', err)
    });
  }

  async guardarUsuario(): Promise<void> {
    if (!this.usuarioForm.correo_electronico || !this.usuarioForm.nombre_completo) {
      alert('Por favor completa el nombre y el correo.');
      return;
    }

    // Normalizamos el rol a guardar en PostgreSQL
    const payload = {
      nombre_completo: this.usuarioForm.nombre_completo,
      correo_electronico: this.usuarioForm.correo_electronico,
      rol: this.usuarioForm.rol, // Mantiene 'administrador', 'autoridad' o 'ciudadano'
      contrasena: this.usuarioForm.contrasena
    };

    if (this.editando && this.idEdicion) {
      // 🟡 Editar usuario en PostgreSQL
      this.http.patch<Usuario>(`${this.apiUrl}/${this.idEdicion}`, payload).subscribe({
        next: () => {
          alert('Usuario actualizado con éxito.');
          this.resetForm();
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al editar usuario:', err)
      });
    } else {
      // 🟢 Crear nuevo usuario
      if (!this.usuarioForm.contrasena || this.usuarioForm.contrasena.length < 6) {
        alert('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      this.cargando = true;
      try {
        // 1. Crear la cuenta en Firebase Authentication
        await this.authService.registrarEnFirebaseAuxiliar(
          this.usuarioForm.correo_electronico, 
          this.usuarioForm.contrasena
        );

        // 2. Guardar el usuario con su rol exacto en PostgreSQL (NeonDB)
        this.http.post<Usuario>(this.apiUrl, payload).subscribe({
          next: () => {
            this.cargando = false;
            alert(`Usuario creado exitosamente con el rol de: ${this.usuarioForm.rol}`);
            this.resetForm();
            this.cargarUsuarios();
          },
          error: (err) => {
            this.cargando = false;
            console.error('Error al guardar en PostgreSQL:', err);
          }
        });
      } catch (fbError: any) {
        this.cargando = false;
        console.error('Error creando en Firebase:', fbError);
        alert(`Error en Firebase: ${fbError.message || 'No se pudo crear el usuario'}`);
      }
    }
  }

  seleccionarParaEditar(user: Usuario): void {
    this.editando = true;
    this.idEdicion = user.id_usuario!;
    this.usuarioForm = { 
      nombre_completo: user.nombre_completo, 
      correo_electronico: user.correo_electronico, 
      rol: user.rol === 'administrador' ? 'administrador' : user.rol 
    };
  }

  async eliminarUsuario(id: number, correo: string): Promise<void> {
    if (confirm(`¿Estás seguro de eliminar al usuario ${correo}?`)) {
      // 1. Eliminar de la Base de Datos PostgreSQL
      this.http.delete(`${this.apiUrl}/${id}`).subscribe({
        next: () => {
          alert('Usuario eliminado de la Base de Datos.');
          this.cargarUsuarios();
        },
        error: (err) => console.error('Error al borrar en PostgreSQL:', err)
      });
    }
  }

  resetForm(): void {
    this.editando = false;
    this.idEdicion = null;
    this.cargando = false;
    this.usuarioForm = { 
      nombre_completo: '', 
      correo_electronico: '', 
      rol: 'ciudadano', 
      contrasena: '' 
    };
  }
}
