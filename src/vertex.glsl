varying vec2 vUv;
uniform float uTime;

attribute float aRandom;
attribute float aColor;
varying float vColor;
varying float vTime;

void main() {
    vUv = uv;
    vTime = uTime;
    vColor = aColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aRandom * 40.0 * (1. / -mvPosition.z );
    gl_Position = projectionMatrix * mvPosition;
}