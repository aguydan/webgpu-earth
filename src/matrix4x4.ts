import { Vector3 } from "./vector3";

export class Matrix4x4 {
  // REMEMBER THAT MATRICES ARE STORED IN ROW MAJOR ORDER!!!!

  static new(...entries: number[]): Float32Array {
    const initial = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

    for (let i = 0; i < entries.length; i++) {
      initial[i] = entries[i];
    }

    return new Float32Array(initial);
  }

  static mult(
    a: Float32Array,
    b: Float32Array,
    destination?: Float32Array,
  ): Float32Array {
    const c = destination || new Float32Array(16);

    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a03 = a[0 * 4 + 3];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a13 = a[1 * 4 + 3];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];
    const a23 = a[2 * 4 + 3];
    const a30 = a[3 * 4 + 0];
    const a31 = a[3 * 4 + 1];
    const a32 = a[3 * 4 + 2];
    const a33 = a[3 * 4 + 3];

    const b00 = b[0 * 4 + 0];
    const b01 = b[0 * 4 + 1];
    const b02 = b[0 * 4 + 2];
    const b03 = b[0 * 4 + 3];
    const b10 = b[1 * 4 + 0];
    const b11 = b[1 * 4 + 1];
    const b12 = b[1 * 4 + 2];
    const b13 = b[1 * 4 + 3];
    const b20 = b[2 * 4 + 0];
    const b21 = b[2 * 4 + 1];
    const b22 = b[2 * 4 + 2];
    const b23 = b[2 * 4 + 3];
    const b30 = b[3 * 4 + 0];
    const b31 = b[3 * 4 + 1];
    const b32 = b[3 * 4 + 2];
    const b33 = b[3 * 4 + 3];

    c[0] = b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30;
    c[1] = b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31;
    c[2] = b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32;
    c[3] = b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33;

    c[4] = b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30;
    c[5] = b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31;
    c[6] = b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32;
    c[7] = b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33;

    c[8] = b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30;
    c[9] = b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31;
    c[10] = b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32;
    c[11] = b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33;

    c[12] = b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30;
    c[13] = b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31;
    c[14] = b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32;
    c[15] = b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33;

    return c;
  }

  static multVector(a: Float32Array, u: Vector3): Vector3 {
    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];

    const x = u.x * a00 + u.y * a10 + u.z * a20;
    const y = u.x * a01 + u.y * a11 + u.z * a21;
    const z = u.x * a02 + u.y * a12 + u.z * a22;

    return new Vector3(x, y, z);
  }

  static translate(
    tx: number,
    ty: number,
    tz: number,
    destination?: Float32Array,
  ): Float32Array {
    const m = new Float32Array(16);
    const c = destination || new Float32Array(16);

    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;

    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = 0;

    m[12] = tx;
    m[13] = ty;
    m[14] = tz;
    m[15] = 1;

    return Matrix4x4.mult(m, c);
  }

  static rotateX(angle: number, destination?: Float32Array): Float32Array {
    const m = new Float32Array(16);
    const c = destination || new Float32Array(16);

    m[0] = 1;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;

    m[4] = 0;
    m[5] = Math.cos(angle);
    m[6] = Math.sin(angle);
    m[7] = 0;

    m[8] = 0;
    m[9] = -Math.sin(angle);
    m[10] = Math.cos(angle);
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return Matrix4x4.mult(m, c);
  }

  static rotateY(angle: number, destination?: Float32Array): Float32Array {
    const m = new Float32Array(16);
    const c = destination || new Float32Array(16);

    m[0] = Math.cos(angle);
    m[1] = 0;
    m[2] = -Math.sin(angle);
    m[3] = 0;

    m[4] = 0;
    m[5] = 1;
    m[6] = 0;
    m[7] = 0;

    m[8] = Math.sin(angle);
    m[9] = 0;
    m[10] = Math.cos(angle);
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return Matrix4x4.mult(m, c);
  }

  static rotateZ(angle: number, destination?: Float32Array): Float32Array {
    const m = new Float32Array(16);
    const c = destination || new Float32Array(16);

    m[0] = Math.cos(angle);
    m[1] = Math.sin(angle);
    m[2] = 0;
    m[3] = 0;

    m[4] = -Math.sin(angle);
    m[5] = Math.cos(angle);
    m[6] = 0;
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = 1;
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return Matrix4x4.mult(m, c);
  }

  scale(
    sx: number,
    sy: number,
    sz: number,
    destination?: Float32Array,
  ): Float32Array {
    const m = new Float32Array(16);
    const c = destination || new Float32Array(16);

    m[0] = sx;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;

    m[4] = 0;
    m[5] = sy;
    m[6] = 0;
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = sz;
    m[11] = 0;

    m[12] = 0;
    m[13] = 0;
    m[14] = 0;
    m[15] = 1;

    return Matrix4x4.mult(m, c);
  }

  static aim(eye: Vector3, target: Vector3): Float32Array {
    const distance = target.subtract(eye);

    const forward = distance.normalized;

    // We first calculate right using the global up vector
    const right = Vector3.cross(Vector3.up, forward).normalized;
    const up = Vector3.cross(forward, right);

    const m = new Float32Array(16);

    m[0] = right.x;
    m[1] = right.y;
    m[2] = right.z;
    m[3] = 0;

    m[4] = up.x;
    m[5] = up.y;
    m[6] = up.z;
    m[7] = 0;

    m[8] = forward.x;
    m[9] = forward.y;
    m[10] = forward.z;
    m[11] = 0;

    m[12] = eye.x;
    m[13] = eye.y;
    m[14] = eye.z;
    m[15] = 1;

    return m;
  }

  static cameraAim(eye: Vector3, target: Vector3): Float32Array {
    const m = Matrix4x4.aim(eye, target);

    m[0] = -m[0];
    m[1] = -m[1];
    m[2] = -m[2];

    m[8] = -m[8];
    m[9] = -m[9];
    m[10] = -m[10];

    return m;
  }

  static lookAt(eye: Vector3, target: Vector3) {
    const distance = eye.subtract(target);

    const forward = distance.normalized;

    // We first calculate right using the global up vector
    const right = Vector3.cross(Vector3.up, forward).normalized;
    const up = Vector3.cross(forward, right);

    const m = new Float32Array(16);

    m[0] = right.x;
    m[1] = up.x;
    m[2] = forward.x;
    m[3] = 0;

    m[4] = right.y;
    m[5] = up.y;
    m[6] = forward.y;
    m[7] = 0;

    m[8] = right.z;
    m[9] = up.z;
    m[10] = forward.z;
    m[11] = 0;

    m[12] = -Vector3.dot(right, eye);
    m[13] = -Vector3.dot(up, eye);
    m[14] = -Vector3.dot(forward, eye);
    m[15] = 1;

    return m;
  }

  static perspective(
    fovy: number,
    aspectRatio: number,
    zNear: number,
    zFar: number,
  ): Float32Array {
    const m = new Float32Array(16);

    const f = Math.tan(Math.PI * 0.5 - 0.5 * fovy);
    const rangeInverse = 1 / (zNear - zFar);

    m[0] = f / aspectRatio;
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;

    m[4] = 0;
    m[5] = f;
    m[6] = 0;
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = zFar * rangeInverse;
    m[11] = -1;

    m[12] = 0;
    m[13] = 0;
    m[14] = zNear * zFar * rangeInverse;
    m[15] = 0;

    return m;
  }

  static orthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
  ): Float32Array {
    const m = new Float32Array(16);

    m[0] = 2 / (right - left);
    m[1] = 0;
    m[2] = 0;
    m[3] = 0;

    m[4] = 0;
    m[5] = 2 / (top - bottom);
    m[6] = 0;
    m[7] = 0;

    m[8] = 0;
    m[9] = 0;
    m[10] = 1 / (near - far);
    m[11] = 0;

    m[12] = (right + left) / (left - right);
    m[13] = (top + bottom) / (bottom - top);
    m[14] = near / (near - far);
    m[15] = 1;

    return m;
  }
}
