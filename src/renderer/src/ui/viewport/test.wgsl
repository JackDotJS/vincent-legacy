// quad shader

struct VertexOutput {
  @builtin(position) Position : vec4f,
  @location(0) Color : vec4f
};

@vertex fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> VertexOutput {
  let pos = array(
    // tri 1
    vec2f(-0.5,  0.5),
    vec2f(-0.5, -0.5),
    vec2f( 0.5, -0.5),
    // tri 2
    vec2f(-0.5,  0.5),
    vec2f( 0.5,  0.5),
    vec2f( 0.5, -0.5)
  );

  let col = array(
    // tri 1
    vec3f(0.0, 0.0, 1.0),
    vec3f(1.0, 0.0, 0.0),
    vec3f(0.0, 1.0, 0.0),
    // tri 2
    vec3f(0.0, 1.0, 0.0),
    vec3f(1.0, 0.0, 0.0),
    vec3f(0.0, 0.0, 1.0)
  );

  var output : VertexOutput;
  output.Position = vec4f(pos[vertexIndex], 0.0, 1.0);
  output.Color = vec4f(col[vertexIndex], 1.0);

  return output;
}

@fragment fn fs(@location(0) Color : vec4f) -> @location(0) vec4f {
  return Color;
}