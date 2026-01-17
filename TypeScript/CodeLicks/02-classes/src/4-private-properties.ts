export class MapPin {
  #lat: number;
  #lng: number;

  private lat2: number;
  private lng2: number;

  // hash syntax -> 런타임 보호되며 JS에서 접근 불가 (존재 모름)
  // private syntax -> 런타임 보호없이 JS에서 접근 가능 (규칙)

  constructor(location?: { lat: number; lng: number }) {
    this.#lat = location?.lat ?? 0;
    this.#lng = location?.lng ?? 0;

    this.lat2 = location?.lat ?? 0;
    this.lng2 = location?.lng ?? 0;
  }

  get coordinates() {
    return {
      lat: this.#lat,
      lng: this.#lng,

      lat2: this.lat2,
      lng2: this.lng2,
    };
  }

  relocate = (newLat: number, newLng: number) => {
    this.#lat = newLat;
    this.#lng = newLng;

    this.lat2 = newLat;
    this.lng2 = newLng;
  };
}

const pin = new MapPin({ lat: 10, lng: 20 });


// 1️⃣ #private (문법 차단) -> 존재 모름
// console.log(pin.#lat);
// console.log(pin.#lng);

// 2️⃣ TS private (타입 에러) -> 규칙위반일뿐 실행 가능
console.log(pin.lat2);
console.log(pin.lng2);


// 3️⃣ public getter -> 가능 (창구 생성)
console.log(pin.coordinates.lat);
console.log(pin.coordinates.lat2);