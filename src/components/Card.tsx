import { useState, useRef, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Edit, Trash2, ExternalLink, MoreHorizontal, Star } from 'lucide-react';
import { Card as CardType } from '../App';

interface CardProps {
  card: CardType;
  columnId: string;
  index: number;
  onUpdateCard: (updatedCard: CardType) => void;
  onDeleteCard: () => void;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
  statusColor: string;
  showRating: boolean;
  readOnly?: boolean;
}

export function Card({ 
  card, 
  columnId, 
  index, 
  onUpdateCard, 
  onDeleteCard, 
  onMoveCard,
  statusColor,
  showRating,
  readOnly = false
}: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedCard, setEditedCard] = useState(card);
  const [editingLinks, setEditingLinks] = useState<Set<number>>(new Set());
  const [dropPosition, setDropPosition] = useState<'top' | 'bottom' | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isEditingRef = useRef(false);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: 'card',
    item: { id: card.id, columnId, index },
    canDrag: () => !readOnly && !isEditing,
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging()
    })
  });

  const [{ handlerId, isOver }, drop] = useDrop({
    accept: 'card',
    canDrop: () => !isEditing,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
        isOver: !!monitor.isOver() && !isEditing
      };
    },
    hover(item: { id: string; columnId: string; index: number }, monitor) {
      if (!ref.current || isEditing) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragColumnId = item.columnId;
      const hoverColumnId = columnId;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragColumnId === hoverColumnId) {
        setDropPosition(null);
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

      // Set drop position indicator
      if (hoverClientY < hoverMiddleY) {
        setDropPosition('top');
      } else {
        setDropPosition('bottom');
      }

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      if (!readOnly) {
        onMoveCard(item.id, dragColumnId, hoverColumnId, hoverIndex);
      }

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
      item.columnId = hoverColumnId;
    },
    drop() {
      setDropPosition(null);
    }
  });

  // Only attach drag/drop handlers when not editing
  if (!isEditing) {
    drag(drop(ref));
  }

  // Auto-save changes when editedCard changes (debounced)
  useEffect(() => {
    if (isEditingRef.current && editedCard !== card && isEditing) {
      const timeoutId = setTimeout(() => {
        onUpdateCard(editedCard);
      }, 500); // 500ms delay

      return () => clearTimeout(timeoutId);
    }
  }, [editedCard, onUpdateCard, card, isEditing]);

  // Update ref when editing state changes
  useEffect(() => {
    isEditingRef.current = isEditing;
    
    // Clear drop position when starting to edit
    if (isEditing) {
      setDropPosition(null);
      
      // Focus title input and place cursor at end
      setTimeout(() => {
        if (titleInputRef.current) {
          titleInputRef.current.focus();
          const length = titleInputRef.current.value.length;
          titleInputRef.current.setSelectionRange(length, length);
        }
      }, 100); // Small delay to ensure dialog is fully rendered
    }
  }, [isEditing]);

  // Clear drop position when not being hovered or when editing
  useEffect(() => {
    if (!isOver || isEditing) {
      setDropPosition(null);
    }
  }, [isOver, isEditing]);



  const closeEdit = () => {
    // Final save when closing
    if (editedCard !== card) {
      onUpdateCard(editedCard);
    }
    isEditingRef.current = false;
    setIsEditing(false);
    setEditingLinks(new Set()); // Reset editing links
    setDropPosition(null); // Clear any drop position
  };

  const addLink = () => {
    const newIndex = editedCard.links.length;
    setEditedCard(prev => ({
      ...prev,
      links: [...prev.links, '']
    }));
    setEditingLinks(prev => new Set([...prev, newIndex]));
  };

  const updateLink = (linkIndex: number, value: string) => {
    setEditedCard(prev => ({
      ...prev,
      links: prev.links.map((link, i) => i === linkIndex ? value : link)
    }));
  };

  const removeLink = (linkIndex: number) => {
    setEditedCard(prev => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== linkIndex)
    }));
    setEditingLinks(prev => {
      const newSet = new Set(prev);
      newSet.delete(linkIndex);
      // Update indices for remaining links
      const updatedSet = new Set();
      newSet.forEach(index => {
        if (index > linkIndex) {
          updatedSet.add(index - 1);
        } else {
          updatedSet.add(index);
        }
      });
      return updatedSet;
    });
  };

  const commitLinkEdit = (linkIndex: number) => {
    setEditingLinks(prev => {
      const newSet = new Set(prev);
      newSet.delete(linkIndex);
      return newSet;
    });
  };

  const handleLinkKeyDown = (e: React.KeyboardEvent, linkIndex: number) => {
    if (e.key === 'Enter') {
      commitLinkEdit(linkIndex);
    }
  };

  const setRating = (rating: number) => {
    setEditedCard(prev => ({
      ...prev,
      rating
    }));
  };

  const renderStars = (rating: number | undefined, isEditable: boolean = false) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          className={`${isEditable ? 'cursor-pointer hover:text-yellow-400' : 'cursor-default'} transition-colors ${
            i <= (rating || 0) ? 'text-yellow-400' : 'text-muted-foreground'
          }`}
          onClick={isEditable ? () => setRating(i) : undefined}
          disabled={!isEditable}
        >
          <Star className="w-3 h-3" fill={i <= (rating || 0) ? 'currentColor' : 'none'} />
        </button>
      );
    }
    return stars;
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't open edit dialog if read-only, dragging, or if clicking on dropdown
    if (readOnly || isDragging || e.defaultPrevented) {
      return;
    }
    
    // Don't open if clicking on interactive elements
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a')) {
      return;
    }
    
    // Reset edited card to current card state when opening
    setEditedCard(card);
    setIsEditing(true);
  };

  return (
    <div className="relative">
      {/* Drop indicator - top */}
      {dropPosition === 'top' && (
        <div className="absolute -top-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
      )}
      
      <div
        ref={ref}
        data-handler-id={handlerId}
        onClick={isEditing ? undefined : handleCardClick}
        className={`group bg-background rounded-md border border-border p-3 transition-all ${
          isDragging ? 'opacity-50 rotate-2' : isEditing ? '' : readOnly ? '' : 'cursor-pointer hover:shadow-sm hover:border-primary/20'
        }`}
        title={isEditing ? undefined : readOnly ? undefined : "Click to edit or drag to move"}
      >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium leading-tight break-words">{card.title}</h4>
          {card.description && (
            <p className="text-sm text-muted-foreground mt-1 break-words">{card.description}</p>
          )}
          {card.links.length > 0 && (
            <div className="mt-2 space-y-1">
              {card.links.filter(Boolean).map((link, i) => (
                <a
                  key={i}
                  href={link.startsWith('http') ? link : `https://${link}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-xs text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()} // Prevent card click when clicking link
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Link
                </a>
              ))}
            </div>
          )}
          {card.tags.length > 0 && (
            <div className="mt-2">
              <span className={`text-xs px-2 py-1 rounded-md ${statusColor}`}>
                {card.tags[0]}
              </span>
            </div>
          )}
          {showRating && (
            <div className="mt-2 flex items-center gap-1">
              {renderStars(card.rating)}
              <span className="text-xs text-muted-foreground ml-1">({card.rating || 0}/5)</span>
            </div>
          )}
        </div>
        
        {!readOnly && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:opacity-100"
                onClick={(e) => e.preventDefault()} // Prevent card click when clicking dropdown
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {
                setEditedCard(card);
                isEditingRef.current = true;
                setIsEditing(true);
              }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onDeleteCard} className="text-destructive">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <Dialog 
        open={isEditing} 
        onOpenChange={(open) => {
          if (!open) {
            closeEdit();
          }
        }}
        modal={true}
      >
        <DialogContent 
          className="max-w-md"
          onPointerDownOutside={(e) => {
            // Force close on outside click
            closeEdit();
          }}
          onEscapeKeyDown={(e) => {
            // Force close on escape
            closeEdit();
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Edit Card</DialogTitle>
            <DialogDescription>
              Edit the details of your card
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input
                ref={titleInputRef}
                value={editedCard.title}
                onChange={(e) => setEditedCard(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Card title"
                onFocus={(e) => {
                  // Prevent default text selection on focus
                  e.preventDefault();
                  const target = e.target as HTMLInputElement;
                  // Use requestAnimationFrame to ensure this runs after the focus event
                  requestAnimationFrame(() => {
                    target.setSelectionRange(target.value.length, target.value.length);
                  });
                }}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={editedCard.description}
                onChange={(e) => setEditedCard(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Add a description..."
                rows={3}
              />
            </div>

            <div>

              <div className="space-y-2">
                {editedCard.links.length === 0 ? (
                  <Button onClick={addLink} variant="ghost" size="sm" className="text-xs">
                    + add link
                  </Button>
                ) : (
                  <>
                    {editedCard.links.map((link, i) => (
                      <div key={i} className="flex items-center gap-2">
                        {editingLinks.has(i) || link === '' ? (
                          <Input
                            value={link}
                            onChange={(e) => updateLink(i, e.target.value)}
                            onKeyDown={(e) => handleLinkKeyDown(e, i)}
                            onBlur={() => commitLinkEdit(i)}
                            placeholder="https://..."
                            className="flex-1"
                            autoFocus={link === ''}
                          />
                        ) : (
                          <a
                            href={link.startsWith('http') ? link : `https://${link}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 text-sm text-primary hover:underline truncate"
                          >
                            {link}
                          </a>
                        )}
                        <Button 
                          onClick={() => removeLink(i)} 
                          size="sm" 
                          variant="ghost"
                          className="text-xs text-muted-foreground hover:text-destructive"
                        >
                          remove
                        </Button>
                      </div>
                    ))}
                    <Button onClick={addLink} size="sm" variant="ghost" className="justify-start p-0 h-auto text-xs text-muted-foreground hover:text-foreground">
                      + add link
                    </Button>
                  </>
                )}
              </div>
            </div>

            {showRating && (
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {renderStars(editedCard.rating, true)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {editedCard.rating || 0}/5
                  </span>
                  <Button
                    onClick={() => setRating(0)}
                    size="sm"
                    variant="ghost"
                    className="text-xs"
                  >
                    Clear
                  </Button>
                </div>
              </div>
            )}


          </div>
        </DialogContent>
      </Dialog>
      </div>
      
      {/* Drop indicator - bottom */}
      {dropPosition === 'bottom' && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary rounded-full z-10" />
      )}
    </div>
  );
}