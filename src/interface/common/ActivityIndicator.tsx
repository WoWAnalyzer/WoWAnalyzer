import React, { useEffect, useState } from 'react';

export interface Props {
  text: React.ReactNode
}

const ActivityIndicator = ({ text }: Props) => {
  const [time, setTime] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => setTime(time => time + 500), 500)
    return () => clearInterval(interval)
  }, [])

  if (time < 1500) {
    // It's best practice to not show a loading indicator (especially a flashy animation) within 1 second of the request. This is both distracting and gives the feeling that the app is slower than if it actually showed nothing.
    return null;
  }

  return (
    <div className="container">
      <div className="text-center" style={{ marginTop: 50, marginBottom: 50 }}>
        <h1>{text}</h1>
        <div className="spinner" />
      </div>
    </div>
  );
}

export default ActivityIndicator;
