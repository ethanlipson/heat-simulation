import React, { useEffect, useRef } from 'react';
import './App.css';
import Space from './space';

const App: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const space = useRef<Space | null>(null);

  useEffect(() => {
    // canvas.current!.width = window.innerWidth;
    // canvas.current!.height = window.innerHeight;
    const gl = canvas.current!.getContext('webgl2');

    if (gl === null) {
      alert('WebGL2 is not available');

      return;
    }

    space.current = new Space(
      gl!,
      canvas.current!.width,
      canvas.current!.height
    );

    function drawScene(time: number) {
      space.current!.step();
      space.current!.draw(gl!);

      requestAnimationFrame(drawScene);
    }

    requestAnimationFrame(drawScene);
  });

  return (
    <div className="App">
      <canvas ref={canvas} width="640" height="480" />
    </div>
  );
};

export default App;
