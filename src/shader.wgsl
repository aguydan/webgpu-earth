struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) uv: vec2f,
    @location(1) normal: vec3f,
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

    var uv = point_to_texture_coord(position.xyz);
    var dimensions = textureDimensions(heightTexture);

    var height = textureLoad(heightTexture, vec2(
        i32(uv.x * f32(dimensions.x)),
        i32(uv.y * f32(dimensions.y))
    ), 0).r;

    var initialPosition = position;
    //initialPosition += position * height * .3;

    output.position = uniforms.mvpMatrix * vec4f(initialPosition, 1);
    output.uv = uv;
    output.normal = position;

    return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
    var texture = textureSample(diffuseTexture, diffuseSampler, fragData.uv);

    return vec4f(vec3f(texture.xyz), 1);
}
