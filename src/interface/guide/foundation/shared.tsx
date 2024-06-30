import { Highlight } from 'interface/Highlight';

export const FoundationHighlight = ({ children }: { children: React.ReactNode }) => (
  <Highlight color="#fbcc4cee" textColor="#111">
    {children}
  </Highlight>
);
