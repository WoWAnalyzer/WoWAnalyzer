import { BadMark, GoodMark } from './Marks';

/** Shows a glyph - either a green checkmark or a red X depending on if 'pass' is true */
const PassFailCheckmark = ({ pass }: { pass: boolean }) => (pass ? <GoodMark /> : <BadMark />);

export default PassFailCheckmark;
