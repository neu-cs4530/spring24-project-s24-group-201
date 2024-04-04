import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  ListItem,
  ModalFooter,
  Select,
  UnorderedList,
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
    <Accordion allowToggle defaultIndex={0}>
      <AccordionItem>
        <h2>
          <AccordionButton _expanded={{ bg: 'black', color: 'white' }} fontWeight='bold'>
            <span>Pick a video to watch</span>
            <AccordionIcon />
          </AccordionButton>
        </h2>
        <AccordionPanel pb={4}>
          <FormControl alignItems='center'>
            <FormLabel htmlFor='search'>Search for Videos</FormLabel>
            <Flex>
              <Input
                id='search'
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder='Type to search YouTube videos'
              />
              <Button colorScheme='blue' onClick={handleSearch} ml={1}>
                Search
              </Button>
            </Flex>
          </FormControl>
          {searchResults.length > 0 && (
            <Select
              variant='filled'
              placeholder='Select this dropdown to see results'
              onChange={event => handleSelectVideo(event.target.value)}
              mt={2}>
              {searchResults.map(item => (
                <option key={item.id.videoId} value={item.id.videoId}>
                  {item.snippet.title}
                </option>
              ))}
            </Select>
          )}
          <FormControl mt={3}>
            <FormLabel htmlFor='video'>Here is your selected video: </FormLabel>
            <Flex>
              <Input
                id='video'
                name='video'
                value={video}
                onChange={e => setVideo(e.target.value)}
              />
              <Button
                ml={1}
                colorScheme='blue'
                mr={3}
                onClick={() => setQueue(prevQueue => [...prevQueue, video])}>
                Add to queue
              </Button>
            </Flex>
          </FormControl>
          <form
            onSubmit={ev => {
              ev.preventDefault();
              createViewingArea();
            }}>
            <ModalFooter mt={4} justifyContent='center'>
              {isBeginButtonVisible && queue.length !== 0 && (
                <Button
                  colorScheme='whatsapp'
                  mr={3}
                  onClick={createViewingArea}
                  fontWeight='bold'
                  color='black'>
                  Press here to start your Watch Party
                </Button>
              )}
            </ModalFooter>
          </form>
          <Heading as='h3' mt={4}>
            <AccordionButton _expanded={{ bg: 'black', color: 'white' }} fontWeight='bold'>
              <Box flex='1' textAlign='left'>
                Queue
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </Heading>
          <AccordionPanel>
            <UnorderedList aria-label='list of queue'>
              {queue.map(videoName => {
                return <ListItem key={videoName}>{videoName}</ListItem>;
              })}
            </UnorderedList>
          </AccordionPanel>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
