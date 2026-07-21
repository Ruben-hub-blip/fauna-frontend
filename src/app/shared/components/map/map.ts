import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output
} from '@angular/core';

import * as L from 'leaflet';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [],
  templateUrl: './map.html',
  styleUrl: './map.css'
})
export class Map implements AfterViewInit {

  @Input()
  editable = false;

  @Input()
  height = '350px';

  @Output()
  locationSelected = new EventEmitter<{
    lat: number;
    lng: number;
  }>();

  private map!: L.Map;
  private marker!: L.Marker;

  ngAfterViewInit(): void {

    // Barranquilla por defecto
    const initialLat = 10.9685;
    const initialLng = -74.7813;

    this.map = L.map('map').setView(
      [initialLat, initialLng],
      13
    );

    L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
      }
    ).addTo(this.map);

    // Marcador principal
    this.marker = L.marker([
      initialLat,
      initialLng
    ]).addTo(this.map);

    // Solo permitir mover marcador en modo editable
    this.map.on('click', (e: L.LeafletMouseEvent) => {

      if (!this.editable) {
        return;
      }

      const lat = e.latlng.lat;
      const lng = e.latlng.lng;

      this.marker.setLatLng([
        lat,
        lng
      ]);

      this.locationSelected.emit({
        lat,
        lng
      });

    });

  }

}