import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/paladin';
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
//import { EXTENDED_SPIKES_SCALING } from 'analysis/retail/demonhunter/vengeance/constants';
//import TALENTS from 'common/TALENTS/paladin';
import Statistic from 'parser/ui/Statistic';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { UptimeIcon } from 'interface/icons';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';

const BASE_DURATION = 12000;

export default class ConsecrationDefensives extends MajorDefensiveBuff {
  static dependencies = {
    ...MajorDefensiveBuff.dependencies,
    statTracker: StatTracker,
  };

  private sotrDurationPerCast = BASE_DURATION;
  private maximumUptime = 0;

  constructor(options: Options & { statTracker: StatTracker }) {
    super(SPELLS.CONSECRATION_CAST, buff(SPELLS.CONSECRATION_BUFF), options);
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.CONSECRATION_CAST),
      this.onSotrCast,
    );
    options.statTracker.add(SPELLS.CONSECRATION_BUFF.id, {
      armor: () => this.bonusArmorGain(options.statTracker),
    });
  }
  get uptimeInMilliseconds() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CONSECRATION_BUFF.id);
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
        <SpellLink spell={SPELLS.CONSECRATION_BUFF} /> nearly <strong>doubles</strong> the amount of
        armor that you have and is critical to have up while actively tanking melee hits.
      </p>
    );
  }

  statistic(): ReactNode {
    return (
      <>
        <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.GENERAL} />
        <Statistic
          category={STATISTIC_CATEGORY.GENERAL}
          size="flexible"
          tooltip={<>drgsdfgsdfghsdfgdfgsdfdfgssdfg</>}
        >
          <BoringSpellValueText spell={SPELLS.CONSECRATION_BUFF}>
            <UptimeIcon /> {formatDurationMillisMinSec(this.wastedUptimeInMilliseconds)}s wasted{' '}
            <small>
              (
              {formatPercentage(this.wastedUptimeInMilliseconds / this.maximumUptimeInMilliseconds)}
              % of total uptime)
            </small>
          </BoringSpellValueText>
        </Statistic>
      </>
    );
  }

  private bonusArmorGain(statTracker: StatTracker) {
    return (75 * statTracker.currentStrengthRating) / 100;
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

  private onSotrCast() {
    this.maximumUptime += this.sotrDurationPerCast;
  }
}
