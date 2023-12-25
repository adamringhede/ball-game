import 'reflect-metadata'
import './App.css';
import { initiateGame, inject, PhysicsSystem, Service, ViewController, World } from '@hology/core/gameplay';
import { createRef, useEffect, useState } from 'react';
import shaders from './shaders'
import actors from './actors'
import Game from './services/game';
import { effect } from '@preact/signals-react';


function App() {
  const containerRef = createRef<HTMLDivElement>()
  const [bestTime, setBestTime] = useState<number>(0)
  const [currentTime, setCurrentTime] = useState<number>()
  useEffect(() => {
    const runtime = initiateGame(Game, {
      element: containerRef.current as HTMLElement, 
      sceneName: 'christmas', 
      dataDir: 'data', 
      shaders,
      actors
    })
    runtime.ready.then(() => {
      effect(() => {
        
          console.log("best time")
          setBestTime(runtime.gameInstance.bestTime.value)
          setCurrentTime(runtime.gameInstance.currentTime.value)
      
      })
    })
    return () => runtime.shutdown()
  }, [])
  
  return (
    <div className="App">
      <div ref={containerRef}></div>
      <div style={{position: 'absolute', zIndex: 5, right: '40px', top: '0px'}}>
        <h4 style={{marginBottom:'0px'}}>Best</h4>
        <p style={{marginTop:'0px'}}>{numberToTime(bestTime)}</p>
        <h4 style={{marginBottom:'0px'}}>Current</h4>
        <p style={{marginTop:'0px'}}>{numberToTime(currentTime)}</p>
      </div>
      <a href="https://hology.app" target='_blank'>
        <img style={{position: 'absolute', zIndex: 5, left: '40px', bottom: '0px'}} width="180" src="madewithhology.png" alt="made with hology engine" />
      </a>
      <img style={{position: 'absolute', zIndex: 5, right: '40px', bottom: '0px'}} width="180" src="movement.png" alt="movement kyes" />
    </div>
  );
}

function numberToTime(num: number) {
  if (num == null) {
    return '–'
  }
  return num.toFixed(2) + ' seconds'
}

export default App;

