precision mediump float;

varying vec4 v_color;
varying vec2 v_texcoord;

float circle(in vec2 st, in float radius) {
  return 1.0 - smoothstep(
    1.0,
    radius,
    dot(st[0], st[1])
  );
}

void main() {
  float ellipseMask = circle(v_texcoord, 1.0);
  // if (ellipseMask == 0.0) discard;

  float alpha = v_color[3] * ellipseMask + 0.5;

  gl_FragColor = vec4(
    v_color[0],
    v_color[1],
    v_color[2],
    alpha
  );
}