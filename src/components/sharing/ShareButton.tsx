import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Share2, Loader2, Copy, ExternalLink } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { Collection } from '../../App';
import { projectId, publicAnonKey } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface ShareButtonProps {
  collection: Collection;
  onShareStatusChange?: (isShared: boolean, shareId?: string) => void;
}

interface ShareData {
  shareId: string;
  shareUrl: string;
}

export function ShareButton({ collection, onShareStatusChange }: ShareButtonProps) {
  const { user, getAccessToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [userShares, setUserShares] = useState<any[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  // Check if collection is already shared
  useEffect(() => {
    if (user) {
      loadUserShares();
    }
  }, [user, collection.id]);

  const loadUserShares = async () => {
    try {
      const token = await getAccessToken();
      if (!token) return;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/user/shares`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUserShares(data.shares);
        
        const existingShare = data.shares.find(
          (share: any) => share.collectionId === collection.id
        );
        
        if (existingShare) {
          const shareData = {
            shareId: existingShare.shareId,
            shareUrl: `#/shared/${existingShare.shareId}`
          };
          setShareData(shareData);
          onShareStatusChange?.(true, existingShare.shareId);
        } else {
          setShareData(null);
          onShareStatusChange?.(false);
        }
      }
    } catch (error) {
      console.error('Error loading user shares:', error);
    }
  };

  const handleShare = async () => {
    if (!user) {
      toast.error('Please sign in to share collections');
      return;
    }

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/share`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ collection })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setShareData(data);
        onShareStatusChange?.(true, data.shareId);
        toast.success('Collection shared successfully!');
        setPopoverOpen(true); // Auto-open the published popup
        await loadUserShares(); // Refresh shares
      } else {
        toast.error(data.error || 'Failed to share collection');
      }
    } catch (error) {
      console.error('Error sharing collection:', error);
      toast.error('Failed to share collection');
    } finally {
      setLoading(false);
    }
  };

  const handleUnshare = async () => {
    if (!shareData) return;

    setLoading(true);
    try {
      const token = await getAccessToken();
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-0d942fc1/share/${shareData.shareId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        setShareData(null);
        onShareStatusChange?.(false);
        toast.success('Collection unshared successfully!');
        await loadUserShares(); // Refresh shares
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to unshare collection');
      }
    } catch (error) {
      console.error('Error unsharing collection:', error);
      toast.error('Failed to unshare collection');
    } finally {
      setLoading(false);
    }
  };

  const copyShareLink = () => {
    if (shareData) {
      const fullUrl = `${window.location.origin}/#/shared/${shareData.shareId}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success('Share link copied to clipboard!');
    }
  };

  const openSharedView = () => {
    if (shareData) {
      const fullUrl = `${window.location.origin}/#/shared/${shareData.shareId}`;
      window.open(fullUrl, '_blank');
    }
  };

  if (!user) {
    return (
      <Button 
        variant="outline" 
        size="sm"
        disabled
        title="Sign in to share collections"
      >
        <Share2 className="h-4 w-4 mr-1" />
        Publish
      </Button>
    );
  }

  if (shareData) {
    return (
      <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-1" />
            Published
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium">Collection is published</h4>
              <p className="text-sm text-muted-foreground">
                Anyone with the link can view this collection
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={copyShareLink}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openSharedView}
                title="Open shared collection in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <Button
              variant="destructive"
              size="sm"
              onClick={handleUnshare}
              disabled={loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Unpublish
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleShare}
      disabled={loading}
    >
      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      <Share2 className="h-4 w-4 mr-1" />
      Publish
    </Button>
  );
}