import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';

interface Point {
  x: number;
  y: number;
  sprite: PIXI.Sprite & {
    data: PIXI.FederatedPointerEvent['data'] | null;
    dragging: boolean;
  };
}

const PitchBend = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<PIXI.Application | null>(null);
  const pointsRef = useRef<Point[]>([]);
  const graphicsRef = useRef<PIXI.Graphics | null>(null);
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || isInitializedRef.current) return;

    // Create PIXI Application
    const app = new PIXI.Application({
      background: '#1a1a1a',
      resizeTo: containerRef.current,
      antialias: true,
    });

    // Store the app reference
    appRef.current = app;

    // Create graphics for the curve
    const graphics = new PIXI.Graphics();
    app.stage.addChild(graphics);
    graphicsRef.current = graphics;

    // Create a function to handle clicks that we can reference for cleanup
    const handleClick = (e: MouseEvent) => {
      const currentApp = appRef.current;
      if (!currentApp?.view || e.target !== currentApp.view) return;
      const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      addPoint(x, y);
    };

    // Initialize the app
    const initApp = () => {
      if (!containerRef.current || !app.view) return;
      containerRef.current.appendChild(app.view as HTMLCanvasElement);
      app.view.addEventListener('click', handleClick);
      isInitializedRef.current = true;
    };

    // Ensure the app is ready before initializing
    requestAnimationFrame(initApp);

    return () => {
      if (appRef.current?.view) {
        appRef.current.view.removeEventListener('click', handleClick);
      }

      if (appRef.current) {
        const view = appRef.current.view;
        if (view instanceof HTMLCanvasElement && view.parentNode) {
          view.parentNode.removeChild(view);
        }
        appRef.current.destroy(true);
        appRef.current = null;
        isInitializedRef.current = false;
      }
    };
  }, []);

  const addPoint = (x: number, y: number) => {
    if (!appRef.current) return;

    // Create point sprite
    const pointTexture = new PIXI.Graphics()
      .beginFill('#00ff88')
      .drawCircle(0, 0, 8)
      .endFill();

    const sprite = new PIXI.Sprite(appRef.current.renderer.generateTexture(pointTexture)) as Point['sprite'];
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5);
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.data = null;
    sprite.dragging = false;

    // Make point draggable
    sprite
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove);

    appRef.current.stage.addChild(sprite);
    
    const point = { x, y, sprite };
    pointsRef.current.push(point);
    updateCurve();
  };

  const updateCurve = () => {
    if (!graphicsRef.current || pointsRef.current.length < 2) return;

    const graphics = graphicsRef.current;
    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 0.8);

    // Draw curve through points
    graphics.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
    
    for (let i = 1; i < pointsRef.current.length; i++) {
      const prevPoint = pointsRef.current[i - 1];
      const currentPoint = pointsRef.current[i];
      
      // Calculate control points for smooth curve
      const cpX = (prevPoint.x + currentPoint.x) / 2;
      graphics.bezierCurveTo(
        cpX, prevPoint.y,
        cpX, currentPoint.y,
        currentPoint.x, currentPoint.y
      );
    }
  };

  const onDragStart = (event: PIXI.FederatedPointerEvent) => {
    const sprite = event.currentTarget as Point['sprite'];
    sprite.alpha = 0.8;
    sprite.data = event.data;
    sprite.dragging = true;
  };

  const onDragEnd = (event: PIXI.FederatedPointerEvent) => {
    const sprite = event.currentTarget as Point['sprite'];
    sprite.alpha = 1;
    sprite.dragging = false;
    sprite.data = null;
  };

  const onDragMove = (event: PIXI.FederatedPointerEvent) => {
    const sprite = event.currentTarget as Point['sprite'];
    if (sprite.dragging) {
      const newPosition = sprite.data?.getLocalPosition(sprite.parent);
      if (newPosition) {
        sprite.x = newPosition.x;
        sprite.y = newPosition.y;
        
        // Update point position in our array
        const point = pointsRef.current.find(p => p.sprite === sprite);
        if (point) {
          point.x = newPosition.x;
          point.y = newPosition.y;
        }
        
        updateCurve();
      }
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden"
    />
  );
};

export default PitchBend;
