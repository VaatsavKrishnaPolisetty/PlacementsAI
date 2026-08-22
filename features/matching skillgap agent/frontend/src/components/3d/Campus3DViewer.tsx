import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Room3D } from '../../types/placement';
import { Maximize2, RotateCw, Eye, Sparkles, Building2, User, Mic, Monitor, CheckCircle, Clock } from 'lucide-react';

interface Campus3DViewerProps {
  rooms: Room3D[];
  selectedRoom: Room3D | null;
  onSelectRoom: (room: Room3D) => void;
}

export const Campus3DViewer: React.FC<Campus3DViewerProps> = ({
  rooms,
  selectedRoom,
  onSelectRoom
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredRoom, setHoveredRoom] = useState<Room3D | null>(null);
  const [viewMode, setViewMode] = useState<'Perspective' | 'TopDown'>('Perspective');
  const [activeFloor, setActiveFloor] = useState<'ALL' | 'Floor 1' | 'Floor 2'>('ALL');

  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const roomMeshesRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 450;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080e);
    scene.fog = new THREE.FogExp2(0x06080e, 0.035);
    sceneRef.current = scene;

    // 2. Camera Setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(16, 18, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer Setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x818cf8, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(20, 30, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x06b6d4, 2, 50);
    pointLight.position.set(0, 10, 0);
    scene.add(pointLight);

    // 5. Futuristic Campus Ground Grid
    const gridHelper = new THREE.GridHelper(36, 36, 0x6366f1, 0x1e293b);
    gridHelper.position.y = -0.05;
    scene.add(gridHelper);

    // Floor Base Plate
    const floorGeo = new THREE.PlaneGeometry(32, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x0a0f1d,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // Subtle Neon Border
    const borderGeo = new THREE.RingGeometry(18, 18.2, 64);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0x6366f1, side: THREE.DoubleSide });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.rotation.x = -Math.PI / 2;
    borderMesh.position.y = 0.01;
    scene.add(borderMesh);

    // 6. Cyber Particle Dust
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 40;
      particlePositions[i + 1] = Math.random() * 15;
      particlePositions[i + 2] = (Math.random() - 0.5) * 40;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x06b6d4,
      size: 0.15,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending
    });
    const particlePoints = new THREE.Points(particleGeo, particleMat);
    scene.add(particlePoints);

    // 7. Render 3D Rooms
    roomMeshesRef.current.clear();

    rooms.forEach((room) => {
      const roomGroup = new THREE.Group();
      roomGroup.position.set(room.coordinates.x, room.coordinates.y, room.coordinates.z);
      roomGroup.userData = { roomId: room.id, roomData: room };

      // Room dimensions
      const isLab = room.type === 'Coding Lab';
      const width = isLab ? 6.5 : 3.4;
      const length = isLab ? 4.5 : 3.4;
      const height = 2.4;

      // Outer Translucent Glass Walls
      const wallGeo = new THREE.BoxGeometry(width, height, length);
      const isSession = room.status === 'In-Session';
      const isReserved = room.status === 'Reserved';

      const wallColor = isSession ? 0x06b6d4 : isReserved ? 0xf59e0b : 0x10b981;
      const wallMat = new THREE.MeshPhysicalMaterial({
        color: wallColor,
        transparent: true,
        opacity: 0.35,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
        ior: 1.5,
        wireframe: false
      });
      const wallMesh = new THREE.Mesh(wallGeo, wallMat);
      wallMesh.position.y = height / 2;
      wallMesh.castShadow = true;
      wallMesh.receiveShadow = true;
      roomGroup.add(wallMesh);

      // Glowing Wireframe Edges
      const edgeGeo = new THREE.EdgesGeometry(wallGeo);
      const edgeMat = new THREE.LineBasicMaterial({
        color: wallColor,
        linewidth: 2,
        transparent: true,
        opacity: 0.9
      });
      const wireframe = new THREE.LineSegments(edgeGeo, edgeMat);
      wireframe.position.y = height / 2;
      roomGroup.add(wireframe);

      // Room Roof Status Indicator Cylinder
      const roofIndicatorGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 16);
      const roofIndicatorMat = new THREE.MeshStandardMaterial({
        color: wallColor,
        emissive: wallColor,
        emissiveIntensity: 0.8
      });
      const roofIndicator = new THREE.Mesh(roofIndicatorGeo, roofIndicatorMat);
      roofIndicator.position.y = height + 0.1;
      roomGroup.add(roofIndicator);

      // Rotating Hologram Ring above room
      const ringGeo = new THREE.TorusGeometry(0.8, 0.04, 16, 32);
      const ringMat = new THREE.MeshBasicMaterial({ color: wallColor });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = height + 0.6;
      ringMesh.name = 'statusRing';
      roomGroup.add(ringMesh);

      // Interior Pod / Interview Table
      const deskGeo = new THREE.BoxGeometry(width * 0.5, 0.3, length * 0.4);
      const deskMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
      const desk = new THREE.Mesh(deskGeo, deskMat);
      desk.position.y = 0.5;
      roomGroup.add(desk);

      scene.add(roomGroup);
      roomMeshesRef.current.set(room.id, roomGroup);
    });

    // 8. Interaction: Raycaster for Clicking & Hovering
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(scene.children, true);

      let foundRoom: Room3D | null = null;
      for (const hit of intersects) {
        let curr: THREE.Object3D | null = hit.object;
        while (curr && curr.parent && curr.parent !== scene) {
          curr = curr.parent;
        }
        if (curr && curr.userData && curr.userData.roomData) {
          foundRoom = curr.userData.roomData;
          break;
        }
      }
      setHoveredRoom(foundRoom);
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
        if (curr && curr.userData && curr.userData.roomData) {
          onSelectRoom(curr.userData.roomData);
          break;
        }
      }
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('click', handleClick);

    // 9. Animation Loop
    let angle = 0;
    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // Rotate status rings
      roomMeshesRef.current.forEach((group) => {
        const ring = group.getObjectByName('statusRing');
        if (ring) {
          ring.rotation.z += 0.02;
        }
      });

      // Animate floating dust particles
      const positions = particleGeo.attributes.position.array as Float32Array;
      for (let i = 1; i < positions.length; i += 3) {
        positions[i] += 0.015;
        if (positions[i] > 15) positions[i] = 0;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Auto Orbit Camera
      if (autoRotate) {
        angle += 0.003;
        const radius = 28;
        camera.position.x = Math.sin(angle) * radius;
        camera.position.z = Math.cos(angle) * radius;
        camera.position.y = 18 + Math.sin(angle * 0.5) * 3;
        camera.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera);
    };

    animate();

    // 10. Handle Resize
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
  }, [rooms]);

  // Update camera when viewMode changes
  useEffect(() => {
    if (!cameraRef.current) return;
    if (viewMode === 'TopDown') {
      cameraRef.current.position.set(0, 32, 0.1);
      cameraRef.current.lookAt(0, 0, 0);
      setAutoRotate(false);
    } else {
      cameraRef.current.position.set(16, 18, 22);
      cameraRef.current.lookAt(0, 0, 0);
    }
  }, [viewMode]);

  // Highlight selected room
  useEffect(() => {
    roomMeshesRef.current.forEach((group, id) => {
      const isSelected = selectedRoom?.id === id;
      const isHovered = hoveredRoom?.id === id;
      
      const targetScale = isSelected ? 1.15 : isHovered ? 1.08 : 1.0;
      group.scale.set(targetScale, targetScale, targetScale);
    });
  }, [selectedRoom, hoveredRoom]);

  return (
    <div className="relative w-full h-[480px] rounded-2xl overflow-hidden glass-panel border border-slate-700/60 shadow-2xl group">
      {/* 3D WebGL Canvas */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay Controls */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-md shadow-lg">
            <Building2 className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              3D Campus Interview Center
            </span>
          </div>

          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/80 border border-slate-800 backdrop-blur-md">
            {(['ALL', 'Floor 1', 'Floor 2'] as const).map((floor) => (
              <button
                key={floor}
                onClick={() => setActiveFloor(floor)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                  activeFloor === floor
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {floor}
              </button>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            title="Toggle 3D Orbit Rotation"
            className={`p-2 rounded-xl border backdrop-blur-md transition-all ${
              autoRotate
                ? 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300 shadow-indigo-500/20 shadow-lg'
                : 'bg-slate-900/80 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
          </button>

          <button
            onClick={() => setViewMode(viewMode === 'Perspective' ? 'TopDown' : 'Perspective')}
            title="Toggle 2D Floor Plan / 3D Isometric"
            className="px-3 py-1.5 text-xs font-semibold flex items-center gap-1.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white backdrop-blur-md shadow-lg"
          >
            <Eye className="w-3.5 h-3.5 text-cyan-400" />
            {viewMode === 'Perspective' ? '3D Isometric' : '2D Blueprint'}
          </button>
        </div>
      </div>

      {/* Real-time Status Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-3 p-2 px-3 rounded-xl bg-slate-950/80 border border-slate-800/80 backdrop-blur-md text-xs pointer-events-auto">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400 animate-pulse" />
          <span className="text-slate-300">In-Session</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
          <span className="text-slate-300">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400" />
          <span className="text-slate-300">Reserved</span>
        </div>
      </div>

      {/* Hover Info Tooltip */}
      {hoveredRoom && !selectedRoom && (
        <div className="absolute bottom-4 right-4 max-w-xs p-3 rounded-xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl backdrop-blur-lg animate-fadeIn pointer-events-none">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-indigo-300">{hoveredRoom.roomNumber}</span>
            <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              {hoveredRoom.status}
            </span>
          </div>
          <div className="text-sm font-semibold text-slate-100">{hoveredRoom.name}</div>
          {hoveredRoom.currentCandidateName && (
            <div className="mt-2 text-xs text-slate-300 border-t border-slate-800 pt-1.5">
              <span className="text-slate-400">Candidate:</span> {hoveredRoom.currentCandidateName}
            </div>
          )}
          <div className="mt-1 text-[11px] text-slate-400">Click room to inspect live telemetry & panel</div>
        </div>
      )}

      {/* Selected Room Telemetry HUD Drawer */}
      {selectedRoom && (
        <div className="absolute top-16 right-4 bottom-4 w-80 p-4 rounded-2xl bg-slate-900/95 border border-indigo-500/50 shadow-2xl backdrop-blur-xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-300 z-10">
          <div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {selectedRoom.roomNumber}
                </span>
                <h3 className="text-base font-bold text-white mt-1.5">{selectedRoom.name}</h3>
                <p className="text-xs text-slate-400">{selectedRoom.building} • {selectedRoom.floor}</p>
              </div>
              <button
                onClick={() => onSelectRoom(null as any)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Status Pill */}
            <div className="mt-3 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg ${
                selectedRoom.status === 'In-Session'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                  : selectedRoom.status === 'Reserved'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current" />
                {selectedRoom.status}
              </span>
              <span className="text-xs text-slate-400">Cap: {selectedRoom.capacity} People</span>
            </div>

            {/* Active Interview Telemetry */}
            {selectedRoom.currentCandidateName ? (
              <div className="mt-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                  Live Interview in Progress
                </div>

                <div className="flex items-center gap-3">
                  {selectedRoom.currentCandidateAvatar && (
                    <img
                      src={selectedRoom.currentCandidateAvatar}
                      alt="Candidate"
                      className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400/80 shadow-md"
                    />
                  )}
                  <div>
                    <div className="text-sm font-bold text-slate-100">{selectedRoom.currentCandidateName}</div>
                    <div className="text-xs text-indigo-300">{selectedRoom.currentRound || 'Technical Interview'}</div>
                  </div>
                </div>

                {selectedRoom.currentPanelName && (
                  <div className="pt-2 border-t border-slate-700/60 text-xs">
                    <span className="text-slate-400 flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Interviewer Panel:
                    </span>
                    <span className="font-semibold text-slate-200 mt-0.5 block pl-5">{selectedRoom.currentPanelName}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-slate-800/40 border border-slate-700/40 text-center">
                <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
                <div className="text-sm font-semibold text-slate-200">Room Ready & Clear</div>
                <div className="text-xs text-slate-400 mt-1">Available for immediate scheduling or next round queue.</div>
              </div>
            )}

            {/* Room Equipment */}
            <div className="mt-4">
              <div className="text-xs font-semibold text-slate-400 mb-2">Venue Hardware & Setup:</div>
              <div className="flex flex-wrap gap-1.5">
                {selectedRoom.equipment.map((item, idx) => (
                  <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => alert(`Broadcasting room check ping to ${selectedRoom.roomNumber}`)}
              className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-1.5"
            >
              <Mic className="w-3.5 h-3.5" /> Ping Room Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
