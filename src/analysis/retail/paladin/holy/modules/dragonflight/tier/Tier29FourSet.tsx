import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import TALENTS from 'common/TALENTS/paladin';
import SpellIcon from 'interface/SpellIcon';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringValueText from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const CDR = 1000;

// https://www.wowhead.com/news/paladin-season-1-dragonflight-tier-set-bonuses-guide-writer-first-impressions-329300

//https://www.wowhead.com/beta/spell=393672/paladin-holy-class-set-4pc
// Paladin Holy Class Set 4pc
// Requires Paladin
// Holy Light, Flash of Light, Light of Dawn, Word of Glory, and Bestow Faith healing is increased by 6% and their critical effects
// increase the damage or healing of your next Holy Shock by 20%.

class Tier29FourSet extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };
  cooldownReductionUsed: number = 0;
  cooldownReductionWasted: number = 0;
  // WingsCasts: number = 0;
  spellToReduce: Spell = SPELLS.AVENGING_WRATH;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4Piece();
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.heal.spell(SPELLS.LIGHT_OF_DAWN_HEAL).by(SELECTED_PLAYER),
      this.lodHeal,
    );

    // this.addEventListener(
    //   Events.cast.spell(this.spellToReduce).by(SELECTED_PLAYER),
    //   this.wingsCast,
    // );

    if (this.selectedCombatant.hasTalent(TALENTS.AVENGING_CRUSADER_TALENT.id)) {
      this.spellToReduce = TALENTS.AVENGING_CRUSADER_TALENT;
    }
  }

  lodHeal(event: HealEvent) {
    if (this.spellUsable.isOnCooldown(this.spellToReduce.id)) {
      this.spellUsable.reduceCooldown(this.spellToReduce.id, CDR);
      this.cooldownReductionUsed += CDR;
    } else {
      this.cooldownReductionWasted += CDR;
    }
  }

  // wingsCast(event: CastEvent) {
  //   if (this.spellUsable.isOnCooldown(this.spellToReduce.id)) {
  //     this.spellUsable.endCooldown(this.spellToReduce.id);
  //     this.spellUsable.beginCooldown(event, this.spellToReduce.id);
  //   }
  //   this.WingsCasts += 1;
  // }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            Effective Cooldown Reduction: {formatDuration(this.cooldownReductionUsed)}
            <br />
            Wasted Cooldown Reduction: {formatDuration(this.cooldownReductionWasted)}
          </>
        }
      >
        <BoringValueText
          label={
            <>
              <SpellIcon id={SPELLS.DAWN_WILL_COME_4PC.id} /> Average CDR of{' '}
              <SpellLink id={SPELLS.AVENGING_WRATH.id} />
            </>
          }
        >
          {/* <>{formatDuration(this.cooldownReductionUsed / (this.WingsCasts + 1))}</> */}
        </BoringValueText>
      </Statistic>
    );
  }
}

export default Tier29FourSet;
