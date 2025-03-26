struct VertexOut {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f
}

@group(0) @binding(0) var<uniform> uTime: f32;

@vertex
fn vertex_main(@location(0) position: vec3f) -> VertexOut
{
    var output: VertexOut;
    var t = 1.8;

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

    output.position = vec4f(position.xyz * .4, 1);
    output.color = vec4f(position.xyz, 1);
    return output;
}

@fragment
fn fragment_main(fragData: VertexOut) -> @location(0) vec4f
{
    var position = fragData.color;

    var polar_angle = asin(position.y);
    var azimuthal_angle = atan2(position.x, position.z);

    polar_angle = (polar_angle / 3.14) + .5;
    azimuthal_angle = ((azimuthal_angle / 3.14) + 1) * .5;

    var uv = vec2f(azimuthal_angle, polar_angle);

    return vec4f(vec3f(polar_angle), 1);
}
