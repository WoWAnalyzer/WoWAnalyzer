import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellIcon } from 'interface';
import Analyzer, { Options } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, { ChangeHasteEvent, EventType } from 'parser/core/Events';
import BoringValue from 'parser/ui/BoringValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import talents from 'common/TALENTS/monk';

import Abilities from '../Abilities';
import BlackOxBrew from '../spells/BlackOxBrew';
import KegSmash from '../spells/KegSmash';
import TigerPalm from '../spells/TigerPalm';
import AnvilStave from '../talents/AnvilStave';
import PressTheAdvantage from '../talents/PressTheAdvantage';

const deps = {
  ks: KegSmash,
  tp: TigerPalm,
  bob: BlackOxBrew,
  anvilStave: AnvilStave,
  abilities: Abilities,
  pta: PressTheAdvantage,
};

class BrewCDR extends Analyzer.withDependencies(deps) {
  _totalHaste = 0;
  _newHaste = 0;
  _lastHasteChange = 0;

  constructor(options: Options) {
    super(options);
    this._lastHasteChange = this.owner.fight.start_time;

    this.addEventListener(new EventFilter(EventType.ChangeHaste), this._updateHaste);
    this.addEventListener(Events.fightend, this._finalizeHaste);
  }

  get meanHaste() {
    return this._totalHaste / this.owner.fightDuration;
  }

  get totalCDR() {
    let totalCDR = 0;
    // add in KS CDR...
    totalCDR += this.deps.ks.cdr;
    totalCDR += this.deps.ks.bocCDR;
    // ...and TP...
    totalCDR += this.deps.tp.cdr;
    // ...and BoB...
    totalCDR += this.deps.bob.cdr[talents.PURIFYING_BREW_TALENT.id];
    totalCDR += this.deps.anvilStave.cdr;
    totalCDR += this.deps.pta.brewCDRTotal;
    return totalCDR;
  }

  get maxTotalCDR() {
    // some passive talents like anvil & stave don't track wasted cdr (yet?)
    return (
      this.deps.ks.wastedCDR +
      this.deps.ks.wastedBocCDR +
      this.deps.tp.wastedCDR +
      this.deps.bob.wastedCDR[talents.PURIFYING_BREW_TALENT.id] +
      this.deps.pta.wastedBrewCDR +
      this.totalCDR
    );
  }

  // The idea here is pretty simple: we have an amount of time that has
  // passed (fightDuration) and an amount of time that has "passed"
  // via flat cooldown reduction on abilities (totalCDR). For example,
  // Keg Smash effetively causes 4 seconds to "pass" when cast. So we
  // want to know what fraction of time that has passed was caused by
  // cooldown reduction effects, which is:
  //
  // cdr% = totalCDR / (fightDuration + totalCDR)
  //
  // related:
  // https://github.com/WoWAnalyzer/WoWAnalyzer/pull/1238#discussion_r163734298
  get cooldownReductionRatio() {
    return this.totalCDR / (this.owner.fightDuration + this.totalCDR);
  }

  get maxCooldownReductionRatio() {
    return this.maxTotalCDR / (this.owner.fightDuration + this.maxTotalCDR);
  }

  get minAttainableCooldown() {
    return this.avgCooldown * (1 - this.maxCooldownReductionRatio);
  }

  get avgCooldown() {
    const ability = this.deps.abilities.getAbility(talents.PURIFYING_BREW_TALENT.id)!;
    return ability.getCooldown(this.meanHaste);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        tooltip={
          <>
            Your cooldowns were reduced by:
            <ul>
              <li>
                {this.deps.ks.totalCasts} Keg Smash casts —{' '}
                <strong>{(this.deps.ks.cdr / 1000).toFixed(2)}s</strong> (
                <strong>{(this.deps.ks.wastedCDR / 1000).toFixed(2)}s</strong> wasted)
              </li>
              {this.deps.ks.bocHits > 0 && (
                <li>
                  Using Blackout Combo on {this.deps.ks.bocHits} Keg Smash hits —{' '}
                  <strong>{(this.deps.ks.bocCDR / 1000).toFixed(2)}s</strong> (
                  <strong>{(this.deps.ks.wastedBocCDR / 1000).toFixed(2)}s</strong> wasted)
                </li>
              )}
              {!this.deps.pta.active && (
                <li>
                  {this.deps.tp.totalCasts} Tiger Palm hits —{' '}
                  <strong>{(this.deps.tp.cdr / 1000).toFixed(2)}s</strong> (
                  <strong>{(this.deps.tp.wastedCDR / 1000).toFixed(2)}s</strong> wasted)
                </li>
              )}
              {this.deps.bob.active && (
                <li>
                  {this.deps.bob.casts} Black Ox Brew casts —{' '}
                  <strong>
                    {(this.deps.bob.cdr[talents.PURIFYING_BREW_TALENT.id] / 1000).toFixed(2)}s
                  </strong>{' '}
                  (
                  <strong>
                    {(this.deps.bob.wastedCDR[talents.PURIFYING_BREW_TALENT.id] / 1000).toFixed(2)}s
                  </strong>{' '}
                  wasted)
                </li>
              )}
              {this.deps.anvilStave.active && (
                <li>
                  {this.deps.anvilStave.count} Anvil & Stave triggers -{' '}
                  <strong>{(this.deps.anvilStave.cdr / 1000).toFixed(2)}s</strong>
                </li>
              )}
              {this.deps.pta.active && (
                <li>
                  {this.deps.pta.meleeCount} Press the Advantage triggers -{' '}
                  <strong>{(this.deps.pta.brewCDRTotal / 1000).toFixed(2)}s</strong> (
                  <strong>{(this.deps.pta.wastedBrewCDR / 1000).toFixed(2)}s</strong> wasted)
                </li>
              )}
            </ul>
            <strong>Total cooldown reduction:</strong> {(this.totalCDR / 1000).toFixed(2)}s.
            <br />
          </>
        }
      >
        <BoringValue
          label={
            <>
              <SpellIcon spell={SPELLS.TIGER_PALM} /> Effective Brew CDR
            </>
          }
        >
          <>{formatPercentage(this.cooldownReductionRatio)} %</>
        </BoringValue>
      </Statistic>
    );
  }

  private _updateHaste(event: ChangeHasteEvent) {
    this._totalHaste += event.oldHaste! * (event.timestamp - this._lastHasteChange);
    this._lastHasteChange = event.timestamp;
    this._newHaste = event.newHaste!;
  }

  private _finalizeHaste() {
    this._totalHaste += this._newHaste * (this.owner.fight.end_time - this._lastHasteChange);
  }
}

export default BrewCDR;
