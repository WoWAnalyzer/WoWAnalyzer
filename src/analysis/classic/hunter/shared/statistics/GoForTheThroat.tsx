import { formatThousands } from 'common/format';
import makeWclUrl from 'common/makeWclUrl';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { statistic } from 'parser/core/Analyzer';
import resourceGained, { sumResourceGainedBySpell } from 'parser/shared/metrics/resourceGained';
import resourceWasted, { sumResourceWastedBySpell } from 'parser/shared/metrics/resourceWasted';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';

const INVIGORATION = 34953;
const GO_FOR_THE_THROAT = 34954;

const GoForTheThroat = statistic((events, { fightDuration, playerId, fightId, reportCode }) => {
  const focusGained = sumResourceGainedBySpell(
    resourceGained(events),
    RESOURCE_TYPES.FOCUS.id,
    INVIGORATION,
  );
  const focusWasted = sumResourceWastedBySpell(
    resourceWasted(events),
    RESOURCE_TYPES.FOCUS.id,
    INVIGORATION,
  );

  if (!focusGained) {
    return null;
  }

  return (
    <Statistic
      drilldown={makeWclUrl(reportCode, {
        fight: fightId,
        source: playerId,
        type: 'resources',
        spell: 102,
        ability: INVIGORATION,
        view: 'events',
      })}
    >
      <BoringSpellValueText spell={GO_FOR_THE_THROAT}>
        {formatThousands((focusGained / fightDuration) * 1000 * 5)} focus gained{' '}
        <small>per 5sec</small>
        <br />
        {formatThousands((focusWasted / fightDuration) * 1000 * 5)} focus wasted{' '}
        <small>per 5sec</small>
      </BoringSpellValueText>
    </Statistic>
  );
});

export default GoForTheThroat;
