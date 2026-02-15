import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { GetRelatedEvents, HealEvent, RemoveBuffEvent } from 'parser/core/Events';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Statistic from 'parser/ui/Statistic';
import { SpellLink } from 'interface';
import { getWordofGlorySpell } from 'analysis/retail/paladin/shared/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { formatNumber, formatPercentage } from 'common/format';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import ItemHealingDone from 'parser/ui/ItemHealingDone';

import { EMPYREAN_LEGACY } from '../../normalizers/EventLinks/EventLinkConstants';

class EmpyreanLegacy extends Analyzer {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };

  protected castEfficiency!: CastEfficiency;

  didWog = false;
  hasBuff = false;
  buffsGained = 0;
  buffsUsed = 0;
  totalHealing = 0;
  totalOverhealing = 0;
  lastEL = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.EMPYREAN_LEGACY_HOLY_TALENT);

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

  removebuff = (event: RemoveBuffEvent) => {
    this.hasBuff = false;
    if (this.didWog) {
      this.buffsUsed += 1;
    }
    this.didWog = false;
    this.lastEL = event.timestamp;

    const events = GetRelatedEvents<HealEvent>(event, EMPYREAN_LEGACY);
    for (const event of events) {
      this.totalHealing += event.amount + (event.absorbed || 0);
      this.totalOverhealing += event.overheal || 0;
    }
  };

  onHeal = (event: HealEvent) => {
    if (event.timestamp <= this.lastEL + 100) {
      this.totalHealing += event.amount + (event.absorbed || 0);
    }
  };

  statistic() {
    const fightDuration = this.owner.fightDuration / 1000;
    const possibleBuffs = Math.floor(fightDuration / 20);

    const consumed = this.buffsGained > 0 ? this.buffsUsed / this.buffsGained : 0;
    const possible = possibleBuffs > 0 ? this.buffsGained / possibleBuffs : 0;

    const judgmentCastEfficiency = this.castEfficiency.getCastEfficiencyForSpellId(
      SPELLS.JUDGMENT_CAST.id,
    );

    // add this to PR https://www.warcraftlogs.com/reports/kfnwY1ydMJ6pBbTm/?fight=12&type=summary&pins=0%24Main%24%23ff00c4%24auras-gained%24-1%240.0.0.Any%24228934672.0.0.Paladin%24true%240.0.0.Any%24true%24387178%5E2%24Separate%24%23909049%24auras-gained%24-1%240.0.0.Any%24228934672.0.0.Paladin%24true%240.0.0.Any%24true%24387178%2463%24or%24healing%24-1%240.0.0.Any%24228934672.0.0.Paladin%24true%240.0.0.Any%24true%24225311%7C225311&view=events
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Effective Healing: {formatNumber(this.totalHealing)} <br />
            Overhealing: {formatNumber(this.totalOverhealing)} <br />
            <br />
            The number of <SpellLink spell={TALENTS.EMPYREAN_LEGACY_HOLY_TALENT} /> buffs you
            receive <br />
            is directly tied to your <SpellLink spell={SPELLS.JUDGMENT_CAST} /> casts. <br />
            <br />
            Fight Duration: {fightDuration} seconds <br />
            <SpellLink spell={TALENTS.EMPYREAN_LEGACY_HOLY_TALENT} /> internal cooldown: 20 seconds{' '}
            <br />
            <SpellLink spell={SPELLS.JUDGMENT_CAST} /> casts: {judgmentCastEfficiency?.casts}/
            {judgmentCastEfficiency?.maxCasts} <br />
            <br />
            Possible buffs: {possibleBuffs} <br />
            Actual buffs: {this.buffsGained} <br />
            Consumed buffs: {this.buffsUsed}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.EMPYREAN_LEGACY_HOLY_TALENT}>
          <div>
            <ItemHealingDone amount={this.totalHealing} />
          </div>
          <div>
            {formatPercentage(consumed, 1)}% <small>buffs consumed</small>
          </div>
          <div>
            {formatPercentage(possible, 1)}% <small>possible buffs gained</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EmpyreanLegacy;
