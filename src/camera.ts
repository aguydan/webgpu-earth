import { Matrix4x4 } from "./matrix4x4";
import { Vector3 } from "./vector3";

interface ProjectionOptions {
  fovY?: number;
  aspectRatio?: number;
  zNear?: number;
  zFar?: number;
}

export class Camera {
  // the position of the camera
  eye: Vector3 = new Vector3();

  // the point at which the camera looks
  target: Vector3 = new Vector3();

  projectionMatrix: Float32Array;

  constructor(
    eye: Vector3,
    target: Vector3,
    projectionOptions: ProjectionOptions = {},
  ) {
    this.eye = eye;
    this.target = target;

    const { fovY, aspectRatio, zNear, zFar } = projectionOptions;

    // fovY is a vertical field of view in radians
    this.projectionMatrix = Matrix4x4.perspective(
      fovY || (2 * Math.PI) / 5,
      aspectRatio || 16 / 9,
      zNear || 1,
      zFar || 2000,
    );
  }

  get viewMatrix() {
    return Matrix4x4.lookAt(this.eye, this.target);
  }

  get viewProjectionMatrix() {
    return Matrix4x4.mult(this.projectionMatrix, this.viewMatrix);
  }

  // yaw is rotation around y axis
  // pitch is rotation around x axis

  orient(yaw: number, pitch: number) {
    // usual rotation around a point: first move the vector to the origin, rotate, move back
    const u = this.target.subtract(this.eye);

    let rotated = Matrix4x4.rotateX(yaw);
    rotated = Matrix4x4.rotateY(pitch);

    const v = Matrix4x4.multVector(rotated, u);

    this.target = this.eye.add(v);
  }
}
