import { GuideProps } from 'interface/guide';
import CombatLogParser from '../../CombatLogParser';
import { DeathStrikeSection } from '../spells/DeathStrike/DeathStrikeSection';

export default function BloodGuide(props: GuideProps<typeof CombatLogParser>): JSX.Element {
  return (
    <>
      <DeathStrikeSection />
    </>
  );
}
