import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class IdolOfYshaarj extends Analyzer {
  casts = 0;
  pride = 0;
  despair = 0;
  anger = 0;
  fear = 0;
  violence = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IDOL_OF_YSHAARJ_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.MINDBENDER_SHADOW_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_YSHAARJ_BUFF_PRIDE),
      this.onBuffPride,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_YSHAARJ_BUFF_DESPAIR),
      this.onBuffDespair,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_YSHAARJ_BUFF_ANGER),
      this.onBuffAnger,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_YSHAARJ_BUFF_FEAR),
      this.onBuffFear,
    );
  }

  onBuffPride() {
    this.pride += 1;
  }
  onBuffDespair() {
    this.despair += 1;
  }
  onBuffAnger() {
    this.anger += 1;
  }
  onBuffFear() {
    this.fear += 1;
  }
  getBuffViolence() {
    return this.casts - this.pride - this.despair - this.anger - this.fear;
  }

  onCast() {
    this.casts += 1;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={<>Effects from {this.casts} casts of mindbenders</>}
      >
        <BoringSpellValueText spellId={TALENTS.IDOL_OF_YSHAARJ_TALENT.id}>
          <>
            <body>
              {this.pride} Healthy. <SpellLink id={SPELLS.IDOL_OF_YSHAARJ_BUFF_PRIDE.id} />
            </body>
            <body>
              {this.despair} Stunned. <SpellLink id={SPELLS.IDOL_OF_YSHAARJ_BUFF_DESPAIR.id} />
            </body>
            <body>
              {this.anger} Enraged. <SpellLink id={SPELLS.IDOL_OF_YSHAARJ_BUFF_ANGER.id} />
            </body>
            <body>
              {this.fear} Feared. <SpellLink id={SPELLS.IDOL_OF_YSHAARJ_BUFF_FEAR.id} />
            </body>
            <body>
              {this.getBuffViolence()} No State.{' '}
              <SpellLink id={SPELLS.IDOL_OF_YSHAARJ_BUFF_VIOLENCE.id} />
            </body>
          </>
          {/*the tooltip on wowhead doesn't match the tooltip on the in game buff, so the extra text is required to show which effect is which.*/}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IdolOfYshaarj;
