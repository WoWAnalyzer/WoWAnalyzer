import { Section } from 'interface/guide';

export function IntroSection() {
  return (
    <Section title="Introduction">
      <p>
        Hello and welcome to the analyzer for the Unholy Death Knight specialization! All
        information is sourced from the latest class guides on{' '}
        <a href="https://www.wowhead.com/unholy-death-knight-guide">Wowhead</a> and{' '}
        <a href="https://www.icy-veins.com/wow/unholy-death-knight-pve-dps-guide">Icy Veins</a>
      </p>
      <p>
        Unholy is all about spreading diseases, managing your undead army, and syncing your
        cooldowns to deliver devastating burst windows. This tool helps identify room for
        improvement in rotation, buff uptime, cooldown usage, and overall execution.
      </p>
      <p>
        The analysis here is based on general guidelines and doesn’t always account for specific
        fight mechanics or edge cases. For the most accurate benchmarking, compare your performance
        to other top Unholy Death Knights in the same encounter using Warcraft Logs. (
        <a href="https://www.warcraftlogs.com/zone/rankings/42?boss=3014&class=DeathKnight&spec=Unholy">
          Mythic One-Armed Bandit Top 100
        </a>
        )
      </p>
      <p>
        If you have any questions, feedback, or suggestions, feel free to reach out in the{' '}
        <a href="https://discord.gg/acherus">Acherus Discord</a>.
      </p>
    </Section>
  );
}
