import { Routes } from '@angular/router';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'principal',
    pathMatch: 'full'
  },
  
  // Mapa General (Público)
  {
    path: 'principal',
    loadComponent: () =>
      import('./features/principal/page/principal-page/principal-page')
        .then(m => m.PrincipalPage)
  },

  // Formulario de Reportes (Ciudadano, Autoridad, Admin)
  {
    path: 'reportar',
    canActivate: [roleGuard(['ciudadano', 'autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/reporte/page/reporte-page/reporte-page')
        .then(m => m.ReportePage)
  },

  // Panel de Moderación de Incidentes (Autoridad, Admin)
  {
    path: 'autoridades',
    canActivate: [roleGuard(['autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/autoridades/page/autoridades-page/autoridades-page')
        .then(m => m.AutoridadesPage)
  },

  // Atención de Casos Aprobados / Resueltos (Autoridad, Admin)
  {
    path: 'autoridades/aprobados',
    canActivate: [roleGuard(['autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/autoridades/page/aprobados-page/aprobados-page')
        .then(m => m.AprobadosPage)
  },

  // Enciclopedia (Todos los usuarios autenticados)
  {
    path: 'enciclopedia',
    canActivate: [roleGuard(['ciudadano', 'autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/enciclopedia/page/enciclopedia-page/enciclopedia-page')
        .then(m => m.EnciclopediaPage)
  },

  // Consejos (Todos los usuarios autenticados)
  {
    path: 'consejos',
    canActivate: [roleGuard(['ciudadano', 'autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/consejos/page/consejos-page/consejos-page')
        .then(m => m.ConsejosPage)
  },

  // Estadísticas y Alertas (Autoridad, Admin)
  {
    path: 'estadisticas',
    canActivate: [roleGuard(['autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/estadisticas/page/estadisticas-page/estadisticas-page')
        .then(m => m.EstadisticasPage)
  },

  // Administración y Creación de Especies (Exclusivo Admin)
  {
    path: 'admin/gestion',
    canActivate: [roleGuard(['administrador'])],
    loadComponent: () =>
      import('./features/admin-gestion/pages/crear-especie/admin-especies')
        .then(m => m.AdminEspeciesComponent)
  },

  // Login de Usuario
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/page/login-page/login-page')
        .then(m => m.LoginPage)
  },

  // Mis Reportes (Para Ciudadanos)
  {
    path: 'mis-reportes',
    canActivate: [roleGuard(['ciudadano', 'autoridad', 'administrador'])],
    loadComponent: () =>
      import('./features/reporte/page/mis-reportes-page/mis-reportes-page')
        .then(m => m.MisReportesPage)
  },

  // Gestión de Usuarios - CRUD (Exclusivo Administrador)
  {
    path: 'admin/usuarios',
    canActivate: [roleGuard(['administrador'])],
    loadComponent: () =>
      import('./features/admin-gestion/pages/usuarios-page/usuarios-page')
        .then(m => m.AdminUsuariosPage)
  },

  // Ruta comodín
  {
    path: '**',
    redirectTo: 'principal'
  }
];