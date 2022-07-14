import {
  Body,
  Rect,
  Sprite,
  game,
  state,
  input,
  collision
} from 'melonjs/dist/melonjs.module.js'

import { declare } from '../../utils/web3'
import { store } from '../../store'
interface Settings {
  width: number
  height: number
  name: string
  id: string
  image: string
  anchorPoint: any
  framewidth: number
  frameheight: number
  type: string
  collisionMask: number
  shapes: any
}

class PlayerEntity extends Sprite {
  /**
   * constructor
   */
  constructor(x: number, y: number, settings: Settings) {
    // call the parent constructor
    super(x, y, settings)

    // setup body
    this.body = new Body(this)
    this.body.addShape(new Rect(0, 0, this.width, this.height))
    this.body.collisionType = collision.types.PLAYER_OBJECT
    this.body.setMaxVelocity(3, 15)
    this.body.setFriction(0.4, 0)

    // set the display to follow our position on both axis
    // @ts-ignore
    game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.4)

    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true

    // define a basic walking animation (using all frames)
    this.addAnimation('walk', [0, 1, 2, 3, 4, 5, 6, 7])

    // define a standing animation (using the first frame)
    this.addAnimation('stand', [0])

    // set the standing animation as default
    this.setCurrentAnimation('stand')
  }

  /**
   * update the entity
   */
  update(dt: any) {
    if (input.isKeyPressed('left')) {
      // flip the sprite on horizontal axis
      this.flipX(true)
      // update the default force
      this.body.force.x = -this.body.maxVel.x
      // change to the walking animation
      if (!this.isCurrentAnimation('walk')) {
        this.setCurrentAnimation('walk')
      }
    } else if (input.isKeyPressed('right')) {
      // unflip the sprite
      this.flipX(false)
      // update the entity velocity
      this.body.force.x = this.body.maxVel.x
      // change to the walking animation
      if (!this.isCurrentAnimation('walk')) {
        this.setCurrentAnimation('walk')
      }
    } else {
      this.body.force.x = 0
      // change to the standing animation
      this.setCurrentAnimation('stand')
    }

    if (input.isKeyPressed('jump')) {
      if (!this.body.jumping && !this.body.falling) {
        // set current vel to the maximum defined value
        // gravity will then do the rest
        this.body.force.y = -this.body.maxVel.y
      }
    } else {
      this.body.force.y = 0
    }

    return super.update(dt) || this.body.vel.x !== 0 || this.body.vel.y !== 0
  }

  /**
   * collision handler
   */
  onCollision(response: any, other: any) {
    switch (response.b.body.collisionType) {
      case collision.types.WORLD_SHAPE:
        // Simulate a platform object
        if (other.type === 'platform') {
          if (
            this.body.falling &&
            !input.isKeyPressed('down') &&
            response.overlapV.y > 0 &&
            ~~this.body.vel.y >= ~~response.overlapV.y
          ) {
            response.overlapV.x = 0
            return true
          }
          return false
        } else if (other.type === 'declare') {
          const state = store.getState()
          if (state.auth.notIllegal) {
            return false
          } else if (!state.auth.pending && !state.auth.notIllegal) {
            declare()
          }
          return true
        }
        break

      // Fall through

      default:
        // Do not respond to other objects (e.g. coins)
        return false
    }

    // Make the object solid
    return true
  }
}

export default PlayerEntity
