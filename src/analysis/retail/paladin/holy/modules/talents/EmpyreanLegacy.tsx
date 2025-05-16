import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { SpellLink, TooltipElement } from 'interface';
import { getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatPercentage } from 'common/format';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';

class EmpyreanLegacy extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };

  protected castEfficiency!: CastEfficiency;
  didWog = false;
  hasBuff = false;
  buffsGained = 0;
  buffsUsed = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPYREAN_LEGACY_TALENT);

    const activeWordOfGlorySpell = getWordofGlorySpell(this.selectedCombatant);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(activeWordOfGlorySpell), this.cast);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_LEGACY_BUFF),
      this.applybuff,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.EMPYREAN_LEGACY_BUFF),
      this.removebuff,
    );
  }

  cast = () => {
    if (this.hasBuff) {
      this.didWog = true;
    }
  };

  applybuff = () => {
    this.hasBuff = true;
    this.buffsGained += 1;
  };

  removebuff = () => {
    this.hasBuff = false;
    if (this.didWog) {
      this.buffsUsed += 1;
    }
    this.didWog = false;
  };

  statistic() {
    const fightDuration = this.owner.fightDuration / 1000;
    const possibleBuffs = Math.floor(fightDuration / 20);

    const consumed = this.buffsGained > 0 ? this.buffsUsed / this.buffsGained : 0;
    const possible = possibleBuffs > 0 ? this.buffsGained / possibleBuffs : 0;

    const judgmentCastEfficiency = this.castEfficiency.getCastEfficiencyForSpellId(
      SPELLS.JUDGMENT_CAST.id,
    );

    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS.EMPYREAN_LEGACY_TALENT}>
          <div>
            <TooltipElement
              content={
                <>
                  <SpellLink spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> gained: {this.buffsGained}
                  <br />
                  <SpellLink spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> consumed: {this.buffsUsed}
                </>
              }
            >
              {formatPercentage(consumed, 1)}% <small>of buffs consumed.</small>
            </TooltipElement>
          </div>
          <div>
            <TooltipElement
              content={
                <>
                  <div>
                    The number of <SpellLink spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> buffs you
                    receive
                    <br />
                    is directly tied to your <SpellLink spell={SPELLS.JUDGMENT_CAST} /> casts.
                  </div>
                  <br />
                  <div>Fight Duration: {fightDuration} seconds</div>
                  <div>
                    <SpellLink spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> internal cooldown: 20
                    seconds
                  </div>
                  <div>
                    <SpellLink spell={SPELLS.JUDGMENT_CAST} /> casts:{' '}
                    {judgmentCastEfficiency?.casts}/{judgmentCastEfficiency?.maxCasts}
                  </div>
                  <br />
                  <div>
                    Possible <SpellLink spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> buffs:{' '}
                    {possibleBuffs}
                  </div>
                  <div>
                    Actual <SpellLink spell={TALENTS.EMPYREAN_LEGACY_TALENT} /> buffs:{' '}
                    {this.buffsGained}
                  </div>
                </>
              }
            >
              {formatPercentage(possible, 1)}% <small>of possible buffs gained.</small>
            </TooltipElement>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EmpyreanLegacy;
