import { Matrix4x4 } from "./matrix4x4";
import { Vector3 } from "./vector3";

interface ProjectionOptions {
  fovy: number;
  aspectRatio: number;
  zNear: number;
  zFar: number;
}

export class Camera {
  // the position of the camera
  eye: Vector3 = new Vector3();

  // the point at which the camera looks
  target: Vector3 = new Vector3();

  fovy: number = (2 * Math.PI) / 5;
  aspectRatio: number = 16 / 9;
  zNear: number = 1;
  zFar: number = 2000;

  constructor(
    eye: Vector3,
    target: Vector3,
    projectionOptions?: ProjectionOptions,
  ) {
    this.eye = eye;
    this.target = target;

    if (projectionOptions) {
      const { fovy, aspectRatio, zNear, zFar } = projectionOptions;

      // fovy is a vertical field of view in radians
      this.fovy = fovy;
      this.aspectRatio = aspectRatio;
      this.zNear = zNear;
      this.zFar = zFar;
    }
  }

  get viewMatrix() {
    return Matrix4x4.lookAt(this.eye, this.target);
  }

  get viewProjectionMatrix() {
    return Matrix4x4.perspective(
      this.fovy,
      this.aspectRatio,
      this.zNear,
      this.zFar,
    ).mult(this.viewMatrix);
  }

  // yaw is rotation around y axis
  // pitch is rotation around x axis

  orient(yaw: number, pitch: number) {
    // usual rotation around a point: first move the vector to the origin, rotate, move back
    const u = this.target.subtract(this.eye);
    const rotated = new Matrix4x4().rotateX(yaw).rotateY(pitch).multVector(u);

    this.target = this.eye.add(rotated);
  }
}
