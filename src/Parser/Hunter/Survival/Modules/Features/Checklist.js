import React from 'react';

//Core
import CoreChecklist, { Rule, Requirement } from 'Parser/Core/Modules/Features/Checklist';
import Abilities from 'Parser/Core/Modules/Abilities';
import { GenericCastEfficiencyRequirement } from 'Parser/Core/Modules/Features/Checklist/Requirements';
import { PreparationRule } from 'Parser/Core/Modules/Features/Checklist/Rules';
import Combatants from 'Parser/Core/Modules/Combatants';
import LegendaryCountChecker from 'Parser/Core/Modules/Items/LegendaryCountChecker';
import LegendaryUpgradeChecker from 'Parser/Core/Modules/Items/LegendaryUpgradeChecker';
import PrePotion from 'Parser/Core/Modules/Items/PrePotion';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Icon from "common/Icon";
import EnchantChecker from 'Parser/Core/Modules/Items/EnchantChecker';
import ITEMS from 'common/ITEMS/HUNTER';
import ItemLink from 'common/ItemLink';
import ResourceIcon from 'common/ResourceIcon';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

//Features
import CastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import AlwaysBeCasting from 'Parser/Hunter/Survival/Modules/Features/AlwaysBeCasting';
import TimeFocusCapped from 'Parser/Hunter/Shared/Modules/Features/TimeFocusCapped';

//Talents
import Caltrops from 'Parser/Hunter/Survival/Modules/Talents/Caltrops';
import ButcheryCarve from 'Parser/Hunter/Survival/Modules/Talents/ButcheryCarve';
import WayOfTheMokNathal from 'Parser/Hunter/Survival/Modules/Talents/WayOfTheMokNathal';

//Spells
import AspectOfTheEagle from 'Parser/Hunter/Survival/Modules/Spells/AspectOfTheEagle';
import Lacerate from 'Parser/Hunter/Survival/Modules/Spells/Lacerate';

//Items
import ButchersBoneApron from 'Parser/Hunter/Survival/Modules/Items/ButchersBoneApron';

class Checklist extends CoreChecklist {

  static dependencies = {
    abilities: Abilities,
    combatants: Combatants,

    //preparation rules
    legendaryUpgradeChecker: LegendaryUpgradeChecker,
    legendaryCountChecker: LegendaryCountChecker,
    prePotion: PrePotion,
    enchantChecker: EnchantChecker,

    //features:
    castEfficiency: CastEfficiency,
    alwaysBeCasting: AlwaysBeCasting,
    timeFocusCapped: TimeFocusCapped,

    //talents
    caltrops: Caltrops,
    butcheryCarve: ButcheryCarve,
    wayOfTheMokNathal: WayOfTheMokNathal,

    //spells
    aspectOfTheEagle: AspectOfTheEagle,
    lacerate: Lacerate,

    //Items
    butchersBoneApron: ButchersBoneApron,
  };

  rules = [
    new Rule({
      name: 'Use core spells as often as possible',
      description: <React.Fragment>Spells such as <SpellLink id={SPELLS.FLANKING_STRIKE.id} /> should be used as often as possible. You'll also want to be using cooldowns such as <SpellLink id={SPELLS.SPITTING_COBRA_TALENT.id} /> and <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} /> as often as possible (whilst still hitting them at opportune moments). <a href="https://www.icy-veins.com/wow/survival-hunter-pve-dps-rotation-cooldowns-abilities" target="_blank" rel="noopener noreferrer">More info.</a></React.Fragment>,
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.FLANKING_STRIKE,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.THROWING_AXES_TALENT,
            when: combatant.hasTalent(SPELLS.THROWING_AXES_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.EXPLOSIVE_TRAP_CAST,
            onlyWithSuggestion: false,
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL,
            when: combatant.hasTalent(SPELLS.A_MURDER_OF_CROWS_TALENT_SURVIVAL.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SNAKE_HUNTER_TALENT,
            when: combatant.hasTalent(SPELLS.SNAKE_HUNTER_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.CALTROPS_TALENT,
            when: combatant.hasTalent(SPELLS.CALTROPS_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.STEEL_TRAP_TALENT,
            when: combatant.hasTalent(SPELLS.STEEL_TRAP_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.BUTCHERY_TALENT,
            when: combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.DRAGONSFIRE_GRENADE_TALENT,
            when: combatant.hasTalent(SPELLS.DRAGONSFIRE_GRENADE_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.SPITTING_COBRA_TALENT,
            when: combatant.hasTalent(SPELLS.SPITTING_COBRA_TALENT.id),
          }),
          new GenericCastEfficiencyRequirement({
            spell: SPELLS.ASPECT_OF_THE_EAGLE,
            onlyWithSuggestion: false,
          }),
          new Requirement({
            name: <React.Fragment>Good <SpellLink id={SPELLS.ASPECT_OF_THE_EAGLE.id} /> casts</React.Fragment>,
            check: () => this.aspectOfTheEagle.badAspectCastsThreshold,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.LACERATE.id} /> uptime</React.Fragment>,
            check: () => this.lacerate.uptimeThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Bad refreshes of <SpellLink id={SPELLS.LACERATE.id} /></React.Fragment>,
            check: () => this.lacerate.refreshingThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: 'Pick the right tools for the fight',
      description: 'The throughput gain of some talents or legendaries might vary greatly. Consider switching to a more reliable alternative if something is underperforming regularly, even after trying to improve your usage of said talent or legendary.',
      requirements: () => {
        const combatant = this.combatants.selected;
        return [
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.CALTROPS_TALENT.id} /> uptime</React.Fragment>,
            when: combatant.hasTalent(SPELLS.CALTROPS_TALENT.id),
            check: () => this.caltrops.uptimeThreshold,
          }),
          new Requirement({
            name: <React.Fragment><SpellLink id={SPELLS.BUTCHERY_TALENT.id} /> efficiency</React.Fragment>,
            when: combatant.hasTalent(SPELLS.BUTCHERY_TALENT.id),
            check: () => this.butcheryCarve.averageTargetsThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Times<SpellLink id={SPELLS.WAY_OF_THE_MOKNATHAL_TALENT.id} /> dropped</React.Fragment>,
            when: combatant.hasTalent(SPELLS.WAY_OF_THE_MOKNATHAL_TALENT.id),
            check: () => this.wayOfTheMokNathal.timesDroppedThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Unused <ItemLink id={ITEMS.BUTCHERS_BONE_APRON.id} /> stacks</React.Fragment>,
            when: combatant.hasChest(ITEMS.BUTCHERS_BONE_APRON.id),
            check: () => this.butchersBoneApron.unusedStacksThreshold,
          }),
          new Requirement({
            name: <React.Fragment>Capped <ItemLink id={ITEMS.BUTCHERS_BONE_APRON.id} /> stacks</React.Fragment>,
            when: combatant.hasChest(ITEMS.BUTCHERS_BONE_APRON.id),
            check: () => this.butchersBoneApron.cappedStacksThreshold,
          }),
        ];
      },
    }),
    new Rule({
      name: <React.Fragment><Icon
        icon="spell_mage_altertime"
        alt="Casting downtime"
        style={{
          height: '1.3em',
          marginTop: '-.1em',
        }}
      /> Downtime & <ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> focus capping </React.Fragment>,
      description: <React.Fragment> Try to reduce the delay between casting spells. If everything is on cooldown, try and use <SpellLink id={SPELLS.RAPTOR_STRIKE.id} /> to stay off the focus cap and do some damage.</React.Fragment>,
      requirements: () => {
        return [
          new Requirement({
            name: <React.Fragment><Icon
              icon="spell_mage_altertime"
              alt="Casting downtime"
              style={{
                height: '1.3em',
                marginTop: '-.1em',
              }}
            /> Downtime</React.Fragment>,
            check: () => this.alwaysBeCasting.suggestionThresholds,
          }),
          new Requirement({
            name: <React.Fragment><ResourceIcon id={RESOURCE_TYPES.FOCUS.id} /> Time focus capped</React.Fragment>,
            check: () => this.timeFocusCapped.suggestionThresholds,
          }),
        ];
      },
    }),
    new PreparationRule(),
  ];

}

export default Checklist;
