import { PhysicsSystem, Service, ViewController, World, inject } from "@hology/core/gameplay"
import BallActor from "../actors/ball-actor"
import { CameraActor, SpawnPoint, TriggerVolume } from "@hology/core/gameplay/actors"
import PlayerController from "./player-controller"
import { Vector3 } from "three"
import { lerp } from "three/src/math/MathUtils"
import { signal } from "@preact/signals-react"

@Service()
class Game {
  private world = inject(World)
  private viewController = inject(ViewController)
  private physics = inject(PhysicsSystem)
  private playerConteroller = inject(PlayerController)

  private cameraOffset = new Vector3(0, .6, -1.5)

  public readonly bestTime = signal<number>(null)
  public readonly currentTime = signal<number>(null)

  constructor() {
   this.start()
  }

  private async start() {
    this.viewController.showStats = false
    this.physics.showDebug = false
    
    const spawnPoint = this.world.findActorByType(SpawnPoint)
    spawnPoint.position.y += 1

    const camera = await this.world.spawnActor(CameraActor)
    this.viewController.setCamera(camera.camera.instance)
    
    const ball = await this.world.spawnActor(BallActor, spawnPoint.position, spawnPoint.rotation)
    
    
    const goal = await this.world.findActorByType(TriggerVolume)

    const storedBestTime = localStorage.getItem('besttime')
    if (storedBestTime != null && !isNaN(parseFloat(storedBestTime))) {
      this.bestTime.value = parseFloat(storedBestTime)
    }

    goal.trigger.onBeginOverlapWithActor(ball).subscribe(() => {
      if (this.bestTime.value == null || this.currentTime.value < this.bestTime.value) {
        this.bestTime.value = this.currentTime.value
        localStorage.setItem('besttime', this.bestTime.value.toString())
      }
      setTimeout(() => respawn(), 500)
    })

    const respawn = () => {
      ball.moveTo(spawnPoint.position)
      ball.cancelMomentum()
      this.currentTime.value = null
    }

    // Need to start current time
    // When starting to move or entring an area. Maybe have a trigger volume to start.
    // Trigger when leaving
    // Alternatively, when being at a distance away from spawn point. 

    const ballDirection = new Vector3()
    const ballForward = new Vector3()
    this.viewController.onLateUpdate().subscribe(deltaTime => {
      // Delta time could be used to move softly

      const distanceFromSpawn = spawnPoint.position.distanceTo(ball.position)
      if (distanceFromSpawn > 2 && this.currentTime.value == null) {
        this.currentTime.value = 0
      } else if (this.currentTime.value != null) {
        this.currentTime.value += deltaTime
      }

      this.physics.getLinearVelocity(ball, ballDirection).normalize()

      //camera.rotation.y = lerp(ball.rotation.y, camera.rotation.y, 0.2)//-ballDirection.angleTo(new Vector3(0,0,1))

      ballForward.copy(ball.position).add(ballDirection)
      

      //camera.rotation.y = ball.rotation.y
      //camera.position.y += .2
      camera.position.copy(ball.position).add(ball.direction.multiplyScalar(this.cameraOffset.z))
      camera.position.y += this.cameraOffset.y
      
      camera.camera.instance.lookAt(ball.position)
      
      

      // rotate towards the opposite of the rolling direction

      if (ball.position.y < -10) {
        respawn()
      }

    })

    this.playerConteroller.setup(ball)
  }
}

export default Game