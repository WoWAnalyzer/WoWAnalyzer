import MajorCooldown from 'parser/core/MajorCooldowns/MajorCooldown';
import { SpellUse } from 'parser/core/SpellUsage/core';
import React from 'react';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/rogue';
import Events, { CastEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import SepsisDescription from './SepsisDescription';
import ExplainPerformance from './ExplainPerformance';
import SepsisCast from './interfaces/SepsisCast';
import getShivOverlapForSepsisCast from './getShivOverlapForSepsisCast';
import onSepsisCast from './onSepsisCast';

export const SHIV_DURATION = 8 * 1000;
export const BASE_ROGUE_GCD = 1000;
export const PRIMARY_BUFF_KEY = 1;
export const SECONDARY_BUFF_KEY = 2;

export default class Sepsis extends MajorCooldown<SepsisCast> {
  static dependencies = {
    ...MajorCooldown.dependencies,
    enemies: Enemies,
  };
  protected enemies!: Enemies;
  overallSepsisCasts: SepsisCast[] = [];
  usingLightweightShiv: boolean = this.selectedCombatant.hasTalent(TALENTS.LIGHTWEIGHT_SHIV_TALENT);

  constructor(options: Options) {
    super({ spell: TALENTS.SEPSIS_TALENT }, options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SEPSIS_TALENT),
      this.onSepsisCast,
    );
    this.addEventListener(Events.fightend, this.onEnd);
  }

  description(): React.ReactNode {
    return <SepsisDescription usingLightweightShiv={this.usingLightweightShiv} />;
  }

  explainPerformance(sepsisCast: SepsisCast): SpellUse {
    return ExplainPerformance({
      sepsisCast,
      usingLightweightShiv: this.usingLightweightShiv,
      owner: this.owner,
    });
  }

  private onEnd() {
    this.overallSepsisCasts.forEach((sepsisCast) => {
      const shivData = getShivOverlapForSepsisCast({
        cast: sepsisCast,
        owner: this.owner,
        enemies: this.enemies,
      });
      this.recordCooldown({
        ...sepsisCast,
        shivData,
      });
    });
  }

  private onSepsisCast(castEvent: CastEvent) {
    onSepsisCast(castEvent, this.overallSepsisCasts);
  }
}
