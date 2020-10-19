import React, { useState } from 'react';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  toggledvalue: React.ReactNode
  value: React.ReactNode
  style: Record<string, unknown>
}

const Toggleable = ({ toggledvalue, value, style, ...otherProps }: Props) => {
  const [toggled, setToggled] = useState(false)

  const handleClick = () => setToggled(!toggled)

  return (
    <div onClick={handleClick} style={{ cursor: 'pointer', ...style }} {...otherProps}>
      {toggled ? toggledvalue : value}
    </div>
  );
}

export default Toggleable;
