export default function initializeCanvas(
  canvas: HTMLCanvasElement,
  device: GPUDevice,
) {
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

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  return [context, textureFormat] as const;
}
