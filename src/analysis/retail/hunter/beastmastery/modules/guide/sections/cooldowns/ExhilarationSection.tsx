import { Section, useAnalyzer } from 'interface/guide';
import ExhilarationTiming from 'analysis/retail/hunter/shared/guide/defensives/Exhiliration';

export default function ExhilarationSection() {
  const exhilaration = useAnalyzer(ExhilarationTiming);
  if (!exhilaration) {
    return null;
  }

  return <Section title="Exhilaration">{exhilaration.guideSubsection}</Section>;
}
