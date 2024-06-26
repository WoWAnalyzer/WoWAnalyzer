import { useMemo } from 'react';
import { SubSection, useInfo } from '../index';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import Explanation from '../components/Explanation';
import CooldownGraphSubsection, { Cooldown } from '../components/CooldownGraphSubSection';
import AlertInfo from 'interface/AlertInfo';
import { FoundationHighlight as HL } from './shared';

interface Props {
  cooldowns?: Cooldown[];
}

export function FoundationCooldownSection({
  cooldowns: manualCooldowns,
}: Props): JSX.Element | null {
  const abilities = useInfo()?.abilities;
  const cooldowns = useMemo(
    () =>
      manualCooldowns ??
      abilities
        ?.filter(
          (ability) =>
            ability.enabled &&
            ability.category === SPELL_CATEGORY.COOLDOWNS &&
            maybeGetTalentOrSpell(ability.primarySpell),
        )
        .sort((a, b) => b.cooldown - a.cooldown)
        .map((ability) => ({
          spell: maybeGetTalentOrSpell(ability.primarySpell)!,
          isActive: () => true,
        })),
    [manualCooldowns, abilities],
  );

  if (!cooldowns || cooldowns.length === 0) {
    return null;
  }

  return (
    <SubSection title="Use Your Cooldowns">
      <Explanation>
        <p>
          Perfect cooldown usage is a combination of in-depth fight knowledge and player skill.
          However, 90% of the time you can get 90% of those results by{' '}
          <strong>making sure to use every cooldown available to you.</strong>
        </p>
        <p>
          The key idea is to <HL>use your cooldowns as many times as you can.</HL> For example, you
          can use a 2-minute cooldown <em>at most</em> 3 times in a 2m 30s boss fight. As long as
          you hit all 3 uses, it is okay to delay it for a better time.
        </p>
      </Explanation>
      <p>
        <CooldownGraphSubsection cooldowns={cooldowns} />
      </p>
      <AlertInfo>
        Getting the most out of your cooldowns requires up-to-date knowledge of your spec and the
        boss fights. We highly recommend finding a community for your class like the{' '}
        <a href="https://www.wowhead.com/discord-servers">Community Discords</a> to get more
        information about improving your cooldown use!
      </AlertInfo>
    </SubSection>
  );
}
