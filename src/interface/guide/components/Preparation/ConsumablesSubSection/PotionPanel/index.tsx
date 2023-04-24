import { useAnalyzer, useInfo } from 'interface/guide/index';
import { PanelHeader, PerformanceRoundedPanel } from 'interface/guide/components/GuideDivs';
import PotionChecker from 'parser/retail/modules/items/PotionChecker';
import ClassicPotionChecker from 'parser/classic/modules/items/PotionChecker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import ItemLink from 'interface/ItemLink';
import Potion from 'interface/icons/Potion';
import Expansion from 'game/Expansion';

interface Props {
  expansion?: Expansion;
}
const PotionPanel = ({ expansion }: Props) => {
  const UsePotionChecker =
    expansion === Expansion.WrathOfTheLichKing ? ClassicPotionChecker : PotionChecker;
  const potionChecker = useAnalyzer(UsePotionChecker);
  const info = useInfo();
  if (!potionChecker || !info) {
    return null;
  }

  const weakPotionsUsed = potionChecker.weakPotionsUsed;
  const potionsUsed = potionChecker.potionsUsed;
  const maxPotions = potionChecker.maxPotions;
  const strongPotionId = potionChecker.strongPotionId;
  const suggestionMessage = potionChecker.suggestionMessage;

  let performance = QualitativePerformance.Good;
  if (weakPotionsUsed > 0) {
    performance = QualitativePerformance.Ok;
  }
  if (potionsUsed < maxPotions) {
    performance = QualitativePerformance.Fail;
  }

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
      {performance !== QualitativePerformance.Fail && (
        <p>
          You used the appropriate amount of potions ({potionsUsed}/{maxPotions}) during this fight!
          Good work!
        </p>
      )}
      {performance === QualitativePerformance.Fail && (
        <p>
          You used {potionsUsed} combat {potionsUsed === 1 ? 'potion' : 'potions'} during this
          encounter, but you could have used {maxPotions}. {suggestionMessage}
        </p>
      )}
      {weakPotionsUsed > 0 && (
        <>
          <PanelHeader>
            <strong>Quality of Potions Used</strong>
          </PanelHeader>
          <p>
            You used {weakPotionsUsed} weak {weakPotionsUsed === 1 ? 'potion' : 'potions'}. Use{' '}
            <ItemLink id={strongPotionId} /> for better results.
          </p>
        </>
      )}
    </PerformanceRoundedPanel>
  );
};

export default PotionPanel;
