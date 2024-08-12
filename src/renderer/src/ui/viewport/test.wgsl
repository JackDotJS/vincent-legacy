// textured quad shader (ellipse rendering test)

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) texcoord : vec2f
};

@vertex 
fn vs(
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

  var output : VertexOutput;
  output.position = vec4f(pos[vertexIndex], 0.0, 1.0);
  output.texcoord = pos[vertexIndex];

  return output;
}

fn circle(uv: vec2f, radius: f32) -> f32 {
  return 1.0 - smoothstep(
    radius - (radius * 0.01),
    radius + (radius * 0.01),
    dot(uv, uv) * 4.0
  );
}

@fragment 
fn fs(vsOutput: VertexOutput) -> @location(0) vec4f {
  if (circle(vsOutput.texcoord, 1.0) == 0) {
    discard;
  }

  return vec4f(1.0, 0.0, 0.0, circle(vsOutput.texcoord, 1.0));
}