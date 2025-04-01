import { Vector3 } from "./vector3";

export class Matrix4x4 {
  values: Float32Array;

  // REMEMBER THAT MATRICES ARE STORED IN ROW MAJOR ORDER!!!!

  constructor(
    values: Float32Array = new Float32Array([
      1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
    ]),
  ) {
    this.values = values;
  }

  get inverse(): Matrix4x4 {
    const m = this.values;
    const c = new Float32Array(16);

    const m00 = m[0 * 4 + 0];
    const m01 = m[0 * 4 + 1];
    const m02 = m[0 * 4 + 2];
    const m03 = m[0 * 4 + 3];
    const m10 = m[1 * 4 + 0];
    const m11 = m[1 * 4 + 1];
    const m12 = m[1 * 4 + 2];
    const m13 = m[1 * 4 + 3];
    const m20 = m[2 * 4 + 0];
    const m21 = m[2 * 4 + 1];
    const m22 = m[2 * 4 + 2];
    const m23 = m[2 * 4 + 3];
    const m30 = m[3 * 4 + 0];
    const m31 = m[3 * 4 + 1];
    const m32 = m[3 * 4 + 2];
    const m33 = m[3 * 4 + 3];

    const tmp0 = m22 * m33;
    const tmp1 = m32 * m23;
    const tmp2 = m12 * m33;
    const tmp3 = m32 * m13;
    const tmp4 = m12 * m23;
    const tmp5 = m22 * m13;
    const tmp6 = m02 * m33;
    const tmp7 = m32 * m03;
    const tmp8 = m02 * m23;
    const tmp9 = m22 * m03;
    const tmp10 = m02 * m13;
    const tmp11 = m12 * m03;
    const tmp12 = m20 * m31;
    const tmp13 = m30 * m21;
    const tmp14 = m10 * m31;
    const tmp15 = m30 * m11;
    const tmp16 = m10 * m21;
    const tmp17 = m20 * m11;
    const tmp18 = m00 * m31;
    const tmp19 = m30 * m01;
    const tmp20 = m00 * m21;
    const tmp21 = m20 * m01;
    const tmp22 = m00 * m11;
    const tmp23 = m10 * m01;

    const t0 =
      tmp0 * m11 +
      tmp3 * m21 +
      tmp4 * m31 -
      (tmp1 * m11 + tmp2 * m21 + tmp5 * m31);
    const t1 =
      tmp1 * m01 +
      tmp6 * m21 +
      tmp9 * m31 -
      (tmp0 * m01 + tmp7 * m21 + tmp8 * m31);
    const t2 =
      tmp2 * m01 +
      tmp7 * m11 +
      tmp10 * m31 -
      (tmp3 * m01 + tmp6 * m11 + tmp11 * m31);
    const t3 =
      tmp5 * m01 +
      tmp8 * m11 +
      tmp11 * m21 -
      (tmp4 * m01 + tmp9 * m11 + tmp10 * m21);

    const d = 1 / (m00 * t0 + m10 * t1 + m20 * t2 + m30 * t3);

    c[0] = d * t0;
    c[1] = d * t1;
    c[2] = d * t2;
    c[3] = d * t3;

    c[4] =
      d *
      (tmp1 * m10 +
        tmp2 * m20 +
        tmp5 * m30 -
        (tmp0 * m10 + tmp3 * m20 + tmp4 * m30));
    c[5] =
      d *
      (tmp0 * m00 +
        tmp7 * m20 +
        tmp8 * m30 -
        (tmp1 * m00 + tmp6 * m20 + tmp9 * m30));
    c[6] =
      d *
      (tmp3 * m00 +
        tmp6 * m10 +
        tmp11 * m30 -
        (tmp2 * m00 + tmp7 * m10 + tmp10 * m30));
    c[7] =
      d *
      (tmp4 * m00 +
        tmp9 * m10 +
        tmp10 * m20 -
        (tmp5 * m00 + tmp8 * m10 + tmp11 * m20));

    c[8] =
      d *
      (tmp12 * m13 +
        tmp15 * m23 +
        tmp16 * m33 -
        (tmp13 * m13 + tmp14 * m23 + tmp17 * m33));
    c[9] =
      d *
      (tmp13 * m03 +
        tmp18 * m23 +
        tmp21 * m33 -
        (tmp12 * m03 + tmp19 * m23 + tmp20 * m33));
    c[10] =
      d *
      (tmp14 * m03 +
        tmp19 * m13 +
        tmp22 * m33 -
        (tmp15 * m03 + tmp18 * m13 + tmp23 * m33));
    c[11] =
      d *
      (tmp17 * m03 +
        tmp20 * m13 +
        tmp23 * m23 -
        (tmp16 * m03 + tmp21 * m13 + tmp22 * m23));

    c[12] =
      d *
      (tmp14 * m22 +
        tmp17 * m32 +
        tmp13 * m12 -
        (tmp16 * m32 + tmp12 * m12 + tmp15 * m22));
    c[13] =
      d *
      (tmp20 * m32 +
        tmp12 * m02 +
        tmp19 * m22 -
        (tmp18 * m22 + tmp21 * m32 + tmp13 * m02));
    c[14] =
      d *
      (tmp18 * m12 +
        tmp23 * m32 +
        tmp15 * m02 -
        (tmp22 * m32 + tmp14 * m02 + tmp19 * m12));
    c[15] =
      d *
      (tmp22 * m22 +
        tmp16 * m02 +
        tmp21 * m12 -
        (tmp20 * m12 + tmp23 * m22 + tmp17 * m02));

    return new Matrix4x4(c);
  }

  multVector(u: Vector3): Vector3 {
    const a = this.values;
    const c = [];

    const a00 = a[0 * 4 + 0];
    const a01 = a[0 * 4 + 1];
    const a02 = a[0 * 4 + 2];
    const a10 = a[1 * 4 + 0];
    const a11 = a[1 * 4 + 1];
    const a12 = a[1 * 4 + 2];
    const a20 = a[2 * 4 + 0];
    const a21 = a[2 * 4 + 1];
    const a22 = a[2 * 4 + 2];

    c[0] = u.x * a00 + u.y * a10 + u.z * a20;
    c[1] = u.x * a01 + u.y * a11 + u.z * a21;
    c[2] = u.x * a02 + u.y * a12 + u.z * a22;

    return new Vector3(...c);
  }

  mult(m: Matrix4x4): Matrix4x4 {
    const a = this.values;
    const b = m.values;
    const c = new Float32Array(16);

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

    return new Matrix4x4(c);
  }

  translate(tx: number, ty: number, tz: number): Matrix4x4 {
    const m = new Float32Array(16);

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

    return this.mult(new Matrix4x4(m));
  }

  rotateX(angle: number): Matrix4x4 {
    const m = new Float32Array(16);

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

    return this.mult(new Matrix4x4(m));
  }

  rotateY(angle: number): Matrix4x4 {
    const m = new Float32Array(16);

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

    return this.mult(new Matrix4x4(m));
  }

  rotateZ(angle: number): Matrix4x4 {
    const m = new Float32Array(16);

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

    return this.mult(new Matrix4x4(m));
  }

  scale(sx: number, sy: number, sz: number): Matrix4x4 {
    const m = new Float32Array(16);

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

    return this.mult(new Matrix4x4(m));
  }

  static aim(eye: Vector3, target: Vector3): Matrix4x4 {
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

    return new Matrix4x4(m);
  }

  // do we even need this?
  static cameraAim(eye: Vector3, target: Vector3): Matrix4x4 {
    const m = Matrix4x4.aim(eye, target).values;

    m[0] = -m[0];
    m[1] = -m[1];
    m[2] = -m[2];

    m[8] = -m[8];
    m[9] = -m[9];
    m[10] = -m[10];

    return new Matrix4x4(m);
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

    return new Matrix4x4(m);
  }

  static perspective(
    fovy: number,
    aspectRatio: number,
    zNear: number,
    zFar: number,
  ): Matrix4x4 {
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

    return new Matrix4x4(m);
  }

  static orthographic(
    left: number,
    right: number,
    top: number,
    bottom: number,
    near: number,
    far: number,
  ): Matrix4x4 {
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

    return new Matrix4x4(m);
  }

  *[Symbol.iterator]() {
    for (let value of this.values) {
      yield value;
    }
  }
}
