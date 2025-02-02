#version 330 compatibility

// will be interpolated into the fragment shader:
out  vec2  vST;                 // texture coords
out  vec3  vN;                  // normal vector
out  vec3  vL;                  // vector from point to light
out  vec3  vE;                  // vector from point to eye
out  vec3  vMC;			// model coordinates
uniform float	uA, uP;
uniform float Timer;	

// for Mac users:
//	Leave out the #version line, or use 120
//	Change the "out" to "varying"

const vec3 LIGHTPOSITION = vec3( 5., 5., 0. );
const float pi = 3.1415926535;
void
main( )
{
	float Y0 = 1.0;
	float x = gl_Vertex.x;
	float y = gl_Vertex.y;
	float z = uA * (Y0-y) * sin( 2.*pi*x/uP );
	vec4 vert = gl_Vertex;
	vert.z = z;

	float dzdx = uA * (Y0-vert.y) * (2.*pi/uP) * cos( 2.*pi*vert.x/uP );
	float dzdy = -uA * sin( 2.*pi*vert.x/uP );
	vec3 Tx = vec3(1., 0., dzdx );
	vec3 Ty = vec3(0., 1., dzdy );
	vec3 normal = normalize( cross( Tx, Ty ) );
	// now use normal everywhere you would have used gl_Normal

	vST = gl_MultiTexCoord0.st;
	vMC = vert.xyz;
	vec4 ECposition = gl_ModelViewMatrix * vert; // eye coordinate position
	vN = normalize( gl_NormalMatrix * normal ); // normal vector
	vL = LIGHTPOSITION - ECposition.xyz; // vector from the point to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point to the eye position
	gl_Position = gl_ModelViewProjectionMatrix * vert;
}