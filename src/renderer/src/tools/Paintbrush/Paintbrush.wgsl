// textured quad shader (ellipse rendering test)

struct ShaderInput {
  color: vec4f,
  scale: vec2f,
  position: vec2f
}

struct VertexOutput {
  @builtin(position) position : vec4f,
  @location(0) texcoord : vec2f
};

@group(0) @binding(0) var<uniform> input: ShaderInput;

@vertex 
fn vs(
  @builtin(vertex_index) vertexIndex : u32
) -> VertexOutput {
  let pos = array(
    // tri 1
    vec2f(-1,  1),
    vec2f(-1, -1),
    vec2f( 1, -1),
    // tri 2
    vec2f(-1,  1),
    vec2f( 1,  1),
    vec2f( 1, -1)
  );

  var output : VertexOutput;
  output.position = vec4f(pos[vertexIndex] * input.scale + input.position, 0.0, 1.0);
  output.texcoord = pos[vertexIndex];

  return output;
}

fn circle(uv: vec2f, radius: f32) -> f32 {
  return 1.0 - smoothstep(
    1,
    radius,
    dot(uv, uv)
  );
}

@fragment 
fn fs(vsOutput: VertexOutput) -> @location(0) vec4f {
  if (input.color[3] == 0) { discard; }

  let ellipseMask = circle(vsOutput.texcoord, 1.0);

  if (ellipseMask == 0) { discard; }

  let alpha = input.color[3] * ellipseMask;
  return vec4f(
    input.color[0] * alpha, 
    input.color[1] * alpha, 
    input.color[2] * alpha, 
    alpha
  );
}