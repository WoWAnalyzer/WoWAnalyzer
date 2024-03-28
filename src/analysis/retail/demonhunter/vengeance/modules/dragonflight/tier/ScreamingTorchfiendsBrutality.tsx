import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import React from 'react';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import { DEMON_HUNTER_DF3_ID } from 'common/ITEMS/dragonflight';
import { formatDurationMillisMinSec, formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Spell from 'common/SPELLS/Spell';
import { getSigilOfFlameSpell } from 'analysis/retail/demonhunter/shared';
import { CooldownIcon, StatisticsIcon } from 'interface/icons';

const FURY_PER_CD = 40;
const CDR_MS = 1000;

const deps = {
  spellUsable: SpellUsable,
};

export class ScreamingTorchfiendsBrutality extends Analyzer.withDependencies(deps) {
  private furySpentCounter = 0;
  private procs = 0;
  private spell: Spell;
  private ticks = 0;
  private totalCdr = 0;
  private effectiveCdr = 0;

  constructor(options: Options) {
    super(options);
    this.spell = getSigilOfFlameSpell(this.selectedCombatant);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.DF3);
    this.addEventListener(
      Events.damage.spell(SPELLS.SIGIL_OF_FLAME_DEBUFF).by(SELECTED_PLAYER),
      this.onSigilOfFlameTick,
    );
    this.addEventListener(
      Events.damage.spell(SPELLS.SIGIL_OF_FLAME_T31_PROC).by(SELECTED_PLAYER),
      this.onSigilOfFlameProc,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
  }

  statistic(): React.ReactNode {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            <div>
              {this.ticks} <SpellLink spell={SPELLS.SIGIL_OF_FLAME_DEBUFF} /> ticks
            </div>
            <div>
              {this.procs} <SpellLink spell={SPELLS.SIGIL_OF_FLAME_T31_PROC} /> procs
            </div>
          </>
        }
      >
        <BoringItemSetValueText
          setId={DEMON_HUNTER_DF3_ID}
          title="Screaming Torchfiend's Brutality"
        >
          <div>
            <StatisticsIcon /> {formatPercentage(this.procs / this.ticks)}% <small>proc rate</small>
          </div>
          <div>
            <CooldownIcon /> {formatDurationMillisMinSec(this.effectiveCdr)}{' '}
            <small>effective CDR</small>
            <br />
            <CooldownIcon /> {formatDurationMillisMinSec(this.totalCdr - this.effectiveCdr)}{' '}
            <small>wasted CDR</small>
          </div>
        </BoringItemSetValueText>
      </Statistic>
    );
  }

  private onSigilOfFlameTick(event: DamageEvent) {
    if (!event.tick) {
      return;
    }
    this.ticks += 1;
  }

  private onSigilOfFlameProc() {
    this.procs += 1;
  }

  private onCast(event: CastEvent) {
    const furyCost = getResourceSpent(event, RESOURCE_TYPES.FURY);
    if (furyCost <= 0) {
      return;
    }
    this.furySpentCounter += furyCost;
    if (this.furySpentCounter < FURY_PER_CD) {
      return;
    }
    this.furySpentCounter = Math.max(0, this.furySpentCounter - FURY_PER_CD);
    this.effectiveCdr += this.deps.spellUsable.reduceCooldown(this.spell.id, CDR_MS);
    this.totalCdr += CDR_MS;
  }
}
