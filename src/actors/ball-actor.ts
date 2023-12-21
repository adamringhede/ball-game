import { PhysicalShapeMesh, SphereCollisionShape } from "@hology/core";
import { Actor, BaseActor, PhysicsBodyType, PhysicsSystem, attach, inject } from "@hology/core/gameplay";
import {
  MeshComponent
} from "@hology/core/gameplay/actors";
import { AxisInput } from "@hology/core/gameplay/input";
import { NodeShaderMaterial, rgba, select, standardMaterial, varyingAttributes } from "@hology/core/shader-nodes";
import { ArrowHelper, Euler, MeshPhysicalMaterial, SphereGeometry, Vector3 } from "three";
import { clamp } from "three/src/math/MathUtils";


const ballMaterial = new NodeShaderMaterial({
  color: standardMaterial({ emissive: select(varyingAttributes.position.y().lt(0), rgba(0xffff00, 1), rgba(0x00ffff, 1)).rgb()})
})
const yellow = new MeshPhysicalMaterial({ color: 0xffff00 })

@Actor()
class BallActor extends BaseActor {
  private maxSpeed = 20
  private impulseMagnitude = 10

  //private camera = attach(ThirdPartyCameraComponent)
  private mesh = attach(MeshComponent, {
    object: new PhysicalShapeMesh(new SphereGeometry(.2, 50, 50), ballMaterial, new SphereCollisionShape(0.2)),
    bodyType: PhysicsBodyType.dynamic,
    mass: 2,
    friction: .5,
    continousCollisionDetection: true
  })
  private physicsSystem = inject(PhysicsSystem)

  public readonly axisInput = new AxisInput()
  public readonly afterMove = this.physicsSystem.afterStep.asObservable()
  public readonly direction = new Vector3() 

  onInit(): void | Promise<void> {
    const angvel = new Vector3()
    const maxlinvel = new Vector3(1,10,1).multiplyScalar(this.maxSpeed)
    const maxangvel = new Vector3(1,1,1).multiplyScalar(10)
    
    const requestedDirection = new Vector3(0, 0, 0);
    const actualDirection = new Vector3()
    const currentDirection = new Vector3(0, 0, 1)
    const rightDirection = new Vector3()
    const impulse = new Vector3()
    const up = new Vector3(0,1,0)

    const rightArrow = new ArrowHelper()
    const forwardArrow = new ArrowHelper()

    let currentSpeed = 0
    
    const linvel = new Vector3()
    const rotation = new Euler()
    
    let hasWorldContact = false
    this.physicsSystem.onHasContactChanged(this).subscribe(hasContact => {
      hasWorldContact = hasContact
    })

  
    this.physicsSystem.beforeStep.subscribe(deltaTime => {
      //this.rotation.y += this.axisInput.horizontal * deltaTime
      //this.physicsSystem.updateActorTransform(this)

      rotation.y += deltaTime * -this.axisInput.horizontal * 3
      //this.physicsSystem.setRotationY(this, this.rotation.y)
      

      this.physicsSystem.getLinearVelocity(this, actualDirection).normalize()
      this.physicsSystem.getLinearVelocity(this, linvel)

      //currentDirection.lerp(actualDirection, 2 * deltaTime)
      currentDirection.copy(actualDirection)

      linvel.y = 0
      currentSpeed = linvel.length()

      // I think vertical should add to the current direction of the ball
      // Horizontal should add in the direction to the side. 
      
      requestedDirection.x = this.axisInput.horizontal
      requestedDirection.z = this.axisInput.vertical

         
      currentDirection
        .set(0,0,1)
        .applyEuler(rotation)

      if (currentSpeed < 0.1) {
        //currentDirection.set(0, 0, 1)
      }
      rightDirection.crossVectors(currentDirection, up)

      this.object.parent.add(rightArrow)
      rightArrow.setDirection(rightDirection)
      rightArrow.position.copy(this.position)
      rightArrow.setLength(.9)
      rightArrow.setColor(0xff0000)
      

      this.object.parent.add(forwardArrow)
      forwardArrow.setDirection(currentDirection)
      forwardArrow.position.copy(this.position)
      forwardArrow.setLength(.9)
      forwardArrow.setColor(0x0000ff)
      

      //const requestedTorqueImpulse = new Vector3(this.axisInput.vertical * deltaTime, 0, this.axisInput.horizontal * deltaTime)
      
      currentDirection.y = 0

      

      // I want to create inertia but still be able to move in the direction
      // Not sure how to do this
      // Using forces could be easier
      // Not sure if this approach is very good
   

      
      impulse
        .copy(currentDirection)
        .multiplyScalar(this.impulseMagnitude * 10 * deltaTime * this.axisInput.vertical)
        //.add(new Vector3().copy(rightDirection).multiplyScalar(this.impulseMagnitude * deltaTime * this.axisInput.horizontal))
      const rightImpulse = new Vector3().copy(rightDirection).multiplyScalar(0 * deltaTime * this.axisInput.horizontal);
      
      // apply force in the direction of rotation 

      if (hasWorldContact) {
        this.physicsSystem.applyImpulse(this, impulse)
        // A low linear damping is hard to control
        this.physicsSystem.setLinearDamping(this, .2)
        this.physicsSystem.setAngularDamping(this, 1)
  
        this.physicsSystem.getLinearVelocity(this, linvel)
        linvel.x = clamp(linvel.x, -maxlinvel.x, maxlinvel.x)
        linvel.y = clamp(linvel.y, -maxlinvel.y, maxlinvel.y)
        linvel.z = clamp(linvel.z, -maxlinvel.z, maxlinvel.z)
        //this.physicsSystem.setLinearVelocity(this, linvel)
  
        this.physicsSystem.getAngularVelocity(this, angvel)
        angvel.x = clamp(angvel.x, -maxangvel.x, maxangvel.x)
        angvel.y = clamp(angvel.y, -maxangvel.y, maxangvel.y)
        angvel.z = clamp(angvel.z, -maxangvel.z, maxangvel.z)
        this.physicsSystem.setAngularVelocity(this, angvel)
  
        //console.log(ballDirection)
      }

      this.direction.copy(currentDirection)

    })
  }

}

export default BallActor

