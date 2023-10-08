import { Service, inject } from "@hology/core/gameplay";
import { InputService, Keybind } from "@hology/core/gameplay/input";
import BallActor from "../actors/ball-actor";


enum InputActions {
  moveForward,
  moveBackward,
  moveLeft,
  moveRight,
}

@Service()
class PlayerController {

  private inputService = inject(InputService)

  public setup(ballActor: BallActor) {
    this.inputService.bind(InputActions.moveForward, ballActor.axisInput.togglePositiveY)
    this.inputService.bind(InputActions.moveBackward, ballActor.axisInput.toggleNegativeY)
    
    this.inputService.setKeybind(InputActions.moveForward, new Keybind('w'))
    this.inputService.setKeybind(InputActions.moveBackward, new Keybind('s'))

    this.inputService.bind(InputActions.moveLeft, ballActor.axisInput.togglePositiveX)
    this.inputService.bind(InputActions.moveRight, ballActor.axisInput.toggleNegativeX)
    
    this.inputService.setKeybind(InputActions.moveLeft, new Keybind('d'))
    this.inputService.setKeybind(InputActions.moveRight, new Keybind('a'))

    this.inputService.start()
  }

}

export default PlayerController