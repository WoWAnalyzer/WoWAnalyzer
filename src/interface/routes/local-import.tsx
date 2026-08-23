import Panel from 'interface/Panel';
import LocalReportSelector from 'interface/LocalReportSelector';

export function Component() {
  return (
    <main className="container offset">
      <Panel title="Local file (experimental)">
        <LocalReportSelector />
      </Panel>
    </main>
  );
}
