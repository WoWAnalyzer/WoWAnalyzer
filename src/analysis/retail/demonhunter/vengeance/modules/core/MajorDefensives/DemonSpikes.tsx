import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import Events, { DamageEvent } from 'parser/core/Events';
import MAGIC_SCHOOLS from 'game/MAGIC_SCHOOLS';
import { SpellLink } from 'interface';
import { ReactNode } from 'react';
import StatTracker from 'parser/shared/modules/StatTracker';
import { getArmorMitigationForEvent } from 'parser/retail/armorMitigation';
import {
  buff,
  MajorDefensiveBuff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { EXTENDED_SPIKES_SCALING } from 'analysis/retail/demonhunter/vengeance/constants';
import TALENTS from 'common/TALENTS/demonhunter';

const BASE_DURATION = 6000;

export default class DemonSpikes extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    statTracker: StatTracker,
  };

  private spikesDurationPerCast = BASE_DURATION;
  private maximumUptime = 0;

  constructor(options: Options & { statTracker: StatTracker }) {
    super(SPELLS.DEMON_SPIKES, buff(SPELLS.DEMON_SPIKES_BUFF), options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.DEMON_SPIKES),
      this.onDemonSpikesCast,
    );
    this.spikesDurationPerCast =
      BASE_DURATION +
      EXTENDED_SPIKES_SCALING[
        this.selectedCombatant.getTalentRank(TALENTS.EXTENDED_SPIKES_TALENT)
      ] *
        1000;
    options.statTracker.add(SPELLS.DEMON_SPIKES_BUFF.id, {
      armor: () => this.bonusArmorGain(options.statTracker),
    });
  }
  get uptimeInMilliseconds() {
    return this.selectedCombatant.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);
  }

  get maximumUptimeInMilliseconds() {
    return this.maximumUptime;
  }

  get wastedUptimeInMilliseconds() {
    return this.maximumUptimeInMilliseconds - this.uptimeInMilliseconds;
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={SPELLS.DEMON_SPIKES} /> nearly <strong>doubles</strong> the amount of
        armor that you have and is critical to have up while actively tanking melee hits.
      </p>
    );
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />;
  }

  private bonusArmorGain(statTracker: StatTracker) {
    return (75 * statTracker.currentAgilityRating) / 100;
  }

  private recordDamage(event: DamageEvent) {
    if (
      !this.defensiveActive(event) ||
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

  private onDemonSpikesCast() {
    this.maximumUptime += this.spikesDurationPerCast;
  }
}
