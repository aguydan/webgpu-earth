import { Camera } from "../camera";
import { Settings } from "../main";
import { Matrix4x4 } from "../matrix4x4";
import { Vector3 } from "../vector3";

// Temporary function before the uniform class

export function updateUniforms(
  timeValue: Float32Array,
  matrixValue: Float32Array,
  settings: Settings,
  time?: number,
) {
  // Initial array to hold the values. Mind the data layout
  if (time) timeValue.set([time]);

  let model = new Matrix4x4();
  model = model
    .translate(
      settings.translate[0],
      settings.translate[1],
      settings.translate[2],
    )
    .rotateX(settings.rotate[0])
    .rotateY(settings.rotate[1])
    .rotateZ(settings.rotate[2]);

  const camera = new Camera(new Vector3(0, 0, -10), new Vector3(), {
    fovy: settings.fov,
    aspectRatio: settings.aspectRatio,
    zNear: settings.zNear,
    zFar: settings.zFar,
  });

  camera.orient(settings.cameraYaw, settings.cameraPitch);

  const modelViewProjection = camera.viewProjectionMatrix.mult(model);

  matrixValue.set(modelViewProjection.values);
}
