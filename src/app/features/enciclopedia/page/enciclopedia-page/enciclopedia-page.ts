import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; // 🔌 Importamos ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EnciclopediaService, Especie } from '../../services/enciclopedia.service';
import { FooterComponent } from "../../../../shared/components/footer/footer";
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";

@Component({
  selector: 'app-enciclopedia-page',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent, NavbarComponent],
  templateUrl: './enciclopedia-page.html',
  styleUrl: './enciclopedia-page.css'
})
export class EnciclopediaPage implements OnInit {
  catalogoEspecies: Especie[] = [];
  especiesFiltradas: Especie[] = [];
  textoBusqueda: string = '';

  constructor(
    private enciclopediaService: EnciclopediaService,
    private cdr: ChangeDetectorRef // 🔌 Inyectamos el detector de cambios de Angular
  ) {}

  ngOnInit(): void {
    this.cargarCatalogo();
  }

  /**
   * 🔵 Carga asíncronamente las especies desde la Base de Datos Real
   */
  cargarCatalogo(): void {
    this.enciclopediaService.obtenerEspecies().subscribe({
      next: (datos) => {
        this.catalogoEspecies = datos;
        // Asignamos directamente la copia inicial para forzar la primera visualización
        this.especiesFiltradas = [...this.catalogoEspecies]; 
        
        this.actualizarPantalla();
        
        this.cdr.detectChanges(); 
        console.log('📖 Catálogo real mapeado e indexado desde FastAPI:', this.catalogoEspecies);
      },
      error: (err) => {
        console.error('Error al consultar el catálogo en FastAPI:', err);
      }
    });
  }

  /**
   * 🔍 Filtro inteligente local por teclado
   */
  actualizarPantalla(): void {
    const texto = this.textoBusqueda.toLowerCase().trim();
    
    if (texto === '') {
      // Usamos el operador spread [...] para romper la referencia antigua y que Angular detecte un array "nuevo"
      this.especiesFiltradas = [...this.catalogoEspecies];
    } else {
      this.especiesFiltradas = this.catalogoEspecies.filter(animal => 
        animal.nombre.toLowerCase().includes(texto) || 
        animal.nombreCientifico.toLowerCase().includes(texto)
      );
    }
    this.cdr.detectChanges(); // Asegura el redibujado de las tarjetas
  }

  filtrarFauna(): void {
    this.actualizarPantalla();
  }
}