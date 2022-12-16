import Tooltip from 'interface/Tooltip';
import InformationIcon from 'interface/icons/Information';
import Toggle from 'react-toggle';

interface EnableNewDefensivesSectionToggleProps {
  enabled: boolean;
  setEnabled: (p: boolean) => void;
}
const EnableNewDefensivesSectionToggle = ({
  enabled,
  setEnabled,
}: EnableNewDefensivesSectionToggleProps) => (
  <div className="flex toggle-control" style={{ alignItems: 'center', padding: '5px 0' }}>
    <label
      className="flex-main"
      htmlFor="enable-new-defensives-section-toggle"
      style={{ marginBottom: '-0.35em' }}
    >
      View In-Flight Content
    </label>
    <div className="flex-sub" style={{ marginBottom: '-0.35em', padding: '0 10px' }}>
      <Tooltip content="Only click this if you're okay with seeing under-development features. If things don't work how you expect, you can always turn this back off.">
        <div>
          <InformationIcon style={{ fontSize: '1.4em' }} />
        </div>
      </Tooltip>
    </div>
    <Toggle
      checked={enabled}
      icons={false}
      onChange={(event) => setEnabled(event.target.checked)}
      id="enable-new-defensives-section-toggle"
      className="flex-sub"
    />
  </div>
);

export default EnableNewDefensivesSectionToggle;
