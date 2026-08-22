/** Earth Elemental
 * Calls forth a Greater Earth Elemental to protect you and your allies, generating high threat and taunting enemies periodically for 30 sec.
 *
 * Primordial Bond
 * Your Earth Elemental no longer taunts nearby enemies or generates threat and instead increases your maximum health by 15% while active.
 *
 * Disclaimer: This does not respect if Ancestral Virgo (or any other) effect is buffing max. HP as well!
 */
import { Trans } from '@lingui/react/macro';
import { formatDuration, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import { SpellLink, Icon } from 'interface';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { abilityToSpell } from 'common/abilityToSpell';
import {
  MajorDefensiveBuff,
  buff,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import type { ReactNode } from 'react';

const PRIMORDIAL_BOND_MAX_HEALTH_INCREASE = 0.15;
const HP_THRESHOLD = 1 - 1 / (1 + PRIMORDIAL_BOND_MAX_HEALTH_INCREASE);

class EarthElemental extends MajorDefensiveBuff {
  lifeSavingEvents: DamageEvent[] = [];

  constructor(options: Options) {
    super(TALENTS.PRIMORDIAL_BOND_TALENT, buff(SPELLS.PRIMORDIAL_BOND_BUFF), options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PRIMORDIAL_BOND_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamageTaken);
  }

  private onDamageTaken(event: DamageEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_BOND_BUFF.id, event.timestamp, 100, 50)) {
      return;
    }

    const hitPoints = event.hitPoints ?? NaN;
    const maxHitPoints = event.maxHitPoints ?? NaN;
    if (!Number.isFinite(hitPoints) || !Number.isFinite(maxHitPoints) || hitPoints <= 0) {
      return;
    }

    const currentHealthRatio = hitPoints / maxHitPoints;
    if (currentHealthRatio > HP_THRESHOLD) {
      return;
    }

    this.lifeSavingEvents.push(event);
  }

  description(): ReactNode {
    return (
      <p>
        <SpellLink spell={TALENTS.PRIMORDIAL_BOND_TALENT} /> increases your maximum health by 15%
        while active.
      </p>
    );
  }

  statistic() {
    const tooltip = (
      <Trans id="shaman.shared.primordialBond.statistic.tooltip.active">
        The amount of times you would have died without your max health increase from{' '}
        <SpellLink spell={TALENTS.PRIMORDIAL_BOND_TALENT} />.
      </Trans>
    );

    return (
      <Statistic
        tooltip={tooltip}
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(60)}
        size="flexible"
        wide={true}
      >
        <TalentSpellText talent={TALENTS.PRIMORDIAL_BOND_TALENT}>
          <>Deaths prevented: {this.lifeSavingEvents.length}</>
        </TalentSpellText>
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>
                <Trans id="common.time">Time</Trans>
              </th>
              <th style={{ textAlign: 'center' }}>
                <Trans id="common.ability">Ability</Trans>
              </th>
              <th>
                <Trans id="common.health">Health</Trans>
              </th>
            </tr>
          </thead>
          <tbody>
            {this.lifeSavingEvents.map((event, index) => (
              <tr key={index}>
                <th scope="row">
                  {formatDuration(event.timestamp - this.owner.fight.start_time, 0)}
                </th>
                <td style={{ textAlign: 'center' }}>
                  <SpellLink spell={abilityToSpell(event.ability)} icon={false}>
                    <Icon icon={event.ability.abilityIcon} />
                  </SpellLink>
                </td>
                <td>{formatPercentage((event.hitPoints || NaN) / (event.maxHitPoints || NaN))}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default EarthElemental;
