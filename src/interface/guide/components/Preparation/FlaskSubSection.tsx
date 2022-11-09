import { SubSection, useAnalyzer, useInfo } from 'interface/guide/index';
import FlaskChecker from 'parser/retail/modules/items/FlaskChecker';

const FlaskSubSection = () => {
  const flaskChecker = useAnalyzer(FlaskChecker);
  const info = useInfo();
  if (!flaskChecker || !info) {
    return null;
  }

  return (
    <SubSection title="Flask Use">
      <p>Appropriate flask use is an easy way to improve your throughput.</p>
      <strong>Flask use details coming soon!</strong>
    </SubSection>
  );
};

export default FlaskSubSection;
