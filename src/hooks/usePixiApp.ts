import { useEffect, useRef, RefObject, useState } from 'react';
import * as PIXI from 'pixi.js';

export const usePixiApp = (containerRef: RefObject<HTMLDivElement>) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create the PIXI application
    const app = new PIXI.Application({
      background: '#1a1a1a',
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      antialias: true,
    });

    // Create the graphics object
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);

    // Store references
    appRef.current = app;
    graphicsRef.current = graphics;

    // Append the canvas to the container
    containerRef.current.appendChild(app.view as HTMLCanvasElement);
    setIsReady(true);

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !app) return;
      app.renderer.resize(
        containerRef.current.clientWidth,
        containerRef.current.clientHeight
      );
    };

    window.addEventListener('resize', handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize);
      
      if (graphicsRef.current) {
        graphicsRef.current.destroy();
        graphicsRef.current = null;
      }

      if (appRef.current) {
        appRef.current.destroy(true, { children: true });
        appRef.current = null;
      }

      setIsReady(false);
    };
  }, [containerRef]);

  return {
    app: appRef.current,
    graphics: graphicsRef.current,
    isReady
  };
};