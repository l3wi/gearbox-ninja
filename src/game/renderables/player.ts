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

import { activate, declare } from '../../utils/web3'

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
    this.body.setMaxVelocity(4, 15)
    this.body.setFriction(0.4, 0)

    // set the display to follow our position on both axis
    // @ts-ignore
    game.viewport.follow(this.pos, game.viewport.AXIS.BOTH, 0.2)

    // ensure the player is updated even when outside of the viewport
    this.alwaysUpdate = true

    // define a basic walking animation (using all frames)
    this.addAnimation('walk', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 60)

    // define a standing animation (using the first frame)
    this.addAnimation('stand', [0])

    this.addAnimation('jump', [12])

    // set the standing animation as default
    this.setCurrentAnimation('stand')
  }

  /**
   * update the entity
   */
  update(dt: any) {
    if (input.isKeyPressed('left')) {
      // flip the sprite on horizontal axis
      this.flipX(false)
      // update the default force
      this.body.force.x = -this.body.maxVel.x
      // change to the walking animation
      if (!this.isCurrentAnimation('walk')) {
        this.setCurrentAnimation('walk')
      }
    } else if (input.isKeyPressed('right')) {
      // unflip the sprite
      this.flipX(true)
      // update the entity velocity
      this.body.force.x = this.body.maxVel.x
      // change to the walking animation
      if (!this.isCurrentAnimation('walk')) {
        this.setCurrentAnimation('walk')
      }
    } else {
      this.setCurrentAnimation('stand')
      this.body.force.x = 0
    }

    if (this.body.vel.y > 0 || this.body.jumping) {
      if (!this.isCurrentAnimation('jump')) {
        this.setCurrentAnimation('jump')
      }
    }

    if (input.isKeyPressed('jump')) {
      if (!this.body.jumping && !this.body.falling) {
        // set current vel to the maximum defined value
        // gravity will then do the rest
        this.body.force.y = -this.body.maxVel.y
        // this.setCurrentAnimation('stand')
      }
      // if (!this.isCurrentAnimation('jump')) {
      //   this.setCurrentAnimation('jump')
      // }
    } else {
      this.body.force.y = 0
    }

    if (!this.inViewport && this.pos.y > video.renderer.getHeight()) {
      this.body.vel.y -= this.body.maxVel.y * 1.6
      game.world.removeChild(this)
      game.viewport.fadeIn('#000000', 500, function () {
        store.dispatch(actions.game.ChangeStage('PLAY', { x: 2175, y: 0 }))
        store.dispatch(actions.game.BeginStage())
        store.dispatch(
          actions.game.AddNotification('Only true ninjas can make jump!')
        )
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
        const state = store.getState()
        if (
          typeof other.type === 'string' &&
          other.type.indexOf('tube') != -1
        ) {
          // TUBE COLLISION + ACTIVATE
          // last time we hit an entrance
          this.isEntrance = Date.now()
          if (this.isEntrance > Date.now() - 50) {
            store.dispatch(
              actions.game.AddNotification('Press DOWN to enter', 100)
            )
          }
          if (input.isKeyPressed('down') && !this.debounce) {
            this.debounce = true
            this.body.gravityScale = 0.1

            // @ts-ignore
            game.world.getChildByName('foreground')[0].setOpacity(1)

            const currentPos = this.pos
            store.dispatch(
              actions.game.ChangeStage('CREDITS', {
                x: +currentPos._x.toFixed(2),
                y: +(currentPos._y - 1).toFixed(2)
              })
            )

            setTimeout(() => {
              const type = other.type.split('-')[0]
              const symbol = other.type.split('-')[1]
              store.dispatch(actions.form.toggleForm(symbol, type))
            }, 500)

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
          // Check if NINJA
        } else if (other.type === 'degen') {
          if (!state.web3.nftClaimed) {
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
        } else if (
          typeof other.type === 'string' &&
          other.type.indexOf('declare') != -1
        ) {
          const side = other.type.split('-')[1]
          // If declared wall is passable
          if (!state.game.isIllegal) {
            return false
            // If running into & no declaration, prompt user
          } else if (
            !this.debounce &&
            state.game.isIllegal &&
            side === 'left' &&
            input.isKeyPressed('left')
          ) {
            store.dispatch(actions.game.PauseGame('Connect Wallet'))
          } else if (
            !this.debounce &&
            state.game.isIllegal &&
            side === 'right' &&
            input.isKeyPressed('right')
          ) {
            store.dispatch(actions.game.PauseGame('Connect Wallet'))
          }
          return true
          // Building Entrance
        } else if (
          typeof other.type === 'string' &&
          other.type.indexOf('entrance') != -1
        ) {
          // last time we hit an entrance
          this.isEntrance = Date.now()
          if (this.isEntrance > Date.now() - 50) {
            store.dispatch(
              actions.game.AddNotification('Press UP to enter', 100)
            )
          }

          // Activate
          if (input.isKeyPressed('jump') && !this.debounce) {
            console.log('Firing')
            game.world.getChildByName('foreground')[0].setOpacity(1)

            const currentPos = this.pos
            store.dispatch(
              actions.game.ChangeStage('CREDITS', {
                x: +currentPos._x.toFixed(2),
                y: +(currentPos._y - 1).toFixed(2)
              })
            )
            setTimeout(() => {
              const type = other.type.split('-')[0]
              const symbol = other.type.split('-')[1]

              if (symbol === 'mcdonalds') {
                store.dispatch(actions.form.toggleForm('', 'mcdonalds'))
              } else {
                store.dispatch(actions.form.toggleForm(symbol, type))
              }
            }, 500)
          }

          return false
        } else if (
          typeof other.type != 'string' ||
          other.type.indexOf('entrance') === -1
        ) {
          // if the last time we collided with an entrance was more
          // than 500 ms ago we turn off notification
          if (this.isEntrance < Date.now() - 50) {
            store.dispatch(actions.game.AddNotification('', 1))
          }
          return true
        }
        break

      default:
        // Fall through
        return false
    }

    return true
  }

  debounce = false
  isEntrance = Date.now()
}

export default PlayerEntity
