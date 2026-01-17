export class MapPin {
  lat: number = 0;
  lng: number = 0;

  relocate(newLat: number, newLng: number) {
    this.lat = newLat;
    this.lng = newLng;
  }
}

const pin = new MapPin();

pin.lat = 20;
pin.lng = 30;
