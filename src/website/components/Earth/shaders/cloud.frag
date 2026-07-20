uniform sampler2D cloudMap;

uniform vec3 sunDirection;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vView;

void main(){

    vec4 tex =

        texture2D(

            cloudMap,

            vUv

        );

    float alpha = tex.r;

    vec3 N = normalize(vNormal);
    vec3 V = normalize(vView);
    vec3 L = normalize(sunDirection);

    float sunlight =

        max(

            dot(N,L),

            0.0

        );

    float fresnel =

        pow(

            1.0 -

            max(dot(V,N),0.0),

            3.0

        );

    vec3 cloudWhite = vec3(

        0.98,

        0.99,

        1.0

    );

    vec3 sunset = vec3(

        1.0,

        0.72,

        0.42

    );

    vec3 color =

        mix(

            cloudWhite,

            sunset,

            pow(

                1.0 - sunlight,

                4.0

            )

            *

            sunlight

        );

    color *=

        mix(

            0.05,

            1.25,

            sunlight

        );

    color +=

        mix(

            vec3(

                0.55,

                0.72,

                1.0

            ),

            vec3(

                1.0,

                0.72,

                0.35

            ),

            pow(

                1.0 -

                sunlight,

                4.0

            )

        )

        *

        fresnel

        *

        0.25;

    gl_FragColor =

        vec4(

            color,

            alpha * 0.42

        );

}