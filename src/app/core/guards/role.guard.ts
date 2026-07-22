import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { map, take, switchMap, of, catchError } from 'rxjs';
import { environment } from '../../../environments/environment'; 

export interface UsuarioDB {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
}

export const roleGuard = (rolesPermitidos: Array<'administrador' | 'autoridad' | 'ciudadano'>): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);
    const http = inject(HttpClient);
    const apiUrl = `${environment.apiUrl}/usuarios/`;

    return authService.usuario$.pipe(
      take(1),
      switchMap(user => {
        if (!user) {
          router.navigate(['/login']);
          return of(false);
        }

        const correoLimpio = user.email?.toLowerCase().trim() || '';

        // Respaldo para cuentas raíz
        if (correoLimpio === 'admin@bioguard.com') return of('administrador');
        if (correoLimpio === 'oficial@bioguard.com') return of('autoridad');

        // Consultar el ROL REAL en PostgreSQL (NeonDB)
        return http.get<UsuarioDB[]>(apiUrl).pipe(
          map(usuarios => {
            const usrDb = usuarios.find(u => u.correo_electronico.toLowerCase().trim() === correoLimpio);
            if (usrDb) {
              const r = usrDb.rol.toLowerCase().trim();
              if (r === 'administrador' || r === 'admin') return 'administrador';
              if (r === 'autoridad' || r === 'oficial') return 'autoridad';
            }
            return 'ciudadano';
          }),
          catchError(() => of('ciudadano'))
        );
      }),
      map(rolUsuario => {
        if (typeof rolUsuario === 'boolean') return rolUsuario;

        // El 'administrador' siempre tiene acceso a todo
        if (rolUsuario === 'administrador' || rolesPermitidos.includes(rolUsuario as any)) {
          return true;
        }

        // Si no tiene permisos, redirigir a la vista principal
        router.navigate(['/principal']);
        return false;
      })
    );
  };
};
