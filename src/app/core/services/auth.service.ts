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
  private apiUrl = 'https://fauna-backend.onrender.com';

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

 // src/app/core/services/auth.service.ts

async loginConFirebaseReal(email: string, pass: string): Promise<UsuarioRealSession> {
  // 1. Autenticación en Firebase
  const userCredential = await signInWithEmailAndPassword(this.auth, email, pass);
  const fbUser = userCredential.user;

  let rolAsignado: 'administrador' | 'autoridad' | 'ciudadano' = 'ciudadano';

  try {
    // 2. Llamada directa al login de tu Backend en Render
    // Esto es mucho más seguro y eficiente
    const resBackend: any = await firstValueFrom(
      this.http.post(`${this.apiUrl}/login`, {
        correo_electronico: email.toLowerCase().trim(),
        contrasena: pass
      })
    );

    if (resBackend && resBackend.rol) {
      const rolDb = resBackend.rol.toLowerCase().trim();
      
      // Mapeo exacto
      if (rolDb === 'administrador') {
        rolAsignado = 'administrador';
      } else if (rolDb === 'autoridad') {
        rolAsignado = 'autoridad';
      } else {
        rolAsignado = 'ciudadano';
      }
    }
  } catch (err) {
    console.error('Error al obtener el rol desde Render/NeonDB:', err);
    // Si falla el backend, puedes decidir si dejarlo como ciudadano o sacar error
  }

  return {
    uid: fbUser.uid,
    email: fbUser.email,
    rol: rolAsignado
  };
}
