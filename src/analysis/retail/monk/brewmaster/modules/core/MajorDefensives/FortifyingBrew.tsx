import { formatDurationMinSec } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import MAGIC_SCHOOLS, { color } from 'game/MAGIC_SCHOOLS';
import { SpellLink, TooltipElement } from 'interface';
import {
  absoluteMitigation,
  buff,
  MajorDefensiveBuff,
  Mitigation,
} from 'interface/guide/components/MajorDefensives/MajorDefensiveAnalyzer';
import { MitigationSegment } from 'interface/guide/components/MajorDefensives/MitigationSegments';
import MajorDefensiveStatistic from 'interface/MajorDefensiveStatistic';
import { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, EventType, HasAbility } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { ReactNode } from 'react';
import CountsAsBrew, { brewCooldownDisplay } from '../../components/CountsAsBrew';

const FORT_BREW_BASE_DR = 0.2;
const FORT_BREW_IRONSHELL_AMOUNT = 0.3;

export class FortifyingBrew extends MajorDefensiveBuff {
  private fortBrewStaggerPool = 0;
  private hasIronshell = false;
  private hasGaiPlins = false;

  private drAmount = FORT_BREW_BASE_DR;

  constructor(options: Options) {
    super(SPELLS.FORTIFYING_BREW_CAST, buff(SPELLS.FORTIFYING_BREW_BUFF), options);

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.recordDamage);

    if (this.selectedCombatant.hasTalent(talents.IRONSHELL_BREW_TALENT)) {
      this.hasIronshell = true;
      this.drAmount = FORT_BREW_IRONSHELL_AMOUNT;
    }
  }

  private recordDamage(event: DamageEvent) {
    if (this.defensiveActive(event) && !event.sourceIsFriendly) {
      this.recordMitigation({
        event,
        mitigatedAmount: absoluteMitigation(event, this.drAmount),
      });
    }
  }

  description(): ReactNode {
    return (
      <>
        <p>
          <SpellLink spell={talents.FORTIFYING_BREW_TALENT} /> is a flexible cooldown that combines
          with several talents for boosting its defensive power or reducing its cooldown.{' '}
          <CountsAsBrew
            baseCooldown={60 * 6}
            cdTooltip={
              <>
                Reduced to {formatDurationMinSec(brewCooldownDisplay(4 * 60))} with{' '}
                <SpellLink spell={talents.EXPEDITIOUS_FORTIFICATION_TALENT} />.
              </>
            }
          />
        </p>
        <p>
          Due to its variable cooldown, it is difficult to plan usage in advance&mdash;making it a
          good choice for{' '}
          <TooltipElement
            content={
              <>
                A cooldown use is <strong>reactive</strong> if you are <em>reacting</em> to the
                damage in the moment, not pre-planning your use before the fight.
              </>
            }
          >
            reactive
          </TooltipElement>{' '}
          use if your other cooldowns can cover major damage events.
        </p>
      </>
    );
  }

  mitigationSegments(mit: Mitigation): MitigationSegment[] {
    const damage = mit.mitigated
      .filter((event) => event.event.type === EventType.Damage)
      .map((event) => event.mitigatedAmount)
      .reduce((a, b) => a + b, 0);

    const purifyBase = mit.mitigated
      .filter((event) => false) // TODO: fb: det
      .map((event) => event.mitigatedAmount)
      .reduce((a, b) => a + b, 0);

    let purify = purifyBase;
    let gaiPlins = 0;
    if (this.hasGaiPlins) {
      purify = purifyBase / 1.25;
      gaiPlins = purifyBase - purify;
    }

    let baseDamage = damage;
    let ironshellDamage = 0;

    if (this.hasIronshell) {
      baseDamage = (damage * FORT_BREW_BASE_DR) / FORT_BREW_IRONSHELL_AMOUNT;
      ironshellDamage = damage * (1 - FORT_BREW_BASE_DR / FORT_BREW_IRONSHELL_AMOUNT);
    }

    return [
      {
        amount: baseDamage,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        description: (
          <>
            Base <SpellLink spell={talents.FORTIFYING_BREW_TALENT} />
          </>
        ),
      },
      {
        amount: ironshellDamage,
        color: color(MAGIC_SCHOOLS.ids.PHYSICAL),
        description: <SpellLink spell={talents.IRONSHELL_BREW_TALENT} />,
      },
      {
        amount: purify,
        color: 'rgb(112, 181, 112)',
        description: <SpellLink spell={talents.FORTIFYING_BREW_DETERMINATION_TALENT} />,
      },
      {
        amount: gaiPlins,
        color: color(MAGIC_SCHOOLS.ids.HOLY),
        description: <SpellLink spell={talents.GAI_PLINS_IMPERIAL_BREW_TALENT} />,
      },
    ].filter((seg) => seg.amount > 0);
  }

  statistic(): ReactNode {
    return <MajorDefensiveStatistic analyzer={this} category={STATISTIC_CATEGORY.TALENTS} />;
  }
}
