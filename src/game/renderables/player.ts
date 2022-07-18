import {
  Body,
  Rect,
  Sprite,
  game,
  video,
  level,
  input,
  collision,
  Vector2d
} from 'melonjs/dist/melonjs.module.js'

import { activateAndDeclare } from '../../utils/web3'

import { store } from '../../store'
import actions from '../../store/actions'

interface Settings {
  width: number
  height: number
  name: string
  image: string
  anchorPoint: Vector2d
  framewidth: number
  frameheight: number
  // type: string
  // collisionMask: number
  // shapes: any
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

    if (!this.inViewport && this.pos.y > video.renderer.getHeight()) {
      this.body.vel.y -= this.body.maxVel.y * 1.6
      game.world.removeChild(this)
      game.viewport.fadeIn('#000000', 500, function () {
        store.dispatch(actions.game.BeginStage())
      })
    }

    return super.update(dt) || this.body.vel.x !== 0 || this.body.vel.y !== 0
  }

  /**
   * collision handler
   */
  onCollision(response: any, other: any) {
    switch (response.b.body.collisionType) {
      case collision.types.WORLD_SHAPE:
        // TUBE COLLISION + ACTIVATE
        if (other.type === 'tube') {
          if (input.isKeyPressed('down') && !this.debounce) {
            this.debounce = true
            this.body.gravityScale = 0.1
            console.log(game.world.getChildByName('foreground'))
            // @ts-ignore
            game.world.getChildByName('foreground')[0].setOpacity(1)

            const currentPos = this.pos
            store.dispatch(
              actions.game.ChangeStage('CREDITS', {
                x: +currentPos._x.toFixed(2),
                y: +(currentPos._y - 1).toFixed(2)
              })
            )

            return false
          } else if (
            this.body.falling &&
            response.overlapV.y > 0 &&
            ~~this.body.vel.y >= ~~response.overlapV.y
          ) {
            response.overlapV.x = 0
            return true
          }
          return false
          // PLATFORM COLLISION
        } else if (other.type === 'platform') {
          if (
            !input.isKeyPressed('down') &&
            this.body.falling &&
            response.overlapV.y > 0 &&
            ~~this.body.vel.y >= ~~response.overlapV.y
          ) {
            response.overlapV.x = 0
            return true
          }
          return false
          // DECLARATION BARRIER COLLISION
        } else if (other.type === 'declare') {
          const state = store.getState()
          if (state.auth.notIllegal) {
            return false
          } else if (
            !state.auth.pending &&
            !state.auth.notIllegal &&
            input.isKeyPressed('left')
          ) {
            try {
              activateAndDeclare('metamask')
            } catch (e: any) {
              console.error(e)
            }
          }
          return true
          // RESET COLLISION
        } else if (other.type === 'reset' && !this.debounce) {
          this.debounce = true
          store.dispatch(
            actions.game.ChangeStage('PLAY', {
              x: 1000,
              y: 350
            })
          )
          return true
        }
        break

      default:
        // Fall through
        // Do not respond to other objects (e.g. coins)
        return false
    }

    // Make the object solid
    return true
  }

  // Transition state
  debounce = false
}

export default PlayerEntity
