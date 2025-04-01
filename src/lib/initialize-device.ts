export async function initializeDevice(): Promise<GPUDevice> {
  if (!navigator.gpu) {
    throw new Error("WebGPU not supported.");
  }

  const adapter = await navigator.gpu.requestAdapter();

  if (!adapter) {
    throw new Error("Couldn't request WebGPU adapter.");
  }

  const device = await adapter.requestDevice();

  device.addEventListener("uncapturederror", (e) => {
    console.error("A WebGPU error was not captured: " + e.error.message);
  });

  return device;
}
