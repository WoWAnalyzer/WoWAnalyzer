import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const CJ_CDR_AMOUNT = 3000;

class GrandCrusader extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  gcProcs = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.GRAND_CRUSADER_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.onProc,
    );
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.GRAND_CRUSADER_BUFF),
      this.onProc,
    );
  }

  private onProc(event: ApplyBuffEvent | RefreshBuffEvent) {
    this.gcProcs += 1;

    this.deps.spellUsable.endCooldown(TALENTS.AVENGERS_SHIELD_TALENT.id, event.timestamp);

    if (this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT)) {
      this.deps.spellUsable.reduceCooldown(
        SPELLS.JUDGMENT_CAST_PROTECTION.id,
        CJ_CDR_AMOUNT,
        event.timestamp,
      );
      if (this.selectedCombatant.hasTalent(TALENTS.HAMMER_OF_WRATH_TALENT)) {
        this.deps.spellUsable.reduceCooldown(
          SPELLS.HAMMER_OF_WRATH_CAST.id,
          CJ_CDR_AMOUNT,
          event.timestamp,
        );
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        tooltip={
          <>
            Grand Crusader reset Avenger's Shield {this.gcProcs} times.
            {this.selectedCombatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT) && (
              <>
                <br />
                Each proc also reduced the cooldown of Judgment (and Hammer of Wrath) by 3 seconds.
              </>
            )}
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.GRAND_CRUSADER_TALENT.id}
          value={`${this.gcProcs} Resets`}
          label="Grand Crusader"
        />
      </Statistic>
    );
  }
}

export default GrandCrusader;
