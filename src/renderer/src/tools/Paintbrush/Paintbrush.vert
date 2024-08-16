precision mediump float;

attribute vec3 position;
attribute vec4 color;
attribute vec2 uv;

varying vec4 v_color;
varying vec2 v_texcoord;

void main() {
  v_color = color;
  v_texcoord = uv;

  gl_Position = vec4(position, 1);
}