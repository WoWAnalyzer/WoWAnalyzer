/**
 * The overall guide container. You will never need this, it is used by the WoWA
 * core to hold your `Guide` component.
 */
const GuideContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="guide-container">{children}</div>
);

export default GuideContainer;
