import 'reflect-metadata'
import './App.css';
import { initiateGame, inject, PhysicsSystem, Service, ViewController, World } from '@hology/core/gameplay';
import { createRef, useEffect } from 'react';
import shaders from './shaders'
import actors from './actors'
import Game from './services/game';


function App() {
  const containerRef = createRef<HTMLDivElement>()
  useEffect(() => {
    const runtime = initiateGame(Game, {
      element: containerRef.current as HTMLElement, 
      sceneName: 'christmas', 
      dataDir: 'data', 
      shaders,
      actors
    })
    return () => runtime.shutdown()
  }, [containerRef])
  return (
    <div className="App">
      <div ref={containerRef}></div>
      <a href="https://hology.app" target='_blank'>
        <img style={{position: 'absolute', zIndex: 5, left: '40px', bottom: '0px'}} width="180" src="madewithhology.png" alt="made with hology engine" />
      </a>
      <img style={{position: 'absolute', zIndex: 5, right: '40px', bottom: '0px'}} width="180" src="movement.png" alt="movement kyes" />
    </div>
  );
}

export default App;

