import React, { useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { usePixiApp } from '../hooks/usePixiApp';

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
  const pointsRef = useRef<Point[]>([]);
  const { app, graphics, isReady } = usePixiApp(containerRef);

  const updateCurve = useCallback(() => {
    if (!graphics || pointsRef.current.length < 2) return;

    graphics.clear();
    graphics.lineStyle(2, 0xffffff, 0.8);

    graphics.moveTo(pointsRef.current[0].x, pointsRef.current[0].y);
    
    for (let i = 1; i < pointsRef.current.length; i++) {
      const prevPoint = pointsRef.current[i - 1];
      const currentPoint = pointsRef.current[i];
      
      const cpX = (prevPoint.x + currentPoint.x) / 2;
      graphics.bezierCurveTo(
        cpX, prevPoint.y,
        cpX, currentPoint.y,
        currentPoint.x, currentPoint.y
      );
    }
  }, [graphics]);

  const addPoint = useCallback((x: number, y: number) => {
    if (!app || !isReady) return;

    const pointTexture = new PIXI.Graphics()
      .beginFill('#00ff88')
      .drawCircle(0, 0, 8)
      .endFill();

    const sprite = new PIXI.Sprite(app.renderer.generateTexture(pointTexture)) as Point['sprite'];
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5);
    sprite.eventMode = 'static';
    sprite.cursor = 'pointer';
    sprite.data = null;
    sprite.dragging = false;

    const onDragStart = (event: PIXI.FederatedPointerEvent) => {
      sprite.alpha = 0.8;
      sprite.data = event.data;
      sprite.dragging = true;
    };

    const onDragEnd = () => {
      sprite.alpha = 1;
      sprite.dragging = false;
      sprite.data = null;
    };

    const onDragMove = () => {
      if (sprite.dragging && sprite.data) {
        const newPosition = sprite.data.getLocalPosition(sprite.parent);
        sprite.x = newPosition.x;
        sprite.y = newPosition.y;
        
        const point = pointsRef.current.find(p => p.sprite === sprite);
        if (point) {
          point.x = newPosition.x;
          point.y = newPosition.y;
        }
        
        updateCurve();
      }
    };

    sprite
      .on('pointerdown', onDragStart)
      .on('pointerup', onDragEnd)
      .on('pointerupoutside', onDragEnd)
      .on('pointermove', onDragMove);

    app.stage.addChild(sprite);
    
    const point = { x, y, sprite };
    pointsRef.current.push(point);
    updateCurve();
  }, [app, updateCurve, isReady]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (!app?.view || !isReady || e.target !== app.view) return;
    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    addPoint(x, y);
  }, [app, addPoint, isReady]);

  React.useEffect(() => {
    if (!app?.view || !isReady) return;
    
    app.view.addEventListener('click', handleClick);
    return () => {
      app.view.removeEventListener('click', handleClick);
    };
  }, [app, handleClick, isReady]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-[500px] rounded-lg overflow-hidden"
    />
  );
};

export default PitchBend;