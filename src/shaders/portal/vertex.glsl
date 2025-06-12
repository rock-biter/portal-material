varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vPosition;

void main() {

  vNormal = (modelMatrix * vec4( normal, 1.0)).xyz;
  vec4 wPos = modelMatrix *  vec4(position, 1.0);
  vPosition = wPos.xyz;

  gl_Position = projectionMatrix * viewMatrix * wPos;
  

}