import { useEffect, useRef, RefObject } from 'react';
import * as PIXI from 'pixi.js';

export const usePixiApp = (containerRef: RefObject<HTMLDivElement>) => {
  const appRef = useRef<PIXI.Application | null>(null);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);

  useEffect(() => {
    let isActive = true;

    const createApp = () => {
      if (!containerRef.current || appRef.current) return;

      const app = new PIXI.Application({
        background: '#1a1a1a',
        resizeTo: containerRef.current,
        antialias: true,
      });

      if (!isActive) {
        app.destroy(true);
        return;
      }

      appRef.current = app;
      const graphics = new PIXI.Graphics();
      app.stage.addChild(graphics);
      graphicsRef.current = graphics;

      if (containerRef.current) {
        containerRef.current.appendChild(app.view as HTMLCanvasElement);
      }
    };

    createApp();

    return () => {
      isActive = false;
      if (graphicsRef.current) {
        graphicsRef.current.destroy();
        graphicsRef.current = null;
      }
      if (appRef.current) {
        if (appRef.current.view) {
          const canvas = appRef.current.view as HTMLCanvasElement;
          canvas.parentNode?.removeChild(canvas);
        }
        appRef.current.destroy(true);
        appRef.current = null;
      }
    };
  }, [containerRef]);

  return { app: appRef.current, graphics: graphicsRef.current };
};