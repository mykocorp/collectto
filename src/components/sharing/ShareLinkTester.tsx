import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

export function ShareLinkTester() {
  const [shareId, setShareId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testShareLink = async () => {
    if (!shareId.trim()) return;

    setLoading(true);
    try {
      const url = `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/shared/${shareId.trim()}`;
      console.log('Testing URL:', url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });

      console.log('Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        setResult({ success: true, data });
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setResult({ success: false, error: errorData });
      }
    } catch (error) {
      console.error('Test failed:', error);
      setResult({ success: false, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg space-y-4">
      <h3 className="text-lg font-semibold">Share Link Tester</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter share ID to test"
          value={shareId}
          onChange={(e) => setShareId(e.target.value)}
        />
        <Button onClick={testShareLink} disabled={loading}>
          {loading ? 'Testing...' : 'Test'}
        </Button>
      </div>
      
      {result && (
        <div className="mt-4">
          <h4 className="font-medium">Result:</h4>
          <pre className="bg-muted p-2 rounded text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}