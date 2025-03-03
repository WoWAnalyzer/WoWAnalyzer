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

class Deathblow extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  activeKillShotSpell =
    this.selectedCombatant.spec === SPECS.SURVIVAL_HUNTER
      ? SPELLS.KILL_SHOT_SV
      : SPELLS.KILL_SHOT_MM_BM;

  protected spellUsable!: SpellUsable;

  private deathblowProcs: number = 0;
  private wastedProcs: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.DEATHBLOW_TALENT);

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

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(4)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
      >
        <BoringSpellValueText spell={TALENTS.DEATHBLOW_TALENT}>
          {this.deathblowProcs}
          <small> Deathblow procs.</small>
          <br />
          {this.wastedProcs} <small> wasted Deathblow procs.</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Deathblow;
