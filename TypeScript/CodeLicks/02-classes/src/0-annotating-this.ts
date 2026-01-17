function relocate(
  this: { lat: number; lng: number },
  lat: number,
  lng: number
) {
  this.lat = lat;
  this.lng = lng;
}

const coordinates = {
  lat: 0,
  lng: 0,

  relocate,
  relocate2(lat: number, lng: number) {
    this.lat = lat;
    this.lng = lng;
  },
};

coordinates.relocate(10, 10);
coordinates.relocate2(20, 20);