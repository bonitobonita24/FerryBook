import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './MOCKUP.jsx';
import MeetingMinutesApp from './MeetingMinutesApp.jsx';

function Router() {
  const path = typeof window !== 'undefined' ? window.location.pathname : '/';
  const match = path.match(/^\/meetings\/([^/]+)\/?$/);
  if (match) return <MeetingMinutesApp slug={decodeURIComponent(match[1])} />;
  return <App />;
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
);
