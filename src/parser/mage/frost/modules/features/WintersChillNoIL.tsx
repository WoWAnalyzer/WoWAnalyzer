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

class WintersChillNoIL extends Analyzer {
  static dependencies = {
    enemies: EnemyInstances,
  };
  protected enemies!: EnemyInstances;

  totalProcs = 0;
  hardcastHits = 0;
  missedHardcasts = 0;
  singleHardcasts = 0;

  constructor(options: any) {
    super(options);
    this.active = !!this.owner.builds.NO_IL.active;

    if (!this.active) {
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL), this.onWintersChillApplied);
    this.addEventListener(Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL), this.onWintersChillRemoved);
  }

  onDamage(event: DamageEvent) {
    const spell = event.ability;
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }

    if(WINTERS_CHILL_HARDCASTS.some(acceptable => acceptable.id === spell.guid)) {
      this.hardcastHits += 1;
      debug && console.log(`${event.ability.name} into Winter's Chill`);
    }
  }

  onWintersChillApplied(event: ApplyDebuffEvent) {
    this.hardcastHits = 0;
	}

  onWintersChillRemoved(event: RemoveDebuffEvent) {
    this.totalProcs += 1;

    if (this.hardcastHits === 0) {
      this.missedHardcasts += 1;
    } else if (this.hardcastHits === 1) {
      this.singleHardcasts += 1;
    } else {
      this.error(`Unexpected number of Frostbolt hits inside Winter's Chill -> ${this.hardcastHits}`);
    }
  }

  get hardcastMissedPercent() {
    return (this.missedHardcasts / this.totalProcs) || 0;
  }

  get hardcastUtil() {
    return 1 - this.hardcastMissedPercent;
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

  suggestions(when: any) {
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
            Every Brain Freeze Flurry should be preceded by a Frostbolt, Glacial Spike, or Ebonbolt, so that the spell hits the target during Winter's Chll and benefits from Shatter.
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.WINTERS_CHILL}>
          <SpellIcon id={SPELLS.FROSTBOLT.id} /> {formatPercentage(this.hardcastUtil, 0)}% <small>Pre-casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WintersChillNoIL;
