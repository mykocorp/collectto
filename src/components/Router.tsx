import { useState, useEffect } from 'react';

// Simple hash-based router for our app
export function useRouter() {
  const [currentPath, setCurrentPath] = useState(() => {
    // Initialize from both hash and pathname to handle shared links
    const hash = window.location.hash.slice(1);
    const pathname = window.location.pathname;
    
    // If pathname contains '/shared/', convert it to hash format
    if (pathname.includes('/shared/')) {
      const parts = pathname.split('/shared/');
      if (parts.length > 1 && parts[1]) {
        const shareId = parts[1].split('?')[0]; // Remove any query params
        const newHash = `/shared/${shareId}`;
        if (!hash) {
          // Only set hash if there isn't one already
          window.location.hash = newHash;
        }
        return newHash;
      }
    }
    
    // If pathname contains '/auth/confirm', handle that too
    if (pathname.includes('/auth/confirm')) {
      const authPath = '/auth/confirm';
      if (!hash) {
        window.location.hash = authPath + (window.location.search || '');
      }
      return authPath + (window.location.search || '');
    }
    
    return hash || '/';
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentPath(window.location.hash.slice(1) || '/');
    };

    const handlePopState = () => {
      // Handle browser back/forward for both hash and pathname changes
      const hash = window.location.hash.slice(1);
      const pathname = window.location.pathname;
      
      if (pathname.includes('/shared/')) {
        const shareId = pathname.split('/shared/')[1]?.split('?')[0];
        if (shareId) {
          const newHash = `/shared/${shareId}`;
          if (!hash) {
            window.location.hash = newHash;
          }
          setCurrentPath(newHash);
          return;
        }
      }
      
      if (pathname.includes('/auth/confirm')) {
        const authPath = '/auth/confirm';
        if (!hash) {
          window.location.hash = authPath + (window.location.search || '');
        }
        setCurrentPath(authPath + (window.location.search || ''));
        return;
      }
      
      setCurrentPath(hash || '/');
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handlePopState);
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return { currentPath, navigate };
}

interface Route {
  path: string;
  component: React.ComponentType<any>;
}

interface RouterProps {
  routes: Route[];
}

export function Router({ routes }: RouterProps) {
  const { currentPath } = useRouter();

  // Handle URL with query parameters (e.g., confirmation links)
  const [basePath, queryString] = currentPath.split('?');
  const queryParams: Record<string, string> = {};
  
  if (queryString) {
    queryString.split('&').forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        queryParams[key] = decodeURIComponent(value);
      }
    });
  }



  // First, check for exact matches (non-parameterized routes)
  const exactRoute = routes.find(route => !route.path.includes(':') && route.path === basePath);
  if (exactRoute) {
    const Component = exactRoute.component;
    return <Component {...queryParams} />;
  }

  // Then, match routes with parameters (e.g., /shared/:shareId)
  for (const route of routes) {
    if (route.path.includes(':')) {
      const routeParts = route.path.split('/');
      const pathParts = basePath.split('/');
      
      if (routeParts.length === pathParts.length) {
        const params: Record<string, string> = {};
        let matches = true;
        
        for (let i = 0; i < routeParts.length; i++) {
          if (routeParts[i].startsWith(':')) {
            params[routeParts[i].slice(1)] = pathParts[i];
          } else if (routeParts[i] !== pathParts[i]) {
            matches = false;
            break;
          }
        }
        
        if (matches) {
          const Component = route.component;
          return <Component {...params} {...queryParams} />;
        }
      }
    }
  }
  
  // If we're trying to access a shared route but it didn't match, show an error instead of defaulting
  if (basePath.startsWith('/shared/')) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Shared Collection Not Found</h2>
          <p className="text-muted-foreground">The shared collection URL appears to be invalid.</p>
          <p className="text-sm text-muted-foreground mt-2">Current path: {currentPath}</p>
          <p className="text-sm text-muted-foreground">Base path: {basePath}</p>
        </div>
      </div>
    );
  }

  // Default to first route if no match
  const Component = routes[0]?.component;
  return Component ? <Component /> : null;
}