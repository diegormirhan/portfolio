/*
 * Fumaça que segue o cursor (inspirada na página About da emotion-agency.com).
 *
 * Simulação de fluido em GPU no estilo "stable fluids": advecção semi-lagrangiana,
 * confinamento de vorticidade (os redemoinhos que dão o aspecto de fumaça), projeção de
 * pressão por Jacobi e um campo de densidade ("tinta") que o cursor injeta e que se dissipa.
 * A tinta é colorida (RGB): cada movimento injeta um tom da paleta, e a exibição acende as
 * bordas da fumaça pelo gradiente da densidade, como luz de contorno.
 */
import * as THREE from "three";

const baseVertex = /* glsl */ `
  uniform vec2 texelSize;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  void main() {
    vUv = position.xy * 0.5 + 0.5;
    vL = vUv - vec2(texelSize.x, 0.0);
    vR = vUv + vec2(texelSize.x, 0.0);
    vT = vUv + vec2(0.0, texelSize.y);
    vB = vUv - vec2(0.0, texelSize.y);
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const header = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
`;

const splatShader = header + /* glsl */ `
  uniform sampler2D uTarget;
  uniform float aspectRatio;
  uniform vec3 color;
  uniform vec2 point;
  uniform float radius;
  void main() {
    vec2 p = vUv - point;
    p.x *= aspectRatio;
    vec3 splat = exp(-dot(p, p) / radius) * color;
    gl_FragColor = vec4(texture2D(uTarget, vUv).xyz + splat, 1.0);
  }
`;

const advectionShader = header + /* glsl */ `
  uniform sampler2D uVelocity;
  uniform sampler2D uSource;
  uniform vec2 texelSize;
  uniform float dt;
  uniform float dissipation;
  void main() {
    vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
    gl_FragColor = vec4(texture2D(uSource, coord).xyz / (1.0 + dissipation * dt), 1.0);
  }
`;

const curlShader = header + /* glsl */ `
  uniform sampler2D uVelocity;
  void main() {
    float L = texture2D(uVelocity, vL).y;
    float R = texture2D(uVelocity, vR).y;
    float T = texture2D(uVelocity, vT).x;
    float B = texture2D(uVelocity, vB).x;
    gl_FragColor = vec4(0.5 * (R - L - T + B), 0.0, 0.0, 1.0);
  }
`;

const vorticityShader = header + /* glsl */ `
  uniform sampler2D uVelocity;
  uniform sampler2D uCurl;
  uniform float curl;
  uniform float dt;
  void main() {
    float L = texture2D(uCurl, vL).x;
    float R = texture2D(uCurl, vR).x;
    float T = texture2D(uCurl, vT).x;
    float B = texture2D(uCurl, vB).x;
    float C = texture2D(uCurl, vUv).x;
    vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
    force /= length(force) + 0.0001;
    force *= curl * C;
    force.y *= -1.0;
    vec2 velocity = texture2D(uVelocity, vUv).xy + force * dt;
    gl_FragColor = vec4(clamp(velocity, -1000.0, 1000.0), 0.0, 1.0);
  }
`;

const divergenceShader = header + /* glsl */ `
  uniform sampler2D uVelocity;
  void main() {
    float L = texture2D(uVelocity, vL).x;
    float R = texture2D(uVelocity, vR).x;
    float T = texture2D(uVelocity, vT).y;
    float B = texture2D(uVelocity, vB).y;
    vec2 C = texture2D(uVelocity, vUv).xy;
    if (vL.x < 0.0) L = -C.x;
    if (vR.x > 1.0) R = -C.x;
    if (vT.y > 1.0) T = -C.y;
    if (vB.y < 0.0) B = -C.y;
    gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);
  }
`;

const clearShader = header + /* glsl */ `
  uniform sampler2D uTexture;
  uniform float value;
  void main() {
    gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

const pressureShader = header + /* glsl */ `
  uniform sampler2D uPressure;
  uniform sampler2D uDivergence;
  void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    float divergence = texture2D(uDivergence, vUv).x;
    gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);
  }
`;

const gradientShader = header + /* glsl */ `
  uniform sampler2D uPressure;
  uniform sampler2D uVelocity;
  void main() {
    float L = texture2D(uPressure, vL).x;
    float R = texture2D(uPressure, vR).x;
    float T = texture2D(uPressure, vT).x;
    float B = texture2D(uPressure, vB).x;
    vec2 velocity = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);
    gl_FragColor = vec4(velocity, 0.0, 1.0);
  }
`;

const displayShader = header + /* glsl */ `
  uniform sampler2D uDye;
  uniform vec3 uRim;
  float density(vec2 uv) {
    vec3 c = texture2D(uDye, uv).rgb;
    return max(c.r, max(c.g, c.b));
  }
  void main() {
    vec3 c = texture2D(uDye, vUv).rgb;
    float d = max(c.r, max(c.g, c.b));
    vec2 grad = vec2(density(vR) - density(vL), density(vT) - density(vB));
    float edge = smoothstep(0.0, 0.14, length(grad));
    // Satura de leve: a fumaça nunca fica totalmente opaca
    float a = 1.0 - exp(-d * 2.4);
    // Tom injetado pelo cursor (normalizado) + contorno claro onde a densidade muda
    vec3 hue = c / max(d, 1e-4);
    vec3 color = mix(hue, uRim, edge * 0.45);
    float alpha = clamp(a * 0.62 + edge * a * 0.3, 0.0, 0.72);
    gl_FragColor = vec4(color * alpha, alpha);
  }
`;

type DoubleTarget = { read: THREE.WebGLRenderTarget; write: THREE.WebGLRenderTarget; swap: () => void };

export function createFluid(renderer: THREE.WebGLRenderer, opts: { simRes: number; dyeRes: number }) {
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
  quad.frustumCulled = false;
  quadScene.add(quad);

  const material = (fragmentShader: string, uniforms: Record<string, THREE.IUniform>, extra: Partial<THREE.ShaderMaterial> = {}) =>
    Object.assign(
      new THREE.ShaderMaterial({
        vertexShader: baseVertex,
        fragmentShader,
        uniforms: { texelSize: { value: new THREE.Vector2() }, ...uniforms },
        depthTest: false,
        depthWrite: false,
      }),
      extra,
    );

  const splat = material(splatShader, {
    uTarget: { value: null },
    aspectRatio: { value: 1 },
    color: { value: new THREE.Vector3() },
    point: { value: new THREE.Vector2() },
    radius: { value: 0.0022 },
  });
  const advection = material(advectionShader, {
    uVelocity: { value: null },
    uSource: { value: null },
    dt: { value: 0 },
    dissipation: { value: 0 },
  });
  const curl = material(curlShader, { uVelocity: { value: null } });
  const vorticity = material(vorticityShader, {
    uVelocity: { value: null },
    uCurl: { value: null },
    curl: { value: 6 },
    dt: { value: 0 },
  });
  const divergence = material(divergenceShader, { uVelocity: { value: null } });
  const clear = material(clearShader, { uTexture: { value: null }, value: { value: 0.8 } });
  const pressure = material(pressureShader, { uPressure: { value: null }, uDivergence: { value: null } });
  const gradient = material(gradientShader, { uPressure: { value: null }, uVelocity: { value: null } });
  const display = material(
    displayShader,
    {
      uDye: { value: null },
      uRim: { value: new THREE.Color("#d6ecff") },
    },
    { transparent: true, premultipliedAlpha: true, blending: THREE.NormalBlending },
  );

  const target = (w: number, h: number) =>
    new THREE.WebGLRenderTarget(w, h, {
      type: THREE.HalfFloatType,
      format: THREE.RGBAFormat,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      depthBuffer: false,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
    });
  const double = (w: number, h: number): DoubleTarget => {
    const pair = { read: target(w, h), write: target(w, h), swap: () => ([pair.read, pair.write] = [pair.write, pair.read]) };
    return pair;
  };

  const size = (res: number) => {
    const aspect = innerWidth / innerHeight;
    return aspect > 1 ? [Math.round(res * aspect), res] : [res, Math.round(res / aspect)];
  };

  let [sw, sh] = size(opts.simRes) as [number, number];
  let [dw, dh] = size(opts.dyeRes) as [number, number];
  let velocity = double(sw, sh);
  let dye = double(dw, dh);
  let pressureT = double(sw, sh);
  let divergenceT = target(sw, sh);
  let curlT = target(sw, sh);
  const simTexel = new THREE.Vector2(1 / sw, 1 / sh);
  const dyeTexel = new THREE.Vector2(1 / dw, 1 / dh);

  function pass(mat: THREE.ShaderMaterial, out: THREE.WebGLRenderTarget | null, texel: THREE.Vector2) {
    mat.uniforms.texelSize!.value.copy(texel);
    quad.material = mat;
    renderer.setRenderTarget(out);
    renderer.render(quadScene, camera);
  }

  function resize() {
    [velocity, dye, pressureT].forEach((d) => (d.read.dispose(), d.write.dispose()));
    divergenceT.dispose();
    curlT.dispose();
    [sw, sh] = size(opts.simRes) as [number, number];
    [dw, dh] = size(opts.dyeRes) as [number, number];
    velocity = double(sw, sh);
    dye = double(dw, dh);
    pressureT = double(sw, sh);
    divergenceT = target(sw, sh);
    curlT = target(sw, sh);
    simTexel.set(1 / sw, 1 / sh);
    dyeTexel.set(1 / dw, 1 / dh);
  }

  /** Injeta movimento e fumaça colorida em (x, y) ∈ [0,1]², com deslocamento (dx, dy) em UV. */
  function addSplat(x: number, y: number, dx: number, dy: number, color: THREE.Color) {
    const u = splat.uniforms;
    u.aspectRatio!.value = innerWidth / innerHeight;
    u.point!.value.set(x, y);
    u.uTarget!.value = velocity.read.texture;
    u.color!.value.set(dx * 2600, dy * 2600, 0);
    pass(splat, velocity.write, simTexel);
    velocity.swap();
    u.uTarget!.value = dye.read.texture;
    u.color!.value.set(color.r, color.g, color.b);
    pass(splat, dye.write, dyeTexel);
    dye.swap();
  }

  function step(dt: number) {
    curl.uniforms.uVelocity!.value = velocity.read.texture;
    pass(curl, curlT, simTexel);

    vorticity.uniforms.uVelocity!.value = velocity.read.texture;
    vorticity.uniforms.uCurl!.value = curlT.texture;
    vorticity.uniforms.dt!.value = dt;
    pass(vorticity, velocity.write, simTexel);
    velocity.swap();

    divergence.uniforms.uVelocity!.value = velocity.read.texture;
    pass(divergence, divergenceT, simTexel);

    clear.uniforms.uTexture!.value = pressureT.read.texture;
    pass(clear, pressureT.write, simTexel);
    pressureT.swap();

    pressure.uniforms.uDivergence!.value = divergenceT.texture;
    for (let i = 0; i < 20; i++) {
      pressure.uniforms.uPressure!.value = pressureT.read.texture;
      pass(pressure, pressureT.write, simTexel);
      pressureT.swap();
    }

    gradient.uniforms.uPressure!.value = pressureT.read.texture;
    gradient.uniforms.uVelocity!.value = velocity.read.texture;
    pass(gradient, velocity.write, simTexel);
    velocity.swap();

    advection.uniforms.dt!.value = dt;
    advection.uniforms.uVelocity!.value = velocity.read.texture;
    advection.uniforms.uSource!.value = velocity.read.texture;
    advection.uniforms.dissipation!.value = 0.8; // movimento assenta rápido: fumaça calma
    pass(advection, velocity.write, simTexel);
    velocity.swap();

    advection.uniforms.uVelocity!.value = velocity.read.texture;
    advection.uniforms.uSource!.value = dye.read.texture;
    advection.uniforms.dissipation!.value = 1.1; // quanto maior, mais rápido a fumaça some
    pass(advection, dye.write, simTexel);
    dye.swap();
  }

  /** Desenha a fumaça sobre o que já estiver no canvas. */
  function render() {
    display.uniforms.uDye!.value = dye.read.texture;
    pass(display, null, dyeTexel);
  }

  return { addSplat, step, render, resize };
}
