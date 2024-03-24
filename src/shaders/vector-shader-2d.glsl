// an attribute will receive data from a buffer
attribute vec2 a_position;

uniform vec2 u_rotation;
uniform vec2 u_rotationPoint;
uniform float u_scale;
uniform vec2 u_resolution;

// all shaders have a main function
void main() {
  // to rotation point
  vec2 position = a_position * u_scale - u_rotationPoint;

  // rotate
  vec2 rotatedPosition = vec2(position.x * u_rotation.y + position.y * u_rotation.x, position.y * u_rotation.y - position.x * u_rotation.x);

  position = rotatedPosition + u_rotationPoint;

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clip space)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace.x, -clipSpace.y, 0, 1);
}