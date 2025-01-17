import { useEffect, useRef, RefObject, useState } from 'react';
import * as PIXI from 'pixi.js';

export const usePixiApp = (containerRef: RefObject<HTMLDivElement>) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isActive = true;

    const createApp = () => {
      if (!containerRef.current || appRef.current) return;

      // Create a new application
      const app = new PIXI.Application({
        background: '#1a1a1a',
        resizeTo: containerRef.current,
        antialias: true,
      });

      // Only proceed if the component is still mounted
      if (!isActive) {
        if (app.view) {
          const canvas = app.view as HTMLCanvasElement;
          canvas.parentNode?.removeChild(canvas);
        }
        app.destroy(true);
        return;
      }

      appRef.current = app;
      const graphics = new PIXI.Graphics();
      app.stage.addChild(graphics);
      graphicsRef.current = graphics;

      // Ensure container exists before appending
      if (containerRef.current && app.view) {
        containerRef.current.appendChild(app.view as HTMLCanvasElement);
        setIsReady(true);
      }
    };

    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(createApp);

    return () => {
      isActive = false;
      setIsReady(false);

      if (graphicsRef.current) {
        graphicsRef.current.destroy();
        graphicsRef.current = null;
      }

      if (appRef.current) {
        if (appRef.current.view) {
          const canvas = appRef.current.view as HTMLCanvasElement;
          if (canvas.parentNode) {
            canvas.parentNode.removeChild(canvas);
          }
        }
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [containerRef]);

  return { 
    app: appRef.current, 
    graphics: graphicsRef.current,
    isReady 
  };
};