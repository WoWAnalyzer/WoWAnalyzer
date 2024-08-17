import { TALENTS_PALADIN } from 'common/TALENTS';
import { GapHighlight } from 'parser/ui/CooldownBar';
import CastEfficiencyBar from 'parser/ui/CastEfficiencyBar';
import { SubSection, useInfo } from 'interface/guide';
import SPELLS from 'common/SPELLS';

const talentsToCheck = [
  TALENTS_PALADIN.DIVINE_TOLL_TALENT,
  TALENTS_PALADIN.TYRS_DELIVERANCE_TALENT,
  TALENTS_PALADIN.HAND_OF_DIVINITY_TALENT,
  TALENTS_PALADIN.AURA_MASTERY_TALENT,
  TALENTS_PALADIN.BLESSING_OF_SACRIFICE_TALENT,
];

const CooldownGraphSubsection = () => {
  const info = useInfo();
  if (!info) {
    return null;
  }

  const talentedCooldowns = talentsToCheck.filter((cooldown) => {
    return info.combatant.hasTalent(cooldown);
  });

  return (
    <SubSection>
      <p>
        <strong>Cooldown Graph</strong> - this graph shows when you used your cooldowns and how long
        you waited to use them again. Grey segments show when the spell was available, yellow
        segments show when the spell was cooling down. Red segments highlight times when you could
        have fit a whole extra use of the cooldown.
      </p>
      <p>
        Holy Paladin is deeply reliant on its cooldown to function.{' '}
        <strong>You should use them as close to on cooldown as possible !</strong>
      </p>
      <CastEfficiencyBar
        spellId={SPELLS.AVENGING_WRATH.id}
        gapHighlightMode={GapHighlight.FullCooldown}
      />
      {talentedCooldowns.map((cooldownCheck) => (
        <CastEfficiencyBar
          key={cooldownCheck.id}
          spellId={cooldownCheck.id}
          gapHighlightMode={GapHighlight.FullCooldown}
        />
      ))}
    </SubSection>
  );
};

export default CooldownGraphSubsection;
