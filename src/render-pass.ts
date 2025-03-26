import { VertexData } from "./vertex-data";

interface GPUVertexData {
  meshes: {
    positions: Float32Array;
    indicies: Uint16Array;
    positionsBuffer: GPUBuffer;
    indiciesBuffer: GPUBuffer;
  }[];
  layout: GPUVertexBufferLayout;
}

export class Renderer {
  context: GPUCanvasContext;
  textureFormat: GPUTextureFormat;
  canvasWidth: number;
  aspectRatio: number;
  device: GPUDevice;
  depthTexture?: GPUTexture;

  constructor(
    context: GPUCanvasContext,
    textureFormat: GPUTextureFormat,
    canvasWidth: number,
    aspectRatio: number,
    device: GPUDevice,
  ) {
    this.context = context;
    this.textureFormat = textureFormat;
    this.canvasWidth = canvasWidth;
    this.aspectRatio = aspectRatio;
    this.device = device;
  }

  get canvasHeight(): number {
    return Math.floor(this.canvasWidth / this.aspectRatio);
  }
}

// vertices shouldnt be a part of the base pass because compute shaders dont have them
export class Pass {
  renderer: Renderer;
  shader: string;
  uniforms: Float32Array;

  constructor(renderer: Renderer, shader: string, uniforms: Float32Array) {
    this.renderer = renderer;
    this.shader = shader;
    this.uniforms = uniforms;
  }
}

export class RenderPass extends Pass {
  pipeline: GPURenderPipeline;

  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;
  bindGroupLayout: GPUBindGroupLayout;

  private _vertexData: GPUVertexData;

  passDescriptor: GPURenderPassDescriptor & {
    colorAttachments: GPURenderPassColorAttachment[];
    depthStencilAttachment: GPURenderPassDepthStencilAttachment;
  };

  constructor(
    renderer: Renderer,
    shader: string,
    uniforms: Float32Array,
    meshes: VertexData[],
  ) {
    super(renderer, shader, uniforms);

    this.uniformBuffer = this.createUniformBuffer();
    this.bindGroupLayout = this.createBindGroupLayout();
    this.bindGroup = this.createBindGroup();

    this._vertexData = this.convertToGPU(meshes);

    this.pipeline = this.createPipeline();

    this.passDescriptor = {
      colorAttachments: [
        {
          view: this.renderer.context.getCurrentTexture().createView(),
          clearValue: { r: 0, g: 0, b: 0, a: 1 },
          loadOp: "clear",
          storeOp: "store",
        },
      ],
      depthStencilAttachment: {
        view: undefined,
        depthClearValue: 1.0,
        depthLoadOp: "clear",
        depthStoreOp: "store",
      },
    };
  }

  get vertexData() {
    return this._vertexData;
  }

  setVertexData(meshes: VertexData[]): void {
    this._vertexData = this.convertToGPU(meshes);
  }

  // should probably utilize the adapter pattern
  convertToGPU(meshes: VertexData[]): GPUVertexData {
    const device = this.renderer.device;
    const convertedMeshes = [];

    for (const mesh of meshes) {
      const positions = mesh.toFloat32();

      convertedMeshes.push({
        positions: positions,
        indicies: mesh.indicies,
        positionsBuffer: device.createBuffer({
          size: positions.byteLength,
          usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        }),
        indiciesBuffer: device.createBuffer({
          size: mesh.indicies.byteLength,
          usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        }),
      });
    }

    return {
      meshes: convertedMeshes,
      layout: meshes[0].layout,
    };
  }

  writeVertexBuffers(): void {
    const device = this.renderer.device;
    //should be dependent on whether certain buffers actually need to be rewritten (for example every frame)
    for (const mesh of this.vertexData.meshes) {
      device.queue.writeBuffer(
        mesh.positionsBuffer,
        0,
        mesh.positions,
        0,
        mesh.positions.length,
      );

      device.queue.writeBuffer(
        mesh.indiciesBuffer,
        0,
        mesh.indicies,
        0,
        mesh.indicies.length,
      );
    }
  }

  render(time: DOMHighResTimeStamp): void {
    const device = this.renderer.device;

    this.uniforms[0] = time;

    device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      this.uniforms,
      0,
      this.uniforms.length,
    );

    this.draw();
  }

  draw(): void {
    const renderer = this.renderer;
    const device = renderer.device;

    const textureView = renderer.context.getCurrentTexture().createView();
    this.passDescriptor.colorAttachments[0].view = textureView;

    if (!renderer.depthTexture) {
      renderer.depthTexture = device.createTexture({
        size: [renderer.canvasWidth, renderer.canvasHeight],
        format: "depth24plus",
        usage: GPUTextureUsage.RENDER_ATTACHMENT,
      });
    }

    this.passDescriptor.depthStencilAttachment.view =
      renderer.depthTexture.createView();

    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(this.passDescriptor);

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);

    this.vertexData.meshes.forEach((mesh) => {
      passEncoder.setVertexBuffer(0, mesh.positionsBuffer);
      passEncoder.setIndexBuffer(mesh.indiciesBuffer, "uint16");
      passEncoder.drawIndexed(mesh.indicies.length);
    });

    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  private createUniformBuffer(): GPUBuffer {
    const device = this.renderer.device;

    return device.createBuffer({
      size: this.uniforms.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  private createBindGroup(): GPUBindGroup {
    const device = this.renderer.device;

    return device.createBindGroup({
      label: "Primary group",
      layout: this.bindGroupLayout,
      entries: [{ binding: 0, resource: { buffer: this.uniformBuffer } }],
    });
  }

  private createBindGroupLayout(): GPUBindGroupLayout {
    const device = this.renderer.device;

    return device.createBindGroupLayout({
      label: "Primary group layout",
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
          buffer: { type: "uniform" },
        },
      ],
    });
  }

  private createPipeline(): GPURenderPipeline {
    const device = this.renderer.device;
    const shaderModule = device.createShaderModule({
      code: this.shader,
    });

    return device.createRenderPipeline({
      label: "Render pipeline",
      vertex: {
        module: shaderModule,
        entryPoint: "vertex_main",
        buffers: [this.vertexData.layout],
      },
      fragment: {
        module: shaderModule,
        entryPoint: "fragment_main",
        targets: [
          {
            format: this.renderer.textureFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [this.bindGroupLayout],
      }),
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });
  }
}
