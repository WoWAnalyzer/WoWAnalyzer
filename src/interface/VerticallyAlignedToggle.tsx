import Tooltip from 'interface/Tooltip';
import InformationIcon from 'interface/icons/Information';
import Toggle from 'react-toggle';
import { ReactNode } from 'react';

interface VerticallyAlignedToggleProps {
  enabled: boolean;
  setEnabled: (p: boolean) => void;
  id: string;
  label: ReactNode;
  tooltipContent: ReactNode;
}
const VerticallyAlignedToggle = ({
  enabled,
  setEnabled,
  id,
  label,
  tooltipContent,
}: VerticallyAlignedToggleProps) => (
  <div className="flex toggle-control" style={{ alignItems: 'center', padding: '5px 0' }}>
    <label className="flex-main" htmlFor={id} style={{ marginBottom: '-0.35em' }}>
      {label}
    </label>
    <div className="flex-sub" style={{ marginBottom: '-0.35em', padding: '0 10px' }}>
      <Tooltip content={tooltipContent}>
        <div>
          <InformationIcon style={{ fontSize: '1.4em' }} />
        </div>
      </Tooltip>
    </div>
    <Toggle
      checked={enabled}
      icons={false}
      onChange={(event) => setEnabled(event.target.checked)}
      id={id}
      className="flex-sub"
    />
  </div>
);

export default VerticallyAlignedToggle;
