import React from 'react';

import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ApplyDebuffEvent, RemoveDebuffEvent } from 'parser/core/Events';
import EnemyInstances from 'parser/shared/modules/EnemyInstances';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import { WINTERS_CHILL_HARDCASTS } from '../../constants';

const debug = false;

class WintersChill extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  totalProcs = 0;

  hardcastHits = 0;
  missedHardcasts = 0;
  singleHardcasts = 0;

  iceLanceHits = 0;
  missedIceLanceCasts = 0;
  singleIceLanceCasts = 0;
  doubleIceLanceCasts = 0;

  constructor(options: any) {
    super(options);
    this.active = this.owner.build === undefined;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell([SPELLS.FROSTBOLT_DAMAGE,SPELLS.EBONBOLT_DAMAGE,SPELLS.GLACIAL_SPIKE_DAMAGE,SPELLS.ICE_LANCE_DAMAGE]), this.onDamage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL), this.onDebuffApplied);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL), this.onDebuffRemoved);
  }

  onDamage(event: DamageEvent) {
    const spell = event.ability;
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    if (spell.guid === SPELLS.ICE_LANCE_DAMAGE.id) {
      this.iceLanceHits += 1;
      debug && console.log("Ice Lance into Winter's Chill");
    } else if (WINTERS_CHILL_HARDCASTS.some(acceptable => acceptable.id === spell.guid)) {
      this.hardcastHits += 1;
      debug && console.log(`${event.ability.name} into Winter's Chill`);
    }
  }

  onDebuffApplied(event: ApplyDebuffEvent) {
    this.iceLanceHits = 0;
    this.hardcastHits = 0;
  }

  onDebuffRemoved(event: RemoveDebuffEvent) {
    this.totalProcs += 1;

    if (this.iceLanceHits === 0) {
      this.missedIceLanceCasts += 1;
    } else if (this.iceLanceHits === 1) {
      this.singleIceLanceCasts += 1;
    } else if (this.iceLanceHits === 2) {
      this.doubleIceLanceCasts += 1;
    } else {
      this.error(`Unexpected number of Ice Lances inside Winter's Chill -> ${this.iceLanceHits}`);
    }

    if (this.hardcastHits === 0) {
      this.missedHardcasts += 1;
    } else if (this.hardcastHits === 1) {
      this.singleHardcasts += 1;
    } else {
      this.error(`Unexpected number of Frostbolt hits inside Winter's Chill -> ${this.hardcastHits}`);
    }
  }

  get iceLanceMissedPercent() {
    return (this.missedIceLanceCasts / this.totalProcs) || 0;
  }

  get iceLanceUtil() {
    return 1 - this.iceLanceMissedPercent;
  }

  get hardcastMissedPercent() {
    return (this.missedHardcasts / this.totalProcs) || 0;
  }

  get hardcastUtil() {
    return 1 - this.hardcastMissedPercent;
  }

  get doubleIceLancePercentage() {
    return this.doubleIceLanceCasts / this.totalProcs || 0;
  }

  // less strict than the ice lance suggestion both because it's less important,
  // and also because using a Brain Freeze after being forced to move is a good excuse for missing the hardcast.
  get wintersChillHardCastThresholds() {
    return {
      actual: this.hardcastUtil,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  get wintersChillIceLanceThresholds() {
    return {
      actual: this.iceLanceUtil,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when: any) {
    when(this.wintersChillIceLanceThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You failed to Ice Lance into <SpellLink id={SPELLS.WINTERS_CHILL.id} /> {this.missedIceLanceCasts} times ({formatPercentage(this.iceLanceMissedPercent)}%). Make sure you cast <SpellLink id={SPELLS.ICE_LANCE.id} /> after each <SpellLink id={SPELLS.FLURRY.id} /> to benefit from <SpellLink id={SPELLS.SHATTER.id} />.</>)
          .icon(SPELLS.ICE_LANCE.icon)
          .actual(`${formatPercentage(this.iceLanceMissedPercent)}% Winter's Chill not shattered with Ice Lance`)
          .recommended(`<${formatPercentage(1 - this.wintersChillIceLanceThresholds.isLessThan.minor)}% is recommended`);
      });
    when(this.wintersChillHardCastThresholds)
      .addSuggestion((suggest: any, actual: any, recommended: any) => {
        return suggest(<>You failed to <SpellLink id={SPELLS.FROSTBOLT.id} />, <SpellLink id={SPELLS.GLACIAL_SPIKE_TALENT.id} /> or <SpellLink id={SPELLS.EBONBOLT_TALENT.id} /> into <SpellLink id={SPELLS.WINTERS_CHILL.id} /> {this.missedHardcasts} times ({formatPercentage(this.hardcastMissedPercent)}%). Make sure you hard cast just before each instant <SpellLink id={SPELLS.FLURRY.id} /> to benefit from <SpellLink id={SPELLS.SHATTER.id} />.</>)
        .icon(SPELLS.FROSTBOLT.icon)
        .actual(`${formatPercentage(this.hardcastMissedPercent)}% Winter's Chill not shattered with Frostbolt, Glacial Spike, or Ebonbolt`)
        .recommended(`${formatPercentage(1 - recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={(
          <>
            Every Brain Freeze Flurry should be preceded by a Frostbolt, Glacial Spike, or Ebonbolt and followed by an Ice Lance, so that both the preceding and following spells benefit from Shatter. <br /><br />

            You double Ice Lance'd into Winter's Chill {this.doubleIceLanceCasts} times ({formatPercentage(this.doubleIceLancePercentage, 1)}%). Note this is usually impossible, it can only be done with strong Haste buffs active and by moving towards the target while casting.
            It should mostly be considered 'extra credit'
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WINTERS_CHILL}>
          <SpellIcon id={SPELLS.ICE_LANCE.id} /> {formatPercentage(this.iceLanceUtil, 0)}% <small>Ice Lances shattered</small><br />
          <SpellIcon id={SPELLS.FROSTBOLT.id} /> {formatPercentage(this.hardcastUtil, 0)}% <small>Pre-casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WintersChill;
