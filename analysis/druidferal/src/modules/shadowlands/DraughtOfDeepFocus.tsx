import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import Events, { ApplyDebuffEvent, DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

const BUFFED_DOTS = [SPELLS.RIP, SPELLS.RAKE_BLEED, SPELLS.MOONFIRE_FERAL]; // TODO also caster moonfire?

const DDF_BOOST = 0.4;

/**
 * **Draught of Deep Focus**
 * Runecarving Legendary
 *
 * When Moonfire, Rake, Rip, or Rejuvenation are active on a single target,
 * their effects are increased 40%.
 */
class DraughtOfDeepFocus extends Analyzer {
  /** A tracker for each DoT boosted by DDF, indexed by spellId */
  ddfDotsOnById: { [key: number]: DdfDot } = {};

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(
      SPELLS.DRAUGHT_OF_DEEP_FOCUS.bonusID,
    );

    // init trackers
    BUFFED_DOTS.forEach((dotSpell) => {
      this.ddfDotsOnById[dotSpell.id] = {
        spell: dotSpell,
        targetsOn: 0,
        buffedAmount: 0,
        buffedTicks: 0,
        totalTicks: 0,
      };
    });

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(BUFFED_DOTS),
      this.onDdfDotApply,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(BUFFED_DOTS),
      this.onDdfDotRemove,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(BUFFED_DOTS),
      this.onDdfDotDamage,
    );
  }

  onDdfDotApply(event: ApplyDebuffEvent) {
    this.ddfDotsOnById[event.ability.guid].targetsOn += 1;
  }

  onDdfDotRemove(event: RemoveDebuffEvent) {
    this.ddfDotsOnById[event.ability.guid].targetsOn -= 1;
  }

  onDdfDotDamage(event: DamageEvent) {
    const dot: DdfDot = this.ddfDotsOnById[event.ability.guid];

    if (dot.targetsOn === 1) {
      dot.buffedAmount += calculateEffectiveDamage(event, DDF_BOOST);
      dot.buffedTicks += 1;
    }
    dot.totalTicks += 1;
  }

  get totalDamage() {
    return Object.values(this.ddfDotsOnById).reduce(
      (acc, tracker) => acc + tracker.buffedAmount,
      0,
    );
  }

  getPercentTicksBuffed(dot: DdfDot) {
    return dot.totalTicks === 0 ? 0 : dot.buffedTicks / dot.totalTicks;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            This number is the damage caused due to Draught of Deep Focus boost.
            <ul>
              {Object.values(this.ddfDotsOnById)
                .filter(
                  (dot) =>
                    this.selectedCombatant.hasTalent(SPELLS.LUNAR_INSPIRATION_TALENT.id) ||
                    dot.spell.id !== SPELLS.MOONFIRE_FERAL.id,
                )
                .map((dot) => (
                  <li key={dot.spell.id}>
                    <SpellIcon id={dot.spell.id} />
                    {dot.spell.name}:{' '}
                    <strong>{this.owner.formatItemDamageDone(dot.buffedAmount)}</strong> -{' '}
                    {formatPercentage(this.getPercentTicksBuffed(dot), 0)}% ticks buffed
                  </li>
                ))}
            </ul>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.DRAUGHT_OF_DEEP_FOCUS.id}>
          <ItemPercentDamageDone amount={this.totalDamage} />
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

/** a record of a DoT's damage with respect to DDF */
interface DdfDot {
  /** The DoT's spell */
  spell: Spell;
  /** The number of targets currently afflicted with this DoT */
  targetsOn: number;
  /** the amount of damage attributable to DDF's buff */
  buffedAmount: number;
  /** the number of ticks that benefitted from the buff */
  buffedTicks: number;
  /** the total number of ticks */
  totalTicks: number;
}

export default DraughtOfDeepFocus;
