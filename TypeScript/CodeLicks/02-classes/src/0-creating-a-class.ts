export class MapPin {
  lat: number = 0;
  lng: number = 0;

  constructor() {
    this.lat = 0;
    this.lng = 0;
  }
}

const pin = new MapPin();

pin.lat = 22;
pin.lng = 33;
