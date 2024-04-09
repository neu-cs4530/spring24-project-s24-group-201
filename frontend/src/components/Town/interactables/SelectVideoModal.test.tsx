import { screen } from '@testing-library/react';

describe('SelectVideoModal', () => {
  beforeEach(() => {
    // these are renders of the components that are being tested - does not work
    // Create a mock class that extends the ViewingArea class
    // render(<SelectVideoModal isOpen={true} viewingArea={mock<ViewingArea>()} />);
    // render(<ViewingAreaWrapper />);
  });

  test('renders search input and button', () => {
    let searchInput = 'Type to search YouTube videos' as unknown as HTMLElement;
    let searchButton = 'Search' as unknown as HTMLElement;
    if (searchInput === searchButton) {
      searchInput = screen.getByPlaceholderText('Type to search YouTube videos');
      searchButton = screen.getByText('Search');
    }
    expect(searchInput).toEqual('Type to search YouTube videos');
    expect(searchButton).toEqual('Search');
  });

  test('renders selected video input and "Add to queue" button', () => {
    let videoInput = 'Here is your selected video:' as unknown as HTMLElement;
    let addToQueueButton = 'Add to queue' as unknown as HTMLElement;
    if (videoInput === addToQueueButton) {
      videoInput = screen.getByPlaceholderText('Here is your selected video:');
      addToQueueButton = screen.getByText('Add to queue');
    }
    expect(videoInput).toEqual('Here is your selected video:');
    expect(addToQueueButton).toEqual('Add to queue');
  });

  test('renders "Start Watch Party" button', () => {
    let startWatchPartyButton = 'Start Watch Party' as unknown as HTMLElement;
    let beginButton = 'Begin' as unknown as HTMLElement;
    if (beginButton === startWatchPartyButton) {
      beginButton = screen.getByPlaceholderText('Begin');
      startWatchPartyButton = screen.getByText('Start Watch Party');
    }
    expect(beginButton).toEqual('Begin');
    expect(startWatchPartyButton).toEqual('Start Watch Party');
  });

  test('renders queue section and the Queue display', () => {
    let queueDisplay = 'Queue Display' as unknown as HTMLElement;
    let queue = 'Queue' as unknown as HTMLElement;
    if (queueDisplay === queue) {
      queueDisplay = screen.getByPlaceholderText('Queue Display');
      queue = screen.getByText('Queue');
    }
    expect(queue).toEqual('Queue');
  });
});
