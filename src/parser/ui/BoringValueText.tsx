/**
 * A simple component that shows a value in the most plain way possible.
 * Use this only as the very last resort.
 */
import type { ReactNode } from 'react';

interface Props {
  label: ReactNode;
  children: ReactNode;
  className?: string;
}

const BoringValue = ({ label, children, className }: Props) => (
  <div className={`pad boring-text ${className || ''}`}>
    <label>{label}</label>
    <div className="value">{children}</div>
  </div>
);

export default BoringValue;
