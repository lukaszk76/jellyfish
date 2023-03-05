varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec4 resolution;

void main() {
    vec2 newUV = (vUv - vec2(0.5)) * resolution.zw + vec2(0.5);
    vec4 texture = texture2D(uTexture, newUV);
    gl_FragColor = texture;
}