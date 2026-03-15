import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { SpellIcon } from 'interface';

const PROTECTOR_OF_THE_FRAIL_CR = 3000;

class ProtectorOfTheFrail extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  effectivePainSupressionReductionMs = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.PROTECTOR_OF_THE_FRAIL_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.reducePainSuppresionCooldown,
    );
  }

  reducePainSuppresionCooldown(event: CastEvent): void {
    if (!this.spellUsable.isOnCooldown(TALENTS_PRIEST.PAIN_SUPPRESSION_TALENT.id)) {
      return;
    }

    this.effectivePainSupressionReductionMs += this.spellUsable.reduceCooldown(
      TALENTS_PRIEST.PAIN_SUPPRESSION_TALENT.id,
      PROTECTOR_OF_THE_FRAIL_CR,
      event.timestamp,
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <>
          <BoringSpellValueText spell={TALENTS_PRIEST.PROTECTOR_OF_THE_FRAIL_TALENT}>
            <SpellIcon
              spell={TALENTS_PRIEST.PAIN_SUPPRESSION_TALENT}
              style={{
                height: '1.3em',
                marginTop: '-1.em',
              }}
            />{' '}
            {(this.effectivePainSupressionReductionMs / 1000).toFixed(1)}{' '}
            <small>Seconds reduced</small>
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default ProtectorOfTheFrail;
