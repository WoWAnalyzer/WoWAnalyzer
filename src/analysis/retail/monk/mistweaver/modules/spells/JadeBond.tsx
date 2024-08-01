import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { JADE_BOND_INC, JADE_BOND_SOOB_INC } from '../../constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TooltipElement } from 'interface';

const JADE_BOND_REDUCTION = 500;

class JadeBond extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  celestialCastCount: number = 0;
  cooldownReductionUsed: number = 0;
  cooldownReductionWasted: number = 0;
  healing: number = 0;
  spellToReduce: Spell = TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT;
  boostAmount: number = JADE_BOND_INC;
  protected spellUsable!: SpellUsable;

  /**
   * Whenever you cast a Gust of Mist procing ability it reduces the cooldown of Yu'lon or Chi-ji by .5 seconds as well as increasing their healing by x%
   */
  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS_MONK.JADE_BOND_TALENT)) {
      this.active = false;
      return;
    }
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT)) {
      this.boostAmount = JADE_BOND_SOOB_INC;
    }

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell([SPELLS.GUSTS_OF_MISTS, SPELLS.GUST_OF_MISTS_CHIJI]),
      this.gustProcingSpell,
    );

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT)) {
      this.spellToReduce = TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT;
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUST_OF_MISTS_CHIJI),
        this.normalizeBoost,
      );
    } else {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER_PET).spell(SPELLS.SOOTHING_BREATH),
        this.normalizeBoost,
      );
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.spellToReduce),
      this.onCelestialCast,
    );
  }

  gustProcingSpell(event: HealEvent) {
    if (this.spellUsable.isOnCooldown(this.spellToReduce.id)) {
      this.cooldownReductionUsed += this.spellUsable.reduceCooldown(
        this.spellToReduce.id,
        JADE_BOND_REDUCTION,
      );
    } else {
      this.cooldownReductionWasted += JADE_BOND_REDUCTION;
    }
  }

  onCelestialCast(event: CastEvent) {
    this.celestialCastCount += 1;
  }

  normalizeBoost(event: HealEvent) {
    this.healing += calculateEffectiveHealing(event, this.boostAmount);
  }

  get averageCDR() {
    return this.cooldownReductionUsed / this.celestialCastCount;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.UNIMPORTANT(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <TalentSpellText talent={TALENTS_MONK.JADE_BOND_TALENT}>
          <ItemHealingDone amount={this.healing} />
          <br />
          <TooltipElement
            content={
              <>
                Total effective cooldown reduction: {formatDuration(this.cooldownReductionUsed)}
                <br />
                Total wasted cooldown reduction: {formatDuration(this.cooldownReductionWasted)}
              </>
            }
          >
            <small>{formatDuration(this.averageCDR)} average effective CDR</small>
          </TooltipElement>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default JadeBond;
