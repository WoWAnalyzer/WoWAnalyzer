import React, { useState } from 'react';

export interface Props extends React.VideoHTMLAttributes<HTMLVideoElement> {
  videos: string[]
  randomValue?: number
}

const CyclingVideo = ({ videos, randomValue = Math.random(), ...otherProps }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(Math.floor(randomValue * videos.length))
  const currentVideo = videos[currentIndex];

  const handleEnded = () => {
    setCurrentIndex((currentIndex + 1) % videos.length)
  }

  return (
    <video
      autoPlay
      muted
      onEnded={handleEnded}
      key={currentVideo} // without this the element doesn't rerender properly and wouldn't start the next video
      {...otherProps}
    >
      <source src={currentVideo} type="video/mp4" />
    </video>
  );
}

export default CyclingVideo;
