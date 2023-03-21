import VerticallyAlignedToggle from 'interface/VerticallyAlignedToggle';
import { useSpellUsageContext } from 'parser/core/SpellUsage/core';

interface HideGoodCastsToggleProps {
  id: string;
  label?: string;
  tooltipContent?: string;
}
export const HideGoodCasts = ({ id, label, tooltipContent }: HideGoodCastsToggleProps) => {
  const { hideGoodCasts, setHideGoodCasts } = useSpellUsageContext();
  return (
    <div className="flex">
      <div className="flex-main" />
      <div className="flex-sub">
        <VerticallyAlignedToggle
          id={id}
          enabled={hideGoodCasts}
          setEnabled={setHideGoodCasts}
          label={label ?? 'Hide Good Casts'}
          tooltipContent={
            tooltipContent ??
            "Enabling this feature will hide good and perfect casts throughout the Guide. Don't worry, you can always bring them back."
          }
        />
      </div>
    </div>
  );
};

export default HideGoodCasts;
