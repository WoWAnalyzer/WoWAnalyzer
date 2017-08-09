import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import ItemLink from 'common/ItemLink';

export default {
  descriptions: {
    // lv 15
    [SPELLS.BRAMBLES_TALENT.id]: <span>Brambles is a passive ability and has a small damage reduction, it is the only dps ability on this tier and with <SpellLink id={SPELLS.BARKSKIN.id} /> it pulses extra damage. It doesn't generate any rage.</span>,
    [SPELLS.BRISTLING_FUR_TALENT.id]: <span>Bristling Fur is the best talent for single target rage generation, it has a relatively short cooldown and should be used if that will not be wasted.</span>,
    [SPELLS.BLOOD_FRENZY_TALENT.id]: <span>Blood Frenzy is the go-to AOE talent and should be used when there are consistently 2+ targets for rage generation if rage is not an issue Brambles is usable.</span>,
    // lv 30
    [SPELLS.GUTTURAL_ROARS_TALENT.id]: <span>Gutteral Roars increases the range of both <SpellLink id={SPELLS.STAMPEDING_ROAR_BEAR.id} /> and <SpellLink id={SPELLS.INCAPACITATING_ROAR.id} /> by 200% and 100% respectively, its a good default talent.</span>,
    [SPELLS.INTIMIDATING_ROAR_TALENT.id]: <span>Intimidating roar is very similar to incapacitating roar but also includes a root for 3s, its not normally required.</span>,
    [SPELLS.WILD_CHARGE_TALENT.id]: <span>Wild charge allows you to charge at an enemy and immobilise them for 4s, the immobilise does not apply to bosses.</span>,
    // lv 45
    [SPELLS.BALANCE_AFFINITY_TALENT_SHARED.id]: <span>Balance Affinity grants you the <a href="http://www.wowhead.com/spell=197524" target="_blank" rel="noopener noreferrer">Astral Influence</a> passive which increases the range of all of your abilities by 5 yards, very good in dungeons but the heal from <SpellLink id={SPELLS.RESTORATION_AFFINITY_TALENT.id} /> is generally more preferred in raids.</span>,
    [SPELLS.FERAL_AFFINITY_TALENT_GUARDIAN.id]: <span>Feral affinity give you a 15% movement speed bonus and is the highest damage output of this tier using <SpellLink id={SPELLS.CAT_FORM.id} /> and the feral spec abilities you gain.</span>,
    [SPELLS.RESTORATION_AFFINITY_TALENT.id]: <span>Restoration Affinity grants <SpellLink id={SPELLS.YSERAS_GIFT_BEAR.id} />, a passive heal for you (or nearby ally) it also gives access to a few situational restoration abilities but they will shift you out of Bear form. </span>,
    // lv 60
    [SPELLS.MIGHTY_BASH_TALENT.id]: <span>Mighty bash is a single target stun on a 50s cooldown, useful if you need a stun.</span>,
    [SPELLS.MASS_ENTANGLEMENT_TALENT.id]: <span>Mass entanglement has some uses, but easily breaks on damage.</span>,
    [SPELLS.TYPHOON_TALENT.id]: <span>Typhoon giving a 30s cooldown knockback will give you the most utility of this tier.</span>,
    // lv 75
    [SPELLS.SOUL_OF_THE_FOREST_TALENT_GUARDIAN.id]: <span>Soul of the Forest is the best rage for single target encounters, make sure you make good use of your <SpellLink id={SPELLS.GORE_BEAR.id} /> procs.</span>,
    [SPELLS.INCARNATION_GUARDIAN_OF_URSOC_TALENT.id]: <span>incarnation gives yo ua huge amount of burst for 30s every 3m, buffing your damage and removing the cooldown from Thrash, Mangle and Growl. However the other two talents on this tier will give you more rage over the course of the encounter.</span>,
    [SPELLS.GALACTIC_GUARDIAN_TALENT.id]: <span>Galactic guardian is the best rage generation for 2+ targets also buffs the damage of <SpellLink id={SPELLS.MOONFIRE.id} /> which can have some uses.</span>,
    // lv 90
    [SPELLS.EARTHWARDEN_TALENT.id]: <span>Earth warden gets stacks from <SpellLink id={SPELLS.THRASH_BEAR.id} /> which reduces auto-attack damage it has limited use because it doesn't affect special attacks.</span>,
    [SPELLS.GUARDIAN_OF_ELUNE_TALENT.id]: <span>The best talent on this tier, increasing the duration of <SpellLink id={SPELLS.IRONFUR.id} /> by 2s and the healing of <SpellLink id={SPELLS.FRENZIED_REGENERATION.id} /> by 25% following a mangle.</span>,
    [SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id]: <span>Survival of the Fittest is useful on encounters when the cooldown reduction allows you to line up <SpellLink id={SPELLS.BARKSKIN.id} /> and <SpellLink id={SPELLS.SURVIVAL_INSTINCTS.id} /> with large special attacks.</span>,
    // lv 100
    [SPELLS.REND_AND_TEAR_TALENT.id]: <span>This talent is the only passive choice on this tier and is very strong when combined with <ItemLink id={ITEMS.ELIZES_EVERLASTING_ENCASEMENT.id} /></span>,
    [SPELLS.LUNAR_BEAM_TALENT.id]: <span>Lunar beam has limited use but can be used for burse AOE if needed.</span>,
    [SPELLS.PULVERIZE_TALENT.id]: <span>Pulverize gives the best damage reduction of this tier unless you have <ItemLink id={ITEMS.ELIZES_EVERLASTING_ENCASEMENT.id} />.</span>,
  },
   attribution: <span>Parts of the descriptions for talents came from the <a href="http://www.icy-veins.com/wow/guardian-druid-pve-tank-spec-builds-talents" target="_blank" rel="noopener noreferrer">Icy Veins Guardian Druid guide</a>.</span>,
};
