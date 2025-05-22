import { MeshGenerator } from "./mesh-generator";
import { RenderPass } from "./render-pass";
import shaderCode from "./shader.wgsl?raw";
import { createImageTexture } from "./lib/create-image-texture";
import { Renderer } from "./types";
import { Uniform, UniformEntry, UniformType } from "./uniform";
import { Matrix4x4 } from "./matrix4x4";
import initializeDevice from "./lib/initialize-device";
import initializeCanvas from "./lib/initialize-canvas";
import initializeGUI from "./lib/initialize-gui";
import controls from "./settings";
import { Camera } from "./camera";
import { Vector3 } from "./vector3";
import createShaderModule from "./lib/create-shader-module";

async function init() {
  const device = await initializeDevice();

  const generator = new MeshGenerator(device);
  const meshes = generator.generateCubeSphere(1, 70);
  const gpuMeshes = meshes.map((mesh) => mesh.toGPUMesh());

  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (!canvas) {
    throw new Error("Canvas element not found");
  }

  const [context, textureFormat] = initializeCanvas(canvas, device);

  controls.aspectRatio = canvas.width / canvas.height;
  initializeGUI(controls, once);

  // Uniforms

  const uniformData = new Map<string, UniformEntry>();

  uniformData.set("time", { type: UniformType.Number, data: 0 });
  uniformData.set("matrix", {
    type: UniformType.Matrix4x4,
    data: Matrix4x4.new(),
  });

  const uniform = new Uniform(device, uniformData);
  const gpuUniform = uniform.toGPUUniform(0);

  // Textures

  const defaultSampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
  });

  const diffuseTexture = await createImageTexture(device, "/src/world.jpg");
  const heightTexture = await createImageTexture(
    device,
    "/src/world-elevation.png",
  );

  const depthTexture = device.createTexture({
    size: [canvas.width, canvas.height],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderer: Renderer = {
    context,
    textureFormat,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
    device,
    defaultSampler,
    textures: [diffuseTexture, heightTexture],
    depthTexture,
  };

  const shader = await createShaderModule(shaderCode, device);
  const pass = new RenderPass(renderer, shader, gpuMeshes, [gpuUniform]);

  // maybe we should split projection and camera
  const camera = new Camera(new Vector3(0, 0, 10), new Vector3(), {
    fovY: controls.fovY,
    aspectRatio: controls.aspectRatio,
    zNear: controls.zNear,
    zFar: controls.zFar,
  });

  let nextFrame = requestAnimationFrame(once);

  function once() {
    cancelAnimationFrame(nextFrame);

    requestAnimationFrame(() => {
      //updateUniforms(uniform, controls);

      const viewMatrix = camera.update();
      const viewProjectionMatrix = projectionMatrix * viewMatrix;
      updateModel();

      pass.render();
    });
  }

  function animate(timestamp: DOMHighResTimeStamp) {
    uniform.set("time", timestamp / 1000 / controls.speed);

    pass.render();

    nextFrame = requestAnimationFrame(animate);
  }
}

init();
