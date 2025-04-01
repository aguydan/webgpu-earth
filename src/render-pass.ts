import { Pass } from "./pass";
import { GPUMesh, Mesh } from "./mesh";

export interface Renderer {
  context: GPUCanvasContext;
  textureFormat: GPUTextureFormat;
  canvasWidth: number;
  canvasHeight: number;
  device: GPUDevice;
  diffuseSampler: GPUSampler;
  depthTexture: GPUTexture;
  diffuseTexture: GPUTexture;
  heightTexture: GPUTexture;
}

export class RenderPass extends Pass {
  pipeline: GPURenderPipeline;

  uniformBuffer: GPUBuffer;
  bindGroup: GPUBindGroup;

  meshes: GPUMesh[];

  passDescriptor: GPURenderPassDescriptor & {
    colorAttachments: GPURenderPassColorAttachment[];
    depthStencilAttachment: GPURenderPassDepthStencilAttachment;
  };

  constructor(
    renderer: Renderer,
    shader: GPUShaderModule,
    uniforms: Float32Array,
    meshes: GPUMesh[],
  ) {
    super(renderer, shader, uniforms);

    this.uniformBuffer = this.createUniformBuffer();
    this.pipeline = this.createPipeline();
    this.bindGroup = this.createBindGroup();

    this.meshes = meshes;

    this.passDescriptor = {
      colorAttachments: [
        {
          view: undefined,
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

  draw(): void {
    const renderer = this.renderer;
    const device = renderer.device;

    // initialize textures
    // separate function

    const textureView = renderer.context.getCurrentTexture().createView();
    this.passDescriptor.colorAttachments[0].view = textureView;

    this.passDescriptor.depthStencilAttachment.view =
      renderer.depthTexture.createView();

    //initialize command encoder
    const commandEncoder = device.createCommandEncoder();
    const passEncoder = commandEncoder.beginRenderPass(this.passDescriptor);

    passEncoder.setPipeline(this.pipeline);
    passEncoder.setBindGroup(0, this.bindGroup);

    this.meshes.forEach((mesh) => {
      passEncoder.setVertexBuffer(0, mesh.verticesBuffer);
      passEncoder.setIndexBuffer(mesh.indiciesBuffer, "uint16");
      passEncoder.drawIndexed(mesh.indiciesCount);
    });

    passEncoder.end();

    device.pushErrorScope("internal");

    device.queue.submit([commandEncoder.finish()]);

    device.popErrorScope().then((error) => {
      if (error) {
        throw new Error(error.message);
      }
    });
  }

  render(uniforms: Float32Array): void {
    const device = this.renderer.device;

    device.queue.writeBuffer(
      this.uniformBuffer,
      0,
      uniforms,
      0,
      uniforms.length,
    );

    this.draw();
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
      label: "Primary bind group",
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: {
            buffer: this.uniformBuffer,
          },
        },
        {
          binding: 1,
          resource: this.renderer.diffuseSampler,
        },
        {
          binding: 2,
          resource: this.renderer.diffuseTexture.createView(),
        },
        {
          binding: 3,
          resource: this.renderer.heightTexture.createView(),
        },
      ],
    });
  }

  private createPipeline(): GPURenderPipeline {
    const device = this.renderer.device;

    return device.createRenderPipeline({
      label: "Render pipeline",
      vertex: {
        module: this.shader,
        entryPoint: "vertex_main",
        buffers: [Mesh.getLayout(0)],
      },
      fragment: {
        module: this.shader,
        entryPoint: "fragment_main",
        targets: [
          {
            format: this.renderer.textureFormat,
          },
        ],
      },
      primitive: {
        topology: "triangle-list",
        cullMode: "back",
      },
      layout: device.createPipelineLayout({
        bindGroupLayouts: [
          device.createBindGroupLayout({
            label: "Primary group layout",
            entries: [
              {
                binding: 0,
                visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                buffer: { type: "uniform" },
              },
              {
                binding: 1,
                visibility: GPUShaderStage.FRAGMENT,
                sampler: {
                  type: "filtering",
                },
              },
              {
                binding: 2,
                visibility: GPUShaderStage.FRAGMENT,
                texture: {
                  sampleType: "float",
                  viewDimension: "2d",
                  multisampled: false,
                },
              },
              {
                binding: 3,
                visibility: GPUShaderStage.FRAGMENT | GPUShaderStage.VERTEX,
                texture: {
                  sampleType: "float",
                  viewDimension: "2d",
                  multisampled: false,
                },
              },
            ],
          }),
        ],
      }),
      depthStencil: {
        depthWriteEnabled: true,
        depthCompare: "less",
        format: "depth24plus",
      },
    });
  }
}
