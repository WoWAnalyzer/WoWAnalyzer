import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import { BuffBasedMajorDefensive } from './core';
import Events, { DamageEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { Trans } from '@lingui/macro';
import { ReactNode } from 'react';
import StatTracker from 'parser/shared/modules/StatTracker';
import { getArmorMitigationForEvent } from 'parser/retail/armorMitigation';

export default class DemonSpikes extends BuffBasedMajorDefensive {
  static dependencies = {
    ...BuffBasedMajorDefensive.dependencies,
    statTracker: StatTracker,
  };

  constructor(options: Options & { statTracker: StatTracker }) {
    super({ triggerSpell: SPELLS.DEMON_SPIKES, appliedSpell: SPELLS.DEMON_SPIKES_BUFF }, options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    options.statTracker.add(SPELLS.DEMON_SPIKES_BUFF.id, {
      armor: () => this.bonusArmorGain(options.statTracker),
    });
  }

  private bonusArmorGain(statTracker: StatTracker) {
    return (75 * statTracker.currentAgilityRating) / 100;
  }

  private recordDamage(event: DamageEvent) {
    if (
      !this.defensiveActive ||
      event.sourceIsFriendly ||
      event.ability.type !== MAGIC_SCHOOLS.ids.PHYSICAL
    ) {
      return;
    }
    this.recordMitigation({
      event,
      mitigatedAmount: getArmorMitigationForEvent(event, this.owner.fight)?.amount ?? 0,
    });
  }

  description(): ReactNode {
    return (
      <p>
        <Trans id="guide.demonhunter.vengeance.sections.defensives.demonSpikes.explanation.summary">
          <SpellLink id={SPELLS.DEMON_SPIKES} /> nearly <strong>doubles</strong> the amount of armor
          that you have and is critical to have up while actively tanking melee hits.
        </Trans>
      </p>
    );
  }
}
