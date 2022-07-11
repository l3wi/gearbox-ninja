import { Container, Renderable } from "melonjs";
import game from "../game";

/**
 * a basic HUD item to display score
 */
class ScoreItem extends Renderable {
  score: number;
  constructor(x: number, y: number) {
    super(x, y, 10, 10);

    console.log("show HUD");
    this.score = -1;
  }

  update() {
    // we don't do anything fancy here, so just
    // return true if the score has been updated

    if (this.score !== game.data.score) {
      this.score = game.data.score;
      return true;
    }
    return false;
  }

  draw(context: any) {
    // draw it baby !
  }
}

export class HUD extends Container {
  constructor() {
    super();
    // persistent across level change
    this.isPersistent = true;

    // make sure we use screen coordinates
    this.floating = true;

    // give a name
    this.name = "HUD";

    // add our child score object at the top left corner
    this.addChild(new ScoreItem(5, 5));
  }
}
