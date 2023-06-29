import { TooltipElement } from 'interface/Tooltip';
import { HTMLAttributes } from 'react';
import Toggle from 'react-toggle';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  initialValue: boolean;
  onChange: (newValue: boolean) => void;
}

const FightDowntimeToggle = ({ initialValue, onChange, ...others }: Props) => (
  <div className="toggle-control" {...others}>
    <Toggle
      defaultChecked={initialValue}
      icons={false}
      onChange={(event) => onChange(event.target.checked)}
      id="adjust-for-downtime-toggle"
    />
    <label htmlFor="adjust-for-downtime-toggle">
      <>
        Adjust statistics for{' '}
        <TooltipElement content="Fight downtime is any forced downtime caused by fight mechanics or dying. Downtime caused by simply not doing anything is not included.">
          fight downtime
        </TooltipElement>{' '}
        (
        <TooltipElement
          content={`We're still working out the kinks of this feature, some modules might output weird results with this on. When we're finished this will be enabled by default.`}
        >
          experimental
        </TooltipElement>
        )
      </>
    </label>
  </div>
);

export default FightDowntimeToggle;
