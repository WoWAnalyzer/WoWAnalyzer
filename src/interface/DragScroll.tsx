/**
 * Created by joe on 16/9/2.
 * Source: https://raw.githubusercontent.com/qiaolb/react-dragscroll/master/src/DragScroll.jsx
 * This was cleaned up. A lot.
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';

export interface Props extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  style?: Record<string, unknown>
}

const DragScroll = ({ children, style = {}, ...otherProps }: Props) => {
  const [dragging, setDragging] = useState(false)
  const container = useRef<HTMLDivElement>(null)

  const clientPosition = useRef<[number, number]>([0, 0])
  const draggingRef = useRef(dragging) // to be used in useEffect so that the effect is not triggered every time the dragging value changes, so that event listeners are only added and removed once

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    if (event.button !== 0) {
      // Only handle left click
      return;
    }

    setDragging(true)
    draggingRef.current = true
    clientPosition.current = [event.clientX, event.clientY]
    event.preventDefault();
  }

  const handleMouseUp = useCallback(() => {
    setDragging(false)
    draggingRef.current = false
  }, [])

  const handleMouseMove = useCallback((event) => {
    if (draggingRef.current && container.current !== null) {
      container.current.scrollLeft -= -clientPosition.current[0] + event.clientX;
      container.current.scrollTop -= -clientPosition.current[1] + event.clientY;
      clientPosition.current = [event.clientX, event.clientY]
    }
  }, [])

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
    }
  }, [handleMouseUp, handleMouseMove])

  return (
    <div
      onMouseDown={handleMouseDown}
      ref={container}
      style={{
        ...style,
        cursor: dragging ? 'grabbing' : 'grab',
      }}
      {...otherProps}
    >
      {children}
    </div>
  );

}

export default DragScroll;
