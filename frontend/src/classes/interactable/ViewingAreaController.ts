import { ViewingArea as ViewingAreaModel } from '../../types/CoveyTownSocket';
import InteractableAreaController, {
  BaseInteractableEventMap,
  VIEWING_AREA_TYPE,
} from './InteractableAreaController';

/**
 * The events that a ViewingAreaController can emit
 */
export type ViewingAreaEvents = BaseInteractableEventMap & {
  /**
   * A playbackChange event indicates that the playing/paused state has changed.
   * Listeners are passed the new state in the parameter `isPlaying`
   */
  playbackChange: (isPlaying: boolean) => void;
  /**
   * A progressChange event indicates that the progress of the video has changed, either
   * due to the user scrubbing through the video, or from the natural progression of time.
   * Listeners are passed the new playback time elapsed in seconds.
   */
  progressChange: (elapsedTimeSec: number) => void;
  /**
   * A videoChange event indicates that the video selected for this viewing area has changed.
   * Listeners are passed the new video, which is either a string (the URL to a video), or
   * the value `undefined` to indicate that there is no video set.
   */
  videoChange: (video: string | undefined) => void;
  /**
   * A playbackChange event indicates that the playing/paused state has changed.
   * Listeners are passed the new state in the parameter `isPlaying`
   */
  queueChange: (queue: string[]) => void;
};

/**
 * A ViewingAreaController manages the state for a ViewingArea in the frontend app, serving as a bridge between the video
 * that is playing in the user's browser and the backend TownService, ensuring that all players watching the same video
 * are synchronized in their playback.
 *
 * The ViewingAreaController implements callbacks that handle events from the video player in this browser window, and
 * emits updates when the state is updated, @see ViewingAreaEvents
 */
export default class ViewingAreaController extends InteractableAreaController<
  ViewingAreaEvents,
  ViewingAreaModel
> {
  private _model: ViewingAreaModel;

  /**
   * Constructs a new ViewingAreaController, initialized with the state of the
   * provided viewingAreaModel.
   *
   * @param viewingAreaModel The viewing area model that this controller should represent
   */
  constructor(viewingAreaModel: ViewingAreaModel) {
    super(viewingAreaModel.id);
    this._model = viewingAreaModel;
  }

  public isActive(): boolean {
    return this._model.video !== undefined;
  }

  /**
   * The URL of the video assigned to this viewing area, or undefined if there is not one.
   */
  public get video() {
    return this._model.video;
  }

  /**
   * The URL of the video assigned to this viewing area, or undefined if there is not one.
   *
   * Changing this value will emit a 'videoChange' event to listeners
   */
  public set video(video: string | undefined) {
    if (this._model.video !== video) {
      this._model.video = video;
      this.emit('videoChange', video);
    }
  }

  /**
   * The playback position of the video, in seconds (a floating point number)
   */
  public get elapsedTimeSec() {
    return this._model.elapsedTimeSec;
  }

  /**
   * The playback position of the video, in seconds (a floating point number)
   *
   * Changing this value will emit a 'progressChange' event to listeners
   */
  public set elapsedTimeSec(elapsedTimeSec: number) {
    if (this._model.elapsedTimeSec != elapsedTimeSec) {
      this._model.elapsedTimeSec = elapsedTimeSec;
      this.emit('progressChange', elapsedTimeSec);
    }
  }

  /**
   * The playback state - true indicating that the video is playing, false indicating
   * that the video is paused.
   */
  public get isPlaying() {
    return this._model.isPlaying;
  }

  /**
   * The playback state - true indicating that the video is playing, false indicating
   * that the video is paused.
   *
   * Changing this value will emit a 'playbackChange' event to listeners
   */
  public set isPlaying(isPlaying: boolean) {
    if (this._model.isPlaying != isPlaying) {
      this._model.isPlaying = isPlaying;
      this.emit('playbackChange', isPlaying);
    }
  }

  /**
   * The queue of the video assigned to this viewing area, or undefined if there is not one.
   */
  public get queue() {
    return this._model.queue;
  }

  /**
   * The queue of the video assigned to this viewing area, or undefined if there is not one.
   *
   * Changing this value will emit a 'queueChange' event to listeners
   */
  public set queue(queue: string[]) {
    if (this._model.queue !== queue) {
      this._model.queue = queue;
      this.emit('queueChange', queue);
    }
  }

  public get friendlyName(): string {
    return this.id;
  }

  public get type(): string {
    return VIEWING_AREA_TYPE;
  }

  /**
   * @returns ViewingAreaModel that represents the current state of this ViewingAreaController
   */
  public toInteractableAreaModel(): ViewingAreaModel {
    return this._model;
  }

  /**
   * Applies updates to this viewing area controller's model, setting the fields
   * isPlaying, elapsedTimeSec and video from the updatedModel
   *
   * @param updatedModel
   */
  protected _updateFrom(updatedModel: ViewingAreaModel): void {
    this.isPlaying = updatedModel.isPlaying;
    this.elapsedTimeSec = updatedModel.elapsedTimeSec;
    this.video = updatedModel.video;
    this.queue = updatedModel.queue;
  }
}
