import { useEffect, useRef, useState } from 'react';
import {
  AuraConfiguration,
  AuraConfigurationProps,
} from 'interface/report/Results/Timeline/configuration/AuraConfiguration';
import CogIcon from 'interface/icons/Cog';
import Tooltip from 'interface/Tooltip';
import {
  GeneralConfiguration,
  GeneralConfigurationProps,
} from 'interface/report/Results/Timeline/configuration/GeneralConfiguration';

import styles from './TimelineConfiguration.module.scss';

type TimelineConfigurationProps = AuraConfigurationProps & GeneralConfigurationProps;
export const TimelineConfiguration = (props: TimelineConfigurationProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={styles['timeline-configuration']} ref={menuRef}>
      <Tooltip content="Configure timeline">
        <button
          type="button"
          className={styles['timeline-configuration-button']}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Configure timeline"
        >
          <CogIcon />
        </button>
      </Tooltip>

      {isOpen && (
        <div className={styles['timeline-configuration-menu']}>
          <GeneralConfiguration
            isMovementVisible={props.isMovementVisible}
            toggleMovementVisibility={props.toggleMovementVisibility}
          />
          <AuraConfiguration
            visibleAuras={props.visibleAuras}
            onAuraVisibilityChange={props.onAuraVisibilityChange}
          />
        </div>
      )}
    </div>
  );
};
