import { Injectable } from '@angular/core';
import { Auth, signInWithEmailAndPassword, signOut, user, User } from '@angular/fire/auth';
import { HttpClient } from '@angular/common/http';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { Observable, firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment'; // CORREGIDO

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
  private apiUrl = environment.apiUrl;

  constructor(
    private auth: Auth,
    private http: HttpClient
  ) {
    this.usuario$ = user(this.auth);
  }

  async registrarEnFirebaseAuxiliar(email: string, pass: string): Promise<string> {
    const currentApp = this.auth.app;
    let secondaryApp = getApps().find(app => app.name === 'SecondaryAdminApp') 
      ? getApp('SecondaryAdminApp') 
      : initializeApp(currentApp.options, 'SecondaryAdminApp');

    const secondaryAuth = getAuth(secondaryApp);
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    await signOut(secondaryAuth);
    return userCredential.user.uid;
  }

  async loginConFirebaseReal(email: string, pass: string): Promise<UsuarioRealSession> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, pass);
    const fbUser = userCredential.user;
    let rolAsignado: 'administrador' | 'autoridad' | 'ciudadano' = 'ciudadano';

    try {
      const resBackend: any = await firstValueFrom(
        this.http.post(`${this.apiUrl}/usuarios/login`, {
          correo_electronico: email.toLowerCase().trim(),
          contrasena: pass
        })
      );
      if (resBackend && resBackend.rol) {
        rolAsignado = resBackend.rol.toLowerCase().trim() as any;
      }
    } catch (err) {
      console.error('Error obteniendo rol:', err);
    }

    return { uid: fbUser.uid, email: fbUser.email, rol: rolAsignado };
  }

  // ESTO ES LO QUE FALTABA Y DABA ERROR EN EL NAVBAR
  async cerrarSesionReal(): Promise<void> {
    await signOut(this.auth);
  }
}
