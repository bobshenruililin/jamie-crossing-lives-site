/* The fieldwork miniature, rendered live on the GPU (WebGPU).
   Same places, same evidence, same grammar as the SVG miniature, which stays
   as the fallback. What the GPU adds is meaning, not decoration:
   - places an account lights up glow from their windows at dusk;
   - crossings are ribbons whose dots, dashes and weight keep the SVG grammar;
   - the schoolchildren's step draws all 16,139 pupils as individual points:
     an unlocated cloud over the Mainland side (residence location is not
     specified) that crosses and settles into a unit bar chart by school level.
   Paths and the cloud are illustrative; each point is one pupil in the
   Education Bureau's September 2024 snapshot. Nothing here is measured geography. */

const SHADER = /* wgsl */`
struct Globals {
  viewProj : mat4x4f,
  lightViewProj : mat4x4f,
  cameraPos : vec4f,   // xyz, time
  lightDir : vec4f,    // xyz, shadow texel
  camRight : vec4f,
  camUp : vec4f,
  params : vec4f,      // pupil progress, pupil alpha, pulses on, fog far
};
@group(0) @binding(0) var<uniform> g : Globals;
@group(0) @binding(1) var shadowTex : texture_depth_2d;
@group(0) @binding(2) var shadowSamp : sampler_comparison;

const PAPER = vec3f(0.949, 0.933, 0.890);
const INK = vec3f(0.090, 0.243, 0.251);
const LAMP = vec3f(0.945, 0.722, 0.306);

fn shadowAt(sp : vec3f) -> f32 {
  if (sp.x < 0.0 || sp.x > 1.0 || sp.y < 0.0 || sp.y > 1.0 || sp.z > 1.0) { return 1.0; }
  var s = 0.0;
  let t = g.lightDir.w;
  for (var x = -1; x <= 1; x++) {
    for (var y = -1; y <= 1; y++) {
      s += textureSampleCompareLevel(shadowTex, shadowSamp, sp.xy + vec2f(f32(x), f32(y)) * t, sp.z - 0.0025);
    }
  }
  return s / 9.0;
}
fn toShadow(world : vec3f) -> vec3f {
  let lp = g.lightViewProj * vec4f(world, 1.0);
  return vec3f(lp.x * 0.5 + 0.5, -lp.y * 0.5 + 0.5, lp.z);
}
fn hash2(p : vec2f) -> f32 { return fract(sin(dot(p, vec2f(127.1, 311.7))) * 43758.5453); }
fn hashu(x : u32) -> f32 {
  var h = x * 747796405u + 2891336453u;
  h = ((h >> ((h >> 28u) + 4u)) ^ h) * 277803737u;
  h = (h >> 22u) ^ h;
  return f32(h) / 4294967295.0;
}

struct SolidOut {
  @builtin(position) pos : vec4f,
  @location(0) world : vec3f,
  @location(1) normal : vec3f,
  @location(2) local : vec3f,
  @location(3) size : vec3f,
  @location(4) color : vec3f,
  @location(5) state : vec4f,
  @location(6) misc : vec2f,
};

@vertex fn vs_solid(@location(0) p : vec3f, @location(1) n : vec3f,
    @location(2) i0 : vec4f, @location(3) i1 : vec4f, @location(4) i2 : vec4f, @location(5) i3 : vec4f) -> SolidOut {
  var o : SolidOut;
  let world = i0.xyz + p * i1.xyz;
  o.pos = g.viewProj * vec4f(world, 1.0);
  o.world = world;
  o.normal = normalize(n / i1.xyz);
  o.local = p;
  o.size = i1.xyz;
  o.color = i2.rgb;
  o.state = i3;
  o.misc = vec2f(i0.w, i1.w);
  return o;
}

@vertex fn vs_shadow(@location(0) p : vec3f, @location(1) n : vec3f,
    @location(2) i0 : vec4f, @location(3) i1 : vec4f, @location(4) i2 : vec4f, @location(5) i3 : vec4f) -> @builtin(position) vec4f {
  return g.lightViewProj * vec4f(i0.xyz + p * i1.xyz, 1.0);
}

@fragment fn fs_solid(in : SolidOut) -> @location(0) vec4f {
  let N = normalize(in.normal);
  let L = normalize(g.lightDir.xyz);
  let lit = in.state.x;
  let dim = in.state.y;
  var base = in.color;
  var glow = vec3f(0.0);
  // Procedural windows on walls: dark glass by day, lamplight when lit.
  if (in.misc.x > 0.5 && abs(N.y) < 0.5) {
    let alongX = abs(N.z) > 0.5;
    let u = select(in.local.z * in.size.z, in.local.x * in.size.x, alongX);
    let span = select(in.size.z, in.size.x, alongX);
    let v = in.local.y * in.size.y;
    let fu = fract(u / 14.0);
    let fv = fract((v - 3.0) / 18.0);
    let inside = step(0.3, fu) * step(fu, 0.72) * step(0.32, fv) * step(fv, 0.8)
      * step(8.0, v) * step(v, in.size.y - 5.0) * step(4.0, u) * step(u, span - 4.0);
    if (inside > 0.5) {
      let h = hash2(floor(vec2f(u / 14.0, (v - 3.0) / 18.0)) + vec2f(in.misc.y * 13.1, in.misc.y * 7.7));
      base = mix(base, vec3f(0.24, 0.40, 0.38), 0.78 * (1.0 - dim * 0.6));
      glow = vec3f(1.0, 0.78, 0.38) * lit * step(0.16, h) * (0.75 + 0.5 * h);
      base = mix(base, vec3f(0.30, 0.22, 0.12), lit * 0.5);
    }
  }
  base = mix(base, vec3f(0.98, 0.80, 0.50), lit * select(0.34, 0.55, N.y > 0.5));
  base = mix(base, vec3f(0.945, 0.937, 0.905), dim * 0.62);
  let sh = shadowAt(toShadow(in.world + N * 0.6));
  let diffuse = max(dot(N, L), 0.0) * mix(1.0, sh, 0.85);
  let hemi = mix(vec3f(0.62, 0.66, 0.62), vec3f(1.0, 0.985, 0.95), N.y * 0.5 + 0.5);
  var c = base * (hemi * 0.66 + vec3f(1.0, 0.97, 0.9) * diffuse * 0.44) + glow;
  // contact darkening at the foot of walls
  if (in.state.w > 0.5 && abs(N.y) < 0.5) { c *= mix(0.8, 1.0, clamp(in.local.y * in.size.y / 12.0, 0.0, 1.0)); }
  let d = distance(in.world, g.cameraPos.xyz);
  c = mix(c, PAPER, smoothstep(g.params.w * 0.55, g.params.w * 1.25, d) * 0.35);
  return vec4f(c, 1.0);
}

struct GroundOut { @builtin(position) pos : vec4f, @location(0) world : vec3f };
@vertex fn vs_ground(@location(0) p : vec3f) -> GroundOut {
  var o : GroundOut;
  o.pos = g.viewProj * vec4f(p, 1.0);
  o.world = p;
  return o;
}
fn rectDist(p : vec2f, mn : vec2f, mx : vec2f) -> f32 {
  let q = max(max(mn - p, p - mx), vec2f(0.0));
  return length(q);
}
@fragment fn fs_ground(in : GroundOut) -> @location(0) vec4f {
  let sh = shadowAt(toShadow(in.world));
  let d = min(rectDist(in.world.xz, vec2f(-386.0, -168.0), vec2f(-100.0, 168.0)), rectDist(in.world.xz, vec2f(100.0, -168.0), vec2f(386.0, 168.0)));
  let blob = 0.16 * (1.0 - smoothstep(0.0, 90.0, d));
  let a = clamp((1.0 - sh) * 0.16 + blob, 0.0, 0.3);
  let c = vec3f(0.19, 0.36, 0.29);
  return vec4f(c * a, a);
}

struct RibOut {
  @builtin(position) pos : vec4f,
  @location(0) side : f32,
  @location(1) arclen : f32,
  @location(2) style : f32,
  @location(3) u : f32,
  @location(4) seed : f32,
};
@vertex fn vs_rib(@location(0) p : vec3f, @location(1) t : vec3f, @location(2) side : f32, @location(3) arclen : f32,
    @location(4) style : f32, @location(5) width : f32, @location(6) u : f32, @location(7) seed : f32) -> RibOut {
  var o : RibOut;
  let toCam = normalize(g.cameraPos.xyz - p);
  var off = cross(t, toCam);
  if (length(off) < 1e-4) { off = vec3f(0.0, 1.0, 0.0); }
  let world = p + normalize(off) * side * width;
  o.pos = g.viewProj * vec4f(world, 1.0);
  o.pos.z -= 0.0004 * o.pos.w;
  o.side = side;
  o.arclen = arclen;
  o.style = style;
  o.u = u;
  o.seed = seed;
  return o;
}
@fragment fn fs_rib(in : RibOut) -> @location(0) vec4f {
  let a = abs(in.side);
  var c = INK;
  if (a > 0.56) { c = PAPER; }
  if (in.style > 0.5 && in.style < 1.5) { if (fract(in.arclen / 7.0) > 0.36) { discard; } }
  if (in.style > 1.5 && in.style < 2.5) { if (fract(in.arclen / 15.0) > 0.6) { discard; } }
  if (g.params.z > 0.5 && a < 0.7) {
    let ph = fract(g.cameraPos.w * 0.22 + in.seed);
    let k = 1.0 - smoothstep(0.0, 0.03, abs(in.u - ph));
    c = mix(c, LAMP, k);
  }
  return vec4f(c, 1.0);
}

struct PartOut { @builtin(position) pos : vec4f, @location(0) uv : vec2f, @location(1) color : vec3f };
@vertex fn vs_part(@builtin(vertex_index) vi : u32, @builtin(instance_index) ii : u32) -> PartOut {
  var corners = array<vec2f, 6>(vec2f(-1.0, -1.0), vec2f(1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, -1.0), vec2f(1.0, 1.0), vec2f(-1.0, 1.0));
  let c = corners[vi];
  // 388 kindergarten · 2,577 primary · 13,174 secondary (EDB, Sept 2024 snapshot)
  let sp = 0.62;
  var k = ii - 2965u;
  var x0 = -374.0 + 72.0 * sp + 12.0;
  var color = INK;
  if (ii < 388u) { k = ii; x0 = -374.0; color = LAMP; }
  else if (ii < 2965u) { k = ii - 388u; x0 = -374.0 + 10.0 * sp + 6.0; color = vec3f(0.0, 0.549, 0.478); }
  let row = f32(k % 42u);
  let col = f32(k / 42u);
  let endP = vec3f(x0 + col * sp, -5.2, 177.0 + row * sp);
  let s = vec3f(mix(340.0, 610.0, hashu(ii * 3u)), mix(150.0, 236.0, hashu(ii * 3u + 1u)), mix(-150.0, 150.0, hashu(ii * 3u + 2u)));
  let delay = hashu(ii * 7u + 11u) * 0.5;
  let t0 = clamp((g.params.x - delay) / 0.5, 0.0, 1.0);
  let e = t0 * t0 * (3.0 - 2.0 * t0);
  let p1 = s + vec3f(-40.0, 30.0, 0.0);
  let p2 = endP + vec3f(60.0, 150.0, 0.0);
  let u = 1.0 - e;
  let pos = u * u * u * s + 3.0 * u * u * e * p1 + 3.0 * u * e * e * p2 + e * e * e * endP;
  let size = mix(0.9, 0.36, e);
  let world = pos + (g.camRight.xyz * c.x + g.camUp.xyz * c.y) * size;
  var o : PartOut;
  o.pos = g.viewProj * vec4f(world, 1.0);
  o.uv = c;
  o.color = color;
  return o;
}
@fragment fn fs_part(in : PartOut) -> @location(0) vec4f {
  if (dot(in.uv, in.uv) > 1.0) { discard; }
  let a = g.params.y;
  return vec4f(in.color * a, a);
}
`;

/* ---------- small matrix helpers (column-major, WebGPU depth 0…1) ---------- */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(...a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, far * nf, -1, 0, 0, far * near * nf, 0]);
}
function ortho(l, r, b, t, n, f) {
  return new Float32Array([2 / (r - l), 0, 0, 0, 0, 2 / (t - b), 0, 0, 0, 0, 1 / (n - f), 0, (l + r) / (l - r), (t + b) / (b - t), n / (n - f), 1]);
}
function lookAt(eye, target, up) {
  const z = norm(sub(eye, target)), x = norm(cross(up, z)), y = cross(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
}
function multiply(a, b) {
  const o = new Float32Array(16);
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) { let s = 0; for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k]; o[c * 4 + r] = s; }
  return o;
}
const hex = h => { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; };

/* ---------- meshes: unit cube, roof prism, low-poly crown ---------- */
function cubeMesh() {
  const f = [
    [[0, 0, 1], [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]]], [[0, 0, -1], [[1, 0, 0], [0, 0, 0], [0, 1, 0], [1, 1, 0]]],
    [[1, 0, 0], [[1, 0, 1], [1, 0, 0], [1, 1, 0], [1, 1, 1]]], [[-1, 0, 0], [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]]],
    [[0, 1, 0], [[0, 1, 1], [1, 1, 1], [1, 1, 0], [0, 1, 0]]], [[0, -1, 0], [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]]]
  ];
  const v = [];
  f.forEach(([n, q]) => [0, 1, 2, 0, 2, 3].forEach(i => v.push(...q[i], ...n)));
  return new Float32Array(v);
}
function prismMesh() {
  // ridge along z at x = .5, y = 1; eaves at y = 0
  const tri = (a, b, c) => { const n = norm(cross(sub(b, a), sub(c, a))); return [...a, ...n, ...b, ...n, ...c, ...n]; };
  const A = [0, 0, 0], B = [1, 0, 0], C = [.5, 1, 0], D = [0, 0, 1], E = [1, 0, 1], F = [.5, 1, 1];
  return new Float32Array([...tri(D, E, F), ...tri(B, A, C), ...tri(A, D, F), ...tri(A, F, C), ...tri(E, B, C), ...tri(E, C, F)]);
}
function crownMesh() {
  const t = (1 + Math.sqrt(5)) / 2;
  const vs = [[-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0], [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t], [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1]].map(norm);
  const fs = [[0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11], [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8], [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9], [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]];
  const out = [];
  fs.forEach(([a, b, c]) => { const n = norm(add(add(vs[a], vs[b]), vs[c])); [vs[a], vs[b], vs[c]].forEach(p => out.push(p[0] * .5 + .5, p[1] * .5 + .5, p[2] * .5 + .5, ...n)); });
  return new Float32Array(out);
}

const SIDE = {
  hk: { body: hex('#e6d8bf'), roof: hex('#58786f') },
  sz: { body: hex('#cfdccf'), roof: hex('#4f746b') },
  x:  { body: hex('#e6dfcc'), roof: hex('#58786f') }
};

/* Build every solid from the shared footprints. Each part keeps its place id
   so a scene can light or dim it. */
function buildScene(GEOMETRY, places, TREES, MAINLAND_REGION) {
  const parts = { cube: [], prism: [], crown: [] };
  let seed = 1;
  const put = (mesh, x, y, z, w, h, d, color, { place = null, windows = false, ao = true } = {}) => parts[mesh].push({ x, y, z, w, h, d, color, place, windows, ao, seed: seed++ });
  // plinths, roads, the bridge and the boundary
  [['hk', -386, '#e7decb', '#c9512d'], ['sz', 100, '#d8e2d5', '#008c7a']].forEach(([, x0, top, edge]) => {
    put('cube', x0, -24, -168, 286, 24, 336, hex('#a6b3a1'), { ao: false });
    put('cube', x0 + 4, -0.2, -164, 278, 0.4, 328, hex(top), { ao: false });
    put('cube', x0, -3.2, 167.6, 286, 2.6, 0.8, hex(edge), { ao: false });
    put('cube', x0 + 7, 0, 44, 272, 0.5, 30, hex('#efeadb'), { ao: false });
  });
  put('cube', -100, -1, 42, 200, 9, 34, hex('#e3d3b2'));
  [43, 75].forEach(z => { put('cube', -100, 17, z - .6, 200, 1.4, 1.2, hex('#426d65'), { ao: false }); for (let x = -96; x <= 100; x += 24) put('cube', x - .5, 8, z - .5, 1, 9, 1, hex('#426d65'), { ao: false }); });
  for (let z = -178; z < 186; z += 16) { if (z > 32 && z < 84) continue; put('cube', -0.6, -6, z, 1.2, 0.8, 7, hex('#517d74'), { ao: false }); }
  // Mainland scope includes Shenzhen; no residential city is assigned.
  const mainlandStart = parts.cube.length;
  put('cube', MAINLAND_REGION.x0, -3, MAINLAND_REGION.z0, MAINLAND_REGION.x1 - MAINLAND_REGION.x0, 0.6, MAINLAND_REGION.z1 - MAINLAND_REGION.z0, hex('#dce8e2'), { ao: false });
  for (let x = MAINLAND_REGION.x0; x < MAINLAND_REGION.x1; x += 14) { put('cube', x, -2.2, MAINLAND_REGION.z0 - .7, 7, .5, 1.4, hex('#008c7a'), { ao: false }); put('cube', x, -2.2, MAINLAND_REGION.z1 - .7, 7, .5, 1.4, hex('#008c7a'), { ao: false }); }
  for (let z = MAINLAND_REGION.z0; z < MAINLAND_REGION.z1; z += 14) put('cube', MAINLAND_REGION.x1 - .7, -2.2, z, 1.4, .5, 7, hex('#008c7a'), { ao: false });
  const mainlandEnd = parts.cube.length;
  // a tray in front of Hong Kong where the pupil count assembles
  const trayStart = parts.cube.length;
  put('cube', -380, -7.4, 172, 262, 2, 34, hex('#ece5d3'), { ao: false });
  const trayEnd = parts.cube.length;

  places.forEach(place => {
    const { x, z, w, d, h } = GEOMETRY[place.id];
    const side = SIDE[place.side === 'x' ? 'x' : place.side];
    const id = place.id;
    const body = (bx, bz, bw, bd, bh, color = side.body, windows = true, y = 0) => put('cube', bx, y, bz, bw, bh, bd, color, { place: id, windows });
    switch (place.kind) {
      case 'tower': body(x, z, w, d, h); body(x + w * .22, z + d * .22, w * .5, d * .5, 8, side.body, false, h); put('cube', x + w * .7, h, z + d * .5, 1, 22, 1, hex('#315b55'), { place: id }); break;
      case 'slab': body(x, z, w, d, h); break;
      case 'estate': body(x, z, 32, d, h); body(x + 42, z + 10, 32, d - 6, h * .72); break;
      case 'house': body(x, z, w, d, h); put('prism', x - 4, h, z - 4, w + 8, 26, d + 8, side.roof, { place: id }); put('cube', x + w * .42, 0, z + d, w * .18, 22, .8, hex('#21484a'), { place: id }); break;
      case 'mall': body(x, z, w, d, h); put('cube', x - 2, h * .52, z + d, w + 4, 3, 10, hex('#c7653e'), { place: id }); break;
      case 'shop': body(x, z, w, d, h); put('cube', x + w - 12, 6, z + d, 8, 32, 3, hex('#c9352a'), { place: id }); put('cube', x + 4, 4, z + d, 10, 24, 2, hex('#3f8f4f'), { place: id }); break;
      case 'school': put('cube', x + w + 4, 0, z, 36, .5, d, hex('#cbd6bf'), { place: id, ao: false }); body(x, z, w, d, h); put('cube', x + w + 30, 0, z + 8, 1.2, 52, 1.2, hex('#2e514b'), { place: id }); put('cube', x + w + 31, 42, z + 8, 14, 9, .8, hex('#c9512d'), { place: id }); break;
      case 'pitch': put('cube', x, 0, z, 84, .7, d, hex('#a9c48c'), { place: id, ao: false }); put('cube', x + 92, 0, z + 8, w - 92, .6, d - 8, hex('#ead9b0'), { place: id, ao: false }); put('cube', x + 112, 0, z + 8, w - 112, .75, d - 8, hex('#9cc4c0'), { place: id, ao: false }); put('cube', x + 41.5, .7, z + 4, 1, .1, d - 8, hex('#f6f4e8'), { place: id, ao: false }); break;
      case 'gate': [[x + 4, z + 4], [x + w - 4, z + 4], [x + 4, z + d - 4], [x + w - 4, z + d - 4]].forEach(([px, pz]) => put('cube', px - .8, 8, pz - .8, 1.6, h - 8, 1.6, hex('#2e514b'), { place: id })); body(x + w * .36, z + d * .3, w * .28, d * .4, 16, side.body, false, 8); put('cube', x - 6, h, z - 2, w + 12, 4, d + 4, hex('#e6dfcc'), { place: id }); break;
      case 'market': body(x, z, w, d, h); ['#c9512d', '#2b6f8f', '#d9a43b', '#3d8b5d'].forEach((c, i) => put('cube', x + 5 + i * 13, h - 16, z + d, 10, 10, 1, hex(c), { place: id })); break;
      case 'restaurant': body(x, z, w, d, h); put('cube', x, h * .48, z + d, w, 3, 10, hex('#c9512d'), { place: id }); break;
      case 'street': [0, 1, 2].forEach(i => { const sx = x + i * (w / 3); body(sx, z, w / 3 - 2, d, h - i * 3); put('cube', sx + 2, h - i * 3 - 10, z + d, w / 3 - 6, 7, 1, hex(['#c9352a', '#2b5fa6', '#1d7fbf'][i]), { place: id }); }); break;
      case 'clinic': body(x, z, w, d, h, hex('#eeefe6')); put('cube', x + w / 2 - 3, h - 22, z + d, 6, 16, 1, hex('#008c7a'), { place: id }); put('cube', x + w / 2 - 8, h - 17, z + d, 16, 6, 1, hex('#008c7a'), { place: id }); break;
      case 'tuition': body(x, z, w, d, h); put('cube', x + 8, h + 2, z + d - 1, w - 16, 14, 1.5, hex('#2b6f8f'), { place: id }); break;
      case 'community': put('cube', x - 4, 0, z + d + 2, w + 8, .5, 14, hex('#a9c48c'), { place: id, ao: false }); body(x, z, w, d, h); put('cube', x + w + 8, 0, z + d + 8, 1.2, 30, 1.2, hex('#6b4f46'), { place: id }); put('cube', x + w + 7.4, 18, z + d - 8, 1, 12, 16, hex('#b32f4c'), { place: id }); break;
      case 'park': put('cube', x + 4, 0, z + 6, w - 8, .7, d * .55, hex('#9cc4c0'), { place: id, ao: false }); [[x + 12, z + d - 4, 16], [x + w - 10, z + d - 2, 18], [x + w * .5, z + d + 2, 14]].forEach(([tx, tz, s]) => { put('cube', tx - 1, 0, tz - 1, 2, s * 1.2, 2, hex('#6c7f68'), { place: id }); put('crown', tx - s * .62, s * .9, tz - s * .62, s * 1.24, s * 1.1, s * 1.24, hex('#6e8f76'), { place: id }); }); break;
    }
  });
  TREES.forEach(([x, z, s]) => { put('cube', x - 1, 0, z - 1, 2, s * 1.2, 2, hex('#6c7f68'), { place: 'tree' }); put('crown', x - s * .62, s * .9, z - s * .62, s * 1.24, s * 1.1, s * 1.24, hex('#6e8f76'), { place: 'tree' }); });
  return { parts, mainland: [mainlandStart, mainlandEnd], tray: [trayStart, trayEnd] };
}

export async function createGpuWorld(canvas, data, { onFrame, onLost } = {}) {
  if (!navigator.gpu) throw new Error('WebGPU unavailable');
  const adapter = await navigator.gpu.requestAdapter({ powerPreference: 'high-performance' });
  if (!adapter) throw new Error('No WebGPU adapter');
  const device = await adapter.requestDevice();
  // Debug only: '&gpu-debug=offscreen' renders off-screen and copies pixels to a
  // 2D canvas. Headless test browsers can render WebGPU but not present it.
  const offscreen = new URLSearchParams(location.search).get('gpu-debug') === 'offscreen';
  const format = navigator.gpu.getPreferredCanvasFormat();
  const context = offscreen ? null : canvas.getContext('webgpu');
  const ctx2d = offscreen ? canvas.getContext('2d') : null;
  context?.configure({ device, format, alphaMode: 'premultiplied' });
  let resolveTex = null, readback = null, reading = false, reads = 0, readErr = '';
  let destroyed = false;
  device.lost.then(info => { if (!destroyed) onLost?.(info); });

  const { GEOMETRY, places, TREES, MAINLAND_REGION } = data;
  const scene = buildScene(GEOMETRY, places, TREES, MAINLAND_REGION);
  const module = device.createShaderModule({ code: SHADER });
  const info = await module.getCompilationInfo?.();
  if (info?.messages?.some(m => m.type === 'error')) throw new Error(info.messages.map(m => m.message).join('\n'));

  // Buffers: meshes and instances
  const meshes = { cube: cubeMesh(), prism: prismMesh(), crown: crownMesh() };
  const meshBuf = {}, instBuf = {}, instData = {};
  for (const key of Object.keys(meshes)) {
    meshBuf[key] = device.createBuffer({ size: meshes[key].byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(meshBuf[key], 0, meshes[key]);
    const list = scene.parts[key];
    const arr = new Float32Array(Math.max(1, list.length) * 16);
    list.forEach((p, i) => arr.set([p.x, p.y, p.z, p.windows ? 1 : 0, p.w, p.h, p.d, p.seed % 97, ...p.color, 0, 0, 0, 0, p.ao ? 1 : 0], i * 16));
    instData[key] = arr;
    instBuf[key] = device.createBuffer({ size: arr.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(instBuf[key], 0, arr);
  }
  const ground = new Float32Array([-900, -26, -700, 1100, -26, -700, 1100, -26, 700, -900, -26, -700, 1100, -26, 700, -900, -26, 700]);
  const groundBuf = device.createBuffer({ size: ground.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
  device.queue.writeBuffer(groundBuf, 0, ground);
  let ribbonBuf = null, ribbonCount = 0;

  const uniformBuf = device.createBuffer({ size: 256, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST });
  const shadowSize = Math.min(2048, device.limits.maxTextureDimension2D);
  const shadowTex = device.createTexture({ size: [shadowSize, shadowSize], format: 'depth32float', usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING });
  const shadowSamp = device.createSampler({ compare: 'less', magFilter: 'linear', minFilter: 'linear' });

  const mainLayout = device.createBindGroupLayout({ entries: [
    { binding: 0, visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT, buffer: { type: 'uniform' } },
    { binding: 1, visibility: GPUShaderStage.FRAGMENT, texture: { sampleType: 'depth' } },
    { binding: 2, visibility: GPUShaderStage.FRAGMENT, sampler: { type: 'comparison' } }
  ] });
  const shadowLayout = device.createBindGroupLayout({ entries: [{ binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: 'uniform' } }] });
  const mainGroup = device.createBindGroup({ layout: mainLayout, entries: [{ binding: 0, resource: { buffer: uniformBuf } }, { binding: 1, resource: shadowTex.createView() }, { binding: 2, resource: shadowSamp }] });
  const shadowGroup = device.createBindGroup({ layout: shadowLayout, entries: [{ binding: 0, resource: { buffer: uniformBuf } }] });
  const mainPL = device.createPipelineLayout({ bindGroupLayouts: [mainLayout] });
  const shadowPL = device.createPipelineLayout({ bindGroupLayouts: [shadowLayout] });

  const solidBuffers = [
    { arrayStride: 24, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }, { shaderLocation: 1, offset: 12, format: 'float32x3' }] },
    { arrayStride: 64, stepMode: 'instance', attributes: [0, 1, 2, 3].map(i => ({ shaderLocation: 2 + i, offset: i * 16, format: 'float32x4' })) }
  ];
  const SAMPLES = 4;
  const depthFormat = 'depth24plus';
  const premultiplied = { color: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' }, alpha: { srcFactor: 'one', dstFactor: 'one-minus-src-alpha' } };
  const solidPipe = device.createRenderPipeline({ layout: mainPL, vertex: { module, entryPoint: 'vs_solid', buffers: solidBuffers }, fragment: { module, entryPoint: 'fs_solid', targets: [{ format }] }, primitive: { topology: 'triangle-list', cullMode: 'none' }, depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: 'less' }, multisample: { count: SAMPLES } });
  const shadowPipe = device.createRenderPipeline({ layout: shadowPL, vertex: { module, entryPoint: 'vs_shadow', buffers: solidBuffers }, primitive: { topology: 'triangle-list', cullMode: 'none' }, depthStencil: { format: 'depth32float', depthWriteEnabled: true, depthCompare: 'less', depthBias: 2, depthBiasSlopeScale: 2 } });
  const groundPipe = device.createRenderPipeline({ layout: mainPL, vertex: { module, entryPoint: 'vs_ground', buffers: [{ arrayStride: 12, attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' }] }] }, fragment: { module, entryPoint: 'fs_ground', targets: [{ format, blend: premultiplied }] }, primitive: { topology: 'triangle-list' }, depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: 'less' }, multisample: { count: SAMPLES } });
  const ribPipe = device.createRenderPipeline({ layout: mainPL, vertex: { module, entryPoint: 'vs_rib', buffers: [{ arrayStride: 48, attributes: [
    { shaderLocation: 0, offset: 0, format: 'float32x3' }, { shaderLocation: 1, offset: 12, format: 'float32x3' }, { shaderLocation: 2, offset: 24, format: 'float32' }, { shaderLocation: 3, offset: 28, format: 'float32' },
    { shaderLocation: 4, offset: 32, format: 'float32' }, { shaderLocation: 5, offset: 36, format: 'float32' }, { shaderLocation: 6, offset: 40, format: 'float32' }, { shaderLocation: 7, offset: 44, format: 'float32' }] }] },
    fragment: { module, entryPoint: 'fs_rib', targets: [{ format }] }, primitive: { topology: 'triangle-list', cullMode: 'none' }, depthStencil: { format: depthFormat, depthWriteEnabled: true, depthCompare: 'less-equal' }, multisample: { count: SAMPLES } });
  const partPipe = device.createRenderPipeline({ layout: mainPL, vertex: { module, entryPoint: 'vs_part' }, fragment: { module, entryPoint: 'fs_part', targets: [{ format, blend: premultiplied }] }, primitive: { topology: 'triangle-list' }, depthStencil: { format: depthFormat, depthWriteEnabled: false, depthCompare: 'less' }, multisample: { count: SAMPLES } });

  // Light: high and slightly south-east, so west walls fall into shade as in the SVG model.
  const lightDir = norm([.45, 1, .5]);
  const lightCenter = [80, 0, 20];
  const lightVP = multiply(ortho(-640, 640, -430, 430, 1, 2400), lookAt(add(lightCenter, mul(lightDir, 1100)), lightCenter, [0, 1, 0]));

  // Camera: orbit around a target. yaw −0.62 and 33° elevation match the SVG view.
  const cam = { yaw: -.62, pitch: .57, dist: 1600, target: [80, 10, 0] };
  let camFrom = null, camTo = null, camStart = 0, camDur = 900;
  const FOV = 24 * Math.PI / 180;
  let viewProj = new Float32Array(16), eye = [0, 0, 0], right = [1, 0, 0], upv = [0, 1, 0];
  let W = 1, H = 1, aspect = 1, msaa = null, depth = null;

  function dirOf(yaw, pitch) { return [Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), Math.cos(yaw) * Math.cos(pitch)]; }
  function updateMatrices() {
    const d = dirOf(cam.yaw, cam.pitch);
    eye = add(cam.target, mul(d, cam.dist));
    const view = lookAt(eye, cam.target, [0, 1, 0]);
    viewProj = multiply(perspective(FOV, aspect, 10, 8000), view);
    const f = norm(sub(cam.target, eye));
    right = norm(cross(f, [0, 1, 0])); upv = cross(right, f);
  }
  /* Distance that fits every point, given the current orientation and aspect. */
  function fitDistance(points, target, yaw, pitch, margin = 1.08) {
    const d = dirOf(yaw, pitch), f = mul(d, -1), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
    const tv = Math.tan(FOV / 2), th = tv * aspect;
    let need = 0;
    points.forEach(p => { const c = sub(p, target); const x = Math.abs(dot(c, r)) * margin, y = Math.abs(dot(c, u)) * margin, z = dot(c, f); need = Math.max(need, x / th - z, y / tv - z); });
    return need;
  }

  function resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(canvas.clientWidth * dpr)), h = Math.max(1, Math.round(canvas.clientHeight * dpr));
    if (w === W && h === H && msaa) return;
    W = canvas.width = w; H = canvas.height = h; aspect = w / h;
    msaa?.destroy(); depth?.destroy();
    msaa = device.createTexture({ size: [w, h], sampleCount: SAMPLES, format, usage: GPUTextureUsage.RENDER_ATTACHMENT });
    if (offscreen) { resolveTex?.destroy(); resolveTex = device.createTexture({ size: [w, h], format, usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC }); }
    depth = device.createTexture({ size: [w, h], sampleCount: SAMPLES, format: depthFormat, usage: GPUTextureUsage.RENDER_ATTACHMENT });
  }

  /* ---------- scene state ---------- */
  let litSet = new Set(), dimming = false, showMainland = false, showTray = false;
  let pupilTarget = 0, pupilProgress = 0, pupilAlpha = 0, pupilStart = 0;
  let motion = true, pulses = false, inView = true, needsShadow = true;
  const stateAnim = { from: null, to: null, start: 0 };

  function targetStates() {
    const out = {};
    for (const key of Object.keys(scene.parts)) {
      out[key] = scene.parts[key].map((p, i) => {
        const isPlace = p.place && p.place !== 'tree';
        const lit = isPlace && litSet.has(p.place) ? 1 : 0;
        const dim = dimming && (p.place === 'tree' || (isPlace && !litSet.has(p.place))) ? 1 : 0;
        let hide = 0;
        if (key === 'cube' && i >= scene.mainland[0] && i < scene.mainland[1] && !showMainland) hide = 1;
        if (key === 'cube' && i >= scene.tray[0] && i < scene.tray[1] && !showTray) hide = 1;
        return [lit, dim, hide];
      });
    }
    return out;
  }
  function currentStates() {
    const out = {};
    for (const key of Object.keys(scene.parts)) out[key] = scene.parts[key].map((p, i) => [instData[key][i * 16 + 12], instData[key][i * 16 + 13], instData[key][i * 16 + 14]]);
    return out;
  }
  function writeStates(states) {
    for (const key of Object.keys(scene.parts)) {
      const arr = instData[key];
      states[key].forEach(([lit, dim, hide], i) => {
        const p = scene.parts[key][i];
        arr[i * 16 + 12] = lit; arr[i * 16 + 13] = dim; arr[i * 16 + 14] = hide;
        // hidden parts collapse to nothing, so they cast no shadow either
        const k = 1 - hide;
        arr[i * 16 + 4] = p.w * k; arr[i * 16 + 5] = p.h * k; arr[i * 16 + 6] = p.d * k;
      });
      device.queue.writeBuffer(instBuf[key], 0, arr);
    }
  }

  function setRibbons(arcs) {
    const verts = [];
    arcs.forEach((arc, n) => {
      const { p0, p1, p2, p3, style, thin } = arc;
      const S = 72, pts = [];
      for (let i = 0; i <= S; i++) { const t = i / S, u = 1 - t; pts.push([0, 1, 2].map(k => u * u * u * p0[k] + 3 * u * u * t * p1[k] + 3 * u * t * t * p2[k] + t * t * t * p3[k])); }
      let len = 0;
      const lens = pts.map((p, i) => (i ? (len += Math.hypot(...sub(p, pts[i - 1]))) : 0));
      const styleId = { visit: 0, ties: 1, move: 2, daily: 3 }[style] ?? 0;
      const width = (thin ? 1.5 : styleId === 3 ? 3.1 : 2.4);
      const seed = (n * .37) % 1;
      for (let i = 0; i < S; i++) {
        const a = pts[i], b = pts[i + 1], t = norm(sub(b, a));
        const quad = [[a, -1, lens[i], i / S], [b, -1, lens[i + 1], (i + 1) / S], [b, 1, lens[i + 1], (i + 1) / S], [a, -1, lens[i], i / S], [b, 1, lens[i + 1], (i + 1) / S], [a, 1, lens[i], i / S]];
        quad.forEach(([p, side, l, u]) => verts.push(...p, ...t, side, l, styleId, width, u, seed));
      }
    });
    ribbonCount = verts.length / 12;
    ribbonBuf?.destroy();
    ribbonBuf = null;
    if (!ribbonCount) return;
    const arr = new Float32Array(verts);
    ribbonBuf = device.createBuffer({ size: arr.byteLength, usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST });
    device.queue.writeBuffer(ribbonBuf, 0, arr);
  }

  /* ---------- frame ---------- */
  let frame = 0, lastCamKey = '', t0 = performance.now();
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  function step(now) {
    frame = 0;
    if (destroyed) return;
    let busy = false;
    if (camTo) {
      const k = Math.min(1, (now - camStart) / camDur), e = ease(k);
      cam.target = add(camFrom.target, mul(sub(camTo.target, camFrom.target), e));
      cam.dist = camFrom.dist + (camTo.dist - camFrom.dist) * e;
      cam.yaw = camFrom.yaw + (camTo.yaw - camFrom.yaw) * e;
      cam.pitch = camFrom.pitch + (camTo.pitch - camFrom.pitch) * e;
      if (k >= 1) camTo = null; else busy = true;
    }
    if (stateAnim.to) {
      const k = Math.min(1, (now - stateAnim.start) / 600);
      const mix = {};
      for (const key of Object.keys(stateAnim.to)) mix[key] = stateAnim.to[key].map((s, i) => s.map((v, j) => stateAnim.from[key][i][j] + (v - stateAnim.from[key][i][j]) * k));
      writeStates(mix);
      if (k >= 1) { stateAnim.to = null; needsShadow = true; } else busy = true;
    }
    if (pupilTarget > 0 || pupilAlpha > 0) {
      if (pupilTarget > 0) {
        pupilAlpha = Math.min(1, pupilAlpha + .06);
        pupilProgress = motion ? Math.min(1, (now - pupilStart) / 6500) : 1;
      } else {
        pupilAlpha = Math.max(0, pupilAlpha - .08);
        if (pupilAlpha === 0) pupilProgress = 0;
      }
      if (pupilAlpha > 0 && (pupilProgress < 1 || pupilAlpha < 1 || pupilTarget === 0)) busy = true;
    }
    if (pulses && motion && ribbonCount) busy = true;
    // debug readback: let the slow software GPU drain before queuing more work
    if (offscreen && reading) { frame = requestAnimationFrame(step); return; }
    resize();
    updateMatrices();
    draw(now);
    const key = `${cam.target.join()},${cam.dist},${cam.yaw},${cam.pitch},${W},${H},${pupilAlpha > .5},${pupilProgress > .92}`;
    if (key !== lastCamKey) { lastCamKey = key; onFrame?.(); }
    if (busy && inView && !document.hidden) frame = requestAnimationFrame(step);
  }
  function kick() { if (!frame && !destroyed) frame = requestAnimationFrame(step); }

  function draw(now) {
    const u = new Float32Array(64);
    u.set(viewProj, 0); u.set(lightVP, 16);
    u.set([...eye, (now - t0) / 1000], 32);
    u.set([...lightDir, 1 / shadowSize], 36);
    u.set([...right, 0], 40); u.set([...upv, 0], 44);
    u.set([pupilProgress, pupilAlpha, pulses && motion ? 1 : 0, cam.dist], 48);
    device.queue.writeBuffer(uniformBuf, 0, u);
    const enc = device.createCommandEncoder();
    if (needsShadow) {
      const sp = enc.beginRenderPass({ colorAttachments: [], depthStencilAttachment: { view: shadowTex.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'store' } });
      sp.setPipeline(shadowPipe); sp.setBindGroup(0, shadowGroup);
      for (const key of Object.keys(meshes)) { if (!scene.parts[key].length) continue; sp.setVertexBuffer(0, meshBuf[key]); sp.setVertexBuffer(1, instBuf[key]); sp.draw(meshes[key].length / 6, scene.parts[key].length); }
      sp.end();
      needsShadow = false;
    }
    const pass = enc.beginRenderPass({
      colorAttachments: [{ view: msaa.createView(), resolveTarget: offscreen ? resolveTex.createView() : context.getCurrentTexture().createView(), clearValue: { r: 0, g: 0, b: 0, a: 0 }, loadOp: 'clear', storeOp: 'discard' }],
      depthStencilAttachment: { view: depth.createView(), depthClearValue: 1, depthLoadOp: 'clear', depthStoreOp: 'discard' }
    });
    pass.setBindGroup(0, mainGroup);
    pass.setPipeline(solidPipe);
    for (const key of Object.keys(meshes)) { if (!scene.parts[key].length) continue; pass.setVertexBuffer(0, meshBuf[key]); pass.setVertexBuffer(1, instBuf[key]); pass.draw(meshes[key].length / 6, scene.parts[key].length); }
    if (ribbonBuf) { pass.setPipeline(ribPipe); pass.setVertexBuffer(0, ribbonBuf); pass.draw(ribbonCount); }
    pass.setPipeline(groundPipe); pass.setVertexBuffer(0, groundBuf); pass.draw(6);
    if (pupilAlpha > 0) { pass.setPipeline(partPipe); pass.draw(6, 16139); }
    pass.end();
    let copy = null;
    if (offscreen && !reading) {
      const bpr = Math.ceil(W * 4 / 256) * 256;
      readback = device.createBuffer({ size: bpr * H, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });
      enc.copyTextureToBuffer({ texture: resolveTex }, { buffer: readback, bytesPerRow: bpr }, [W, H]);
      copy = { buf: readback, bpr, w: W, h: H };
    }
    device.queue.submit([enc.finish()]);
    if (copy) { reading = true; copy.buf.mapAsync(GPUMapMode.READ).then(() => {
      const src = new Uint8Array(copy.buf.getMappedRange()), img = new ImageData(copy.w, copy.h), bgra = format.startsWith('bgra');
      for (let y = 0; y < copy.h; y++) for (let x = 0; x < copy.w; x++) {
        const i = y * copy.bpr + x * 4, o = (y * copy.w + x) * 4, a = src[i + 3] || 1;
        img.data[o] = Math.min(255, (bgra ? src[i + 2] : src[i]) * 255 / a); img.data[o + 1] = Math.min(255, src[i + 1] * 255 / a); img.data[o + 2] = Math.min(255, (bgra ? src[i] : src[i + 2]) * 255 / a); img.data[o + 3] = src[i + 3];
      }
      if (canvas.width !== copy.w) { canvas.width = copy.w; canvas.height = copy.h; }
      ctx2d.putImageData(img, 0, 0); copy.buf.unmap(); copy.buf.destroy(); reading = false; reads++;
    }).catch(e => { readErr = e.message; reading = false; }); }
  }

  const visibility = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => { inView = entries.some(e => e.isIntersecting); if (inView) kick(); }) : null;
  visibility?.observe(canvas);
  const resizeObs = typeof ResizeObserver === 'function' ? new ResizeObserver(() => kick()) : null;
  resizeObs?.observe(canvas);
  const onVisible = () => { if (!document.hidden) kick(); };
  document.addEventListener('visibilitychange', onVisible);

  // hide the Mainland scope at start
  writeStates(targetStates());
  resize(); updateMatrices();

  const api = {
    renderer: 'webgpu',
    setScene({ lit = [], dim = false, arcs = [], mainland = false, pupils = false, pulse = true }) {
      litSet = new Set(lit); dimming = dim; showMainland = mainland || pupils; showTray = pupils;
      stateAnim.from = currentStates(); stateAnim.to = targetStates(); stateAnim.start = performance.now();
      if (!motion) { writeStates(stateAnim.to); stateAnim.to = null; needsShadow = true; }
      setRibbons(arcs);
      pulses = pulse && arcs.length > 0;
      if (pupils && pupilTarget === 0) { pupilStart = performance.now(); pupilProgress = 0; }
      pupilTarget = pupils ? 1 : 0;
      kick();
    },
    /* Frame a set of world points, keeping the reader's orientation unless reset. */
    flyTo(points, { animate = true, reset = false } = {}) {
      const xs = points.map(p => p[0]), ys = points.map(p => p[1]), zs = points.map(p => p[2]);
      const target = [(Math.min(...xs) + Math.max(...xs)) / 2, (Math.min(...ys) + Math.max(...ys)) / 2, (Math.min(...zs) + Math.max(...zs)) / 2];
      const yaw = reset ? -.62 : cam.yaw, pitch = reset ? .57 : cam.pitch;
      const dist = Math.max(300, fitDistance(points, target, yaw, pitch) * api.zoom);
      const to = { target, dist, yaw, pitch };
      if (!animate || !motion) { Object.assign(cam, to); camTo = null; }
      else { camFrom = { target: [...cam.target], dist: cam.dist, yaw: cam.yaw, pitch: cam.pitch }; camTo = to; camStart = performance.now(); }
      kick();
    },
    zoom: 1,
    orbit(dYaw, dPitch = 0) {
      camTo = null;
      cam.yaw = Math.max(-1.3, Math.min(.1, cam.yaw + dYaw));
      cam.pitch = Math.max(.28, Math.min(1.15, cam.pitch + dPitch));
      kick();
    },
    zoomBy(factor) { camTo = null; cam.dist = Math.max(180, Math.min(4200, cam.dist * factor)); kick(); },
    sway() {
      if (!motion) return;
      const from = cam.yaw, start = performance.now();
      const tick = now => { if (destroyed || camTo) return; const k = Math.min(1, (now - start) / 1800); cam.yaw = from + .16 * Math.sin(Math.PI * k); kick(); if (k < 1) requestAnimationFrame(tick); else cam.yaw = from; };
      requestAnimationFrame(tick);
    },
    setMotion(on) { motion = on; kick(); },
    /* World [x, z, height] → percentage of the canvas, as the SVG overlays expect. */
    toPct([x, z, y]) {
      const v = viewProj, w = v[3] * x + v[7] * y + v[11] * z + v[15];
      const nx = (v[0] * x + v[4] * y + v[8] * z + v[12]) / w, ny = (v[1] * x + v[5] * y + v[9] * z + v[13]) / w;
      return [(nx + 1) / 2 * 100, (1 - ny) / 2 * 100];
    },
    /* The place under a client point, by ray against each footprint box. */
    pick(clientX, clientY) {
      const r = canvas.getBoundingClientRect();
      const nx = (clientX - r.left) / r.width * 2 - 1, ny = 1 - (clientY - r.top) / r.height * 2;
      const tv = Math.tan(FOV / 2), f = norm(sub(cam.target, eye));
      const dir = norm(add(add(f, mul(right, nx * tv * aspect)), mul(upv, ny * tv)));
      let best = null, bestT = Infinity;
      places.forEach(p => {
        const g = GEOMETRY[p.id], min = [g.x - 2, 0, g.z - 2], max = [g.x + Math.min(g.w, 160) + 2, Math.max(g.h, 6) + 26, g.z + g.d + 2];
        let t1 = -Infinity, t2 = Infinity;
        for (let k = 0; k < 3; k++) {
          if (Math.abs(dir[k]) < 1e-9) { if (eye[k] < min[k] || eye[k] > max[k]) return; continue; }
          let a = (min[k] - eye[k]) / dir[k], b = (max[k] - eye[k]) / dir[k];
          if (a > b) [a, b] = [b, a];
          t1 = Math.max(t1, a); t2 = Math.min(t2, b);
        }
        if (t1 <= t2 && t2 > 0 && t1 < bestT) { bestT = t1; best = p.id; }
      });
      return best;
    },
    /* Label anchors for the pupil count. */
    pupilAnchors() {
      return { cloud: [475, 0, 262], bars: [-250, 170, 4], ready: pupilAlpha > .5 && pupilProgress > .92, flying: pupilAlpha > .5 };
    },
    requestFrame: kick,
    destroy() { destroyed = true; cancelAnimationFrame(frame); visibility?.disconnect(); resizeObs?.disconnect(); document.removeEventListener('visibilitychange', onVisible); device.destroy?.(); }
  };
  if (offscreen) window.__gpuDebug = { lit: () => ({ set: [...litSet], dimming, tween: Boolean(stateAnim.to), litInstances: Object.values(instData).reduce((n, arr) => { for (let i = 12; i < arr.length; i += 16) n += arr[i] > .5 ? 1 : 0; return n; }, 0), frame: Boolean(frame), pulses, motion, reads, reading, readErr }) };
  kick();
  return api;
}
