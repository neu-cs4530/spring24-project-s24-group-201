import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Icon,
  Image,
} from '@chakra-ui/react';
import React, { useEffect, useRef, useState } from 'react';
import ReactPlayer from 'react-player';
import { useInteractable, useInteractableAreaController } from '../../../classes/TownController';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import useTownController from '../../../hooks/useTownController';
import SelectVideoModal from './SelectVideoModal';
import ViewingAreaInteractable from './ViewingArea';
import ChatChannel from './ChatChannel';
import ToggleLikeButton from '../../VideoCall/VideoFrontend/components/Buttons/LikeButton/LikeButton';
import { IoPlaySkipForwardSharp } from 'react-icons/io5';

const ALLOWED_DRIFT = 3;
export class MockReactPlayer extends ReactPlayer {
  render(): React.ReactNode {
    return <></>;
  }
}

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
  const [isPlaying, setPlaying] = useState<boolean>(controller.isPlaying);
  const [videoURL, setVideoURL] = useState<string>(controller.video || '');
  const [queue, setQueue] = useState<string[]>(controller.queue || []);
  const townController = useTownController();
  const reactPlayerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    const progressListener = (newTime: number) => {
      const currentTime = reactPlayerRef.current?.getCurrentTime();
      if (currentTime !== undefined && Math.abs(currentTime - newTime) > ALLOWED_DRIFT) {
        reactPlayerRef.current?.seekTo(newTime, 'seconds');
      }
    };
    controller.addListener('progressChange', progressListener);
    controller.addListener('playbackChange', setPlaying);

    // The clean-up function
    return () => {
      controller.removeListener('playbackChange', setPlaying);
      controller.removeListener('progressChange', progressListener);
    };
  }, [controller]);

  useEffect(() => {
    const queueUpdater = (updatedQueue: string[]) => {
      setQueue(updatedQueue);
    };
    const videoChangeQueueUpdater = (updatedVideo: string | undefined) => {
      if (updatedVideo) {
        setVideoURL(updatedVideo);
      }
    };
    controller.addListener('queueChange', queueUpdater);
    controller.addListener('videoChange', videoChangeQueueUpdater);
    return () => {
      controller.removeListener('queueChange', queueUpdater);
      controller.removeListener('videoChange', videoChangeQueueUpdater);
    };
  }, [controller]);

  return (
    <Accordion allowToggle defaultIndex={0}>
      <AccordionItem>
        <AccordionButton _expanded={{ bg: 'black', color: 'white' }} fontWeight='bold'>
          <span>Watch your video here</span>
          <AccordionIcon />
        </AccordionButton>
        <AccordionPanel>
          <Center>
            <Flex>
              <Flex direction='column'>
                <Box mr={10}>
                  {!controller.video && (
                    <Image
                      src='https://via.placeholder.com/600x400.png?text=Select+video+to+be+played+here'
                      alt='Your video will be played here'
                      width='100%'
                      height='100%'
                    />
                  )}
                  {controller.video && (
                    <ReactPlayer
                      url={videoURL}
                      ref={reactPlayerRef}
                      config={{
                        youtube: {
                          playerVars: {
                            disablekb: 1,
                            autoplay: 1,
                          },
                        },
                      }}
                      playing={isPlaying}
                      onProgress={state => {
                        if (
                          state.playedSeconds != 0 &&
                          state.playedSeconds != controller.elapsedTimeSec
                        ) {
                          controller.elapsedTimeSec = state.playedSeconds;
                          townController.emitViewingAreaUpdate(controller);
                        }
                      }}
                      onPlay={() => {
                        if (!controller.isPlaying) {
                          controller.isPlaying = true;
                          townController.emitViewingAreaUpdate(controller);
                        }
                      }}
                      onPause={() => {
                        if (controller.isPlaying) {
                          controller.isPlaying = false;
                          townController.emitViewingAreaUpdate(controller);
                        }
                      }}
                      onEnded={() => {
                        if (controller.isPlaying) {
                          controller.isPlaying = false;
                          if (queue.length > 0) {
                            controller.video = queue.shift();
                            setQueue([...queue]);
                          }
                          townController.emitViewingAreaUpdate(controller);
                        }
                      }}
                      controls={true}
                      width='37vw' // Adjust width as needed
                      height='30vh' // Adjust height as needed
                    />
                  )}
                </Box>
                <Flex alignSelf='flex-end' mr={10} mt={2}>
                  <Box>
                    {controller.video && controller.queue.length !== 0 && (
                      <Button
                        data-testid='Skip Video'
                        colorScheme='purple'
                        onClick={() => {
                          controller.isPlaying = false;
                          controller.video = queue.shift();
                          setQueue([...queue]);
                        }}>
                        Skip Video
                        <Icon as={IoPlaySkipForwardSharp} boxSize={6} ml={1} />
                      </Button>
                    )}
                  </Box>
                  <Box ml={1}>
                    {controller.video && controller.video.includes('v=') && (
                      <ToggleLikeButton
                        data-testid='Like'
                        videoID={controller.video.split('v=')[1].split('&')[0]}
                        user={townController.userID}
                      />
                    )}
                  </Box>
                </Flex>
              </Flex>
              <Box
                height='37vh'
                width='20vw'
                overflowY='scroll'
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <ChatChannel interactableID={controller.id} />
              </Box>
            </Flex>
          </Center>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}

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
  useEffect(() => {
    const setURL = (url: string | undefined) => {
      if (!url) {
        townController.interactableEmitter.emit('endIteraction', viewingAreaController);
      }
    };
    viewingAreaController.addListener('videoChange', setURL);
    return () => {
      viewingAreaController.removeListener('videoChange', setURL);
    };
  }, [viewingAreaController, townController]);

  return (
    <Flex>
      <Modal
        isOpen={selectIsOpen}
        onClose={() => {
          setSelectIsOpen(false);
          // forces game to emit "viewingArea" event again so that
          // reopening the modal works as expected
          townController.interactEnd(viewingArea);
        }}
        size='6xl'>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader fontFamily='heading' color='black' bg='white'>
            Welcome to the YouTube Watch Party
          </ModalHeader>

          <ModalCloseButton />
          <ModalBody>
            <SelectVideoModal isOpen={selectIsOpen} viewingArea={viewingArea} />
            <ViewingAreaVideo controller={viewingAreaController}></ViewingAreaVideo>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  );
}

/**
 * The ViewingAreaWrapper is suitable to be *always* rendered inside of a town, and
 * will activate only if the player begins interacting with a viewing area.
 */
export default function ViewingAreaWrapper(): JSX.Element {
  const viewingArea = useInteractable<ViewingAreaInteractable>('viewingArea');
  if (viewingArea) {
    return <ViewingArea viewingArea={viewingArea} />;
  }
  return <></>;
}
