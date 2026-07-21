import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css'
})
export class LoginPage {
  userInput: string = '';
  passInput: string = '';
  errorLogin: boolean = false;

  constructor(private authService: AuthService, private router: Router) {}

  async procesarLogin(): Promise<void> {
    this.errorLogin = false;

    try {
      const sesionReal = await this.authService.loginConFirebaseReal(this.userInput, this.passInput);

      if (sesionReal && sesionReal.rol) {
        const rolAsignado = sesionReal.rol;

        if (rolAsignado === 'administrador') {
          this.router.navigate(['/admin/gestion']); 
        } else if (rolAsignado === 'autoridad') {
          this.router.navigate(['/autoridades']); 
        } else if (rolAsignado === 'ciudadano') {
          this.router.navigate(['/principal']); 
        }
      } else {
        this.errorLogin = true;
      }

    } catch (error) {
      console.error('Error de autenticación real en la nube de Firebase:', error);
      this.errorLogin = true;
    }
  }
}