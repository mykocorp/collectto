import { useState } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { Card as CardComponent } from './Card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from './ui/dropdown-menu';
import { Plus, MoreHorizontal, Edit, Trash2, Star, Palette, GripVertical } from 'lucide-react';
import { Column as ColumnType, Card } from '../App';

interface ColumnProps {
  column: ColumnType;
  index: number;
  onMoveCard: (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => void;
  onAddCard: (columnId: string, card: Omit<Card, 'id'>, position?: 'top' | 'bottom') => void;
  onUpdateCard: (columnId: string, cardId: string, updatedCard: Card) => void;
  onDeleteCard: (columnId: string, cardId: string) => void;
  onUpdateColumn: (columnId: string, updates: Partial<ColumnType>) => void;
  onDeleteColumn: (columnId: string) => void;
  onReorderColumns: (fromIndex: number, toIndex: number) => void;
  dense?: boolean;
  readOnly?: boolean;
}

export function Column({
  column,
  index,
  onMoveCard,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onUpdateColumn,
  onDeleteColumn,
  onReorderColumns,
  dense = false,
  readOnly = false
}: ColumnProps) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isAddingCardFromMenu, setIsAddingCardFromMenu] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newMenuCardTitle, setNewMenuCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState(column.title);

  const [{ isOver }, drop] = useDrop({
    accept: 'card',
    drop: (item: { id: string; columnId: string; index: number }, monitor) => {
      if (!monitor.didDrop() && !readOnly) {
        onMoveCard(item.id, item.columnId, column.id, column.cards.length);
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true })
    })
  });

  // Column drag and drop
  const [{ isDragging }, dragColumn] = useDrag({
    type: 'column',
    item: { id: column.id, index },
    canDrag: () => !isEditingTitle && !readOnly,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOverColumn }, dropColumn] = useDrop({
    accept: 'column',
    drop: (item: { id: string; index: number }) => {
      if (item.index !== index && !readOnly) {
        onReorderColumns(item.index, index);
      }
    },
    collect: (monitor) => ({
      isOverColumn: !!monitor.isOver(),
    }),
  });

  const addCard = () => {
    if (!newCardTitle.trim()) return;

    onAddCard(column.id, {
      title: newCardTitle,
      description: '',
      links: [],
      tags: [column.title]
    }, 'bottom');

    setNewCardTitle('');
    setIsAddingCard(false);
  };

  const addCardFromMenu = () => {
    if (!newMenuCardTitle.trim()) return;

    onAddCard(column.id, {
      title: newMenuCardTitle,
      description: '',
      links: [],
      tags: [column.title]
    }, 'top');

    setNewMenuCardTitle('');
    setIsAddingCardFromMenu(false);
  };

  const saveTitle = () => {
    if (editedTitle.trim() && editedTitle !== column.title) {
      onUpdateColumn(column.id, { title: editedTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const toggleRating = () => {
    onUpdateColumn(column.id, { rate: !column.rate });
  };

  const colorOptions = [
    { name: 'Default', value: '', class: 'bg-muted text-muted-foreground border border-border' },
    { name: 'Blue', value: 'blue', class: 'bg-blue-500/20 text-blue-400 border border-blue-500/30' },
    { name: 'Green', value: 'green', class: 'bg-green-500/20 text-green-400 border border-green-500/30' },
    { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' },
    { name: 'Red', value: 'red', class: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { name: 'Purple', value: 'purple', class: 'bg-purple-500/20 text-purple-400 border border-purple-500/30' },
    { name: 'Pink', value: 'pink', class: 'bg-pink-500/20 text-pink-400 border border-pink-500/30' },
    { name: 'Orange', value: 'orange', class: 'bg-orange-500/20 text-orange-400 border border-orange-500/30' }
  ];

  const setColumnColor = (color: string) => {
    onUpdateColumn(column.id, { color });
  };

  const getStatusColor = (title: string, customColor?: string) => {
    // If custom color is set, use it
    if (customColor) {
      const colorOption = colorOptions.find(c => c.value === customColor);
      if (colorOption) {
        return colorOption.class;
      }
    }
    
    // Otherwise use automatic color based on title
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('playing') || lowerTitle.includes('reading') || lowerTitle.includes('watching')) {
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    }
    if (lowerTitle.includes('hold') || lowerTitle.includes('paused')) {
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    }
    if (lowerTitle.includes('completed') || lowerTitle.includes('finished') || lowerTitle.includes('done') || lowerTitle.includes('rated')) {
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    }
    if (lowerTitle.includes('abandoned')) {
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    }
    return 'bg-muted text-muted-foreground border border-border';
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        dropColumn(node);
      }}
      className={`flex-shrink-0 bg-card rounded-lg border border-border transition-all ${
        dense ? 'w-64' : 'w-80'
      } ${
        isOver ? 'ring-2 ring-primary/50' : ''
      } ${
        isOverColumn ? 'ring-2 ring-blue-500/50' : ''
      } ${
        isDragging ? 'opacity-50 rotate-2 scale-95' : ''
      }`}
    >
      <div 
        ref={dragColumn}
        className={`hover:bg-muted/50 transition-colors ${
          dense ? 'p-2' : 'p-4'
        } ${
          isEditingTitle ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'
        }`}
        title={isEditingTitle ? '' : 'Drag to reorder column'}
      >
        <div className="flex items-center justify-between">
          {isEditingTitle && !readOnly ? (
            <Input
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
              className="flex-1 mr-2"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveTitle();
                } else if (e.key === 'Escape') {
                  setEditedTitle(column.title);
                  setIsEditingTitle(false);
                }
              }}
              onBlur={saveTitle}
              autoFocus
            />
          ) : (
            <>
              <div className="flex items-center gap-2">
                {!readOnly && <GripVertical className="w-4 h-4 text-muted-foreground" />}
                <h3 
                  className={`font-medium ${readOnly ? '' : 'cursor-pointer hover:text-primary'} transition-colors`}
                  onClick={readOnly ? undefined : () => setIsEditingTitle(true)}
                  title={readOnly ? '' : "Click to edit column name"}
                >
                  {column.title}
                </h3>
                <span className={`text-xs px-2 py-1 rounded-md ${getStatusColor(column.title, column.color)}`}>
                  {column.cards.length}
                </span>
              </div>
              {!readOnly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsAddingCardFromMenu(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add card
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="px-2 py-1.5">
                    <div className="flex items-center mb-2">
                      <Palette className="w-4 h-4 mr-2" />
                      <span className="text-sm">Color</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setColumnColor(color.value)}
                          className={`w-6 h-6 rounded border-2 transition-all hover:scale-110 ${
                            column.color === color.value ? 'ring-2 ring-primary ring-offset-1' : ''
                          }`}
                          style={{
                            backgroundColor: color.value ? `rgb(${color.value === 'blue' ? '59 130 246' : 
                              color.value === 'green' ? '34 197 94' :
                              color.value === 'yellow' ? '234 179 8' :
                              color.value === 'red' ? '239 68 68' :
                              color.value === 'purple' ? '168 85 247' :
                              color.value === 'pink' ? '236 72 153' :
                              color.value === 'orange' ? '249 115 22' : '156 163 175'} / 0.3)` : 'rgb(156 163 175 / 0.3)'
                          }}
                          title={color.name}
                        />
                      ))}
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <div 
                    className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                    onClick={toggleRating}
                  >
                    <Checkbox
                      checked={column.rate}
                      className="mr-2 w-4 h-4"
                    />
                    <span className={`text-sm ${column.rate ? 'font-medium' : 'text-muted-foreground'}`}>
                      Rating
                    </span>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDeleteColumn(column.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>
              )}
            </>
          )}
        </div>
      </div>

      <div className={`min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto ${
        dense ? 'p-2 space-y-2' : 'p-4 space-y-3'
      }`}>
        {!readOnly && isAddingCardFromMenu && (
          <div className="space-y-2">
            <Input
              value={newMenuCardTitle}
              onChange={(e) => setNewMenuCardTitle(e.target.value)}
              placeholder="Card title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCardFromMenu();
                } else if (e.key === 'Escape') {
                  setIsAddingCardFromMenu(false);
                  setNewMenuCardTitle('');
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={addCardFromMenu} size="sm">
                Add Card
              </Button>
              <Button 
                onClick={() => {
                  setIsAddingCardFromMenu(false);
                  setNewMenuCardTitle('');
                }} 
                variant="ghost" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        {column.cards.map((card, cardIndex) => (
          <CardComponent
            key={card.id}
            card={card}
            columnId={column.id}
            index={cardIndex}
            onUpdateCard={(updatedCard) => onUpdateCard(column.id, card.id, updatedCard)}
            onDeleteCard={() => onDeleteCard(column.id, card.id)}
            onMoveCard={onMoveCard}
            statusColor={getStatusColor(column.title, column.color)}
            showRating={column.rate}
            readOnly={readOnly}
          />
        ))}

        {!readOnly && isAddingCard ? (
          <div className="space-y-2">
            <Input
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Card title"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addCard();
                } else if (e.key === 'Escape') {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }
              }}
              autoFocus
            />
            <div className="flex gap-2">
              <Button onClick={addCard} size="sm">
                Add Card
              </Button>
              <Button 
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }} 
                variant="ghost" 
                size="sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : !readOnly ? (
          <Button
            onClick={() => setIsAddingCard(true)}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add card
          </Button>
        ) : null}
      </div>
    </div>
  );
}