import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import Combatants from 'parser/shared/modules/Combatants';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { INSIGHT_CDR } from './OracleValues';
import { FATEBENDER_SCALER } from './OracleValues';
import { removesInsightCharge } from '../../../normalizers/CastLinkNormalizer';
import SpellIcon from 'interface/SpellIcon';

class PremonitionOfInsight extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  // Temporary value used as flags or for calculations
  insightCastNumber: number = 1;
  insightStackNumber: number = 1;
  fatebenderActive = false;
  scaledInsightCDR = INSIGHT_CDR;
  baseInsightCDR = INSIGHT_CDR;

  insightReducBySpell: { [spellID: string]: number } = {};

  insightCastSpellTracker: insightPerCast[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CLAIRVOYANCE_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.FATEBENDER_TALENT)) {
      this.scaledInsightCDR *= FATEBENDER_SCALER;
      this.fatebenderActive = true;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleOnCast);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PREMONITION_OF_CLAIRVOYANCE),
      this.handleInsightCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PREMONITION_OF_INSIGHT_BUFF),
      this.handleInsightCast,
    );
  }

  handleOnCast(event: CastEvent) {
    if (!removesInsightCharge(event)) {
      return;
    }
    const spellId = event.ability.guid;
    if (spellId === SPELLS.HOLY_FIRE.id) {
      //WRITE CODE TO FILTER OUT EMPYREAL BLAZE CASTS;
    }
    const effCDR = this.spellUsable.reduceCooldown(spellId, this.scaledInsightCDR);

    this.insightReducBySpell[spellId] = this.insightReducBySpell[spellId] || 0;

    this.insightReducBySpell[spellId] += effCDR;

    this.insightStackNumber += 1;

    //this is for the dropdown info table and holy fuck i hate TS
    const stackNumx = this.insightStackNumber;
    const castSpellIdx = spellId;
    const effectiveCDRx = this.spellUsable.reduceCooldown(spellId, this.scaledInsightCDR);
    const remainingCDx = this.spellUsable.cooldownRemaining(spellId) / 1000 - effectiveCDRx;

    this.insightCastSpellTracker[stackNumx] = {
      castSpellId: castSpellIdx,
      effectiveCDR: effectiveCDRx,
      remainingCD: remainingCDx,
    };
  }

  handleInsightCast() {
    this.insightCastNumber += 3;
  }

  statistic() {
    this.insightCastSpellTracker = this.insightCastSpellTracker.filter(Boolean);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(99)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        dropdown={
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <td className="text-left">Spell</td>
                  <th>Cast Order</th>
                  <th>Effective CDR</th>
                  <th>Remaining CD</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.insightCastSpellTracker).map((castNumber, stackNum) => (
                  <tr key={stackNum}>
                    <td className="text-left">
                      <SpellIcon
                        spell={Number(this.insightCastSpellTracker[stackNum].castSpellId)}
                      />{' '}
                      {SPELLS[Number(this.insightCastSpellTracker[stackNum].castSpellId)].name}
                    </td>
                    <td>{stackNum + 1}</td>
                    <td>
                        {Math.round(this.insightCastSpellTracker[stackNum].effectiveCDR * 10) / 10}s
                      </td>
                    <td>
                        {Math.round(this.insightCastSpellTracker[stackNum].remainingCD * 10) / 10}
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        }
      >
        <>
          <table className="table table-condensed">
            <thead>
              <tr>
                <td className="text-left">Spell</td>
                <td>Insight CDR</td>
              </tr>
            </thead>
            <tbody>
              {Object.keys(this.insightReducBySpell).map((e, i) => (
                <tr key={i}>
                  <td className="text-left">
                    <SpellIcon spell={Number(e)} /> {SPELLS[Number(e)].name}
                  </td>
                  <td>{Math.round(this.insightReducBySpell[e] * 10) / 10}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      </Statistic>
    );
  }
}

interface insightPerCast {
  castSpellId: number;
  effectiveCDR: number;
  remainingCD: number;
}

export default PremonitionOfInsight;
