uniform sampler2D logoMap;
uniform vec3 color;
uniform float intensity;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {

    vec4 tex = texture2D(logoMap, vUv);

    if(tex.a < 0.01)
        discard;

    float fresnel = pow(
        1.0 - max(dot(normalize(vNormal), normalize(vViewDir)), 0.0),
        3.0
    );

    vec3 glow = color * fresnel * 0.8;

    vec3 finalColor = tex.rgb + glow;

    gl_FragColor = vec4(
        finalColor * intensity,
        tex.a
    );

}