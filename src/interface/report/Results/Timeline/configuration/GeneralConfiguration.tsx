import styles from './TimelineConfiguration.module.scss';

export interface GeneralConfigurationProps {
  isMovementVisible: boolean;
  toggleMovementVisibility: (isVisible: boolean) => void;
}
export const GeneralConfiguration = ({
  isMovementVisible,
  toggleMovementVisibility,
}: GeneralConfigurationProps) => {
  return (
    <label className={styles['item']}>
      <input
        type="checkbox"
        checked={isMovementVisible}
        onChange={(e) => toggleMovementVisibility(e.target.checked)}
      />
      Movement overlay
    </label>
  );
};
