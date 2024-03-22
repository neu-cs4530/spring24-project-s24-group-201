import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import { useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import ViewingArea from './ViewingArea';

export default function SelectVideoModal({
  isOpen,
  close,
  viewingArea,
}: {
  isOpen: boolean;
  close: () => void;
  viewingArea: ViewingArea;
}): JSX.Element {
  const coveyTownController = useTownController();
  const viewingAreaController = useInteractableAreaController<ViewingAreaController>(
    viewingArea?.name,
  );

  const [video, setVideo] = useState<string>(viewingArea?.defaultVideoURL || '');
  const [queue, setQueue] = useState<string[]>(viewingArea?.defaultQueue);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  const toast = useToast();

  const createViewingArea = useCallback(async () => {
    const videoToPlay = queue.shift();
    const updatedQueue = [...queue];
    if (video && viewingAreaController) {
      const request = {
        id: viewingAreaController.id,
        video: videoToPlay,
        isPlaying: true,
        elapsedTimeSec: 0,
        occupants: [],
        queue: updatedQueue,
      };
      try {
        await coveyTownController.createViewingArea(request);
        toast({
          title: 'Video set!',
          status: 'success',
        });
        coveyTownController.unPause();
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to set video URL',
            description: err.toString(),
            status: 'error',
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error',
          });
        }
      }
    }
  }, [video, viewingAreaController, queue, coveyTownController, toast]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        closeModal();
        coveyTownController.unPause();
      }}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Pick a video to watch in {viewingAreaController?.id} </ModalHeader>
        <ModalCloseButton />
        <form
          onSubmit={ev => {
            ev.preventDefault();
            createViewingArea();
          }}>
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel htmlFor='video'>Video URL</FormLabel>
              <Input
                id='video'
                name='video'
                value={video}
                onChange={e => setVideo(e.target.value)}
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={createViewingArea}>
              Set video
            </Button>
            <Button
              colorScheme='green'
              mr={3}
              onClick={() => setQueue(prevQueue => [...prevQueue, video])}>
              Add to queue
            </Button>
            <Button onClick={closeModal}>Cancel</Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
