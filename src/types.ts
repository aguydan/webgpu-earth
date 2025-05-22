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
  textures: GPUTexture[];
  depthTexture: GPUTexture;
}

export interface Settings {
  speed: number;
  fovY: number;
  aspectRatio: number;
  zNear: number;
  zFar: number;
  translate: {
    x: number;
    y: number;
    z: number;
  };
  rotate: {
    x: number;
    y: number;
    z: number;
  };
  cameraYaw: number;
  cameraPitch: number;
}
