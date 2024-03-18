import { Container } from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
//import ReactPlayer from 'react-player';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import useTownController from '../../../hooks/useTownController';
import SelectVideoModal from './SelectVideoModal';
import ViewingAreaInteractable from './ViewingArea';
import VideoRenderer from './YouTube/VideoRenderer';
import YouTubeSearch from './YouTube/YouTubeSearch';

// const ALLOWED_DRIFT = 3;
// export class MockReactPlayer extends ReactPlayer {
//   render(): React.ReactNode {
//     return <></>;
//   }
// }

/**
 * The ViewingAreaVideo component renders a ViewingArea's video, using the ReactPlayer component.
 * The URL property of the ReactPlayer is set to the ViewingAreaController's video property, and the isPlaying
 * property is set, by default, to the controller's isPlaying property.
 *
 * The ViewingAreaVideo subscribes to the ViewingAreaController's events, and responds to
 * playbackChange events by pausing (or resuming) the video playback as appropriate. In response to
 * progressChange events, the ViewingAreaVideo component will seek the video playback to the same timecode.
 * To avoid jittering, the playback is allowed to drift by up to ALLOWED_DRIFT before seeking: the video should
 * not be seek'ed to the newTime from a progressChange event unless the difference between the current time of
 * the video playback exceeds ALLOWED_DRIFT.
 *
 * The ViewingAreaVideo also subscribes to onProgress, onPause, onPlay, and onEnded events of the ReactPlayer.
 * In response to these events, the ViewingAreaVideo updates the ViewingAreaController's properties, and
 * uses the TownController to emit a viewing area update.
 *
 * @param props: A single property 'controller', which is the ViewingAreaController corresponding to the
 *               current viewing area.
 */
export function ViewingAreaVideo({
  controller,
}: {
  controller: ViewingAreaController;
}): JSX.Element {
  const [videoUrl, setVideoUrl] = useState<string | undefined>(controller.video);

  useEffect(() => {
    const handleVideoChange = (newVideoUrl: string | undefined) => {
      setVideoUrl(newVideoUrl);
    };
    controller.addListener('videoChange', handleVideoChange);
    return () => {
      controller.removeListener('videoChange', handleVideoChange);
    };
  }, [controller]);

  return (
    <Container className='participant-wrapper'>
      Viewing Area: {controller.friendlyName}{' '}
      {videoUrl && <VideoRenderer videoId={videoUrl.split('v=')[1]} />}
    </Container>
  );
}

// export function ViewingAreaVideo(): JSX.Element {
//   // Hardcoded video URL (extract the video ID from the URL)
//   const videoId = 'dQw4w9WgXcQ';

//   return (
//     <div className='participant-wrapper'>
//       Viewing Area Video:
//       <VideoRenderer videoId={videoId} />
//     </div>
//   );
// }

/**
 * The ViewingArea monitors the player's interaction with a ViewingArea on the map: displaying either
 * a popup to set the video for a viewing area, or if the video is set, a video player.
 *
 * @param props: the viewing area interactable that is being interacted with
 */
export function ViewingArea({
  viewingArea,
}: {
  viewingArea: ViewingAreaInteractable;
}): JSX.Element {
  const townController = useTownController();
  const viewingAreaController = useInteractableAreaController<ViewingAreaController>(
    viewingArea.name,
  );
  const [selectIsOpen, setSelectIsOpen] = useState(viewingAreaController.video === undefined);
  const [viewingAreaVideoURL, setViewingAreaVideoURL] = useState(viewingAreaController.video);
  useEffect(() => {
    const setURL = (url: string | undefined) => {
      if (!url) {
        townController.interactableEmitter.emit('endIteraction', viewingAreaController);
      } else {
        setViewingAreaVideoURL(url);
      }
    };
    viewingAreaController.addListener('videoChange', setURL);
    return () => {
      viewingAreaController.removeListener('videoChange', setURL);
    };
  }, [viewingAreaController, townController]);

  if (!viewingAreaVideoURL) {
    return (
      <SelectVideoModal
        isOpen={selectIsOpen}
        close={() => {
          setSelectIsOpen(false);
          // forces game to emit "viewingArea" event again so that
          // repoening the modal works as expected
          townController.interactEnd(viewingArea);
        }}
        viewingArea={viewingArea}
      />
    );
  }
  return (
    <>
      <ViewingAreaVideo controller={viewingAreaController} />
    </>
  );
}

// export function ViewingArea({
//   viewingArea,
// }: {
//   viewingArea: ViewingAreaInteractable;
// }): JSX.Element {
//   // You can still use the controller if you need to perform actions or checks based on the viewing area state
//   const townController = useTownController();
//   const viewingAreaController = useInteractableAreaController<ViewingAreaController>(
//     viewingArea.name,
//   );

//   // Directly return the ViewingAreaVideo component, assuming that the interaction implies wanting to see the video
//   return <ViewingAreaVideo />;
// }

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function ViewingAreaWrapper(): JSX.Element {
  const [videoId, setVideoId] = useState<string | undefined>(undefined);
  const townController = useTownController();
  const viewingArea = useInteractable<ViewingAreaInteractable>('viewingArea');

  useEffect(() => {
    if (videoId && viewingArea) {
      // Assuming you have a method to retrieve the controller using the ID
      const viewingAreaController = townController.getViewingAreaController(viewingArea);
      viewingAreaController.video = `https://www.youtube.com/watch?v=${videoId}`;
    }
  }, [videoId, viewingArea, townController]);

  if (viewingArea) {
    const viewingAreaController = townController.getViewingAreaController(viewingArea);
    return (
      <>
        <YouTubeSearch
          onVideoSelect={setVideoId}
          onFocus={() => townController.pause()}
          onBlur={() => townController.unPause()}
        />
        {videoId && <ViewingAreaVideo controller={viewingAreaController} />}
      </>
    );
  }

  // When no viewing area is interacted with, render nothing or some placeholder
  return <></>;
}

//make whole page a parent, multiple child components
