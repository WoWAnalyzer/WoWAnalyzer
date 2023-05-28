/**
 * Converts a color from common CSS format into format needed by Vega-Lite.
 * Input format: '#rrggbb', where rr gg and bb are two digit hex values
 * Output format: 'rgb(r,g,b)', where r g and b are decimal values
 */
export default function convertColor(color: string): string {
  if (color.length !== 7 || !color.startsWith('#')) {
    console.error(
      'Got color to convert with bad format: ' + color + ' - will be replaced with white.',
    );
    return '#ffffff';
  }
  const r = '0x' + color[1] + color[2];
  const g = '0x' + color[3] + color[4];
  const b = '0x' + color[5] + color[6];
  return 'rgb(' + Number(r) + ',' + Number(g) + ',' + Number(b) + ')';
}
