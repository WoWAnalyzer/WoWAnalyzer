import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/hunter';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Spell from 'common/SPELLS/Spell';

class Deathblow extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private activeKillShotSpell!: Spell;
  private deathblowProcs = 0;
  private wastedProcs = 0;

  constructor(options: Options) {
    super(options);
    const activeKillShotSpell = this.killShotSpell();

    this.active = activeKillShotSpell !== null;
    if (!this.active) {
      return;
    }
    this.activeKillShotSpell = activeKillShotSpell!;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHBLOW_BUFF),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.DEATHBLOW_BUFF),
      this.onRefreshBuff,
    );
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (!this.spellUsable.isOnCooldown(this.activeKillShotSpell.id)) {
      return;
    }
    this.spellUsable.endCooldown(this.activeKillShotSpell.id, event.timestamp);
    this.deathblowProcs += 1;
  }
  onRefreshBuff(event: RefreshBuffEvent) {
    if (!this.spellUsable.isOnCooldown(this.activeKillShotSpell.id)) {
      return;
    }
    this.spellUsable.endCooldown(this.activeKillShotSpell.id, event.timestamp);
    this.deathblowProcs += 1;
    this.wastedProcs += 1;
  }

  private killShotSpell(): Spell | null {
    if (this.selectedCombatant.spec === SPECS.MARKSMANSHIP_HUNTER) {
      return this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT)
        ? TALENTS.BLACK_ARROW_MARKSMANSHIP_TALENT
        : SPELLS.KILL_SHOT_MM_BM;
    } else if (
      this.selectedCombatant.spec === SPECS.BEAST_MASTERY_HUNTER &&
      this.selectedCombatant.hasTalent(TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT)
    ) {
      return TALENTS.BLACK_ARROW_BEAST_MASTERY_TALENT;
    }

    return null;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.DEATHBLOW_TALENT}>
          {this.deathblowProcs}
          <small> Deathblow procs</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Deathblow;
