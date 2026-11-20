varying vec3 vColor;
varying float vOpacity;

void main() {
  float radius = length(gl_PointCoord - vec2(0.5)) * 2.0;
  if (radius > 1.0) discard;
  float glow = 0.4 * exp(-radius * radius * 2.5) + 0.85 * exp(-radius * radius * 9.0);
  float alpha = min(glow, 1.0) * (1.0 - smoothstep(0.8, 1.0, radius)) * vOpacity;
  gl_FragColor = vec4(vColor, alpha);
  #include <colorspace_fragment>
}
