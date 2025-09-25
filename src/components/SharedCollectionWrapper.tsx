import { SharedCollectionView } from './sharing/SharedCollectionView';

// Wrapper component to handle the router props
// This wrapper ensures shared collections are completely isolated from main app auth logic
export function SharedCollectionWrapper(props: any) {
  // Apply basic theme setup for shared collection views
  return (
    <div className="shared-collection-view">
      <SharedCollectionView {...props} />
    </div>
  );
}