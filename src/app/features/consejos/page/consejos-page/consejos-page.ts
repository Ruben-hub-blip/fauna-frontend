import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NavbarComponent } from "../../../../shared/components/navbar/navbar";
import { FooterComponent } from "../../../../shared/components/footer/footer";

export interface Consejo {
  id: string;
  titulo: string;
  icono: string;
  categoria: string;
  descripcion: string;
}

@Component({
  selector: 'app-consejos-page',
  standalone: true,
  imports: [CommonModule, NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './consejos-page.html',
  styleUrl: './consejos-page.css'
})
export class ConsejosPage implements OnInit {
  // Arreglo local con la información que recorreremos con el *ngFor
  listaConsejos: Consejo[] = [
    {
      id: 'collapseOne',
      titulo: '¿Qué hacer al encontrar una Zarigüeya o "Chucha"?',
      icono: 'bi-shield-exclamation',
      categoria: 'Mamíferos urbanos',
      descripcion: 'No las ataques ni las lastimes. Las zarigüeyas no son roedores ni transmiten rabia; son marsupiales controladores de plagas. Si está sana, déjala seguir su camino nocturno. Si está herida o atrapada, usa la sección de "Nuevo Reporte" de nuestra app.'
    },
    {
      id: 'collapseTwo',
      titulo: 'Encuentro con Iguanas en zonas residenciales',
      icono: 'bi-tree-fill',
      categoria: 'Reptiles',
      descripcion: 'Es normal verlas en árboles o buscando sol. Evita alimentarlas con comida procesada. Recuerda que la venta y consumo de sus huevos es un delito ambiental grave que puedes reportar a través del panel de alertas.'
    },
    {
      id: 'collapseThree',
      titulo: 'Aves caídas del nido (Polluelos)',
      icono: 'bi-egg-fried',
      categoria: 'Aves',
      descripcion: 'Si encuentras un polluelo, revisa si está herido. Si está bien y ves el nido cerca, colócalo de vuelta con cuidado. Os padres suelen estar cerca vigilando. No te lo lleves a casa a menos que corra peligro inminente de depredadores.'
    },
    {
      id: 'collapseFour',
      titulo: 'Cómo actuar ante la presencia de una serpiente',
      icono: 'bi-exclamation-triangle-fill',
      categoria: 'Reptiles',
      descripcion: 'Mantén la distancia y no intentes manipularla ni matarla. La mayoría de serpientes en zonas urbanas no son venenosas y huyen del humano. Aléjate despacio y haz un reporte de alta prioridad para que una patrulla ambiental la reubique.'
    }
  ];

  constructor() {}

  ngOnInit(): void {}
}