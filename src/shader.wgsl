struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
    @location(1) light: f32,
    @location(2) fresnel: f32
}

struct Uniforms {
    time: f32,
    mvpMatrix: mat4x4f
}

@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var diffuseSampler: sampler;
@group(0) @binding(2) var diffuseTexture: texture_2d<f32>;
@group(0) @binding(3) var heightTexture: texture_2d<f32>;

const PI = 3.14159265359;

fn point_to_texture_coord(position: vec3f) -> vec2f
{
    var polar_angle = asin(position.y);
    var azimuthal_angle = atan2(position.x, position.z);

    polar_angle = (polar_angle / PI) + .5;
    azimuthal_angle = (azimuthal_angle / (2 * PI)) + .5;

    var uv = vec2f(azimuthal_angle, polar_angle);

    return uv;
}

@vertex
fn vertex_main(@location(0) position: vec3f) -> VertexOut
{
    var output: VertexOut;

    output.position = uniforms.mvpMatrix * vec4f(position, 1);
    output.color = vec4f(position, 1);

    var light_dir = normalize(vec3f(1, 4, 7) - position);
    output.light = clamp(dot(position, light_dir), 0., 1.);

    output.fresnel = 1 - dot(position, vec3f(0, 0, 1));

    return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
    var position = fragData.color;

    var uv = point_to_texture_coord(position.xyz);
    var texture = textureSample(diffuseTexture, diffuseSampler, uv);

    return vec4f(texture);
}
