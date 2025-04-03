import { Vector3 } from "./vector3";
import { Mesh } from "./mesh";

export class MeshGenerator {
  constructor(private _device: GPUDevice) {}

  // Thanks to Sebastian Lague
  generateFace(
    meshData: { position: Vector3; a: Vector3; b: Vector3; meshSize: number },
    resolution: number = 2,
  ): Mesh {
    const vertices: Vector3[] = [];
    const indicies = new Uint16Array((resolution - 1) * (resolution - 1) * 6);

    let triangleIndex = 0;

    for (let y = 0; y < resolution; y++) {
      for (let x = 0; x < resolution; x++) {
        const vertexIndex = x + resolution * y;

        // we first subtract 1 because if the resolution is 3
        // then x / resolution yields 0, 0.3, 0.6 which isnt 0 to 1 range
        //
        // 2 * a - 1 is for mapping a to the -1 to 1 range

        // edit this to new range
        const stepX = x / (resolution - 1);
        const stepY = y / (resolution - 1);

        const { position, a, b, meshSize } = meshData;

        const vertex = position
          .add(a.mult(meshSize * stepX))
          .add(b.mult(meshSize * stepY));

        vertices.push(vertex);

        if (x !== resolution - 1 && y !== resolution - 1) {
          indicies[triangleIndex] = vertexIndex;
          indicies[triangleIndex + 1] = vertexIndex + resolution + 1;
          indicies[triangleIndex + 2] = vertexIndex + resolution;
          indicies[triangleIndex + 3] = vertexIndex;
          indicies[triangleIndex + 4] = vertexIndex + 1;
          indicies[triangleIndex + 5] = vertexIndex + resolution + 1;

          triangleIndex += 6;
        }
      }
    }

    return new Mesh(vertices, indicies, this._device);
  }

  // Just like generate face, but generates the face made of multiple meshes
  generateSubdividedFace(
    normal: Vector3,
    resolution: number = 1,
    resolutionPerMesh: number = 2,
  ): Mesh[] {
    const axisA = new Vector3(normal.y, normal.z, normal.x);
    const axisB = Vector3.cross(normal, axisA);

    const meshes: Mesh[] = [];
    const meshCount = resolution * resolution;

    // part of the range taken by a single mesh
    const meshSize = 2 / resolution;

    for (let i = 0; i < meshCount; i++) {
      const x = i % resolution;
      const y = Math.floor(i / resolution);

      const position = normal
        .add(axisA.mult(2 * (x / resolution) - 1))
        .add(axisB.mult(2 * (y / resolution) - 1));

      const meshData = {
        position,
        a: axisA,
        b: axisB,
        meshSize,
      };

      meshes.push(this.generateFace(meshData, resolutionPerMesh));
    }

    return meshes;
  }

  generateCube(resolution: number = 1, resolutionPerMesh: number = 2): Mesh[] {
    const data: Mesh[] = [];

    const sideNormals = [
      Vector3.up,
      Vector3.down,
      Vector3.left,
      Vector3.right,
      Vector3.forward,
      Vector3.back,
    ];

    for (const normal of sideNormals) {
      data.push(
        ...this.generateSubdividedFace(normal, resolution, resolutionPerMesh),
      );
    }

    return data;
  }

  generateCubeSphere(
    resolution: number = 1,
    resolutionPerMesh: number = 2,
  ): Mesh[] {
    const data = this.generateCube(resolution, resolutionPerMesh);

    for (const d of data) {
      d.vertices = d.vertices.map((vertex) => vertex.normalized);
    }

    return data;
  }
}
