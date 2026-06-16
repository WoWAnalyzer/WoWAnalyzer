import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import { calculateEffectiveHealing, calculateOverhealing } from 'parser/core/EventCalculateLib';
import Combatants from 'parser/shared/modules/Combatants';
import SPELLS from 'common/SPELLS/shaman';
import TALENTS from 'common/TALENTS/shaman';
// UI
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

import { Trans } from '@lingui/react/macro';
import { formatNumber } from 'common/format';

import { healingIncreases } from 'analysis/retail/shaman/restoration/constants';

export default class Earthsurge extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  protected combatants!: Combatants;

  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.EARTHSURGE_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return;
    }

    if (
      target.hasBuff(
        SPELLS.EARTHLIVING_WEAPON_HEAL.id,
        event.timestamp,
        0,
        0,
        this.selectedCombatant.id,
      )
    ) {
      this.healingDoneFromTalent += calculateEffectiveHealing(
        event,
        healingIncreases.EARTHSURGE_HEALING_INCREASE,
      );
      this.overhealingDoneFromTalent += calculateOverhealing(
        event,
        healingIncreases.EARTHSURGE_HEALING_INCREASE,
      );
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <Trans id="shaman.restoration.earthsurge.tooltip">
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
          </Trans>
        }
      >
        <TalentSpellText talent={TALENTS.EARTHSURGE_TALENT}>
          <ItemHealingDone amount={this.healingDoneFromTalent} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
