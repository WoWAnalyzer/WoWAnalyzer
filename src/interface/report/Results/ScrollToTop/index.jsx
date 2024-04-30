import Logo from 'interface/images/logo.svg?react';

// This has an elevator music easter egg that occurs randomly once every 5 times.
// Lazy load it to minimize bundle impact. This whole joke has a tiny amount of overhead.
let elevator;
async function loadElevator() {
  elevator = (await import('./elevate')).default;
}
let useElevator = Math.random() < 0.1;

function scrollToTop() {
  if (!useElevator || !elevator) {
    window.scrollTo(0, 0);
  } else {
    elevator();
    // Only do it once to increase ~~confusion~~ mystery
    useElevator = false;
  }
}

const ScrollToTop = () => (
  <div
    className="clickable text-right"
    onClick={scrollToTop}
    onMouseEnter={useElevator ? loadElevator : undefined}
  >
    <Logo style={{ '--arrow': '#fab700', '--main': '#1c1c1b', maxWidth: 50 }} />
  </div>
);

export default ScrollToTop;
