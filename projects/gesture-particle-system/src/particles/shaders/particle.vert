uniform vec4 uRect;
uniform float uAspect;
uniform float uMirror;
uniform float uPixelRatio;
uniform float uPointSize;
uniform float uHandTint;
uniform float uHighlight;
uniform float uSpread;
uniform float uTime;
uniform vec3 uPalmCenter;
uniform float uPalmWidth;
attribute vec3 aNormal;
attribute float aTone;
attribute float aSize;
varying vec3 vColor;
varying float vOpacity;

void main() {
  float body = 1.0 - step(0.5, uHighlight);
  float seed = clamp((aSize - 0.78) / 0.4, 0.0, 1.0);
  float halo = smoothstep(0.58, 1.0, seed) * body;
  vec3 normal = normalize(aNormal + vec3(0.0, 0.0, 0.00001));
  vec3 radial = vec3(position.xy - uPalmCenter.xy, 0.0);
  radial /= max(length(radial), 0.0001);
  vec3 drift = vec3(sin(uTime * 0.7 + seed * 19.0), cos(uTime * 0.6 + seed * 23.0), sin(uTime * 0.9 + seed * 31.0));
  vec3 local = uPalmCenter + (position - uPalmCenter) * (1.0 + 0.045 * uSpread * body);
  local += uPalmWidth * uSpread * halo * ((radial + normal) * 0.32 + drift * 0.055);
  float x = mix(local.x, 1.0 - local.x, uMirror);
  vec3 display = vec3(uRect.x + x * uRect.z, uRect.y + local.y / uAspect * uRect.w, -local.z * uRect.z);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(display, 1.0);
  gl_PointSize = clamp(uPointSize * aSize * uPixelRatio * (1.0 + halo * uSpread * 0.55), 1.0, 16.0);

  vec3 cyan = vec3(0.05, 0.86, 1.0);
  vec3 blue = vec3(0.12, 0.42, 1.0);
  vec3 purple = vec3(0.68, 0.24, 1.0);
  float tone = clamp(aTone + uHandTint * 0.18 - position.z * 1.8, 0.0, 1.0);
  vec3 color = tone < 0.5 ? mix(cyan, blue, tone * 2.0) : mix(blue, purple, (tone - 0.5) * 2.0);
  float light = 0.48 + 0.52 * abs(normalize(aNormal + vec3(0.0, 0.0, 0.00001)).z);
  vColor = mix(color * light, vec3(0.79, 0.94, 1.0), uHighlight);
  vColor = mix(vColor, vec3(0.27, 0.85, 1.0), halo * uSpread * 0.35);
  vOpacity = 1.0 - halo * uSpread * 0.35;
}
