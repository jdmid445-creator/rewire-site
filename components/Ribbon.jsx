'use client';

import { useEffect, useRef } from 'react';

/**
 * The hero: a ribbon of folded plates that flows across the page like a cable carrying fees.
 * Built live in three.js so it stays sharp at any size and keeps moving.
 * Plates travel along the curve, the ribbon twists slowly, and it leans toward the cursor.
 */
const PALETTE = ['#E9A9C6', '#A9C3EC', '#C6AEEA', '#F1BBA6', '#B7C9F0', '#E3B2D8'];

export default function Ribbon() {
  const wrap = useRef(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    let dead = false;
    let cleanup = () => {};

    (async () => {
      const THREE = await import('three');
      const { RoomEnvironment } = await import('three/examples/jsm/environments/RoomEnvironment.js');
      if (dead) return;

      let renderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      } catch {
        return; // no WebGL: the page reads fine without the ribbon
      }
      const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      renderer.setPixelRatio(Math.min(1.75, window.devicePixelRatio || 1));
      renderer.toneMapping = THREE.NeutralToneMapping;
      renderer.toneMappingExposure = 1.02;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      el.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      scene.environmentIntensity = 0.75;

      const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
      camera.position.set(0, 0, 22);

      const key = new THREE.DirectionalLight('#ffffff', 1.6);
      key.position.set(-6, 9, 12);
      key.castShadow = true;
      key.shadow.mapSize.set(1024, 1024);
      key.shadow.radius = 8;
      key.shadow.camera.left = -20; key.shadow.camera.right = 20;
      key.shadow.camera.top = 12; key.shadow.camera.bottom = -12;
      key.shadow.camera.near = 1; key.shadow.camera.far = 40;
      scene.add(key);
      scene.add(new THREE.HemisphereLight('#ffffff', '#d8d6e4', 0.9));

      // Soft shadow on the page behind the ribbon.
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 40), new THREE.ShadowMaterial({ opacity: 0.07 }));
      floor.position.z = -3.2;
      floor.receiveShadow = true;
      scene.add(floor);

      const group = new THREE.Group();
      scene.add(group);

      // One plate: a thin card folded into a V, the fold pointing along the ribbon.
      const H = 0.95, D = 0.34, T = 0.11, W = 1.15;
      const shape = new THREE.Shape();
      shape.moveTo(0, H); shape.lineTo(D, 0); shape.lineTo(0, -H);
      shape.lineTo(-T, -H); shape.lineTo(D - T, 0); shape.lineTo(-T, H); shape.closePath();
      const geo = new THREE.ExtrudeGeometry(shape, { depth: W, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.028, bevelSegments: 3, curveSegments: 1 });
      geo.translate(-D / 2, 0, -W / 2);
      geo.computeVertexNormals();

      const mat = new THREE.MeshPhysicalMaterial({ roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.4, sheen: 0.4, sheenRoughness: 0.6, sheenColor: new THREE.Color('#ffffff') });

      const COUNT = 104;
      const plates = new THREE.InstancedMesh(geo, mat, COUNT);
      plates.castShadow = true;
      plates.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      const c = new THREE.Color();
      for (let i = 0; i < COUNT; i++) {
        c.set(PALETTE[i % PALETTE.length]);
        c.offsetHSL(0, 0, ((i * 37) % 7) / 200 - 0.015);
        plates.setColorAt(i, c);
      }
      group.add(plates);

      // A few small grey squares drifting in the air around it.
      const dotGeo = new THREE.BoxGeometry(0.16, 0.16, 0.05);
      const dotMat = new THREE.MeshStandardMaterial({ color: '#8f8f96', roughness: 0.7 });
      const DOTS = 18;
      const dots = new THREE.InstancedMesh(dotGeo, dotMat, DOTS);
      const seeds = Array.from({ length: DOTS }, (_, i) => {
        const r = (n) => { const s = Math.sin(i * 91.7 + n * 13.3) * 43758.5453; return s - Math.floor(s); };
        return { x: r(1), y: r(2), z: r(3) * 4 - 2, sp: 0.15 + r(4) * 0.3, rot: r(5) * 6 };
      });
      group.add(dots);

      // Layout in world units, recomputed on resize.
      let span = 20, amp = 1.6, lift = 0, scale = 1, viewW = 20, viewH = 10, narrow = false;
      const resize = () => {
        const w = el.clientWidth, h = el.clientHeight;
        if (!w || !h) return;
        renderer.setSize(w, h, false);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        viewH = 2 * camera.position.z * Math.tan((camera.fov * Math.PI) / 360);
        viewW = viewH * camera.aspect;
        narrow = w < 760;
        scale = narrow ? 0.7 : Math.min(1.45, Math.max(1, viewW / 22));
        span = viewW * 1.25;
        amp = viewH * (narrow ? 0.08 : 0.155);
        lift = viewH * (narrow ? 0.25 : 0.2);
      };
      resize();

      const P = new THREE.Vector3(), P2 = new THREE.Vector3(), Tn = new THREE.Vector3();
      const N = new THREE.Vector3(), B = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0);
      const M = new THREE.Matrix4(), S = new THREE.Vector3(), Q = new THREE.Quaternion(), twist = new THREE.Quaternion();
      const curve = (s, t, out) => {
        const x = (s - 0.5) * span;
        const y = lift + amp * (Math.sin(s * Math.PI * 2.2 + 0.9 + t * 0.12) * 0.85 + Math.sin(s * Math.PI * 4.6 - t * 0.09) * 0.25) - (s - 0.5) * amp * 0.6;
        const z = Math.cos(s * Math.PI * 1.7 + t * 0.07) * 2.2;
        return out.set(x, y, z);
      };

      const look = { x: 0, y: 0 }, aim = { x: 0, y: 0 };
      const onMove = (e) => {
        aim.x = (e.clientX / window.innerWidth - 0.5) * 2;
        aim.y = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      window.addEventListener('pointermove', onMove, { passive: true });

      const draw = (t) => {
        look.x += (aim.x - look.x) * 0.04;
        look.y += (aim.y - look.y) * 0.04;
        group.rotation.y = look.x * 0.06;
        group.rotation.x = look.y * 0.04;

        const flow = still ? 0 : t * 0.018;
        for (let i = 0; i < COUNT; i++) {
          const s = (((i / COUNT) + flow) % 1 + 1) % 1;
          curve(s, t, P);
          curve(s + 0.002, t, P2);
          Tn.subVectors(P2, P).normalize();
          B.crossVectors(Tn, UP).normalize();
          N.crossVectors(B, Tn).normalize();
          M.makeBasis(Tn, N, B);
          Q.setFromRotationMatrix(M);
          const angle = 0.35 + Math.sin(s * Math.PI * 2.1 - t * 0.22) * 1.25;
          twist.setFromAxisAngle(Tn, angle);
          Q.premultiply(twist);
          // plates shrink a touch at the ends so the ribbon fades in rather than starting hard
          const edge = Math.min(1, Math.min(s, 1 - s) * 9);
          S.setScalar(scale * (0.55 + 0.45 * edge));
          M.compose(P, Q, S);
          plates.setMatrixAt(i, M);
        }
        plates.instanceMatrix.needsUpdate = true;

        for (let i = 0; i < DOTS; i++) {
          const d = seeds[i];
          const x = (d.x - 0.5) * viewW * 0.95;
          const y = lift + ((d.y + (still ? 0 : t * 0.004 * d.sp)) % 1 - 0.5) * viewH * (narrow ? 0.42 : 0.6); // stay in the ribbon's band, clear of the text
          P.set(x, y, d.z);
          Q.setFromAxisAngle(UP, d.rot + t * d.sp * 0.4);
          S.setScalar(narrow ? 0.8 : 1);
          M.compose(P, Q, S);
          dots.setMatrixAt(i, M);
        }
        dots.instanceMatrix.needsUpdate = true;
        renderer.render(scene, camera);
      };

      let raf = 0, visible = true, start = performance.now();
      const loop = () => {
        raf = 0;
        if (!visible || document.hidden) return;
        draw((performance.now() - start) / 1000);
        if (!still) raf = requestAnimationFrame(loop);
      };
      const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

      const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
      io.observe(el);
      const ro = new ResizeObserver(() => { resize(); if (still) draw(0); });
      ro.observe(el);
      document.addEventListener('visibilitychange', kick);

      draw(0);
      el.classList.add('is-ready');
      kick();

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect(); ro.disconnect();
        window.removeEventListener('pointermove', onMove);
        document.removeEventListener('visibilitychange', kick);
        geo.dispose(); mat.dispose(); dotGeo.dispose(); dotMat.dispose(); pmrem.dispose();
        renderer.dispose();
        renderer.domElement.remove();
      };
    })();

    return () => { dead = true; cleanup(); };
  }, []);

  return <div ref={wrap} className="ribbon" aria-hidden="true" />;
}
