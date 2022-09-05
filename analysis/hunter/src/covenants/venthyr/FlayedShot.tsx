import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import SPECS from 'game/SPECS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, DamageEvent, RefreshBuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import {
  binomialCDF,
  expectedProcCount,
  plotOneVariableBinomChart,
} from 'parser/shared/modules/helpers/Probability';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import {
  EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE,
  FLAYED_SHOT_RESET_CHANCE,
} from '../../constants';

class FlayedShot extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  damage = 0;
  damageTicks = 0;
  totalProcs = 0;
  resets = 0;
  offCDProcs = 0;
  activeKillShotSpell =
    this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER
      ? SPELLS.KILL_SHOT_SV
      : SPELLS.KILL_SHOT_MM_BM;
  resetChance =
    FLAYED_SHOT_RESET_CHANCE +
    (this.selectedCombatant.hasConduitBySpellID(SPELLS.EMPOWERED_RELEASE_CONDUIT.id)
      ? EMPOWERED_RELEASE_INCREASED_FLAYED_PROC_CHANCE
      : 0);

  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasCovenant(COVENANTS.VENTHYR.id);

    if (!this.active) {
      return;
    }

    (options.abilities as Abilities).add({
      spell: SPELLS.FLAYED_SHOT.id,
      category: SPELL_CATEGORY.ROTATIONAL,
      cooldown: 30,
      gcd: {
        base: 1500,
      },
      castEfficiency: {
        suggestion: true,
        recommendedEfficiency: 0.9,
      },
    });

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FLAYED_SHOT),
      this.onDamage,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK),
      this.onProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLAYERS_MARK),
      this.onProc,
    );
  }

  get expectedProcs() {
    return expectedProcCount(this.resetChance, this.damageTicks);
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.damageTicks += 1;
  }

  onProc(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.totalProcs += 1;
    if (this.spellUsable.isOnCooldown(this.activeKillShotSpell.id)) {
      this.spellUsable.endCooldown(this.activeKillShotSpell.id, event.timestamp);
      this.resets += 1;
    } else {
      this.offCDProcs += 1;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            You had {this.offCDProcs} {this.offCDProcs === 1 ? `proc` : `procs`} with Kill Shot
            already off cooldown. <br />
            You had {formatPercentage(this.totalProcs / this.expectedProcs, 1)}% procs of what you
            could expect to get over the encounter. <br />
            You had a total of {this.totalProcs} procs, and your expected amount of procs was{' '}
            {formatNumber(this.expectedProcs)}. <br />
            <ul>
              <li>
                You have a ≈
                {formatPercentage(binomialCDF(this.totalProcs, this.damageTicks, this.resetChance))}
                % chance of getting this amount of procs or fewer in the future with this amount of
                auto attacks.
              </li>
            </ul>
          </>
        }
        dropdown={
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.totalProcs, this.damageTicks, this.resetChance)}
              <p>
                Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given
                your number of <SpellLink id={SPELLS.FLAYED_SHOT.id} /> ticks.
              </p>
            </div>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FLAYED_SHOT.id}>
          <>
            {this.resets} / {this.totalProcs} <small>Kill Shot resets</small>
            <br />
            {formatPercentage(this.resets / this.totalProcs)}% <small>effective procs</small>
            <br />
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlayedShot;
