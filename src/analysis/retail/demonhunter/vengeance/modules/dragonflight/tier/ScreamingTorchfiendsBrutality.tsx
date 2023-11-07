import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import React from 'react';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';
import { DEMON_HUNTER_T31_ID } from 'common/ITEMS/dragonflight';
import { formatPercentage } from 'common/format';
import SpellLink from 'interface/SpellLink';

export class ScreamingTorchfiendsBrutality extends Analyzer {
  private damage = 0;
  private procs = 0;
  private ticks = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T31);
    this.addEventListener(
      Events.damage.spell(SPELLS.SIGIL_OF_FLAME_DEBUFF).by(SELECTED_PLAYER),
      this.onSigilOfFlameTick,
    );
    this.addEventListener(
      Events.damage.spell(SPELLS.SIGIL_OF_FLAME_T31_PROC).by(SELECTED_PLAYER),
      this.onSigilOfFlameProc,
    );
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
          setId={DEMON_HUNTER_T31_ID}
          title="Screaming Torchfiend's Brutality"
        >
          <div>
            {formatPercentage(this.procs / this.ticks)}% <small>proc rate</small>
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

  private onSigilOfFlameProc(event: DamageEvent) {
    this.procs += 1;
    this.damage += event.amount;
  }
}
