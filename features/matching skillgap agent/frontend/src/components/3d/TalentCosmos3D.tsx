import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Student, PlacementDrive } from '../../types/placement';
import { analyzeCandidateMatch } from '../../services/matcherEngine';
import { Orbit, Sparkles, User, Award, Zap, Layers, RefreshCw } from 'lucide-react';

interface TalentCosmos3DProps {
  students: Student[];
  selectedDrive: PlacementDrive;
  onSelectStudent: (student: Student) => void;
}

export const TalentCosmos3D: React.FC<TalentCosmos3DProps> = ({
  students,
  selectedDrive,
  onSelectStudent
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCandidate, setHoveredCandidate] = useState<{ student: Student; matchScore: number } | null>(null);
  const [filterBranch, setFilterBranch] = useState<string>('ALL');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const candidateMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameId = useRef<number | null>(null);

  const filteredStudents = filterBranch === 'ALL'
    ? students
    : students.filter(s => s.branch === filterBranch);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060a);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 16, 26);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Central Sun (Company & Role Core)
    const sunGeo = new THREE.SphereGeometry(2.2, 32, 32);
    const sunMat = new THREE.MeshStandardMaterial({
      color: 0x6366f1,
      emissive: 0x818cf8,
      emissiveIntensity: 1.2,
      roughness: 0.2,
      metalness: 0.8
    });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Sun Wireframe Shell
    const shellGeo = new THREE.IcosahedronGeometry(2.8, 1);
    const shellMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.4
    });
    const shellMesh = new THREE.Mesh(shellGeo, shellMat);
    scene.add(shellMesh);

    // Light from Sun
    const sunLight = new THREE.PointLight(0x818cf8, 3, 60);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    // 5. Orbit Rings (Tier 1: 90%+, Tier 2: 80-89%, Tier 3: <80%)
    const orbitRadii = [7, 12, 17];
    orbitRadii.forEach(r => {
      const ringGeo = new THREE.RingGeometry(r - 0.05, r + 0.05, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x334155,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      scene.add(ringMesh);
    });

    // 6. Background Star Field
    const starCount = 350;
    const starGeo = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 80;
      starPositions[i + 1] = (Math.random() - 0.5) * 50;
      starPositions[i + 2] = (Math.random() - 0.5) * 80;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0x94a3b8, size: 0.12 });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // 7. Render Candidates as Orbiting Planar Nodes
    candidateMeshesRef.current.clear();

    filteredStudents.forEach((student, index) => {
      const match = analyzeCandidateMatch(student, selectedDrive);
      
      // Radius depends on match score (High score = closer to sun!)
      let radius = 7; // Tier 1: 90%+
      let nodeColor = 0x10b981; // Emerald
      if (match.matchScore < 80) {
        radius = 17;
        nodeColor = 0xf59e0b; // Amber
      } else if (match.matchScore < 90) {
        radius = 12;
        nodeColor = 0x06b6d4; // Cyan
      }

      const angle = (index / filteredStudents.length) * Math.PI * 2;
      const initialX = Math.cos(angle) * radius;
      const initialZ = Math.sin(angle) * radius;

      const group = new THREE.Group();
      group.position.set(initialX, 0, initialZ);
      group.userData = {
        student,
        matchScore: match.matchScore,
        radius,
        angle,
        speed: (0.005 + (100 - match.matchScore) * 0.0001)
      };

      // Candidate Planet Sphere
      const sphereGeo = new THREE.SphereGeometry(0.7, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: nodeColor,
        emissive: nodeColor,
        emissiveIntensity: 0.5,
        roughness: 0.3
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      group.add(sphere);

      // Outer Halo Ring
      const haloGeo = new THREE.TorusGeometry(1.0, 0.04, 16, 32);
      const haloMat = new THREE.MeshBasicMaterial({ color: nodeColor, transparent: true, opacity: 0.7 });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.rotation.x = Math.PI / 2;
      group.add(halo);

      scene.add(group);
      candidateMeshesRef.current.set(student.id, group);
    });

    // 8. Raycaster Interaction
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let found = null;
      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr.parent && curr.parent !== scene) {
          curr = curr.parent;
        }
        if (curr && curr.userData && curr.userData.student) {
          found = { student: curr.userData.student, matchScore: curr.userData.matchScore };
          break;
        }
      }
      setHoveredCandidate(found);
    };

    const handleClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr.parent && curr.parent !== scene) {
          curr = curr.parent;
        }
        if (curr && curr.userData && curr.userData.student) {
          onSelectStudent(curr.userData.student);
          break;
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 9. Animation Loop
    let orbitClock = 0;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      orbitClock += 0.008;
      shellMesh.rotation.y += 0.005;
      shellMesh.rotation.x += 0.003;

      // Rotate each candidate along its orbit
      candidateMeshesRef.current.forEach((group) => {
        group.userData.angle += group.userData.speed;
        group.position.x = Math.cos(group.userData.angle) * group.userData.radius;
        group.position.z = Math.sin(group.userData.angle) * group.userData.radius;
        group.position.y = Math.sin(group.userData.angle * 2) * 0.4;
      });

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!containerRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 450;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement) {
        renderer.domElement.removeEventListener('pointermove', handlePointerMove);
        renderer.domElement.removeEventListener('click', handleClick);
      }
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      renderer.dispose();
    };
  }, [filteredStudents, selectedDrive]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl group">
      {/* 3D Talent Cosmos Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-pointer" />

      {/* Top Overlay Badge */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
            <Orbit className="w-4 h-4 text-indigo-400 animate-spin-slow" />
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block">
                3D Talent Cosmos & Skill Orbit
              </span>
              <span className="text-[10px] text-indigo-300">
                Central Gravity: {selectedDrive.companyName} ({selectedDrive.role})
              </span>
            </div>
          </div>
        </div>

        {/* Branch Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md pointer-events-auto">
          {['ALL', 'CSE', 'AI & DS', 'IT', 'ECE'].map((br) => (
            <button
              key={br}
              onClick={() => setFilterBranch(br)}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                filterBranch === br
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {br}
            </button>
          ))}
        </div>
      </div>

      {/* Orbit Tier Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 p-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md text-xs pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          <span className="text-slate-300">Inner Orbit (90%+ Match)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400" />
          <span className="text-slate-300">Mid Orbit (80-89%)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
          <span className="text-slate-300">Outer Orbit (Skill Gap)</span>
        </div>
      </div>

      {/* Hover Candidate Card */}
      {hoveredCandidate && (
        <div className="absolute bottom-4 right-4 w-72 p-3.5 rounded-xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-md pointer-events-none animate-fadeIn">
          <div className="flex items-center gap-3">
            <img
              src={hoveredCandidate.student.avatar}
              alt="Avatar"
              className="w-10 h-10 rounded-full object-cover border-2 border-indigo-400"
            />
            <div>
              <h4 className="text-sm font-bold text-white">{hoveredCandidate.student.name}</h4>
              <p className="text-xs text-slate-400">{hoveredCandidate.student.branch} • CGPA: {hoveredCandidate.student.cgpa.toFixed(2)}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-xs text-slate-400">Match Affinity:</span>
            <span className="text-sm font-extrabold text-cyan-400">
              {hoveredCandidate.matchScore}%
            </span>
          </div>

          <div className="mt-2 flex flex-wrap gap-1">
            {hoveredCandidate.student.skills.slice(0, 3).map((sk, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {sk.name}
              </span>
            ))}
          </div>

          <div className="mt-2 text-[10px] text-indigo-300 text-center font-medium">
            Click node to view full profile & AI explanation
          </div>
        </div>
      )}
    </div>
  );
};
