import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { LatLng, LatLngExpression, LatLngTuple } from 'leaflet'; // Keep only the types, no direct imports from Leaflet
import { Order } from '../../../shared/models/Order';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnChanges {
  @Input()
  order!: Order;
  @Input()
  readonly = false;

  private readonly MARKER_ZOOM_LEVEL = 16;
  private MARKER_ICON: any; // Will be set after dynamically loading Leaflet
  private readonly DEFAULT_LATLNG: LatLngTuple = [13.75, 21.62];

  @ViewChild('map', { static: true }) mapRef!: ElementRef;
  map!: any; // Map will be loaded dynamically
  currentMarker!: any; // Marker will be loaded dynamically

  constructor(private locationService: LocationService) {}

  async ngOnChanges(): Promise<void> {
    if (typeof window !== 'undefined') {
      const L = await import('leaflet');
      this.MARKER_ICON = L.icon({
        iconUrl: 'https://res.cloudinary.com/foodmine/image/upload/v1638842791/map/marker_kbua9q.png',
        iconSize: [42, 42],
        iconAnchor: [21, 42],
      });

      this.initializeMap(L);
    }

    // Apply readonly mode if necessary
    if (this.readonly && this.addressLatLng) {
      this.showLocationOnReadonlyMode();
    }
  }

  async showLocationOnReadonlyMode() {
    const L = await import('leaflet');
    const m = this.map;

    this.setMarker(this.addressLatLng, L); // Pass Leaflet object (L)
    m.setView(this.addressLatLng, this.MARKER_ZOOM_LEVEL);

    // Ensure the map is fully initialized before disabling interactions
    m.whenReady(() => {
      // Disable all interactions for read-only mode
      m.dragging.disable();
      m.touchZoom.disable();
      m.doubleClickZoom.disable();
      m.scrollWheelZoom.disable();
      m.boxZoom.disable();
      m.keyboard.disable();
      m.off('click'); // Disable click event

      // Tap handling on touch devices (if available)
      if (m.tap) m.tap.disable();

      // Disable dragging for the marker if it exists
      if (this.currentMarker?.dragging) {
        this.currentMarker.dragging.disable();
      }
    });
  }

  initializeMap(L: any) {
    if (this.map) return;

    this.map = L.map(this.mapRef.nativeElement, {
      attributionControl: false,
    }).setView(this.DEFAULT_LATLNG, 1);

    L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(this.map);

    // Add click event for setting marker in non-readonly mode
    this.map.on('click', (e: any) => {
      if (!this.readonly) {
        this.setMarker(e.latlng, L);
      }
    });
  }

  findMyLocation() {
    this.locationService.getCurrentLocation().subscribe({
      next: (latlng) => {
        this.map.setView(latlng, this.MARKER_ZOOM_LEVEL);
        this.setMarker(latlng, null); // Update marker position
      },
    });
  }

  setMarker(latlng: LatLngExpression, L: any) {
    this.addressLatLng = latlng as LatLng;
    if (this.currentMarker) {
      this.currentMarker.setLatLng(latlng);
      return;
    }

    this.currentMarker = L.marker(latlng, {
      draggable: !this.readonly, // Only allow dragging if not read-only
      icon: this.MARKER_ICON,
    }).addTo(this.map);

    // Handle marker dragging
    this.currentMarker.on('dragend', () => {
      this.addressLatLng = this.currentMarker.getLatLng();
    });
  }

  set addressLatLng(latlng: LatLng) {
    if (!latlng.lat.toFixed) return;
    latlng.lat = parseFloat(latlng.lat.toFixed(8));
    latlng.lng = parseFloat(latlng.lng.toFixed(8));
    this.order.addressLatLng = latlng;
  }

  get addressLatLng() {
    return this.order.addressLatLng!;
  }
}
