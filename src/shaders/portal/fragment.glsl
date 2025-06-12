#include ../random.glsl;
#include ../functions.glsl;
#include ../lights.glsl;

uniform sampler2D uScene;
uniform vec2 uResolution;

varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  vec3 normal = normalize(vNormal);
  float light = 0.;
  vec3 viewDir = normalize(vPosition - cameraPosition);
  vec3 lightDir = normalize(vec3(1,3,0.5));

  light = max(0.0,dot(normal, lightDir));
  light += 0.8;

  vec3 reflectDir = normalize(reflect(viewDir, normal));
  float specular = max(0.0, dot(reflectDir, lightDir));
  specular = smoothstep(0.5,1.,specular);

  vec2 screenUv = gl_FragCoord.xy / uResolution.xy;
  vec3 sceneColor = texture(uScene,screenUv).rgb;

  vec3 color = sceneColor * vec3(1.,1.,1.2) * light * 2.;
  // color += sceneColor * 2.;
  color += vec3(0.2, 0.1, 0.6) * specular;

  gl_FragColor = vec4(color, 1.0);

  #include <tonemapping_fragment>
	#include <colorspace_fragment>

}