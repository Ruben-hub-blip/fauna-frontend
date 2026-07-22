import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; 
import { HttpClient } from '@angular/common/http';
import { map, Observable, switchMap, of, catchError } from 'rxjs';
import { AuthService, UsuarioRealSession } from '../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

export interface UsuarioDB {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class NavbarComponent {
  usuario$: Observable<UsuarioRealSession | null>;
  private apiUrl = `${environment.apiUrl}/usuarios`;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private http: HttpClient
  ) {
    this.usuario$ = this.authService.usuario$.pipe(
      switchMap(fbUser => {
        if (!fbUser) return of(null);
        
        const correoLimpio = fbUser.email?.toLowerCase().trim() || '';

        // Respaldo para cuentas maestras
        if (correoLimpio === 'admin@bioguard.com') {
          return of({ uid: fbUser.uid, email: fbUser.email, rol: 'administrador' } as UsuarioRealSession);
        }
        if (correoLimpio === 'oficial@bioguard.com') {
          return of({ uid: fbUser.uid, email: fbUser.email, rol: 'autoridad' } as UsuarioRealSession);
        }

        // Leer el ROL REAL asignado desde PostgreSQL
        return this.http.get<UsuarioDB[]>(this.apiUrl).pipe(
          map(usuarios => {
            const usrDb = usuarios.find(u => u.correo_electronico.toLowerCase().trim() === correoLimpio);
            let rolResult: 'administrador' | 'autoridad' | 'ciudadano' = 'ciudadano';

            if (usrDb) {
              const r = usrDb.rol.toLowerCase().trim();
              if (r === 'administrador' || r === 'admin') rolResult = 'administrador';
              else if (r === 'autoridad' || r === 'oficial') rolResult = 'autoridad';
            }

            return {
              uid: fbUser.uid,
              email: fbUser.email,
              rol: rolResult
            } as UsuarioRealSession;
          }),
          catchError(() => of({ uid: fbUser.uid, email: fbUser.email, rol: 'ciudadano' } as UsuarioRealSession))
        );
      })
    );
  }

  async ejecutarCerrarSesion(): Promise<void> {
    try {
      await this.authService.cerrarSesionReal();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  }
}
