export enum VERTEX_BUFFER_LAYOUT {
  Mesh = 0,
}

// do this as a declare module instead
export type CustomRenderPassDescriptor = GPURenderPassDescriptor & {
  colorAttachments: GPURenderPassColorAttachment[];
  depthStencilAttachment: GPURenderPassDepthStencilAttachment;
};

export interface Renderer {
  context: GPUCanvasContext;
  textureFormat: GPUTextureFormat;
  canvasWidth: number;
  canvasHeight: number;
  device: GPUDevice;
  defaultSampler: GPUSampler;
  depthTexture: GPUTexture;
  diffuseTexture: GPUTexture;
  heightTexture: GPUTexture;
}

export interface Settings {
  time: number;
  fovY: number;
  aspectRatio: number;
  zNear: number;
  zFar: number;
  translate: [number, number, number];
  rotate: [number, number, number];
  cameraYaw: number;
  cameraPitch: number;
}
