import { Section } from 'interface/guide';

export function IntroSection() {
  return (
    <Section title="Preface">
      <p>
        Hello and welcome to the analyzer for the Augmentation Evoker spec! All the theorycrafting
        comes hot and fresh from the official{' '}
        <a href="https://discord.com/invite/evoker">Evoker Discord</a>.
      </p>
      <p>
        For more indepth information about the spec, you should check out these guides:{' '}
        <a href="https://www.wowhead.com/guide/classes/evoker/augmentation/dragonflight-season-2">
          Wowhead
        </a>
        , <a href="https://www.icy-veins.com/wow/augmentation-evoker-buffs">Icy-Veins</a>
      </p>
      <p>
        The analyzer is currently in early development and will be updated regularly. If you have
        any suggestions, corrections, complaints, or want to help, I'm happy to talk over at{' '}
        <code>#augmentation</code> in the{' '}
        <a href="https://discord.com/invite/evoker">Evoker Discord</a>.
      </p>
    </Section>
  );
}
