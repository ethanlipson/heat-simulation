import React, { useEffect, useRef } from 'react';
import './App.css';
import Space from './space';

const App: React.FC = () => {
  const canvas = useRef<HTMLCanvasElement>(null);
  const space = useRef<Space | null>(null);

  const [clicked, setClicked] = React.useState(false);

  const simulationCellSize = 2;

  useEffect(() => {
    canvas.current!.width = window.innerWidth;
    canvas.current!.height = window.innerHeight;
    const gl = canvas.current!.getContext('webgl2');

    if (gl === null) {
      alert('WebGL2 is not available');

      return;
    }

    space.current = new Space(
      gl!,
      canvas.current!.width,
      canvas.current!.height,
      Math.floor(canvas.current!.width / simulationCellSize),
      Math.floor(canvas.current!.height / simulationCellSize)
    );

    function drawScene(time: number) {
      space.current!.step(gl!);
      space.current!.step(gl!);
      space.current!.step(gl!);
      space.current!.draw(gl!);

      // console.log('Render');

      requestAnimationFrame(drawScene);
    }

    requestAnimationFrame(drawScene);
  }, []);

  return (
    <div className="App">
      <canvas
        ref={canvas}
        width="640"
        height="480"
        onMouseDown={() => setClicked(true)}
        onMouseUp={() => setClicked(false)}
        onMouseMove={event => {
          if (!clicked) {
            return;
          }

          const x = Math.floor(event.clientX / simulationCellSize);
          const y = Math.floor(
            (canvas.current!.height - event.clientY) / simulationCellSize
          );
          const minDimension = Math.min(
            canvas.current!.width / simulationCellSize,
            canvas.current!.height / simulationCellSize
          );
          const r = Math.floor(minDimension / 12);

          space.current!.addHeat(x, y, r);
        }}
        onTouchMove={event => {
          for (let i = 0; i < event.touches.length; i++) {
            const touch = event.touches.item(i);

            const x = Math.floor(touch.clientX / simulationCellSize);
            const y = Math.floor(
              (canvas.current!.height - touch.clientY) / simulationCellSize
            );
            const minDimension = Math.min(
              canvas.current!.width / simulationCellSize,
              canvas.current!.height / simulationCellSize
            );
            const r = Math.floor(minDimension / 12);

            space.current!.addHeat(x, y, r);
          }
        }}
      />
    </div>
  );
};

export default App;
