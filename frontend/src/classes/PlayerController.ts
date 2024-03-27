import EventEmitter from 'events';
import TypedEmitter from 'typed-emitter';
import { Player as PlayerModel, PlayerLocation } from '../types/CoveyTownSocket';

export const MOVEMENT_SPEED = 175;
export const PROXIMITY_THRESHOLD = 50; // Define the proximity threshold

export type PlayerEvents = {
  movement: (newLocation: PlayerLocation) => void;
  proximity: (nearbyPlayerID: string) => void;
};

export type PlayerGameObjects = {
  sprite: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  label: Phaser.GameObjects.Text;
  locationManagedByGameScene: boolean;
};

type OtherPlayersFunc = () => PlayerController[];

export default class PlayerController extends (EventEmitter as new () => TypedEmitter<PlayerEvents>) {
  private _location: PlayerLocation;

  private readonly _id: string;

  private readonly _userName: string;

  public gameObjects?: PlayerGameObjects;

  private readonly _getOtherPlayers: OtherPlayersFunc;

  constructor(
    id: string,
    userName: string,
    location: PlayerLocation,
    getOtherPlayers: OtherPlayersFunc,
  ) {
    super();
    this._id = id;
    this._userName = userName;
    this._location = location;
    this._getOtherPlayers = getOtherPlayers;
  }

  set location(newLocation: PlayerLocation) {
    this._location = newLocation;
    this._updateGameComponentLocation();
    this.emit('movement', newLocation);
    this._checkForProximity();
  }

  get location(): PlayerLocation {
    return this._location;
  }

  get userName(): string {
    return this._userName;
  }

  get id(): string {
    return this._id;
  }

  toPlayerModel(): PlayerModel {
    return { id: this.id, userName: this.userName, location: this.location };
  }

  private _updateGameComponentLocation() {
    if (this.gameObjects && !this.gameObjects.locationManagedByGameScene) {
      const { sprite, label } = this.gameObjects;
      if (!sprite.anims) return;
      sprite.setX(this.location.x);
      sprite.setY(this.location.y);
      if (this.location.moving) {
        sprite.anims.play(`misa-${this.location.rotation}-walk`, true);
        switch (this.location.rotation) {
          case 'front':
            sprite.body.setVelocity(0, MOVEMENT_SPEED);
            break;
          case 'right':
            sprite.body.setVelocity(MOVEMENT_SPEED, 0);
            break;
          case 'back':
            sprite.body.setVelocity(0, -MOVEMENT_SPEED);
            break;
          case 'left':
            sprite.body.setVelocity(-MOVEMENT_SPEED, 0);
            break;
        }
        sprite.body.velocity.normalize().scale(175);
      } else {
        sprite.body.setVelocity(0, 0);
        sprite.anims.stop();
        sprite.setTexture('atlas', `misa-${this.location.rotation}`);
      }
      label.setX(sprite.body.x);
      label.setY(sprite.body.y - 20);
    }
  }

  private _checkForProximity() {
    const otherPlayers = this._getOtherPlayers();
    otherPlayers.forEach(otherPlayer => {
      if (otherPlayer.id !== this.id) {
        const distance = Phaser.Math.Distance.Between(
          this.location.x,
          this.location.y,
          otherPlayer.location.x,
          otherPlayer.location.y,
        );
        if (distance < PROXIMITY_THRESHOLD) {
          this.emit('proximity', otherPlayer.id);
        }
      }
    });
  }

  // Within PlayerController class
  public isNearOtherPlayer(otherPlayers: PlayerController[], proximityThreshold: number): boolean {
    const currentPlayerPos = { x: this.location.x, y: this.location.y };
    return otherPlayers.some(otherPlayer => {
      if (otherPlayer.id !== this.id) {
        const distance = Math.sqrt(
          (currentPlayerPos.x - otherPlayer.location.x) ** 2 +
            (currentPlayerPos.y - otherPlayer.location.y) ** 2,
        );
        return distance < proximityThreshold;
      }
      return false;
    });
  }

  static fromPlayerModel(
    modelPlayer: PlayerModel,
    getOtherPlayers: OtherPlayersFunc,
  ): PlayerController {
    return new PlayerController(
      modelPlayer.id,
      modelPlayer.userName,
      modelPlayer.location,
      getOtherPlayers,
    );
  }
}
