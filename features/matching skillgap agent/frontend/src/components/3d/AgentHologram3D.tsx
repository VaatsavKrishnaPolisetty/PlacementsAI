import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Bot, Cpu, Sparkles, Activity, ShieldCheck } from 'lucide-react';

interface AgentHologram3DProps {
  statusText?: string;
  operationsCount?: number;
}

export const AgentHologram3D: React.FC<AgentHologram3DProps> = ({
  statusText = 'Autonomous Coordination Active',
  operationsCount = 142
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 220;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // Inner Glowing Core
    const coreGeo = new THREE.SphereGeometry(1.0, 32, 32);
    const coreMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x818cf8,
      emissiveIntensity: 1.5,
      roughness: 0.1,
      metalness: 0.9
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    scene.add(coreMesh);

    // Middle Holographic Wireframe Cage
    const cageGeo = new THREE.IcosahedronGeometry(1.6, 2);
    const cageMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.6
    });
    const cageMesh = new THREE.Mesh(cageGeo, cageMat);
    scene.add(cageMesh);

    // Outer Gyroscope Rings
    const ring1Geo = new THREE.TorusGeometry(2.1, 0.03, 16, 64);
    const ring1Mat = new THREE.MeshBasicMaterial({ color: 0xa855f7, transparent: true, opacity: 0.7 });
    const ring1 = new THREE.Mesh(ring1Geo, ring1Mat);
    scene.add(ring1);

    const ring2Geo = new THREE.TorusGeometry(2.4, 0.03, 16, 64);
    const ring2Mat = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
    const ring2 = new THREE.Mesh(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI / 3;
    scene.add(ring2);

    // Particle field
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const rad = 2.6 + Math.random() * 0.8;
      pPos[i] = rad * Math.sin(phi) * Math.cos(theta);
      pPos[i + 1] = rad * Math.sin(phi) * Math.sin(theta);
      pPos[i + 2] = rad * Math.cos(phi);
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x06b6d4, size: 0.08, blending: THREE.AdditiveBlending });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    const light = new THREE.PointLight(0x06b6d4, 2, 20);
    scene.add(light);

    let t = 0;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);
      t += 0.02;

      coreMesh.rotation.y += 0.01;
      cageMesh.rotation.y -= 0.015;
      cageMesh.rotation.x += 0.008;

      ring1.rotation.x += 0.02;
      ring1.rotation.y += 0.01;

      ring2.rotation.y -= 0.018;
      ring2.rotation.z += 0.012;

      particles.rotation.y += 0.005;

      const scale = 1.0 + Math.sin(t * 2) * 0.06;
      coreMesh.scale.set(scale, scale, scale);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !renderer) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 220;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameId.current) cancelAnimationFrame(animationFrameId.current);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="relative w-full h-56 rounded-2xl glass-panel border border-indigo-500/30 overflow-hidden flex flex-col justify-between p-4 shadow-xl">
      {/* Background 3D Hologram */}
      <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 uppercase tracking-wider">Placement Agent Core</h4>
            <span className="text-[11px] text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              Real-time Neural Engine v2.6
            </span>
          </div>
        </div>

        <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Live
        </span>
      </div>

      {/* Bottom Telemetry Metrics */}
      <div className="relative z-10 grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 bg-slate-950/60 -mx-4 -mb-4 p-3 backdrop-blur-md">
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Workflow Status</div>
          <div className="text-xs font-bold text-white truncate">{statusText}</div>
        </div>
        <div>
          <div className="text-[10px] text-slate-400 uppercase font-semibold">Decisions Executed</div>
          <div className="text-xs font-bold text-cyan-400 font-mono">{operationsCount} ops / min</div>
        </div>
      </div>
    </div>
  );
};
