import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Module';
import Events, { DamageEvent } from 'parser/core/Events';
import { TALENTS_DRUID } from 'common/TALENTS';
import { ReactNode } from 'react';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellLink } from 'interface';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { barkskinMitigation } from 'analysis/retail/druid/guardian/constants';

/**
 * **Barkskin**
 * Spec Talent
 *
 * Your skin becomes as tough as bark, reducing all damage you take by 20% and
 * preventing damage from delaying your spellcasts. Lasts 8 sec. Usable while stunned,
 * frozen, incapacitated, feared, or asleep, and in all shapeshift forms.
 */
export default class Barkskin extends MajorDefensiveBuff {
  constructor(options: Options) {
    super(SPELLS.BARKSKIN, buff(SPELLS.BARKSKIN), options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, barkskinMitigation(this.selectedCombatant)),
      });
    }
  }

  description(): React.ReactNode {
    return (
      <>
        <p>
          <strong>
            <SpellLink spell={SPELLS.BARKSKIN} />
          </strong>{' '}
          provides a modest damage reduction on a short cooldown. With{' '}
          <SpellLink spell={TALENTS_DRUID.VERDANT_HEART_TALENT} />, it also increases all incoming
          healing by 20%.
        </p>
        <p>
          With its brief cooldown and long duration, you can use it pretty freely. Cover time of
          moderate danger, like on pull or before a routine tankbuster.
        </p>
      </>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
