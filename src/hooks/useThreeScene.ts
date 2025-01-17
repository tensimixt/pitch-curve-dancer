import { useEffect, useRef, RefObject, useState } from 'react';
import * as THREE from 'three';

export const useThreeScene = (containerRef: RefObject<HTMLDivElement>) => {
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const curveRef = useRef<THREE.Line | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Setup scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1a1a1a');

    // Setup orthographic camera for 2D-like view
    const aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
    const frustumSize = 2;
    const camera = new THREE.OrthographicCamera(
      -aspect * frustumSize / 2,
      aspect * frustumSize / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Setup renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);

    // Store scene in userData for easy access
    renderer.userData = { scene };

    // Create curve
    const curve = new THREE.Line(
      new THREE.BufferGeometry(),
      new THREE.LineBasicMaterial({ color: 0xffffff })
    );
    scene.add(curve);

    // Store references
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    curveRef.current = curve;
    setIsReady(true);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      
      const newAspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      
      camera.left = -newAspect * frustumSize / 2;
      camera.right = newAspect * frustumSize / 2;
      camera.top = frustumSize / 2;
      camera.bottom = -frustumSize / 2;
      camera.updateProjectionMatrix();
      
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    // Animation loop
    const animate = () => {
      if (!renderer || !scene || !camera) return;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current.domElement.remove();
        rendererRef.current = null;
      }

      if (curveRef.current) {
        curveRef.current.geometry.dispose();
        (curveRef.current.material as THREE.Material).dispose();
        curveRef.current = null;
      }

      if (sceneRef.current) {
        sceneRef.current.clear();
        sceneRef.current = null;
      }

      cameraRef.current = null;
      setIsReady(false);
    };
  }, [containerRef]);

  return {
    scene: sceneRef.current,
    camera: cameraRef.current,
    renderer: rendererRef.current,
    curve: curveRef.current,
    isReady
  };
};