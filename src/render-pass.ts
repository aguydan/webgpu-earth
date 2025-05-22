import { Pass } from "./pass";
import { GPUMesh, Mesh } from "./mesh";
import {
  CustomRenderPassDescriptor,
  Renderer,
  VERTEX_BUFFER_LAYOUT,
} from "./types";
import { GPUUniform } from "./uniform";

export class RenderPass extends Pass {
  pipeline: GPURenderPipeline;
  bindGroup: GPUBindGroup;

  meshes: GPUMesh[];
  uniforms: GPUUniform[];

  passDescriptor: CustomRenderPassDescriptor;

  constructor(
    renderer: Renderer,
    shader: GPUShaderModule,
    meshes: GPUMesh[],
    uniforms: GPUUniform[],
  ) {
    super(renderer, shader);

    this.meshes = meshes;
    this.uniforms = uniforms;

    this.pipeline = this.createPipeline();
    this.bindGroup = this.createBindGroup();

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
        view: this.renderer.depthTexture.createView(),
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
      passEncoder.setVertexBuffer(
        VERTEX_BUFFER_LAYOUT.Mesh,
        mesh.verticesBuffer,
      );
      passEncoder.setIndexBuffer(mesh.indiciesBuffer, "uint16");
      passEncoder.drawIndexed(mesh.indiciesCount);
    });

    passEncoder.end();

    device.queue.submit([commandEncoder.finish()]);
  }

  render(): void {
    const device = this.renderer.device;

    this.uniforms.forEach((uniform) => {
      device.queue.writeBuffer(
        uniform.buffer,
        0,
        uniform.values,
        0,
        uniform.values.length,
      );
    });

    this.draw();
  }

  private createBindGroup(): GPUBindGroup {
    const device = this.renderer.device;

    // maybe it makes sense to create both bind group entry and the layout entry on
    // uniform and texture creation in their respective classes
    return device.createBindGroup({
      label: "Primary bind group",
      layout: this.pipeline.getBindGroupLayout(0),
      entries: [
        ...this.uniforms.map((uniform) => uniform.bindGroupEntry),
        {
          binding: 1,
          resource: this.renderer.defaultSampler,
        },
        {
          binding: 2,
          resource: this.renderer.textures[0].createView(),
        },
        {
          binding: 3,
          resource: this.renderer.textures[1].createView(),
        },
      ],
    });
  }

  // we could probably dependency inject a pipeline for each mesh
  private createPipeline(): GPURenderPipeline {
    const device = this.renderer.device;

    return device.createRenderPipeline({
      label: "Render pipeline",
      vertex: {
        module: this.shader,
        entryPoint: "vertex_main",
        buffers: [Mesh.vertexBufferLayout],
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
              ...this.uniforms.map((uniform) => uniform.layoutEntry),
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
