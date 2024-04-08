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
  Icon,
  Input,
  ListItem,
  Select,
  UnorderedList,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import { useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import ViewingArea from './ViewingArea';
import { MdPlayCircleFilled, MdMenu } from 'react-icons/md';
import { IoIosAddCircle } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';

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
  const [videoTitles, setVideoTitles] = useState<string[]>([]);

  // Function to fetch video titles by IDs
  const fetchVideoTitles = async (currentQueue: string[]) => {
    const titles = await Promise.all(
      currentQueue.map(async videoId => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/youtube-video-info?url=${videoId}`,
          );
          if (!response.ok) {
            throw new Error('Failed to fetch video title');
          }
          const data = await response.json();
          return data.title || 'Unknown Title'; // Fallback title if not found
        } catch (error) {
          console.error('Error fetching video title:', error);
          return 'Error fetching title';
        }
      }),
    );
    setVideoTitles(titles);
  };

  // Effect to fetch titles whenever the queue updates
  useEffect(() => {
    if (viewingAreaController.queue && viewingAreaController.queue.length > 0) {
      fetchVideoTitles(viewingAreaController.queue);
    }
  }, [viewingAreaController.queue]);

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
        <AccordionButton _expanded={{ bg: 'black', color: 'white' }} fontWeight='bold'>
          <span>Pick a video to watch</span>
          <AccordionIcon />
        </AccordionButton>
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
                <Icon as={FaSearch} boxSize={6} mr={2} />
                Search
              </Button>
            </Flex>
          </FormControl>
          <Box>
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
          </Box>
          <FormControl mt={3}>
            <FormLabel htmlFor='video'>Here is your selected video:</FormLabel>
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
                onClick={() => {
                  setQueue(prevQueue => [...prevQueue, video]);
                  fetchVideoTitles([...queue, video]);
                }}>
                <Icon as={IoIosAddCircle} boxSize={6} mr={2} />
                Add to queue
              </Button>
            </Flex>
          </FormControl>
          <Box mt={4}>
            <form
              onSubmit={ev => {
                ev.preventDefault();
                createViewingArea();
              }}>
              <Box mt={4} textAlign='center'>
                {isBeginButtonVisible && queue.length !== 0 && (
                  <Button
                    colorScheme='green'
                    mr={3}
                    onClick={createViewingArea}
                    fontWeight='bold'
                    color='white'>
                    <Icon as={MdPlayCircleFilled} boxSize={6} mr={2} style={{ color: 'white' }} />
                    Start Watch Party
                  </Button>
                )}
              </Box>
            </form>
          </Box>
          <Box mt={4}>
            <Accordion allowToggle defaultIndex={0}>
              <AccordionItem>
                <AccordionButton _expanded={{ bg: 'black', color: 'white' }} fontWeight='bold'>
                  <Box flex='1' alignItems='center' display='flex' textAlign='left'>
                    <Icon as={MdMenu} boxSize={4} mr={2} alignSelf='center' />
                    Queue
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <Box>
                    <UnorderedList aria-label='list of queue'>
                      {videoTitles.map((title, index) => (
                        <ListItem key={index}>{title}</ListItem>
                      ))}
                    </UnorderedList>
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </Box>
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
