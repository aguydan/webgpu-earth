import { GUI } from "dat.gui";
import { MeshGenerator } from "./mesh-generator";
import { Renderer, RenderPass } from "./render-pass";
import shaderCode from "./shader.wgsl?raw";
import { Matrix4x4 } from "./matrix4x4";
import { Shader } from "./shader";
import { initializeDevice } from "./lib/initialize-device";

async function init() {
  // initialize the device
  const device = await initializeDevice();

  const generator = new MeshGenerator(device);
  const meshes = generator.generateCubeSphere(30);
  const gpuMeshes = meshes.map((mesh) => mesh.toGPUMesh());

  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgpu");

  if (!context) {
    throw Error("Canvas is not supported");
  }

  const textureFormat = navigator.gpu.getPreferredCanvasFormat();

  context.configure({
    device: device,
    format: textureFormat,
    alphaMode: "premultiplied",
  });

  const canvasWidth = 1280;
  const canvasHeight = Math.floor(canvasWidth / (16 / 9));

  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  document.body.appendChild(canvas);

  const settings = {
    time: 1,
    left: 0,
    right: canvasWidth,
    top: canvasHeight,
    bottom: 0,
    near: 1200,
    far: -1200,
  };

  //to a separate function
  const gui = new GUI();

  const generalFolder = gui.addFolder("General");
  generalFolder.add(settings, "time", 1, 10);

  const matrixFolder = gui.addFolder("Projection matrix");
  matrixFolder.add(settings, "left", 0, 1000);
  matrixFolder.add(settings, "right", 0, 1000);
  matrixFolder.add(settings, "top", 0, 1000);
  matrixFolder.add(settings, "bottom", 0, 1000);
  matrixFolder.add(settings, "near", -1199, 1200);
  matrixFolder.add(settings, "far", -1200, 1200);

  //put a listener on every slider
  Object.values(gui.__folders).forEach((folder) => {
    folder.__controllers.forEach((controller) => {
      controller.onChange(once);
    });
  });

  let projection = Matrix4x4.orthographic(
    settings.left,
    settings.right,
    settings.top,
    settings.bottom,
    settings.near,
    settings.far,
  );

  //uniforms
  // mind data layout!!!!
  const uniformValues = new Float32Array([0, 0, 0, 0, ...projection.values]);

  const timeValue = uniformValues.subarray(0, 1);
  const projectionValue = uniformValues.subarray(4, 20);

  const diffuseSampler = device.createSampler();

  //image loading
  const image = await fetch("/src/world.jpg");
  const blob = await image.blob();

  const bitmap = await createImageBitmap(blob, {
    colorSpaceConversion: "none",
  });

  const diffuseTexture = device.createTexture({
    size: [bitmap.width, bitmap.height],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: bitmap, flipY: true },
    { texture: diffuseTexture },
    { width: bitmap.width, height: bitmap.height },
  );

  const depthTexture = device.createTexture({
    size: [canvasWidth, canvasHeight],
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const renderer: Renderer = {
    context,
    textureFormat,
    canvasWidth,
    canvasHeight,
    device,
    diffuseSampler,
    diffuseTexture,
    depthTexture,
  };

  const shader = await new Shader(shaderCode, renderer).createModule();
  const pass = new RenderPass(renderer, shader, uniformValues, gpuMeshes);

  let nextFrame: number;

  function once() {
    cancelAnimationFrame(nextFrame);

    requestAnimationFrame(() => {
      projection = Matrix4x4.orthographic(
        settings.left,
        settings.right,
        settings.top,
        settings.bottom,
        settings.near,
        settings.far,
      );

      projectionValue.set(projection.values);

      pass.render(uniformValues);

      nextFrame = requestAnimationFrame(animate);
    });
  }

  function animate(time: DOMHighResTimeStamp) {
    timeValue.set([time / 1000 / settings.time]);
    pass.render(uniformValues);

    nextFrame = requestAnimationFrame(animate);
  }

  nextFrame = requestAnimationFrame(animate);
}

init();
