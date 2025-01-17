import React, { useRef, useCallback, useState } from 'react';
import * as THREE from 'three';
import { useThreeScene } from '../hooks/useThreeScene';

interface Point {
  x: number;
  y: number;
  mesh: THREE.Mesh;
}

const PitchBend = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const dragPointRef = useRef<Point | null>(null);
  const { scene, curve, isReady } = useThreeScene(containerRef);

  const updateCurve = useCallback(() => {
    if (!curve || pointsRef.current.length < 2) return;

    const points = pointsRef.current.map(p => new THREE.Vector3(p.x, p.y, 0));
    curve.geometry.dispose();
    curve.geometry = new THREE.BufferGeometry().setFromPoints(points);
  }, [curve]);

  const addPoint = useCallback((x: number, y: number) => {
    if (!scene || !isReady) return;

    const geometry = new THREE.SphereGeometry(0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff88 });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, 0);
    scene.add(mesh);

    const point = { x, y, mesh };
    pointsRef.current.push(point);
    updateCurve();
  }, [scene, updateCurve, isReady]);

  const handleMouseDown = useCallback((e: MouseEvent) => {
    if (!scene) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    // Check if clicking on existing point
    const point = pointsRef.current.find(p => {
      const dx = p.x - x;
      const dy = p.y - y;
      return Math.sqrt(dx * dx + dy * dy) < 0.2;
    });

    if (point) {
      setIsDragging(true);
      dragPointRef.current = point;
    } else {
      addPoint(x, y);
    }
  }, [scene, addPoint]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragPointRef.current) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    dragPointRef.current.x = x;
    dragPointRef.current.y = y;
    dragPointRef.current.mesh.position.set(x, y, 0);
    updateCurve();
  }, [isDragging, updateCurve]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    dragPointRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!scene || !isReady) return;
    
    const canvas = scene.userData.renderer?.domElement;
    if (!canvas) return;

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseUp);
    };
  }, [scene, handleMouseDown, handleMouseMove, handleMouseUp, isReady]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden"
    />
  );
};

export default PitchBend;