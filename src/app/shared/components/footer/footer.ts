import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.css'
})
export class FooterComponent implements OnInit {
  // Variable dinámica para que el año de copyright siempre esté actualizado en el parcial
  anioActual: number = new Date().getFullYear();

  constructor() {}

  ngOnInit(): void {}
}