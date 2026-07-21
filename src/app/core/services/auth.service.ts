import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { Observable, firstValueFrom } from 'rxjs';

export interface UsuarioRealSession {
  uid: string;
  email: string | null;
  rol: 'administrador' | 'autoridad' | 'ciudadano';
}

export interface UsuarioDB {
  id_usuario: number;
  nombre_completo: string;
  correo_electronico: string;
  rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  usuario$: Observable<User | null>;
  private apiUrl = 'http://localhost:8000/api/v1/usuarios';

  constructor(
    private auth: Auth,
    private http: HttpClient
  ) {
    this.usuario$ = user(this.auth);
  }

  /**
   * Crea un usuario en Firebase mediante una instancia secundaria sin afectar la sesión activa.
   */
  async registrarEnFirebaseAuxiliar(email: string, pass: string): Promise<string> {
    const currentApp = this.auth.app;
    let secondaryApp;

    if (getApps().find(app => app.name === 'SecondaryAdminApp')) {
      secondaryApp = getApp('SecondaryAdminApp');
    } else {
      secondaryApp = initializeApp(currentApp.options, 'SecondaryAdminApp');
    }

    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    await signOut(secondaryAuth);
    
    return userCredential.user.uid;
  }

  /**
   * Elimina un usuario de Firebase en segundo plano autenticándose con una app secundaria.
   */
  async eliminarDeFirebaseAuxiliar(email: string, pass: string): Promise<void> {
    const currentApp = this.auth.app;
    let secondaryApp;

    if (getApps().find(app => app.name === 'SecondaryAdminApp')) {
      secondaryApp = getApp('SecondaryAdminApp');
    } else {
      secondaryApp = initializeApp(currentApp.options, 'SecondaryAdminApp');
    }

    const secondaryAuth = getAuth(secondaryApp);
    try {
      const cred = await signInWithEmailAndPassword(secondaryAuth, email, pass);
      if (cred.user) {
        await deleteUser(cred.user);
      }
    } catch (err) {
      console.warn('No se pudo eliminar el usuario de Firebase Auth:', err);
    } finally {
      await signOut(secondaryAuth);
    }
  }

  /**
   * Autentica con Firebase y resuelve el rol real consultando PostgreSQL (NeonDB).
   */
  async loginConFirebaseReal(email: string, pass: string): Promise<UsuarioRealSession> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, pass);
    const fbUser = userCredential.user;
    const correoLimpio = fbUser.email?.toLowerCase().trim() || '';

    let rolAsignado: 'administrador' | 'autoridad' | 'ciudadano' = 'ciudadano';

    // Regla especial para cuenta raíz por defecto
    if (correoLimpio === 'admin@bioguard.com') {
      rolAsignado = 'administrador';
    } else if (correoLimpio === 'oficial@bioguard.com') {
      rolAsignado = 'autoridad';
    } else {
      // Consulta dinámica a la API / PostgreSQL
      try {
        const usuarios = await firstValueFrom(this.http.get<UsuarioDB[]>(this.apiUrl));
        const usuarioEncontrado = usuarios.find(
          u => u.correo_electronico.toLowerCase().trim() === correoLimpio
        );

        if (usuarioEncontrado) {
          const rolDb = usuarioEncontrado.rol.toLowerCase().trim();
          // Mapeo explicito del ENUM 'administrador' a 'admin' para Angular
          if (rolDb === 'administrador') {
            rolAsignado = 'administrador';
          } else if (rolDb === 'autoridad') {
            rolAsignado = 'autoridad';
          } else {
            rolAsignado = 'ciudadano';
          }
        }
      } catch (err) {
        console.warn('Error al verificar el rol en PostgreSQL:', err);
      }
    }

    return {
      uid: fbUser.uid,
      email: fbUser.email,
      rol: rolAsignado
    };
  }

  async cerrarSesionReal(): Promise<void> {
    await signOut(this.auth);
  }
}