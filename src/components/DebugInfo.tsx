import { useState, useEffect } from 'react';
import { ShareLinkTester } from './sharing/ShareLinkTester';

export function DebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const updateDebugInfo = () => {
      setDebugInfo({
        href: window.location.href,
        origin: window.location.origin,
        pathname: window.location.pathname,
        hash: window.location.hash,
        search: window.location.search,
        hostname: window.location.hostname,
        protocol: window.location.protocol,
        port: window.location.port
      });
    };

    updateDebugInfo();
    
    // Update on hash change
    const handleChange = () => updateDebugInfo();
    window.addEventListener('hashchange', handleChange);
    window.addEventListener('popstate', handleChange);
    
    return () => {
      window.removeEventListener('hashchange', handleChange);
      window.removeEventListener('popstate', handleChange);
    };
  }, []);

  // Only show in development or when explicitly enabled
  const showDebug = window.location.search.includes('debug=true');
  
  if (!showDebug) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg p-4 max-w-sm text-xs z-50 shadow-lg space-y-3">
      <div>
        <h3 className="font-bold mb-2">Debug Info</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      <ShareLinkTester />
    </div>
  );
}