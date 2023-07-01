import { Section } from 'interface/guide';

export function IntroSection() {
  return (
    <Section title="Preface">
      <p>
        Hello and welcome to the analyzer for the Augmentation Evoker spec! All the theorycrafting
        comes hot and fresh from the official{' '}
        <a href="https://discord.com/invite/evoker">Evoker Discord</a>. With specials thanks to{' '}
        <code>Zindurn</code> for his assistance with the analysis.
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
