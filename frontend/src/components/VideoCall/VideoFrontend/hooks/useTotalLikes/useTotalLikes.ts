import { useEffect, useState } from 'react';

export default function useTotalLikes() {
  const [totalLikes, setTotalLikes] = useState(window.innerHeight * (window.visualViewport?.scale || 1));

  useEffect(() => {
    let updatedLikes = totalLikes;
    updatedLikes++;
    setTotalLikes(updatedLikes);
  }, []);

  return totalLikes;
}
