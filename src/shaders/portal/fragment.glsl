#include ../random.glsl;
#include ../functions.glsl;
#include ../lights.glsl;

uniform sampler2D uScene;
uniform samplerCube uEnvMap;
uniform vec2 uResolution;
uniform float uTime;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  vec3 normal = normalize(vNormal);
  // vec3 viewNormal = (viewMatrix * vec4(normal, 0.0)).xyz;
  vec3 light = vec3(0);
  vec3 viewDir = normalize(vPosition - cameraPosition);
  vec3 lightDir = normalize(vec3(1,3,0.5));

  // light = max(0.0,dot(normal, lightDir));
  light += hemiLight(vec3(0.2,0.8,0.9), vec3(0.1,0.1,0.5), 0.2, normal);
  light += pointLight(vec3(0.4,0.1,0.9), 9., vec3(7,6,2), vPosition, normal, 10., viewDir, 10.);
  light += pointLight(vec3(0.9,0.3,0.2), 5., vec3(-7,-3,1), vPosition, normal, 32., viewDir, 10.);

  vec3 reflectDir = normalize(reflect(viewDir, normal));
  reflectDir.x *= -1.;
  vec3 envColor = texture(uEnvMap, reflectDir).rgb;
  // float specular = max(0.0, dot(reflectDir, lightDir));
  // specular = pow(specular, 12.);
  // specular = smoothstep(0.5,1.,specular);

  vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
  vec3 sceneColor = texture(uScene,screenUv + normal.xy * 0.05).rgb;

  vec3 color = vec3(1.) * light;
  // color += sceneColor * 2.;
  // color += vec3(0.2, 0.1, 0.6) * specular;

  float inverseFresnel = max(0.0, dot(-viewDir, normal));
  float fresnel = 1. - inverseFresnel;

  color += mix(color, sceneColor, min(2.0,pow(inverseFresnel,2.) * 2.));

  // color = vec3(pow(inverseFresnel,5.));

  color += envColor * pow(fresnel, 1.5) * 3.;
  color += random(vec3(gl_FragCoord.xy * 0.05 + 100., uTime + 50.)) * 0.7 * pow(fresnel,2.);

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>

}