
import { HTMLAttributes } from 'react';
import Toggle from 'react-toggle';

interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'onChange'> {
  initialValue: boolean;
  onChange: (newValue: boolean) => void;
}

export const FilterByCovenantToggle = ({ initialValue, onChange, ...props }: Props) => (
  <div className="toggle-control" {...props}>
    <Toggle
      defaultChecked={initialValue}
      icons={false}
      onChange={(event) => onChange(event.target.checked)}
      id="filter-for-covenant-toggle"
    />
    <label htmlFor="filter-for-covenant-toggle">
      <small>
        <>
          Filter similiar kill times by your covenant
        </>
      </small>
    </label>
  </div>
);
