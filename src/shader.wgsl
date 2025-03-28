struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
}

struct Uniforms {
    uTime: f32,
    uProjectionMatrix: mat4x4f
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var diffuseSampler: sampler;
@group(0) @binding(2) var diffuseTexture: texture_2d<f32>;

@vertex
fn vertex_main(@location(0) position: vec3f) -> VertexOut
{
    var output: VertexOut;
    var t = uniforms.uTime;

    var rotateZ = mat3x3f(
        cos(t), -sin(t), 0,
        sin(t), cos(t), 0,
        0, 0, 1
    );

    var rotateY = mat3x3f(
        cos(t), 0, sin(t),
        0, 1, 0,
        -sin(t), 0, cos(t)
    );

    var rotateX = mat3x3f(
        1, 0, 0,
        0, cos(t), -sin(t),
        0, sin(t), cos(t)
    );

    var s = 400.;

    var modelMatrix = mat4x4f(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 0,
        1.8, 1, 0, 1 / s
    );

    var fudgeMatrix = mat4x4f(
        1, 0, 0, 0,
        0, 1, 0, 0,
        0, 0, 1, 2,
        0, 0, 0, 1
    );

    output.position = fudgeMatrix * uniforms.uProjectionMatrix * modelMatrix * vec4f(rotateY * position, 1);
    output.color = vec4f(position, 1);
    return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
    var position = fragData.color;

    var polar_angle = asin(position.y);
    var azimuthal_angle = atan2(position.x, position.z);

    polar_angle = (polar_angle / 3.14) + .5;
    azimuthal_angle = 1. - ((azimuthal_angle / 3.14) + 1) * .5;

    var uv = vec2f(azimuthal_angle, polar_angle);

    var texture = textureSample(diffuseTexture, diffuseSampler, uv);

    return vec4f(dot(position.xyz, vec3f(1000, 1000, 0)));
}
