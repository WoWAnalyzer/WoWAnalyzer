export default function loadScript(src: string, type = 'text/javascript') {
  const script = document.createElement('script');
  script.type = type;
  script.src = src;
  document.body.appendChild(script);
}
