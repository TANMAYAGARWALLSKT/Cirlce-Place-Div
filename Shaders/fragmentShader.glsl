varying vec2 vUv;
uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uIntensity;

void main() {
    float blocks = 20.0;
    vec2 uv2 = floor(vUv * blocks) / blocks;
    float distance = length(uv2 - uMouse);
    float effect = smoothstep(0.2, 0.1, distance);

    // Simple displacement based on mouse position
    vec2 displacement = vec2(0.02) * effect * uIntensity;

    // Sample texture with displacement
    vec4 color = texture2D(uTexture, vUv + displacement);

    // Mix based on intensity
    vec4 originalColor = texture2D(uTexture, vUv);
    gl_FragColor = mix(originalColor, color, uIntensity);
}