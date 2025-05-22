import { Camera } from "../camera";
import { Settings } from "../types";
import { Matrix4x4 } from "../matrix4x4";
import { Uniform } from "../uniform";

// update model??
export function updateUniforms(uniform: Uniform, settings: Settings) {
  // uniform get in the future
  let model = Matrix4x4.new();

  model = Matrix4x4.rotateX(settings.rotate.x, model);
  model = Matrix4x4.rotateY(settings.rotate.y, model);
  model = Matrix4x4.rotateZ(settings.rotate.z, model);
  model = Matrix4x4.translate(
    settings.translate.x,
    settings.translate.y,
    settings.translate.z,
    model,
  );

  //stopped working, investigate
  //camera.orient(settings.cameraYaw, settings.cameraPitch);

  //put view projection matrix into a uniform
  const modelViewProjection = Matrix4x4.mult(
    camera.viewProjectionMatrix,
    model,
  );

  uniform.set("matrix", modelViewProjection);
}
