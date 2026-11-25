"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3DCanvas() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      50,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 8;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Refined architectural astrolabe rings in KVS Brass, Saffron, and Navy
    const rig = new THREE.Group();
    rig.position.set(2.4, 0.3, -1);
    scene.add(rig);

    const outerRingGeo = new THREE.TorusGeometry(2.6, 0.018, 16, 120);
    const outerRingMat = new THREE.MeshBasicMaterial({
      color: 0xb88a2e,
      transparent: true,
      opacity: 0.32,
    });
    const outerRing = new THREE.Mesh(outerRingGeo, outerRingMat);
    rig.add(outerRing);

    const midRingGeo = new THREE.TorusGeometry(2.05, 0.014, 16, 100);
    const midRingMat = new THREE.MeshBasicMaterial({
      color: 0xd96b27,
      transparent: true,
      opacity: 0.28,
    });
    const midRing = new THREE.Mesh(midRingGeo, midRingMat);
    midRing.rotation.x = Math.PI / 3;
    rig.add(midRing);

    const innerGeo = new THREE.IcosahedronGeometry(1.15, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0f1d3a,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    rig.add(innerMesh);

    // Gentle floating brass-dust motes
    const count = 260;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 16;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const dotMat = new THREE.PointsMaterial({
      color: 0xb88a2e,
      size: 0.045,
      transparent: true,
      opacity: 0.4,
    });
    const motes = new THREE.Points(dotGeo, dotMat);
    scene.add(motes);

    let pointerX = 0;
    let pointerY = 0;
    const onPointerMove = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth - 0.5) * 0.9;
      pointerY = (e.clientY / window.innerHeight - 0.5) * 0.6;
    };
    window.addEventListener("pointermove", onPointerMove);

    const onResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let animId = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();

      outerRing.rotation.z = t * 0.1;
      outerRing.rotation.y = Math.sin(t * 0.25) * 0.35;
      midRing.rotation.x = Math.PI / 3 + t * 0.14;
      midRing.rotation.y = -t * 0.12;
      innerMesh.rotation.y = t * 0.16;
      innerMesh.rotation.x = t * 0.08;
      motes.rotation.y = t * 0.025;

      rig.position.x += (2.4 + pointerX * 0.7 - rig.position.x) * 0.04;
      rig.position.y += (0.3 - pointerY * 0.5 - rig.position.y) * 0.04;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      outerRingGeo.dispose();
      outerRingMat.dispose();
      midRingGeo.dispose();
      midRingMat.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      dotGeo.dispose();
      dotMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
