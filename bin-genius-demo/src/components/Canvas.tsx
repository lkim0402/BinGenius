import React, { useEffect, useRef, useState } from "react";
import { ANIMATION_SPEED_MS } from "./Main";

interface CanvasProps {
  isOpen: boolean;
  result: Result | null;
  isLoading: boolean;
  width?: string | number;
  height?: string | number;
}

export default function Canvas({
  isOpen,
  result,
  isLoading,
  width = 500,
  height = 500,
}: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [slidingY, setSlidingY] = useState(-200);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [loaderAngle, setLoaderAngle] = useState(0);

  useEffect(() => {
    // Handle sliding object animation for isOpen
    const slidingStart = Date.now();
    const slidingEndPosition = isOpen ? slidingY - 200 : slidingY + 200;

    const slide = () => {
      const now = Date.now();
      const timeElapsed = now - slidingStart;
      const progress = Math.min(timeElapsed / ANIMATION_SPEED_MS, 1);
      setSlidingY(slidingY + (slidingEndPosition - slidingY) * progress);
      if (progress < 1) requestAnimationFrame(slide);
    };

    slide();
  }, [isOpen]);

  useEffect(() => {
    // Handle rotation for result
    let newMultiplier;
    switch (result) {
      case "Recycle":
        newMultiplier = 1;
        break;
      case "Landfill":
        newMultiplier = 0;
        break;
      case "Compost":
        newMultiplier = -1;
        break;
      default:
        newMultiplier = 0;
    }

    const newTargetAngle = newMultiplier * ((40 * Math.PI) / 180);

    const rotationStart = Date.now();
    const rotate = () => {
      const now = Date.now();
      const timeElapsed = now - rotationStart;
      const progress = Math.min(timeElapsed / ANIMATION_SPEED_MS, 1);
      setRotationAngle(
        rotationAngle + (newTargetAngle - rotationAngle) * progress
      );
      if (progress < 1) requestAnimationFrame(rotate);
    };

    rotate();
  }, [result]);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;

    const bgImage = new Image();
    const rotatingObject = new Image();
    const slidingObject = new Image();

    bgImage.src = "/bg.png";
    rotatingObject.src = "/pipe.png";
    slidingObject.src = "/slider.png";

    const drawLoader = () => {
      ctx.beginPath();
      ctx.arc(250, 120, 50, loaderAngle, loaderAngle + Math.PI / 2);
      ctx.lineWidth = 5; // Increase the line width
      ctx.lineCap = 'round'; // Smooth out the edges
      ctx.stroke();
    };

    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(bgImage, 0, 0);

      // Draw rotating object
      ctx.save();
      ctx.translate(250, 120);
      ctx.rotate(rotationAngle);
      ctx.drawImage(
        rotatingObject,
        -rotatingObject.width / 2,
        -rotatingObject.height / 2
      );
      ctx.restore();

      // Draw sliding object
      ctx.drawImage(slidingObject, 0, slidingY);

      if (isLoading) {
        setLoaderAngle(prev => (prev + 0.2 * (Math.PI / 3000))); // Adjust rotation speed here
        drawLoader();
      }

      requestAnimationFrame(animate);
    };

    bgImage.onload = animate; // Trigger the animation when bgImage is loaded
  }, [rotationAngle, slidingY, isLoading, loaderAngle]);

  return <canvas ref={canvasRef} width={width} height={height}></canvas>;
}
