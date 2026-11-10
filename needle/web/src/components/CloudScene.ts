// The landing page's WebGL scene: 26,183 public advisories as points (real embeddings, PCA to 3D), a needle for
// the question, and the rows a given identity may see. Data: /cloud/cloud.{json,bin} from
// scripts/build_hero_cloud.py. All state changes are uniforms or one attribute upload; nothing animates on load
// beyond a fade-in, and reduced motion gets a still scene.
import * as THREE from "three";

export interface CloudQuery {
  key: string; text: string; pos: [number, number, number];
  top10: number[]; top10_ids: string[]; batch: number[]; batch_visible_p10: number;
  p10_top10: number[]; p10_top10_ids: string[];
}
export interface CloudInfo {
  n: number; excluded_embargoed: number; p10_max_bucket: number; p10_visible: number; batch: number;
  pca_explained: number[]; generated: string; source: string; queries: CloudQuery[];
}
export type Lens = "all" | "p10-shared" | "p10-router";

const VERT = /* glsl */ `
attribute float aBucket;
attribute float aRole;
uniform float uMax, uPrevMax, uFade, uSize, uPixelRatio;
varying float vAlpha;
varying vec3 vColor;
void main() {
  float vis = mix(aBucket < uPrevMax ? 1.0 : 0.0, aBucket < uMax ? 1.0 : 0.0, uFade);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float size = uSize;
  vec3 col = vec3(0.50, 0.60, 0.63);
  float a = mix(0.045, 0.5, vis);
  if (aRole > 0.5) { a = 0.0; }
  vColor = col; vAlpha = a;
  gl_PointSize = size * uPixelRatio * (3.2 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = /* glsl */ `
varying float vAlpha;
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vColor, vAlpha * smoothstep(0.5, 0.05, d));
}`;

const HL_VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
uniform float uPixelRatio;
varying vec3 vColor;
void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vColor = aColor;
  gl_PointSize = aSize * uPixelRatio * (3.2 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const HL_FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  vec3 ring = vec3(0.04, 0.05, 0.055);
  gl_FragColor = vec4(mix(vColor, ring, smoothstep(0.30, 0.36, d)), 1.0 - smoothstep(0.46, 0.5, d));
}`;

const HALO_FRAG = /* glsl */ `
varying vec3 vColor;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  float g = pow(1.0 - d * 2.0, 2.2);
  gl_FragColor = vec4(vColor * g, g * 0.55);
}`;
const PULSE_VERT = /* glsl */ `
uniform float uTime, uPixelRatio;
varying float vT;
void main() {
  vT = fract(uTime / 2.6);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_PointSize = (14.0 + vT * 120.0) * uPixelRatio * (3.2 / -mv.z);
  gl_Position = projectionMatrix * mv;
}`;
const PULSE_FRAG = /* glsl */ `
varying float vT;
void main() {
  float d = length(gl_PointCoord - 0.5);
  float ring = smoothstep(0.5, 0.44, d) * smoothstep(0.36, 0.44, d);
  float core = smoothstep(0.5, 0.0, d) * 0.35 * (1.0 - vT);
  float a = (ring * 0.55 + core) * pow(1.0 - vT, 1.6);
  gl_FragColor = vec4(vec3(0.72, 0.95, 0.97) * a, a);
}`;
const DUST_FRAG = /* glsl */ `
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vec3(0.55, 0.68, 0.72), 0.16 * smoothstep(0.5, 0.0, d));
}`;

export async function loadCloud(): Promise<{ info: CloudInfo; pos: Float32Array; bucket: Float32Array }> {
  const [info, buf] = await Promise.all([
    fetch("/cloud/cloud.json").then((r) => r.json() as Promise<CloudInfo>),
    fetch("/cloud/cloud.bin").then((r) => r.arrayBuffer()),
  ]);
  const n = info.n;
  const q = new Int16Array(buf, 0, n * 3);
  const b = new Uint8Array(buf, n * 6, n);
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n * 3; i++) pos[i] = (q[i] / 32767) * 1.6;
  return { info, pos, bucket: Float32Array.from(b) };
}

export class CloudScene {
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  private group = new THREE.Group();
  private mat: THREE.ShaderMaterial;
  private role: THREE.BufferAttribute;
  private lines: THREE.LineSegments;
  private needle: THREE.Line;
  private tip: THREE.Points;
  private hl: THREE.Points;
  private halo: THREE.Points;
  private pulse: THREE.Points;
  private dust: THREE.Points;
  private t0 = performance.now();
  private raf = 0;
  private running = true;
  private fadeT = 1;
  private rotY = -0.6;
  private rotX = 0.18;
  private velY = 0;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;
  private needlePos = new THREE.Vector3();
  private needleTarget = new THREE.Vector3();
  private ro: ResizeObserver;
  onFrame?: (screen: { x: number; y: number } | null) => void;

  constructor(private host: HTMLElement, private data: { info: CloudInfo; pos: Float32Array; bucket: Float32Array },
              private still: boolean) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    this.renderer.setClearColor(0x000000, 0);
    host.appendChild(this.renderer.domElement);
    this.renderer.domElement.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.pos, 3));
    g.setAttribute("aBucket", new THREE.BufferAttribute(data.bucket, 1));
    this.role = new THREE.BufferAttribute(new Float32Array(data.info.n), 1);
    g.setAttribute("aRole", this.role);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uMax: { value: 100 }, uPrevMax: { value: 100 }, uFade: { value: 1 }, uSize: { value: 5.0 },
                  uPixelRatio: { value: this.renderer.getPixelRatio() } },
    });
    this.group.add(new THREE.Points(g, this.mat));

    this.hl = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
      vertexShader: HL_VERT, fragmentShader: HL_FRAG, transparent: true, depthTest: false, depthWrite: false,
      uniforms: { uPixelRatio: { value: this.renderer.getPixelRatio() } },
    }));
    this.hl.renderOrder = 3;
    this.halo = new THREE.Points(new THREE.BufferGeometry(), new THREE.ShaderMaterial({
      vertexShader: HL_VERT, fragmentShader: HALO_FRAG, transparent: true, depthTest: false, depthWrite: false,
      blending: THREE.AdditiveBlending, uniforms: { uPixelRatio: { value: this.renderer.getPixelRatio() } },
    }));
    this.halo.renderOrder = 2;
    const pg = new THREE.BufferGeometry();
    pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
    this.pulse = new THREE.Points(pg, new THREE.ShaderMaterial({
      vertexShader: PULSE_VERT, fragmentShader: PULSE_FRAG, transparent: true, depthTest: false, depthWrite: false,
      blending: THREE.AdditiveBlending, uniforms: { uTime: { value: 0 }, uPixelRatio: { value: this.renderer.getPixelRatio() } },
    }));
    this.pulse.renderOrder = 4;
    this.pulse.visible = !still;
    // depth: a sparse dust field around the cloud (atmosphere, not data), turning slower than the cloud
    const dn = 1400, dp = new Float32Array(dn * 3);
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < dn; i++) {
      const r = 3.2 + rnd() * 5.5, th = rnd() * Math.PI * 2, ph = Math.acos(2 * rnd() - 1);
      dp.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph) * 0.6, r * Math.sin(ph) * Math.sin(th)], i * 3);
    }
    const dg = new THREE.BufferGeometry();
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    this.dust = new THREE.Points(dg, new THREE.ShaderMaterial({
      vertexShader: `uniform float uPixelRatio; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_PointSize = 2.2 * uPixelRatio * (6.0 / -mv.z); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: DUST_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uPixelRatio: { value: this.renderer.getPixelRatio() } },
    }));
    this.scene.add(this.dust);
    this.lines = new THREE.LineSegments(new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0x5fdbe3, transparent: true, opacity: 0.35, depthWrite: false }));
    this.group.add(this.lines);
    this.needle = new THREE.Line(new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xf3f7f9, transparent: true, opacity: 0.85 }));
    this.group.add(this.needle);
    const tg = new THREE.BufferGeometry();
    tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(3), 3));
    this.tip = new THREE.Points(tg, new THREE.PointsMaterial({ color: 0xffffff, size: 0.09, transparent: true, opacity: 0.95, depthWrite: false }));
    this.group.add(this.tip);
    this.group.add(this.halo);
    this.group.add(this.hl);
    this.group.add(this.pulse);
    this.scene.add(this.group);

    this.ro = new ResizeObserver(() => this.resize());
    this.ro.observe(host);
    this.resize();
    this.bindDrag();
    document.addEventListener("visibilitychange", this.onVis);
    this.loop();
  }

  private onVis = () => { this.running = !document.hidden; if (this.running) this.loop(); };

  private auto = true;
  /** Pause / resume the idle turn and the needle pulse (the stage's "Pause motion" control). */
  setAuto(on: boolean) {
    this.auto = on;
    this.pulse.visible = on && !this.still;
  }

  setRunning(on: boolean) {
    if (on === this.running) return;
    this.running = on;
    if (on) this.loop();
  }

  private resize() {
    const w = this.host.clientWidth, h = this.host.clientHeight;
    if (!w || !h) return;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    const wide = w / h > 1.25;
    this.camera.position.set(0, 0, wide ? 5.6 : 6.6);
    this.group.position.x = wide ? Math.min(1.05, (w / h - 1) * 0.8) : 0;
    this.group.scale.setScalar(wide ? 1.32 : 1.1);
    this.group.position.y = wide ? 0.05 : 0.2;
    this.camera.updateProjectionMatrix();
    this.render();
  }

  private bindDrag() {
    const el = this.renderer.domElement;
    el.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "touch") return; // touch scrolls the page
      this.dragging = true; this.lastX = e.clientX; this.lastY = e.clientY; this.velY = 0;
      el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing";
    });
    el.addEventListener("pointermove", (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX, dy = e.clientY - this.lastY;
      this.lastX = e.clientX; this.lastY = e.clientY;
      this.rotY += dx * 0.006; this.velY = dx * 0.006;
      this.rotX = Math.max(-0.8, Math.min(0.8, this.rotX + dy * 0.004));
      if (this.still) this.render();
    });
    const up = () => { this.dragging = false; el.style.cursor = "grab"; };
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
  }

  /** Show what an identity sees for a query. Points: 0 plain, 1 lit, 2 fetched then removed by the permission. */
  setState(q: CloudQuery, lens: Lens) {
    const { info, pos, bucket } = this.data;
    const roles = this.role.array as Float32Array;
    roles.fill(0);
    let lit: number[] = [];
    if (lens === "all") lit = q.top10;
    else if (lens === "p10-router") lit = q.p10_top10;
    else {
      for (const i of q.batch) {
        if (bucket[i] < info.p10_max_bucket) lit.push(i); else roles[i] = 2;
      }
    }
    for (const i of lit) roles[i] = 1;
    this.role.needsUpdate = true;
    const marks = [...lit.map((i) => [i, 1] as const), ...Array.from(roles.keys()).filter((i) => roles[i] === 2).map((i) => [i, 2] as const)];
    const hp = new Float32Array(marks.length * 3), hc = new Float32Array(marks.length * 3), hs = new Float32Array(marks.length);
    marks.forEach(([i, r], k) => {
      hp.set([pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], k * 3);
      hc.set(r === 1 ? [0.37, 0.86, 0.89] : [1.0, 0.36, 0.31], k * 3);
      hs[k] = r === 1 ? 17 : 13;
    });
    this.hl.geometry.setAttribute("position", new THREE.BufferAttribute(hp, 3));
    this.hl.geometry.setAttribute("aColor", new THREE.BufferAttribute(hc, 3));
    this.hl.geometry.setAttribute("aSize", new THREE.BufferAttribute(hs, 1));
    this.hl.geometry.computeBoundingSphere();
    const hz = new Float32Array(marks.length).map((_, k) => (marks[k][1] === 1 ? 70 : 46));
    this.halo.geometry.setAttribute("position", new THREE.BufferAttribute(hp.slice(), 3));
    this.halo.geometry.setAttribute("aColor", new THREE.BufferAttribute(hc.slice(), 3));
    this.halo.geometry.setAttribute("aSize", new THREE.BufferAttribute(hz, 1));
    this.halo.geometry.computeBoundingSphere();

    const max = lens === "all" ? 100 : info.p10_max_bucket;
    const u = this.mat.uniforms;
    if (u.uMax.value !== max) { u.uPrevMax.value = u.uMax.value; u.uMax.value = max; this.fadeT = this.still ? 1 : 0; }

    this.needleTarget.set(...q.pos);
    if (this.still || this.needlePos.lengthSq() === 0) this.needlePos.copy(this.needleTarget);
    const segs = new Float32Array(lit.length * 6);
    lit.forEach((i, k) => {
      segs.set([q.pos[0], q.pos[1], q.pos[2], pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]], k * 6);
    });
    this.lines.geometry.setAttribute("position", new THREE.BufferAttribute(segs, 3));
    this.lines.geometry.computeBoundingSphere();
    this.updateNeedle();
    this.render();
  }

  private updateNeedle() {
    const p = this.needlePos;
    const dir = new THREE.Vector3(0.35, 1, 0.55).normalize();
    const far = p.clone().addScaledVector(dir, 2.6);
    this.needle.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([far.x, far.y, far.z, p.x, p.y, p.z]), 3));
    (this.tip.geometry.getAttribute("position") as THREE.BufferAttribute).set([p.x, p.y, p.z]);
    if (this.pulse) {
      (this.pulse.geometry.getAttribute("position") as THREE.BufferAttribute).set([p.x, p.y, p.z]);
      this.pulse.geometry.getAttribute("position").needsUpdate = true;
    }
    this.tip.geometry.getAttribute("position").needsUpdate = true;
  }

  private render() {
    this.group.rotation.set(this.rotX, this.rotY, 0);
    this.dust.rotation.set(this.rotX * 0.5, this.rotY * 0.35, 0);
    this.dust.position.x = this.group.position.x * 0.6;
    (this.pulse.material as THREE.ShaderMaterial).uniforms.uTime.value = (performance.now() - this.t0) / 1000;
    this.renderer.render(this.scene, this.camera);
    if (this.onFrame) {
      const v = this.needlePos.clone().applyMatrix4(this.group.matrixWorld).project(this.camera);
      const w = this.host.clientWidth, h = this.host.clientHeight;
      this.onFrame(v.z < 1 ? { x: (v.x * 0.5 + 0.5) * w, y: (-v.y * 0.5 + 0.5) * h } : null);
    }
  }

  private loop = () => {
    cancelAnimationFrame(this.raf);
    if (!this.running) return;
    if (!this.still) {
      if (!this.dragging) { this.velY *= 0.94; this.rotY += this.velY + (this.auto ? 0.0011 : 0); }
      if (this.fadeT < 1) { this.fadeT = Math.min(1, this.fadeT + 1 / 42); this.mat.uniforms.uFade.value = 1 - (1 - this.fadeT) ** 3; }
      if (this.needlePos.distanceToSquared(this.needleTarget) > 1e-6) { this.needlePos.lerp(this.needleTarget, 0.12); this.updateNeedle(); }
    } else {
      this.mat.uniforms.uFade.value = 1;
    }
    this.render();
    if (!this.still) this.raf = requestAnimationFrame(this.loop);
  };

  dispose() {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.ro.disconnect();
    document.removeEventListener("visibilitychange", this.onVis);
    this.renderer.dispose();
    this.renderer.domElement.remove();
  }
}
