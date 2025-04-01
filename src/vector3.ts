export class Vector3 {
  values: [number, number, number];

  constructor(
    private _x: number = 0,
    private _y: number = 0,
    private _z: number = 0,
  ) {
    this.values = [_x, _y, _z];
  }

  static get up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static get down(): Vector3 {
    return new Vector3(0, -1, 0);
  }

  static get left(): Vector3 {
    return new Vector3(-1, 0, 0);
  }

  static get right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  static get forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  static get back(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  static dot(u: Vector3, v: Vector3): number {
    return u.x * v.x + u.y * v.y + u.z * v.z;
  }

  static cross(u: Vector3, v: Vector3): Vector3 {
    return new Vector3(
      u.y * v.z - u.z * v.y,
      u.z * v.x - u.x * v.z,
      u.x * v.y - u.y * v.x,
    );
  }

  get x(): number {
    return this._x;
  }

  get y(): number {
    return this._y;
  }

  get z(): number {
    return this._z;
  }

  get normalized(): Vector3 {
    const length = this.length();

    if (length === 0) {
      return this;
    }

    return new Vector3(this.x / length, this.y / length, this.z / length);
  }

  add(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    return new Vector3(this.x + v, this.y + v, this.z + v);
  }

  subtract(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
    }

    return new Vector3(this.x - v, this.y - v, this.z - v);
  }

  mult(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
    }

    return new Vector3(this.x * v, this.y * v, this.z * v);
  }

  divide(v: Vector3 | number): Vector3 {
    if (v instanceof Vector3) {
      return new Vector3(this.x / v.x, this.y / v.y, this.z / v.z);
    }

    return new Vector3(this.x / v, this.y / v, this.z / v);
  }

  length(): number {
    return Math.sqrt(Vector3.dot(this, this));
  }

  *[Symbol.iterator]() {
    yield this.x;
    yield this.y;
    yield this.z;
  }
}
