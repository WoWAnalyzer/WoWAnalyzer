import { Link } from 'react-router-dom';

export function Component() {
  return (
    <div className="container">
      <h1>404: Content not found</h1>

      <Link to="/">Go back home</Link>
    </div>
  );
}
