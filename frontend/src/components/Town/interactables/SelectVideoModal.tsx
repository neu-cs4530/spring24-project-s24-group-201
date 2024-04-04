import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  Heading,
  Input,
  List,
  ListItem,
  ModalFooter,
  Select,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import { useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import ViewingArea from './ViewingArea';

type SearchResultItem = {
  id: { videoId: string };
  snippet: { title: string };
  [key: string]: unknown; // This allows for other unknown properties
};

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [queue, setQueue] = useState<string[]>(viewingArea?.defaultQueue);
  const [isBeginButtonVisible, setIsBeginButtonVisible] = useState(true);

  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause();
      viewingAreaController.queue = queue;
    } else {
      coveyTownController.unPause();
    }
  }, [coveyTownController, isOpen, viewingAreaController, queue]);

  const closeModal = useCallback(() => {
    coveyTownController.unPause();
    close();
  }, [coveyTownController, close]);

  const toast = useToast();

  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/youtube-search?query=${encodeURIComponent(
          searchQuery,
        )}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      const e = error as Error;
      toast({
        title: 'Error searching for videos',
        description: e.message,
        status: 'error',
      });
    }
  };

  const handleSelectVideo = (videoId: string) => {
    const fullVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    setVideo(fullVideoUrl);
    setSearchResults([]); // Clear search results after selection
  };

  const createViewingArea = useCallback(async () => {
    setIsBeginButtonVisible(false); // Hide the button when clicked
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
    <Center h='100vh'>
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton _expanded={{ bg: 'tomato', color: 'white' }}>
              <span>Pick a video to watch in {viewingAreaController?.id}</span>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl mt={4} display='flex' alignItems='center'>
              <FormLabel htmlFor='search'>Search for Videos</FormLabel>
              <Input
                id='search'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Type to search YouTube videos'
              />
              <Button ml={2} colorScheme='blue' onClick={handleSearch}>
                Search
              </Button>
            </FormControl>
            {searchResults.length > 0 && (
              <Select
                placeholder='Click dropdown to see results'
                onChange={event => handleSelectVideo(event.target.value)}
                mt={2}>
                {searchResults.map(item => (
                  <option key={item.id.videoId} value={item.id.videoId}>
                    {item.snippet.title}
                  </option>
                ))}
              </Select>
            )}
            <FormControl>
              <FormLabel htmlFor='video'>Or enter Video URL</FormLabel>
              <Input
                id='video'
                name='video'
                value={video}
                onChange={e => setVideo(e.target.value)}
              />
            </FormControl>
            <form
              onSubmit={ev => {
                ev.preventDefault();
                createViewingArea();
              }}>
              <ModalFooter mt={4}>
                {isBeginButtonVisible && queue.length !== 0 && (
                  <Button colorScheme='blue' mr={3} onClick={createViewingArea}>
                    Begin
                  </Button>
                )}
                <Button
                  colorScheme='green'
                  mr={3}
                  onClick={() => setQueue(prevQueue => [...prevQueue, video])}>
                  Add to queue
                </Button>
                {queue.length !== 0 && (
                  <Button
                    colorScheme='yellow'
                    mr={3}
                    onClick={() => {
                      viewingAreaController.isPlaying = false;
                      viewingAreaController.video = queue.shift();
                      setQueue([...queue]);
                    }}>
                    Skip Video
                  </Button>
                )}
                <Button onClick={closeModal}>Cancel</Button>
              </ModalFooter>
            </form>
            <Heading as='h3' mt={4}>
              <AccordionButton _expanded={{ bg: 'tomato', color: 'white' }}>
                <Box flex='1' textAlign='left'>
                  Queue
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </Heading>
            <AccordionPanel>
              <List aria-label='list of queue'>
                {queue.map(videoName => {
                  return <ListItem key={videoName}>{videoName}</ListItem>;
                })}
              </List>
            </AccordionPanel>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Center>
  );
}
