import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { statistic } from 'parser/core/Analyzer';
import { Metric } from 'parser/core/metric';
import resourceGained, {
  sumResourceGainedByPlayerPerSpell,
} from 'parser/shared/metrics/resourceGained';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';

const ManaGained: Metric<React.ReactNode> = (events, info) => {
  const manaGainedBySpell = sumResourceGainedByPlayerPerSpell(
    resourceGained(events),
    RESOURCE_TYPES.MANA.id,
    info.playerId,
  );

  if (!manaGainedBySpell) {
    return null;
  }

  return (
    <Statistic size="flexible">
      {Object.keys(manaGainedBySpell)
        .map(Number)
        .map((spellId) => (
          <BoringSpellValueText key={spellId} spell={spellId}>
            <ItemManaGained amount={manaGainedBySpell[spellId]} />
          </BoringSpellValueText>
        ))}
    </Statistic>
  );
};

export default statistic(ManaGained);
