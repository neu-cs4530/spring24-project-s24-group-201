import { mock, mockClear, MockProxy } from 'jest-mock-extended';
import { nanoid } from 'nanoid';
import { ViewingArea } from '../../types/CoveyTownSocket';
import TownController from '../TownController';
import ViewingAreaController, { ViewingAreaEvents } from './ViewingAreaController';

describe('[T2] ViewingAreaController', () => {
  // A valid ViewingAreaController to be reused within the tests
  let testArea: ViewingAreaController;
  let testAreaModel: ViewingArea;
  const townController: MockProxy<TownController> = mock<TownController>();
  const mockListeners = mock<ViewingAreaEvents>();
  beforeEach(() => {
    testAreaModel = {
      id: nanoid(),
      isPlaying: true,
      elapsedTimeSec: 12,
      video: nanoid(),
      occupants: [],
      queue: [],
      type: 'ViewingArea',
    };
    testArea = new ViewingAreaController(testAreaModel);
    mockClear(townController);
    mockClear(mockListeners.playbackChange);
    mockClear(mockListeners.progressChange);
    mockClear(mockListeners.videoChange);
    mockClear(mockListeners.queueChange);
    testArea.addListener('playbackChange', mockListeners.playbackChange);
    testArea.addListener('progressChange', mockListeners.progressChange);
    testArea.addListener('videoChange', mockListeners.videoChange);
    testArea.addListener('queueChange', mockListeners.queueChange);
  });
  describe('Setting video property', () => {
    it('updates the property and emits a videoChange event if the property changes', () => {
      const newVideo = nanoid();
      testArea.video = newVideo;
      expect(mockListeners.videoChange).toBeCalledWith(newVideo);
      expect(testArea.video).toEqual(newVideo);
    });
    it('does not emit a videoChange event if the video property does not change', () => {
      testArea.video = `${testAreaModel.video}`;
      expect(mockListeners.videoChange).not.toBeCalled();
    });
  });
  describe('Setting elapsedTimeSec property', () => {
    it('updates the model and emits a progressChange event if the property changes', () => {
      const newElapsedTimeSec = testArea.elapsedTimeSec + 1;
      testArea.elapsedTimeSec = newElapsedTimeSec;
      expect(mockListeners.progressChange).toBeCalledWith(newElapsedTimeSec);
      expect(testArea.elapsedTimeSec).toEqual(newElapsedTimeSec);
    });
    it('does not emit a progressChange event if the elapsedTimeSec property does not change', () => {
      testArea.elapsedTimeSec = testAreaModel.elapsedTimeSec;
      expect(mockListeners.progressChange).not.toBeCalled();
    });
  });
  describe('Setting isPlaying property', () => {
    it('updates the model and emits a playbackChange event if the property changes', () => {
      const newValue = !testAreaModel.isPlaying;
      testArea.isPlaying = newValue;
      expect(mockListeners.playbackChange).toBeCalledWith(newValue);
      expect(testArea.isPlaying).toEqual(newValue);
    });
    it('does not emit a playbackChange event if the isPlaying property does not change', () => {
      const existingValue = testAreaModel.isPlaying;
      testArea.isPlaying = existingValue;
      expect(mockListeners.playbackChange).not.toBeCalled();
    });
  });
  describe('Setting queue property', () => {
    it('updates the model and emits a queueChange event if the property changes', () => {
      const newValue = ['nanoid()', 'nanoid()'];
      testArea.queue = newValue;
      expect(mockListeners.queueChange).toBeCalledWith(newValue);
      expect(testArea.queue).toEqual(newValue);
    });
    it('does not emit a queueChange event if the queue property does not change', () => {
      const existingValue = testAreaModel.queue;
      testArea.queue = existingValue;
      expect(mockListeners.queueChange).not.toBeCalled();
    });
  });
  describe('viewingAreaModel', () => {
    it('Carries through all of the properties', () => {
      const model = testArea.toInteractableAreaModel();
      expect(model).toEqual(testAreaModel);
    });
  });
  describe('updateFrom', () => {
    it('Updates the isPlaying, elapsedTimeSec and video properties', () => {
      const newModel: ViewingArea = {
        id: testAreaModel.id,
        video: nanoid(),
        elapsedTimeSec: testArea.elapsedTimeSec + 1,
        isPlaying: !testArea.isPlaying,
        occupants: [],
        queue: [],
        type: 'ViewingArea',
      };
      testArea.updateFrom(newModel, []);
      expect(testArea.video).toEqual(newModel.video);
      expect(testArea.elapsedTimeSec).toEqual(newModel.elapsedTimeSec);
      expect(testArea.isPlaying).toEqual(newModel.isPlaying);
      expect(testArea.queue).toEqual(newModel.queue);
      expect(mockListeners.videoChange).toBeCalledWith(newModel.video);
      expect(mockListeners.queueChange).toBeCalledWith(newModel.queue);
      expect(mockListeners.progressChange).toBeCalledWith(newModel.elapsedTimeSec);
      expect(mockListeners.playbackChange).toBeCalledWith(newModel.isPlaying);
    });
    it('Does not update the id property', () => {
      const existingID = testArea.id;
      const newModel: ViewingArea = {
        id: nanoid(),
        video: nanoid(),
        elapsedTimeSec: testArea.elapsedTimeSec + 1,
        isPlaying: !testArea.isPlaying,
        occupants: [],
        queue: [],
        type: 'ViewingArea',
      };
      testArea.updateFrom(newModel, []);
      expect(testArea.id).toEqual(existingID);
    });
  });
});
