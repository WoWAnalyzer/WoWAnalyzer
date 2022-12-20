import VerticallyAlignedToggle from 'interface/VerticallyAlignedToggle';

interface Props {
  hideExplanations: boolean;
  setHideExplanations: (p: boolean) => void;
  id: string;
  label?: string;
  tooltipContent?: string;
}
const HideExplanationsToggle = ({
  hideExplanations,
  setHideExplanations,
  id,
  label,
  tooltipContent,
}: Props) => (
  <div className="flex">
    <div className="flex-main" />
    <div className="flex-sub">
      <VerticallyAlignedToggle
        id={id}
        enabled={hideExplanations}
        setEnabled={setHideExplanations}
        label={label ?? 'Hide Rotation Explanations'}
        tooltipContent={
          tooltipContent ??
          "Enabling this feature will hide the explanations of what each ability does. Don't worry, you can always bring them back."
        }
      />
    </div>
  </div>
);

export default HideExplanationsToggle;
