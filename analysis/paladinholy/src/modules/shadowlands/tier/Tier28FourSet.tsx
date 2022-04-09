import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent, CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import HealingDone from 'parser/shared/modules/throughput/HealingDone';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const CDR = 1000;

class Tier28FourSet extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    healingDone: HealingDone,
  };
  cooldownReductionUsed: number = 0;
  cooldownReductionWasted: number = 0;
  WingsCasts: number = 0;
  spellToReduce: Spell = SPELLS.AVENGING_WRATH;
  healingBoost: number = 0;
  healing: number = 0;
  conduitRank: number = 0;
  protected spellUsable!: SpellUsable;
  protected healingDone!: HealingDone;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.spell(SPELLS.LIGHT_OF_DAWN_HEAL).by(SELECTED_PLAYER),
      this.LODheal,
    );

    this.addEventListener(
      Events.cast.spell(this.spellToReduce).by(SELECTED_PLAYER),
      this.WingsCast,
    );

    if (this.selectedCombatant.hasTalent(SPELLS.AVENGING_CRUSADER_TALENT.id)) {
      this.spellToReduce = SPELLS.AVENGING_CRUSADER_TALENT;
    }
  }

  LODheal(event: HealEvent) {
    if (this.spellUsable.isOnCooldown(this.spellToReduce.id)) {
      this.cooldownReductionUsed += this.spellUsable.reduceCooldown(this.spellToReduce.id, CDR);
    } else {
      this.cooldownReductionWasted += CDR;
    }
  }

  WingsCast(event: CastEvent) {
    this.WingsCasts += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Effective Cooldown Reduction: {formatNumber(this.cooldownReductionUsed / 1000)} Seconds
            <br />
            Wasted Cooldown Reduction: {formatNumber(this.cooldownReductionWasted / 1000)} Seconds
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.DAWN_WILL_COME_4PC.id}>
          <>
            Estimated Average <SpellLink id={this.spellToReduce.id} /> Cooldown:{' '}
            {formatNumber((120000 - this.cooldownReductionUsed / (this.WingsCasts + 1)) / 1000)}{' '}
            Seconds
          </>
          <br />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tier28FourSet;
