varying vec2 vUv;
varying float vColor;

uniform vec4 resolution;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
varying float vTime;

void main() {
    float alpha = 1. - smoothstep(-.2, 0.5,  distance(gl_PointCoord, vec2(0.5)));
    alpha *= 0.5;

    float time = sin(vTime * 2.) * 0.5 + 0.5;
    float colorControl = fract(time + vColor);
    vec3 color = uColor1;
    color = mix(color, uColor2, smoothstep(0.2, 0.4, colorControl));
    color = mix(color, uColor3, smoothstep(0.6, 0.8, colorControl));
//
    float gradient = smoothstep(0.1, 0.68, vUv.y);
    gl_FragColor = vec4(color, alpha * gradient);
}