import { ChakraProvider } from '@chakra-ui/react';
import { EventNames } from '@socket.io/component-emitter';
import { cleanup, render, RenderResult } from '@testing-library/react';
import * as ChatChannel from './ChatChannel';
import { mock, MockProxy } from 'jest-mock-extended';
import { fireEvent } from '@testing-library/react';
import React from 'react';
import { act } from 'react-dom/test-utils';
import * as ReactPlayer from 'react-player';
import TownController from '../../../classes/TownController';
import ViewingAreaController, {
  ViewingAreaEvents,
} from '../../../classes/interactable/ViewingAreaController';
import TownControllerContext from '../../../contexts/TownControllerContext';
import { ViewingAreaVideo } from './ViewingAreaVideo';

// A sentinel value that we will render in the mock react player component to help find it in the DOM tree
const MOCK_REACT_PLAYER_PLACEHOLDER = 'MOCK_REACT_PLAYER_PLACEHOLER';
// Mocking a React class-based component appears to be quite challenging; we define our own class
// to use as a mock here. Using jest-mock-extended's mock<ReactPlayer>() doesn't work.
class MockReactPlayer extends React.Component {
  private _componentDidUpdateSpy: jest.Mock<never, [ReactPlayer.ReactPlayerProps]>;

  private _seekSpy: jest.Mock<never, [number]>;

  public currentTime = 0;

  constructor(
    props: ReactPlayer.ReactPlayerProps,
    componentDidUpdateSpy: jest.Mock<never, [ReactPlayer.ReactPlayerProps]>,
    seekSpy: jest.Mock<never, [number]>,
  ) {
    super(props);
    this._componentDidUpdateSpy = componentDidUpdateSpy;
    this._seekSpy = seekSpy;
  }

  getCurrentTime() {
    return this.currentTime;
  }

  seekTo(newTime: number) {
    this.currentTime = newTime;
    this._seekSpy(newTime);
  }

  componentDidUpdate(): void {
    this._componentDidUpdateSpy(this.props);
  }

  render(): React.ReactNode {
    return <>{MOCK_REACT_PLAYER_PLACEHOLDER}</>;
  }
}

const reactPlayerSpy = jest.spyOn(ReactPlayer, 'default');
// This TS ignore is necessary in order to spy on a react class based component, apparently...
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
reactPlayerSpy.prototype = React.Component.prototype;

function renderViewingArea(viewingArea: ViewingAreaController, controller: TownController) {
  return (
    <ChakraProvider>
      <TownControllerContext.Provider value={controller}>
        <ViewingAreaVideo controller={viewingArea} />
      </TownControllerContext.Provider>
    </ChakraProvider>
  );
}

describe('[T4] Viewing Area Video', () => {
  const mockReactPlayerConstructor = jest.fn<never, [ReactPlayer.ReactPlayerProps]>();
  const componentDidUpdateSpy = jest.fn<never, [ReactPlayer.ReactPlayerProps]>();
  const seekSpy = jest.fn<never, [number]>();
  let mockReactPlayer: MockReactPlayer;
  let viewingArea: ViewingAreaController;
  type ViewingAreaEventName = keyof ViewingAreaEvents;
  let addListenerSpy: jest.SpyInstance<
    ViewingAreaController,
    [event: ViewingAreaEventName, listener: ViewingAreaEvents[ViewingAreaEventName]]
  >;

  let removeListenerSpy: jest.SpyInstance<
    ViewingAreaController,
    [event: ViewingAreaEventName, listener: ViewingAreaEvents[ViewingAreaEventName]]
  >;

  let townController: MockProxy<TownController>;

  let renderData: RenderResult;
  beforeAll(() => {
    reactPlayerSpy.mockImplementation(function (props) {
      mockReactPlayerConstructor(props);
      const ret = new MockReactPlayer(props, componentDidUpdateSpy, seekSpy);
      mockReactPlayer = ret;
      return ret as any;
    });
  });
  beforeEach(() => {
    mockReactPlayerConstructor.mockClear();
    componentDidUpdateSpy.mockClear();
    seekSpy.mockClear();
    townController = mock<TownController>();
    viewingArea = new ViewingAreaController({
      elapsedTimeSec: 0,
      id: 'test',
      isPlaying: true,
      video: 'test',
      occupants: [],
      queue: ['test1', 'test2'],
      type: 'ViewingArea',
    });

    addListenerSpy = jest.spyOn(viewingArea, 'addListener');
    removeListenerSpy = jest.spyOn(viewingArea, 'removeListener');

    renderData = render(renderViewingArea(viewingArea, townController));
  });
  /**
   * Retrieve the properties passed to the ReactPlayer the first time it was rendered
   */
  function firstReactPlayerConstructorProps() {
    return mockReactPlayerConstructor.mock.calls[0][0];
  }
  /**
   * Retrieve the properties passed to the ReactPlayer the last time it was rendered
   */
  function lastReactPlayerPropUpdate() {
    return componentDidUpdateSpy.mock.calls[componentDidUpdateSpy.mock.calls.length - 1][0];
  }
  /**
   * Retrieve the playback time that was passed to 'seek' in its most recent call
   */
  function lastSeekCall() {
    return seekSpy.mock.calls[seekSpy.mock.calls.length - 1][0];
  }
  /**
   * Retrieve the listener passed to "addListener" for a given eventName
   * @throws Error if the addListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerAdded<Ev extends EventNames<ViewingAreaEvents>>(
    eventName: Ev,
    spy = addListenerSpy,
  ): ViewingAreaEvents[Ev] {
    const addedListeners = spy.mock.calls.filter(eachCall => eachCall[0] === eventName);
    if (addedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one addListener call for ${eventName} but found ${addedListeners.length}`,
      );
    }
    return addedListeners[0][1] as unknown as ViewingAreaEvents[Ev];
  }
  /**
   * Retrieve the listener pased to "removeListener" for a given eventName
   * @throws Error if the removeListener method was not invoked exactly once for the given eventName
   */
  function getSingleListenerRemoved<Ev extends EventNames<ViewingAreaEvents>>(
    eventName: Ev,
  ): ViewingAreaEvents[Ev] {
    const removedListeners = removeListenerSpy.mock.calls.filter(
      eachCall => eachCall[0] === eventName,
    );
    if (removedListeners.length !== 1) {
      throw new Error(
        `Expected to find exactly one removeListeners call for ${eventName} but found ${removedListeners.length}`,
      );
    }
    return removedListeners[0][1] as unknown as ViewingAreaEvents[Ev];
  }

  describe('[T4] ReactPlayer rendering', () => {
    it('Sets the videoURL', () => {
      const props = firstReactPlayerConstructorProps();
      expect(props.url).toEqual(viewingArea.video);
    });
    it('Sets the playing property', () => {
      const props = firstReactPlayerConstructorProps();
      expect(props.playing).toEqual(viewingArea.isPlaying);
    });
  });
  describe('[T4] Bridging events from the ViewingAreaController to the ReactPlayer', () => {
    describe('Registering ViewingAreaController listeners', () => {
      describe('When rendered', () => {
        it('Registers exactly one videoChange listener', () => {
          act(() => {
            viewingArea.emit('videoChange', '');
          });
          act(() => {
            viewingArea.emit('videoChange', '');
          });
          act(() => {
            viewingArea.emit('videoChange', '');
          });
          act(() => {
            viewingArea.emit('videoChange', '');
          });
          getSingleListenerAdded('videoChange');
        });
        it('Removes the videoChange listener at unmount', () => {
          act(() => {
            viewingArea.emit('videoChange', '');
          });
          const listenerAdded = getSingleListenerAdded('videoChange');
          cleanup();
          expect(getSingleListenerRemoved('videoChange')).toBe(listenerAdded);
        });
        it('Registers exactly one progressChange listener', () => {
          act(() => {
            viewingArea.emit('progressChange', 10);
          });
          act(() => {
            viewingArea.emit('progressChange', 5);
          });
          act(() => {
            viewingArea.emit('progressChange', 400);
          });
          getSingleListenerAdded('progressChange');
        });
        it('Removes the progressChange listener at unmount', () => {
          act(() => {
            viewingArea.emit('progressChange', 30);
          });
          const listenerAdded = getSingleListenerAdded('progressChange');
          cleanup();
          expect(getSingleListenerRemoved('progressChange')).toBe(listenerAdded);
        });
        it('Registers exactly one playbackChange listener', () => {
          act(() => {
            viewingArea.emit('playbackChange', true);
          });
          act(() => {
            viewingArea.emit('playbackChange', false);
          });
          act(() => {
            viewingArea.emit('playbackChange', true);
          });
          act(() => {
            viewingArea.emit('playbackChange', false);
          });
          getSingleListenerAdded('playbackChange');
        });
        it('Removes the playbackChange listener at unmount', () => {
          act(() => {
            viewingArea.emit('playbackChange', true);
          });
          const listenerAdded = getSingleListenerAdded('playbackChange');
          cleanup();
          expect(getSingleListenerRemoved('playbackChange')).toBe(listenerAdded);
        });
        it('Registers exactly one queueChange listener', () => {
          act(() => {
            viewingArea.emit('queueChange', []);
          });
          act(() => {
            viewingArea.emit('queueChange', []);
          });
          act(() => {
            viewingArea.emit('queueChange', []);
          });
          act(() => {
            viewingArea.emit('queueChange', []);
          });
          getSingleListenerAdded('queueChange');
        });
        it('Removes the queueChange listener at unmount', () => {
          act(() => {
            viewingArea.emit('queueChange', []);
          });
          const listenerAdded = getSingleListenerAdded('queueChange');
          cleanup();
          expect(getSingleListenerRemoved('queueChange')).toBe(listenerAdded);
        });
      });
      describe('When re-rendered with a different viewing area controller', () => {
        it('Removes the listeners on the old viewing area controller and adds listeners to the new controller', () => {
          const origPlayback = getSingleListenerAdded('playbackChange');
          const origProgress = getSingleListenerAdded('progressChange');
          const origQueue = getSingleListenerAdded('queueChange');
          const origVideo = getSingleListenerAdded('videoChange');

          const newViewingArea = new ViewingAreaController({
            elapsedTimeSec: 0,
            id: 'test',
            isPlaying: true,
            video: 'test',
            occupants: [],
            queue: [],
            type: 'ViewingArea',
          });
          const newAddListenerSpy = jest.spyOn(newViewingArea, 'addListener');
          renderData.rerender(renderViewingArea(newViewingArea, townController));

          expect(getSingleListenerRemoved('playbackChange')).toBe(origPlayback);
          expect(getSingleListenerRemoved('progressChange')).toBe(origProgress);
          expect(getSingleListenerRemoved('queueChange')).toBe(origQueue);
          expect(getSingleListenerRemoved('videoChange')).toBe(origVideo);

          getSingleListenerAdded('playbackChange', newAddListenerSpy);
          getSingleListenerAdded('progressChange', newAddListenerSpy);
          getSingleListenerAdded('queueChange', newAddListenerSpy);
          getSingleListenerAdded('videoChange', newAddListenerSpy);
        });
      });
    });
    it('Pauses the video on playbackChange', async () => {
      expect(viewingArea.isPlaying).toBe(true);
      expect(componentDidUpdateSpy).not.toBeCalled();
      act(() => {
        viewingArea.emit('playbackChange', false);
      });
      const newProps = lastReactPlayerPropUpdate();
      expect(newProps.playing).toBe(false);
    });
    it('Unpauses the video on playbackChange', () => {
      expect(viewingArea.isPlaying).toBe(true);
      expect(componentDidUpdateSpy).not.toBeCalled();
      act(() => {
        viewingArea.emit('playbackChange', false);
      });
      let newProps = lastReactPlayerPropUpdate();
      expect(newProps.playing).toBe(false);

      act(() => {
        viewingArea.emit('playbackChange', true);
      });
      newProps = lastReactPlayerPropUpdate();
      expect(newProps.playing).toBe(true);
    });
    it('Seeks the video when the drift is more than ALLOWED_DRIFT', () => {
      mockReactPlayer.currentTime = 10;
      act(() => {
        viewingArea.emit('progressChange', 13.01);
      });
      expect(lastSeekCall()).toEqual(13.01);

      mockReactPlayer.currentTime = 10;
      act(() => {
        viewingArea.emit('progressChange', 6.99);
      });
      expect(lastSeekCall()).toEqual(6.99);
    });
    it('Does not seek the video if the drift is less than ALLOWED_DRIFT', () => {
      mockReactPlayer.currentTime = 10;
      act(() => {
        viewingArea.emit('progressChange', 13);
      });
      expect(seekSpy).not.toBeCalled();
    });
  });
  describe('[T4] Bridging events from the ReactPlayer to the ViewingAreaController', () => {
    it('Registers listeners for onProgress, onPlay, onPause, and onEnded', () => {
      const props = firstReactPlayerConstructorProps();
      expect(props.onPlay).toBeDefined();
      expect(props.onPause).toBeDefined();
      expect(props.onEnded).toBeDefined();
      expect(props.onProgress).toBeDefined();
    });
    it("updates the viewing area controller's model and emits an update to the town onPlay", () => {
      const { onPlay } = firstReactPlayerConstructorProps();
      expect(viewingArea.isPlaying).toBe(true);
      act(() => {
        viewingArea.isPlaying = false;
      });
      act(() => {
        if (onPlay) {
          onPlay();
        }
      });
      expect(viewingArea.isPlaying).toBe(true);
      expect(townController.emitViewingAreaUpdate).toBeCalledWith(viewingArea);
    });

    it("updates the viewing area controller's model and emits an update to the town onPause", () => {
      const { onPause } = firstReactPlayerConstructorProps();
      expect(viewingArea.isPlaying).toBe(true);
      act(() => {
        if (onPause) onPause();
      });
      expect(viewingArea.isPlaying).toBe(false);
      expect(townController.emitViewingAreaUpdate).toBeCalledWith(viewingArea);
    });
    it("updates the viewing area controller's model and emits an update to the town onEnded", () => {
      const { onEnded } = firstReactPlayerConstructorProps();
      expect(viewingArea.isPlaying).toBe(true);
      act(() => {
        if (onEnded) onEnded();
      });
      expect(viewingArea.isPlaying).toBe(false);
      expect(townController.emitViewingAreaUpdate).toBeCalledWith(viewingArea);
    });
    it("updates the viewing area controller's model and emits an update to the town onProgress", () => {
      const { onProgress } = firstReactPlayerConstructorProps();
      expect(viewingArea.isPlaying).toBe(true);
      const newElapsedTimeSec = 10;
      act(() => {
        if (onProgress)
          onProgress({ loaded: 0, playedSeconds: newElapsedTimeSec, loadedSeconds: 0, played: 0 });
      });
      expect(viewingArea.elapsedTimeSec).toBe(newElapsedTimeSec);
      expect(townController.emitViewingAreaUpdate).toBeCalledWith(viewingArea);
    });
    it('does not emit an update to the town for onPlay, onPause, onEnded or onProgress if the new state matches the existing state of the controller', () => {
      const { onPlay, onProgress, onEnded, onPause } = firstReactPlayerConstructorProps();
      if (!onPlay) {
        fail('Unable to find an onPlay handler');
      }
      if (!onProgress) {
        fail('Unable to find an onProgress handler');
      }
      if (!onEnded) {
        fail('Unable to find an onEnded handler');
      }
      if (!onPause) {
        fail('Unable to find an onPause handler');
      }

      act(() => {
        viewingArea.isPlaying = true;
      });
      onPlay();
      expect(townController.emitViewingAreaUpdate).not.toBeCalled();

      act(() => {
        viewingArea.elapsedTimeSec = 100;
      });
      onProgress({ playedSeconds: 100, loaded: 0, loadedSeconds: 0, played: 0 });
      expect(townController.emitViewingAreaUpdate).not.toBeCalled();

      act(() => {
        viewingArea.isPlaying = false;
      });
      onPause();
      expect(townController.emitViewingAreaUpdate).not.toBeCalled();

      act(() => {
        viewingArea.isPlaying = false;
      });
      onEnded();
      expect(townController.emitViewingAreaUpdate).not.toBeCalled();
    });
  });

  describe('[T4] Skip Button Functionality', () => {
    let newSkipButton: HTMLElement;
    it('Skips the video when clicked', () => {
      newSkipButton = renderData.getByText('Skip Video');

      // Verify the type and everything is the same as defined above
      expect(viewingArea.type).toBe('Viewing Area');
      expect(viewingArea.isPlaying).toBe(true);
      expect(viewingArea.video).toBe('test');
      expect(viewingArea.queue).toEqual(['test1', 'test2']);

      // Simulate someone clicking skip
      fireEvent.click(newSkipButton);

      // We should not be playing a video when we skip
      expect(viewingArea.isPlaying).toBe(false);

      // Ensure that the video in the queue is set as the new video
      expect(viewingArea.video).toBe('test1');

      // Ensure that the queue is updated to the next video
      expect(viewingArea.queue).toEqual(['test2']);
    });
  });

  describe('[T4] LikeButton Functionality', () => {
    let likeButton: HTMLElement;

    it('LikeButton is not defined', () => {
      const verifyButton = renderData.queryByTestId('Like');
      expect(verifyButton).toBeNull();
    });

    it('LikeButton is now defined and clicked', async () => {
      // verifies the mock video is playing
      expect(viewingArea.video != undefined).toBe(true);
      expect(viewingArea.video).toBe('test');
      expect(viewingArea.type).toBe('Viewing Area');
      expect(viewingArea.isPlaying).toBe(true);

      // now feed a new video
      viewingArea.video = 'test?v=_LoDzVvBVpQ';

      likeButton = renderData.getByTestId('Like');
      expect(renderData.getByTestId('Like')).toBeDefined();

      // Verify video is the same as defined above
      expect(viewingArea.video).toBe('test?v=_LoDzVvBVpQ');

      // Simulate clicking skip
      fireEvent.click(likeButton);

      // Now that we click like button we check that the same video is playing as above and that the video doesn't stop playing
      expect(viewingArea.video).toBe('test?v=_LoDzVvBVpQ');
      expect(viewingArea.type).toBe('Viewing Area');
      expect(viewingArea.isPlaying).toBe(true);
    });
  });

  describe('[T4] Rendering Chat', () => {
    const chatChannelSpy = jest.spyOn(ChatChannel, 'default');
    it('Renders a ChatChannel with the interactableID', () => {
      renderViewingArea(viewingArea, townController);
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: viewingArea.id,
        },
        {},
      );
    });
    it('Re-renders the ChatChannel when the interactableID changes', () => {
      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: viewingArea.id,
        },
        {},
      );
      renderData.rerender(
        <ChakraProvider>
          <TownControllerContext.Provider value={townController}>
            <ViewingAreaVideo controller={viewingArea} />
          </TownControllerContext.Provider>
        </ChakraProvider>,
      );

      expect(chatChannelSpy).toHaveBeenCalledWith(
        {
          interactableID: viewingArea.id,
        },
        {},
      );
    });
  });
});
