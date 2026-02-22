import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import StaggerStatistic from '../tools/StaggerAnalyzer';
import { GoodColor, OkColor } from 'interface/guide';
import { formatNumber } from 'common/format';
import { staggeringStrikesClear } from '../../normalizers/StaggerClearSourceLinkNormalizer';

export default class StaggeringStrikes extends StaggerStatistic {
  constructor(options: Options) {
    super(talents.STAGGERING_STRIKES_TALENT, options);

    this.active = this.selectedCombatant.hasTalent(talents.STAGGERING_STRIKES_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK_BRM),
      this.onKick,
    );
  }

  private onKick(event: DamageEvent) {
    const clear = staggeringStrikesClear.first(event);
    if (!clear) {
      // with Shadow Boxing Treads, not every BoK damage event has a clear.
      return;
    }

    // Staggering Strikes, unlike most other sources, logs the total pooled amount removed.
    this.removeStagger(event, clear.amount);

    this.addDebugAnnotation(event, {
      color: event.hitPoints !== undefined ? GoodColor : OkColor,
      summary: `Removed up to ${formatNumber(clear.amount)} Stagger`,
      details: (
        <dl>
          <dt>Attack Power</dt>
          <dd>{event.attackPower ? formatNumber(event.attackPower) : 'Unknown'}</dd>
        </dl>
      ),
    });
  }
}
