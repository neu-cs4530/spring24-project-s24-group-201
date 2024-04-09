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
  Select,
  useToast,
} from '@chakra-ui/react';
import React, { useCallback, useEffect, useState } from 'react';
import ViewingAreaController from '../../../classes/interactable/ViewingAreaController';
import { useInteractableAreaController } from '../../../classes/TownController';
import useTownController from '../../../hooks/useTownController';
import ViewingArea from './ViewingArea';
import { MdPlayCircleFilled } from 'react-icons/md';
import { IoIosAddCircle } from 'react-icons/io';
import { FaSearch } from 'react-icons/fa';

type SearchResultItem = {
  id: { videoId: string };
  snippet: { title: string };
  [key: string]: unknown; // This allows for other unknown properties
};

/**
 * Component for selecting a video to watch within a viewing area modal.
 * @param isOpen Indicates whether the modal is open or not.
 * @param viewingArea The viewing area for which the video is being selected.
 * @returns JSX.Element
 */
export default function SelectVideoModal({
  isOpen,
  viewingArea,
}: {
  isOpen: boolean;
  viewingArea: ViewingArea;
}): JSX.Element {
  const coveyTownController = useTownController(); // Access the town controller hook
  const viewingAreaController = useInteractableAreaController<ViewingAreaController>(
    viewingArea?.name, // Get the viewing area controller using its name
  );

  // State variables
  // State for selected video
  const [video, setVideo] = useState<string>(viewingArea?.defaultVideoURL || '');
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // State for search results
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  // State for video queue
  const [queue, setQueue] = useState<string[]>(viewingArea?.defaultQueue);
  // State to control visibility of begin button
  const [isBeginButtonVisible, setIsBeginButtonVisible] = useState(true);
  // Effect to pause/unpause town controller based on modal state
  // and update queue in viewing area controller
  useEffect(() => {
    if (isOpen) {
      coveyTownController.pause(); // Pause the town controller if modal is open
      viewingAreaController.queue = queue; // Update queue in the viewing area controller
    } else {
      coveyTownController.unPause(); // Unpause the town controller if modal is closed
    }
  }, [coveyTownController, isOpen, viewingAreaController, queue]);

  const toast = useToast(); // Access the toast hook

  // Function to handle search for YouTube videos
  const handleSearch = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_TOWNS_SERVICE_URL}/api/youtube-search?query=${encodeURIComponent(
          searchQuery,
        )}`,
        // Fetch YouTube videos based on search query
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
        // Throw error if response is not OK
      }
      const data = await response.json(); // Parse response data
      setSearchResults(data.items || []); // Set search results in state
    } catch (error) {
      const e = error as Error;
      toast({
        title: 'Error searching for videos',
        description: e.message,
        status: 'error', // Show toast with error message if search fails
      });
    }
  };

  // Function to handle selection of a video from search results
  const handleSelectVideo = (videoId: string) => {
    const fullVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    setVideo(fullVideoUrl); // Set selected video URL
    setSearchResults([]); // Clear search results after selection
  };

  // Function to create viewing area with selected video
  const createViewingArea = useCallback(async () => {
    setIsBeginButtonVisible(false); // Hide the button when clicked
    const videoToPlay = queue.shift(); // Remove first video from queue
    const updatedQueue = [...queue]; // Create a copy of queue
    if (video && viewingAreaController) {
      const request = {
        id: viewingAreaController.id, // Get viewing area ID
        video: videoToPlay, // Set video to play
        isPlaying: true,
        elapsedTimeSec: 0,
        occupants: [],
        queue: updatedQueue, // Set updated queue
      };
      try {
        await coveyTownController.createViewingArea(request); // Create viewing area with request
        toast({
          title: 'Video set!',
          status: 'success', // Show success toast
        });
        coveyTownController.unPause(); // Unpause the town controller
      } catch (err) {
        if (err instanceof Error) {
          toast({
            title: 'Unable to set video URL',
            description: err.toString(),
            status: 'error', // Show error toast if unable to set video URL
          });
        } else {
          console.trace(err);
          toast({
            title: 'Unexpected Error',
            status: 'error', // Show unexpected error toast
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
          {/* Search section */}
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
            {/* Display search results */}
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
                data-testid='Add to queue'
                ml={1}
                colorScheme='blue'
                mr={3}
                onClick={() => setQueue(prevQueue => [...prevQueue, video])}>
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
                {/* Display begin watch party button */}
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
        </AccordionPanel>
      </AccordionItem>
    </Accordion>
  );
}
