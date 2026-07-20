uniform vec3 sunDirection;

varying vec3 vNormal;
varying vec3 vView;

void main() {

    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    vec3 L = normalize(sunDirection);

    //----------------------------------
    // Fresnel
    //----------------------------------

    float fresnel = pow(

        1.0 - max(dot(V, N), 0.0),

        4.0

    );

    //----------------------------------
    // Sun
    //----------------------------------

    float sun = dot(N, L);

    //----------------------------------
    // Rayleigh (Blue Sky)
    //----------------------------------

    vec3 rayleigh = vec3(

        0.20,
        0.55,
        1.00

    );

    //----------------------------------
    // Sunset (Orange Rim)
    //----------------------------------

    vec3 sunset = vec3(

        1.00,
        0.55,
        0.20

    );

    //----------------------------------
    // Terminator
    //----------------------------------

    float horizon =

        exp(

            -abs(sun) * 8.0

        );

    //----------------------------------
    // Day Strength
    //----------------------------------

    float day =

        smoothstep(

            -0.05,

            0.15,

            sun

        );

    //----------------------------------
    // Night Fade
    //----------------------------------

    float night =

        smoothstep(

            -0.30,

            -0.05,

            sun

        );

    //----------------------------------
    // Atmosphere Color
    //----------------------------------

    vec3 color =

        rayleigh * day

        +

        sunset * horizon * 0.9;

    //----------------------------------
    // Alpha
    //----------------------------------

    float alpha =

        fresnel

        *

        (0.10 + day * 0.45)

        +

        horizon * 0.12;

    alpha *= (1.0 - night);

    //----------------------------------
    // Output
    //----------------------------------

    gl_FragColor = vec4(

        color,

        alpha

    );

}