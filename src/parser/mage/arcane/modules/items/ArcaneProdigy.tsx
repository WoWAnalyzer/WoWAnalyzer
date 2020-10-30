import React from 'react';
import SPELLS from 'common/SPELLS';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import UptimeIcon from 'interface/icons/Uptime';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const COOLDOWN_REDUCTION_MS = [0, 200, 200, 200, 200, 200, 200, 200, 300, 300, 300, 300, 300, 300, 300, 400];

class ArcaneProdigy extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  }
  protected spellUsable!: SpellUsable;

  conduitRank = 0;
  cooldownReduction = 0;
  wastedReduction = 0;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasConduitBySpellID(SPELLS.ARCANE_PRODIGY.id);
    if (!this.active) {
      return;
    }
    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.ARCANE_PRODIGY.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ARCANE_MISSILES), this.onMissilesCast);
  }

  onMissilesCast(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(SPELLS.ARCANE_POWER.id)) {
      this.cooldownReduction += this.spellUsable.reduceCooldown(SPELLS.ARCANE_POWER.id, COOLDOWN_REDUCTION_MS[this.conduitRank]);
    } else {
      this.wastedReduction += COOLDOWN_REDUCTION_MS[this.conduitRank];
    }
  }

  get reductionSeconds() {
    return this.cooldownReduction / 1000;
  }

  get wastedReductionSeconds() {
    return this.wastedReduction / 1000;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={<>You reduced the cooldown on Arcane Power by a total of {this.reductionSeconds}s. Additionally, by casting Arcane Missiles while Arcane Power was not on cooldown, you wasted {this.wastedReductionSeconds}s that could have reduced the cooldown on Arcane Power further. </>}
      >
        <BoringSpellValueText spell={SPELLS.ARCANE_PRODIGY}>
          <UptimeIcon /> {this.reductionSeconds}s <small>Arcane Power CDR</small><br />
          {this.wastedReductionSeconds}s <small>Wasted CDR</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcaneProdigy;
