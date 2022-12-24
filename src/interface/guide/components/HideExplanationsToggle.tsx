import VerticallyAlignedToggle from 'interface/VerticallyAlignedToggle';
import { useExplanationContext } from 'interface/guide/components/Explanation';

interface HideExplanationToggleProps {
  id: string;
  label?: string;
  tooltipContent?: string;
}
export const HideExplanationsToggle = ({
  id,
  label,
  tooltipContent,
}: HideExplanationToggleProps) => {
  const { hideExplanations, setHideExplanations } = useExplanationContext();
  return (
    <div className="flex">
      <div className="flex-main" />
      <div className="flex-sub">
        <VerticallyAlignedToggle
          id={id}
          enabled={hideExplanations}
          setEnabled={setHideExplanations}
          label={label ?? 'Hide Explanations'}
          tooltipContent={
            tooltipContent ??
            "Enabling this feature will hide explanations throughout the Guide. Don't worry, you can always bring them back."
          }
        />
      </div>
    </div>
  );
};

export default HideExplanationsToggle;
