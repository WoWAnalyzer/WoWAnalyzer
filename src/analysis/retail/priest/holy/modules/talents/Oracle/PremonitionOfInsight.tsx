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

import { INSIGHT_CDR } from '../../../constants';
import { FATEBENDER_SCALER } from '../../../constants';
import { removesInsightCharge } from '../../../normalizers/CastLinkNormalizer';
import SpellIcon from 'interface/SpellIcon';

class PremonitionOfInsight extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    combatants: Combatants,
  };

  protected spellUsable!: SpellUsable;
  protected combatants!: Combatants;

  private insightCastNumber: number = 1;
  private insightStackNumber: number = 1;
  private scaledInsightCDR = INSIGHT_CDR;

  private insightReducBySpell: { [spellID: string]: number } = {};

  private insightCastSpellTracker: insightPerCast[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.CLAIRVOYANCE_TALENT);
    if (this.selectedCombatant.hasTalent(TALENTS_PRIEST.FATEBENDER_TALENT)) {
      this.scaledInsightCDR *= FATEBENDER_SCALER;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.handleOnCast);
  }

  handleOnCast(event: CastEvent) {
    if (!removesInsightCharge(event)) {
      return;
    }

    const spellId = event.ability.guid;
    const effCDR = this.spellUsable.reduceCooldown(spellId, this.scaledInsightCDR);

    this.insightReducBySpell[spellId] = this.insightReducBySpell[spellId] || 0;

    this.insightStackNumber += 1;

    /*have to hard code hf because holy fire's cast time causes it to
      bug geteffectiveCDR */
    if (spellId === SPELLS.HOLY_FIRE.id) {
      this.insightReducBySpell[spellId] += this.scaledInsightCDR;
      this.insightCastSpellTracker[this.insightStackNumber] = {
        castSpellId: spellId,
        effectiveCDR: this.scaledInsightCDR,
        remainingCD: 10 - this.scaledInsightCDR,
      };
      return;
    }

    let effectiveCDRx = this.spellUsable.reduceCooldown(spellId, this.scaledInsightCDR);
    const remainingCDx = this.spellUsable.cooldownRemaining(spellId) / 1000 - effectiveCDRx;

    // Haste variable CD spells like circle/PoM mess the math up
    if (spellId === TALENTS_PRIEST.PRAYER_OF_MENDING_TALENT.id) {
      effectiveCDRx += remainingCDx;
      this.insightReducBySpell[spellId] += effectiveCDRx;
    } else {
      this.insightReducBySpell[spellId] += effCDR;
    }

    this.insightCastSpellTracker[this.insightStackNumber] = {
      castSpellId: spellId,
      effectiveCDR: effectiveCDRx,
      remainingCD: remainingCDx,
    };
  }

  statistic() {
    //this filters out undefined values that cause errors
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
                      />
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
