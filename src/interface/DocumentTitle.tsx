import { Helmet } from 'react-helmet';

const siteName = 'WoWAnalyzer';

interface DocumentTitleProps {
  title?: string;
}

const DocumentTitle = ({ title }: DocumentTitleProps) => (
  <Helmet>
    <title>{title ?? siteName}</title>
  </Helmet>
);

export default DocumentTitle;
