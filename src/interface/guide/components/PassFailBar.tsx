/**
 * A simplified form of the Checklist's success meters.
 *
 * # Props
 * - `pass` - The number of successes.
 * - `total` - The number of events that *could have* succeeded (also known as `successes + failures`).
 *
 * # Styles
 *
 * You can control the colors of this component by wrapping it in a container
 * `div` and setting the `background-color` for the `.pass-bar` and `.fail-bar`
 * classes.
 *
 * For an example, see the Brewmaster `PurifyReasonBreakdown` component, which
 * sets `.fail-bar` to be transparent.
 */
export default function PassFailBar({
  pass,
  total,
  className,
  passTooltip,
  failTooltip,
}: {
  pass: number;
  total: number;
  className?: string;
  passTooltip?: string;
  failTooltip?: string;
}) {
  const perf = Math.min(pass / total, 1);
  return (
    <div className={`pass-fail-bar-container ${className ?? ''}`}>
      <div className="pass-bar" title={passTooltip} style={{ minWidth: `${perf * 100}%` }} />
      {perf < 1 && (
        <div
          className="fail-bar"
          title={failTooltip}
          style={{ minWidth: `${(1 - perf) * 100}%` }}
        />
      )}
    </div>
  );
}
