import { useAnalyzer, useInfo } from 'interface/guide/index';
import { PanelHeader, PerformanceRoundedPanel } from 'interface/guide/components/GuideDivs';
import PotionChecker from 'parser/retail/modules/items/PotionChecker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ItemLink from 'interface/ItemLink';
import Potion from 'interface/icons/Potion';

const PotionPanel = () => {
  const potionChecker = useAnalyzer(PotionChecker);
  const info = useInfo();
  if (!potionChecker || !info) {
    return null;
  }

  const weakPotionsUsed = potionChecker.weakPotionsUsed;
  const potionsUsed = potionChecker.potionsUsed;
  const maxPotions = potionChecker.maxPotions;
  const strongPotionId = potionChecker.strongPotionId;

  const performance =
    potionsUsed >= maxPotions && weakPotionsUsed === 0
      ? QualitativePerformance.Good
      : QualitativePerformance.Fail;

  return (
    <PerformanceRoundedPanel performance={performance}>
      <PanelHeader className="flex">
        <div className="flex-main">
          <strong>Number of Potions Used</strong>
        </div>
        <div className="flex-sub">
          <Potion />
        </div>
      </PanelHeader>
      {performance === QualitativePerformance.Good && (
        <p>
          You used the appropriate amount of potions ({potionsUsed}/{maxPotions}) during this fight!
          Good work!
        </p>
      )}
      {performance === QualitativePerformance.Fail && (
        <p>
          You used {potionsUsed} combat {potionsUsed === 1 ? 'potion' : 'potions'} during this
          encounter, but you could have used {maxPotions}. Since you are able to use a combat potion
          every 5 minutes, you should ensure that you are getting the maximum number of potions in
          each encounter.
        </p>
      )}
      {weakPotionsUsed > 0 && (
        <>
          <PanelHeader>
            <strong>Quality of Potions Used</strong>
          </PanelHeader>
          <p>
            You used {weakPotionsUsed} weak {weakPotionsUsed === 1 ? 'potion' : 'potions'}.{' '}
            <ItemLink id={strongPotionId} /> should be used in order to get a slightly higher damage
            output.
          </p>
        </>
      )}
    </PerformanceRoundedPanel>
  );
};

export default PotionPanel;
