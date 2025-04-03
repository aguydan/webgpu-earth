import { GUI } from "dat.gui";
import { MeshGenerator } from "./mesh-generator";
import { Renderer, RenderPass } from "./render-pass";
import shaderCode from "./shader.wgsl?raw";
import { Shader } from "./shader";
import { initializeDevice } from "./lib/initialize-device";
import { updateUniforms } from "./lib/update-uniforms";

export interface Settings {
  time: number;
  fov: number;
  aspectRatio: number;
  zNear: number;
  zFar: number;
  translate: [number, number, number];
  rotate: [number, number, number];
  cameraYaw: number;
  cameraPitch: number;
}

async function init() {
  // initialize the device
  const device = await initializeDevice();

  const generator = new MeshGenerator(device);
  let meshes = generator.generateCubeSphere(1, 70);
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

  const canvasWidth = window.innerWidth;
  const canvasHeight = window.innerHeight;
  const aspectRatio = canvasWidth / canvasHeight;
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  document.body.appendChild(canvas);

  const settings: Settings = {
    time: 10,
    fov: 0.5,
    aspectRatio,
    zNear: 1,
    zFar: 2000,
    translate: [0, 0, -4],
    rotate: [0, 0, 0],
    cameraYaw: 0,
    cameraPitch: 0,
  };

  //to a separate function
  const gui = new GUI();

  const generalFolder = gui.addFolder("General");
  generalFolder.add(settings, "time", 1, 40);

  const matrixFolder = gui.addFolder("Projection matrix");
  matrixFolder.add(settings, "fov", 0, Math.PI);
  matrixFolder.add(settings, "zNear", 0, 2000);
  matrixFolder.add(settings, "zFar", 0, 2000);

  const translationFolder = gui.addFolder("Translation");
  translationFolder.add(settings.translate, "0", -10, 10);
  translationFolder.add(settings.translate, "1", -10, 10);
  translationFolder.add(settings.translate, "2", -10, 10);

  const rotationFolder = gui.addFolder("Rotation");
  rotationFolder.add(settings.rotate, "0", 0, 2 * Math.PI);
  rotationFolder.add(settings.rotate, "1", 0, 2 * Math.PI);
  rotationFolder.add(settings.rotate, "2", 0, 2 * Math.PI);

  /*   const cameraFolder = gui.addFolder("Camera");
  cameraFolder.add(settings, "cameraYaw", 0, 2 * Math.PI);
  cameraFolder.add(settings, "cameraPitch", 0, 2 * Math.PI); */

  //put a listener on every slider
  Object.values(gui.__folders).forEach((folder) => {
    folder.__controllers.forEach((controller) => {
      controller.onChange(once);
    });
  });

  // Uniforms

  const uniformValues = new Float32Array(20);
  const timeValue = uniformValues.subarray(0, 1);
  const matrixValue = uniformValues.subarray(4, 20);

  const diffuseSampler = device.createSampler({
    magFilter: "linear",
  });

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

  const image2 = await fetch("/src/world-elevation.png");
  const blob2 = await image2.blob();

  const bitmap2 = await createImageBitmap(blob2, {
    colorSpaceConversion: "none",
  });

  const heightTexture = device.createTexture({
    size: [bitmap2.width, bitmap2.height],
    format: "rgba8unorm",
    usage:
      GPUTextureUsage.TEXTURE_BINDING |
      GPUTextureUsage.COPY_DST |
      GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture(
    { source: bitmap2, flipY: true },
    { texture: heightTexture },
    { width: bitmap2.width, height: bitmap2.height },
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
    heightTexture,
  };

  const shader = await new Shader(shaderCode, renderer).createModule();
  const pass = new RenderPass(renderer, shader, uniformValues, gpuMeshes);

  let nextFrame: number;

  let prev = {
    x: 0,
    y: 0,
  };

  const sensitivity = 0.001;
  let shouldRequest = true;

  let yawFactor = 0;
  let pitchFactor = 0;

  canvas.addEventListener("mousemove", (e) => {
    if (!shouldRequest) return;

    shouldRequest = false;

    /*
    requestAnimationFrame(() => {
      if (prev.x === 0 && prev.y === 0) {
        (prev.x = e.clientX), (prev.y = e.clientY);
      }

      const current = { x: e.clientX, y: e.clientY };

      yawFactor += (e.clientY - prev.y) * sensitivity;
      pitchFactor += (prev.x - e.clientX) * sensitivity;

      settings.cameraYaw = Math.PI * Math.min(Math.max(yawFactor, 0), 1);
      settings.cameraPitch = (2 * Math.PI * pitchFactor) % (2 * Math.PI);

            updateUniforms(timeValue, matrixValue, settings);
      pass.render(uniformValues);

      prev = { ...current };

      shouldRequest = true;
    }); */
  });

  function once() {
    cancelAnimationFrame(nextFrame);

    requestAnimationFrame(() => {
      updateUniforms(timeValue, matrixValue, settings);

      pass.render(uniformValues);

      nextFrame = requestAnimationFrame(animate);
    });
  }

  function animate(time: DOMHighResTimeStamp) {
    const modifiedTime = time / 1000 / settings.time;

    updateUniforms(timeValue, matrixValue, settings, modifiedTime);

    pass.render(uniformValues);

    //nextFrame = requestAnimationFrame(animate);
  }

  nextFrame = requestAnimationFrame(animate);
}

init();
