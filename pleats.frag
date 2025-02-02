#version 330 compatibility

// you can set these 4 uniform variables dynamically or hardwire them:

uniform float	uKa, uKd, uKs;	// coefficients of each type of lighting
uniform vec4    uColor;		 // object color
uniform vec4    uSpecularColor;	 // light color
uniform float	uShininess;	// specular exponent

// in Project #1, these have to be set dynamically from glman sliders or keytime animations or by keyboard hits:
uniform float	uAd, uBd;
uniform float	uTol;
// get the noise from the 3D noise texture
// look it up using (s,t,0.) if using 2D texture coords:
// look it up using (x,y,z)  if using 3D model   coords:

uniform sampler3D Noise3;
uniform float uNoiseAmp, uNoiseFreq;

// interpolated from the vertex shader:
in  vec2  vST;                  // texture coords
in  vec3  vN;                   // normal vector
in  vec3  vL;                   // vector from point to light
in  vec3  vE;                   // vector from point to eye
in  vec3  vMC;			// model coordinates

// for Mac users:
//	Leave out the #version line, or use 120
//	Change the "in" to "varying"


const vec3 OBJECTCOLOR          = vec3( 1., 1., 1. );   // color to make the object
const vec3 ELLIPSECOLOR         = vec3( 0., 1., 1. );           // color to make the ellipse
const vec3 SPECULARCOLOR        = vec3( 1., 1., 1. );

void
main( )
{
    vec3 myColor = OBJECTCOLOR;
	vec2 st = vST;

	// blend OBJECTCOLOR and ELLIPSECOLOR by using the ellipse equation to decide how close
	// 	this fragment is to the ellipse border:
        
	int numins = int( st.s / uAd );
	int numint = int( st.t / uBd );

	//	<< do the rest of the ellipse equation to compute d >>
	float Ar = uAd/2.;
	float Br = uBd/2.;
	float Sc = numins * uAd + Ar;
	float Tc = numint * uBd + Br;

    // give the noise a range of [-1.,+1.]:
    vec4 nv = texture( Noise3, uNoiseFreq * vMC );
    float n = nv.r + nv.g + nv.b + nv.a; // 1. -> 3.
    n = n - 2.;                          //  -1. -> 1.
    n *= uNoiseAmp;                      // -uNoiseAmp -> uNoiseAmp

    float ds = st.s - Sc; // wrt ellipse center
    float dt = st.t - Tc; // wrt ellipse center
    float oldDist = sqrt( ds*ds + dt*dt );

    float newDist = oldDist + n;
    float scale = newDist / oldDist;    // this could be < 1., = 1., or > 1.
    ds *= scale;                        // scale by noise factor
    ds /= Ar;                           // ellipse equation
    dt *= scale;                        // scale by noise factor
    dt /= Br;                           // ellipse equation
    
    float dim = ds*ds + dt*dt;
    float t = smoothstep( 1.-uTol, 1.+uTol, dim );
    myColor = mix( uColor.rgb, OBJECTCOLOR, t );

	// now use myColor in the per-fragment lighting equations:

        vec3 Normal    = normalize(vN);
        vec3 Light     = normalize(vL);
        vec3 Eye       = normalize(vE);

        vec3 ambient = uKa * myColor;

        float d = max( dot(Normal,Light), 0. );       // only do diffuse if the light can see the point
        vec3 diffuse = uKd * d * myColor;

        float s = 0.;
        if( d > 0. )              // only do specular if the light can see the point
        {
                vec3 ref = normalize(  reflect( -Light, Normal )  );
                float cosphi = dot( Eye, ref );
                if( cosphi > 0. )
                        s = pow( max( cosphi, 0. ), uShininess );
        }
        vec3 specular = uKs * s * SPECULARCOLOR.rgb;
        gl_FragColor = vec4( ambient + diffuse + specular,  1. );
}