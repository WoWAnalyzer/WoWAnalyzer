import React from 'react';

import MainCombatLogParser from 'Parser/Core/CombatLogParser';
import ParseResults from 'Parser/Core/ParseResults';
import getCastEfficiency from 'Parser/Core/getCastEfficiency';
import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';
import AmalgamsSeventhSpine from 'Parser/Core/Modules/Items/AmalgamsSeventhSpine';
import SephuzsSecret from 'Parser/Core/Modules/Items/SephuzsSecret';
import DarkmoonDeckPromises from 'Parser/Core/Modules/Items/DarkmoonDeckPromises';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import Icon from 'common/Icon';
import ITEMS from 'common/ITEMS';
import ItemLink from 'common/ItemLink';
import ItemIcon from 'common/ItemIcon';

import StatisticBox from 'Main/StatisticBox';
import SuggestionsTab from 'Main/SuggestionsTab';
import TalentsTab from 'Main/TalentsTab';
import CastEfficiencyTab from 'Main/CastEfficiencyTab';
import CooldownsTab from 'Main/CooldownsTab';
import ManaTab from 'Main/ManaTab';

import AbilityTracker from './Modules/Core/AbilityTracker';

import AlwaysBeCasting from './Modules/Features/AlwaysBeCasting';
import CooldownTracker from './Modules/Features/CooldownTracker';

import DrapeOfShame from './Modules/Items/DrapeOfShame';
import Velens from './Modules/Items/Velens';
import Prydaz from './Modules/Items/Prydaz';
import Tier19_2set from './Modules/Items/Tier19_2set';
import CordOfMaiev from './Modules/Items/CordOfMaiev';
import Skjoldr from './Modules/Items/Skjoldr';
import Xalan from './Modules/Items/Xalan';
import NeroBandOfPromises from './Modules/Items/NeroBandOfPromises';

import TwistOfFate from './Modules/Spells/TwistOfFate';
import Atonement from './Modules/Spells/Atonement';

import CPM_ABILITIES, { SPELL_CATEGORY } from './CPM_ABILITIES';

function formatThousands(number) {
  return (Math.round(number || 0) + '').replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
}
function formatNumber(number) {
  if (number > 1000000) {
    return `${(number / 1000000).toFixed(2)}m`;
  }
  if (number > 10000) {
    return `${Math.round(number / 1000)}k`;
  }
  return formatThousands(number);
}
function getIssueImportance(value, regular, major, higherIsWorse = false) {
  if (higherIsWorse ? value > major : value < major) {
    return ISSUE_IMPORTANCE.MAJOR;
  }
  if (higherIsWorse ? value > regular : value < regular) {
    return ISSUE_IMPORTANCE.REGULAR;
  }
  return ISSUE_IMPORTANCE.MINOR;
}
function formatPercentage(percentage) {
  return (Math.round((percentage || 0) * 10000) / 100).toFixed(2);
}

class CombatLogParser extends MainCombatLogParser {
  static specModules = {
    // Override the ability tracker so we also get stats for IoL and beacon healing
    abilityTracker: AbilityTracker,

    alwaysBeCasting: AlwaysBeCasting,
    cooldownTracker: CooldownTracker,

    // Items:
    drapeOfShame: DrapeOfShame,
    prydaz: Prydaz,
    velens: Velens,
    sephuzsSecret: SephuzsSecret,
    tier19_2set: Tier19_2set,
    cordOfMaiev: CordOfMaiev,
    skjoldr: Skjoldr,
    xalan: Xalan,
    neroBandOfPromises: NeroBandOfPromises,
    amalgamsSeventhSpine: AmalgamsSeventhSpine,
    darkmoonDeckPromises: DarkmoonDeckPromises,

    // Spells (talents and traits):
    twistOfFate: TwistOfFate,
    atonement: Atonement,
  };

  generateResults() {
    const results = new ParseResults();

    const fightDuration = this.fightDuration;

    const abilityTracker = this.modules.abilityTracker;
    const getAbility = spellId => abilityTracker.getAbility(spellId);

    const penance = getAbility(SPELLS.PENANCE.id);

    const missedPenanceTicks = (this.modules.alwaysBeCasting.truePenanceCasts * 4) - (penance.casts || 0);
    const deadTimePercentage = this.modules.alwaysBeCasting.totalTimeWasted / fightDuration;
    const velensHealingPercentage = this.modules.velens.healing / this.totalHealing;
    const prydazHealingPercentage = this.modules.prydaz.healing / this.totalHealing;
    const drapeOfShameHealingPercentage = this.modules.drapeOfShame.healing / this.totalHealing;
    const improperAtonementRefreshPercentage = this.modules.atonement.improperAtonementRefreshes.length / this.modules.atonement.totalAtones;

    const tier19_2setHealingPercentage = this.modules.tier19_2set.healing / this.totalHealing;


    if(improperAtonementRefreshPercentage > .05) {
      results.addIssue({
        issue: <span>Your <SpellLink id={SPELLS.ATONEMENT.id} /> efficiency can be improved ({this.modules.atonement.improperAtonementRefreshes.length}/{this.modules.atonement.totalAtones} applications: {(improperAtonementRefreshPercentage * 100).toFixed(2)}% applied to already buffed players.)</span>,
        icon: SPELLS.ATONEMENT.icon,
        importance: getIssueImportance(improperAtonementRefreshPercentage, .07, .1, true)
      });
    }
    
    if (deadTimePercentage > 0.2) {
      results.addIssue({
        issue: `Your dead GCD time can be improved. Try to Always Be Casting (ABC); when there's nothing to heal try to contribute some damage (${Math.round(deadTimePercentage * 100)}% dead GCD time).`,
        icon: 'spell_mage_altertime',
        importance: getIssueImportance(deadTimePercentage, 0.35, 0.4, true),
      });
    }
    if (this.modules.velens.active && velensHealingPercentage < 0.045) {
      results.addIssue({
        issue: <span>Your usage of <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} /> can be improved. Try to maximize the amount of casts during the buff or consider using an easier legendary ({(velensHealingPercentage * 100).toFixed(2)}% healing contributed).</span>,
        icon: ITEMS.VELENS_FUTURE_SIGHT.icon,
        importance: getIssueImportance(velensHealingPercentage, 0.04, 0.03),
      });
    }
    // PtW uptime should be > 95%

    const castEfficiencyCategories = SPELL_CATEGORY;
    const castEfficiency = getCastEfficiency(CPM_ABILITIES, this);
    castEfficiency.forEach((cpm) => {
      if (cpm.canBeImproved && !cpm.ability.noSuggestion) {
        results.addIssue({
          issue: <span>Try to cast <SpellLink id={cpm.ability.spell.id} /> more often ({cpm.casts}/{cpm.maxCasts} casts: {Math.round(cpm.castEfficiency * 100)}% cast efficiency). {cpm.ability.extraSuggestion || ''}</span>,
          icon: cpm.ability.spell.icon,
          importance: cpm.ability.importance || getIssueImportance(cpm.castEfficiency, cpm.recommendedCastEfficiency - 0.05, cpm.recommendedCastEfficiency - 0.15),
        });
      }
    });

    results.statistics = [
      <StatisticBox
        icon={(
          <img
            src="./img/healing.png"
            style={{ border: 0 }}
            alt="Healing"
          />)}
        value={`${formatNumber(this.totalHealing / fightDuration * 1000)} HPS`}
        label={(
          <dfn data-tip={`The total healing done recorded was ${formatThousands(this.totalHealing)}.`}>
            Healing done
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<Icon icon="petbattle_health-down" alt="Non healing time" />}
        value={`${formatPercentage(deadTimePercentage)} %`}
        label={(
          <dfn data-tip="Dead GCD time is available casting time not used. This can be caused by latency, cast interrupting, not casting anything (e.g. due to movement/stunned), etc.">
            Dead GCD time
          </dfn>
        )}
      />,
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PENANCE.id} />}
        value={missedPenanceTicks}
        label={(
          <dfn data-tip={`Each Penance channel allows you to hit 4 times. You should try to let this channel finish as much as possible. You channeled Penance ${this.modules.alwaysBeCasting.truePenanceCasts} times.`}>
            Wasted Penance bolts
          </dfn>
        )}
      />,
      this.modules.atonement.active && (
        <StatisticBox 
        icon={<SpellIcon id={SPELLS.ATONEMENT.id} />}
        value= {this.modules.atonement.improperAtonementRefreshes.length}
        label={(
          <dfn data-tip={`${((this.modules.atonement.improperAtonementRefreshes.length / this.modules.atonement.totalAtonementRefreshes * 100) || 0).toFixed(2)}% (${this.modules.atonement.improperAtonementRefreshes.length}/${this.modules.atonement.totalAtonementRefreshes}) of your Atonement refreshes were too early. ${((this.modules.atonement.improperAtonementRefreshes.length / this.modules.atonement.totalAtones * 100) || 0).toFixed(2)}% (${this.modules.atonement.improperAtonementRefreshes.length}/${this.modules.atonement.totalAtones}) of all Atonements applied were refreshed too early.` }>
             Early Atonement Refreshes
          </dfn> 
        )}
        />
      ),
      this.modules.twistOfFate.active && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.TWIST_OF_FATE_TALENT.id} />}
          value={`${formatNumber(this.modules.twistOfFate.healing / fightDuration * 1000)} HPS`}
          label={(
            <dfn data-tip={`The actual effective healing contributed by Twist of Fate (${formatPercentage(this.modules.twistOfFate.healing / this.totalHealing)}% of total healing done). Twist of Fate also contributed ${formatNumber(this.modules.twistOfFate.damage / fightDuration * 1000)} DPS (${formatPercentage(this.modules.twistOfFate.damage / this.totalDamage)}% of total damage done).`}>
              Twist of Fate contribution
            </dfn>
          )}
        />
      ),
      this.selectedCombatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id) && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.PURGE_THE_WICKED_BUFF.id} />}
          value={`${formatPercentage(this.modules.enemies.getBuffUptime(SPELLS.PURGE_THE_WICKED_BUFF.id) / this.fightDuration)} %`}
          label="Purge the Wicked uptime"
        />
      ),
      !this.selectedCombatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id) && (
        <StatisticBox
          icon={<SpellIcon id={SPELLS.SHADOW_WORD_PAIN.id} />}
          value={`${formatPercentage(this.modules.enemies.getBuffUptime(SPELLS.SHADOW_WORD_PAIN.id) / this.fightDuration)} %`}
          label="Shadow Word: Pain uptime"
        />
      ),
    ];

    results.items = [
      this.modules.prydaz.active && {
        id: ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id,
        icon: <ItemIcon id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        title: <ItemLink id={ITEMS.PRYDAZ_XAVARICS_MAGNUM_OPUS.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Prydaz, Xavaric's Magnum Opus equip effect.">
            {((prydazHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.prydaz.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.velens.active && {
        id: ITEMS.VELENS_FUTURE_SIGHT.id,
        icon: <ItemIcon id={ITEMS.VELENS_FUTURE_SIGHT.id} />,
        title: <ItemLink id={ITEMS.VELENS_FUTURE_SIGHT.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Velen's Future Sight use effect.">
            {((velensHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.velens.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.sephuzsSecret.active && {
        id: ITEMS.SEPHUZS_SECRET.id,
        icon: <ItemIcon id={ITEMS.SEPHUZS_SECRET.id} />,
        title: <ItemLink id={ITEMS.SEPHUZS_SECRET.id} />,
        result: `${((this.modules.sephuzsSecret.uptime / fightDuration * 100) || 0).toFixed(2)} % uptime`,
      },
      this.modules.cordOfMaiev.active && {
        id: ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON.id,
        icon: <ItemIcon id={ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON.id} />,
        title: <ItemLink id={ITEMS.CORD_OF_MAIEV_PRIESTESS_OF_THE_MOON.id} />,
        result: (
          <span>
            {(this.modules.cordOfMaiev.procTime / 1000).toFixed(1)} seconds off the <SpellLink id={SPELLS.PENANCE.id} /> cooldown ({this.modules.cordOfMaiev.procs} Penances cast earlier)
          </span>
        )
      },
      this.modules.skjoldr.active && {
        id: ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id,
        icon: <ItemIcon id={ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id} />,
        title: <ItemLink id={ITEMS.SKJOLDR_SANCTUARY_OF_IVAGONT.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Skjoldr, Sanctuary of Ivagont equip effect. This includes the healing gained via Share in the Light.">
            {((this.modules.skjoldr.healing / this.totalHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.skjoldr.healing / fightDuration * 1000)} HPS
          </dfn>
        )
      },
      this.modules.xalan.active && {
        id: ITEMS.XALAN_THE_FEAREDS_CLENCH.id,
        icon: <ItemIcon id={ITEMS.XALAN_THE_FEAREDS_CLENCH.id} />,
        title: <ItemLink id={ITEMS.XALAN_THE_FEAREDS_CLENCH.id} />,
        result: (
          <dfn data-tip={`The actual effective healing contributed by the Xalan the Feared's Clench equip effect asuming your Atonement lasts ${this.modules.xalan.atonementDuration} seconds normally.`}>
            {((this.modules.xalan.healing / this.totalHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.xalan.healing / fightDuration * 1000)} HPS
          </dfn>
        )
      },
      this.modules.neroBandOfPromises.active && {
        id: ITEMS.NERO_BAND_OF_PROMISES.id,
        icon: <ItemIcon id={ITEMS.NERO_BAND_OF_PROMISES.id} />,
        title: <ItemLink id={ITEMS.NERO_BAND_OF_PROMISES.id} />,
        result: (
          <dfn data-tip={`The actual effective healing contributed by the Xalan the Feared's Clench equip effect. The healing gain counts as Atonement healing and does NOT stack with existing Atonements.`}>
            {((this.modules.neroBandOfPromises.healing / this.totalHealing * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.neroBandOfPromises.healing / fightDuration * 1000)} HPS
          </dfn>
        )
      },
      this.modules.drapeOfShame.active && {
        id: ITEMS.DRAPE_OF_SHAME.id,
        icon: <ItemIcon id={ITEMS.DRAPE_OF_SHAME.id} />,
        title: <ItemLink id={ITEMS.DRAPE_OF_SHAME.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Drape of Shame equip effect.">
            {((drapeOfShameHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.drapeOfShame.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
      this.modules.amalgamsSeventhSpine.active && {
        id: ITEMS.AMALGAMS_SEVENTH_SPINE.id,
        icon: <ItemIcon id={ITEMS.AMALGAMS_SEVENTH_SPINE.id} />,
        title: <ItemLink id={ITEMS.AMALGAMS_SEVENTH_SPINE.id} />,
        result: (
          <dfn data-tip={`The exact amunt of mana gained from the Amalgam's Seventh Spine equip effect. You gained mana ${this.modules.amalgamsSeventhSpine.procs} times and refreshed the buff ${this.modules.amalgamsSeventhSpine.refreshes} times (refreshing delay the mana return and is inefficient use of this trinket).`}>
            {formatThousands(this.modules.amalgamsSeventhSpine.manaGained)} mana gained ({formatThousands(this.modules.amalgamsSeventhSpine.manaGained / this.fightDuration * 1000 * 5)} MP5)
          </dfn>
        )
      },
      this.modules.darkmoonDeckPromises.active && {
        id: ITEMS.DARKMOON_DECK_PROMISES.id,
        icon: <ItemIcon id={ITEMS.DARKMOON_DECK_PROMISES.id} />,
        title: <ItemLink id={ITEMS.DARKMOON_DECK_PROMISES.id} />,
        result: (
          <dfn data-tip={`The exact amunt of mana saved by the Darkmoon Deck: Promises equip effect. This takes the different values per card into account at the time of the cast. Mana values assume you have a 875 item level version.`}>
            {formatThousands(this.modules.darkmoonDeckPromises.manaGained)} mana saved ({formatThousands(this.modules.darkmoonDeckPromises.manaGained / this.fightDuration * 1000 * 5)} MP5)
          </dfn>
        )
      },
      this.modules.tier19_2set.active && {
        id: `spell-${SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id}`,
        icon: <SpellIcon id={SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id} />,
        title: <SpellLink id={SPELLS.DISC_PRIEST_T19_2SET_BONUS_BUFF.id} />,
        result: (
          <dfn data-tip="The actual effective healing contributed by the Tier 19 2 set bonus.">
            {((tier19_2setHealingPercentage * 100) || 0).toFixed(2)} % / {formatNumber(this.modules.tier19_2set.healing / fightDuration * 1000)} HPS
          </dfn>
        ),
      },
    ];

    results.tabs = [
      {
        title: 'Suggestions',
        url: 'suggestions',
        render: () => (
          <SuggestionsTab issues={results.issues} />
        ),
      },
      {
        title: 'Cast efficiency',
        url: 'cast-efficiency',
        render: () => (
          <CastEfficiencyTab
            categories={castEfficiencyCategories}
            abilities={castEfficiency}
          />
        ),
      },
      {
        title: 'Cooldowns',
        url: 'cooldowns',
        render: () => (
          <CooldownsTab
            fightStart={this.fight.start_time}
            fightEnd={this.fight.end_time}
            cooldowns={this.modules.cooldownTracker.cooldowns}
          />
        ),
      },
      {
        title: 'Talents',
        url: 'talents',
        render: () => (
          <TalentsTab combatant={this.selectedCombatant} />
        ),
      },
      {
        title: 'Mana',
        url: 'mana',
        render: () => (
          <ManaTab
            reportCode={this.report.code}
            actorId={this.playerId}
            start={this.fight.start_time}
            end={this.fight.end_time}
          />
        ),
      },
    ];

    return results;
  }
}

export default CombatLogParser;
