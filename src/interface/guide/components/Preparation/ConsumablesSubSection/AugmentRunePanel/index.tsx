import AugmentRuneChecker from 'parser/retail/modules/items/AugmentRuneChecker';
import { useAnalyzer, useInfo } from 'interface/guide';
import { PanelHeader, PerformanceRoundedPanel } from 'interface/guide/components/GuideDivs';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import SpellLink from 'interface/SpellLink';

const AugmentRunePanel = () => {
  const augmentRuneChecker = useAnalyzer(AugmentRuneChecker);
  const info = useInfo();
  if (!augmentRuneChecker || !augmentRuneChecker.active || !info) {
    return null;
  }

  const startFightWithAugmentRuneUp = augmentRuneChecker.startFightWithAugmentRuneUp;
  const uptimePercentage = augmentRuneChecker.augmentRuneUptimePercentage;
  const augmentRuneSpellId = augmentRuneChecker.augmentRuneSpellId;
  const showCurrentAugmentRune = augmentRuneSpellId ? (
    <>
      : <SpellLink spell={augmentRuneSpellId} />
    </>
  ) : (
    <>.</>
  );

  let performance = QualitativePerformance.Fail;
  if (startFightWithAugmentRuneUp) {
    if (uptimePercentage < 1) {
      performance = QualitativePerformance.Ok;
    } else {
      performance = QualitativePerformance.Good;
    }
  }

  return (
    <PerformanceRoundedPanel performance={performance}>
      <PanelHeader className="flex">
        <div className="flex-main">
          <strong>Augment Rune Used</strong>
        </div>
      </PanelHeader>
      {performance === QualitativePerformance.Good && (
        <p>You had an Augment Rune active for during the fight{showCurrentAugmentRune}</p>
      )}
      {performance === QualitativePerformance.Ok && (
        <p>You did not have an Augment Rune active for the entire fight.{showCurrentAugmentRune}</p>
      )}
      {performance === QualitativePerformance.Fail && (
        <p>You did not have an Augment Rune active during the fight{showCurrentAugmentRune}</p>
      )}
    </PerformanceRoundedPanel>
  );
};

export default AugmentRunePanel;
