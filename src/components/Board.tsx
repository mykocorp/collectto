import { useState } from 'react';
import { Column as ColumnComponent } from './Column';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Collection, Column, Card } from '../App';

interface BoardProps {
  collection: Collection;
  onUpdateCollection: (collection: Collection) => void;
  dense?: boolean;
  readOnly?: boolean;
}

export function Board({ collection, onUpdateCollection, dense = false, readOnly = false }: BoardProps) {
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const moveCard = (cardId: string, fromColumnId: string, toColumnId: string, toIndex: number) => {
    // Handle same column reordering
    if (fromColumnId === toColumnId) {
      const updatedColumns = collection.columns.map(column => {
        if (column.id === fromColumnId) {
          const cards = [...column.cards];
          const fromIndex = cards.findIndex(card => card.id === cardId);
          
          if (fromIndex !== -1) {
            // Remove card from current position
            const [movedCard] = cards.splice(fromIndex, 1);
            // Insert at new position
            cards.splice(toIndex, 0, movedCard);
          }
          
          return {
            ...column,
            cards
          };
        }
        return column;
      });

      onUpdateCollection({
        ...collection,
        columns: updatedColumns
      });
      return;
    }

    // Handle cross-column movement
    const updatedColumns = collection.columns.map(column => {
      if (column.id === fromColumnId) {
        return {
          ...column,
          cards: column.cards.filter(card => card.id !== cardId)
        };
      }
      return column;
    });

    const card = collection.columns
      .find(col => col.id === fromColumnId)
      ?.cards.find(c => c.id === cardId);

    if (!card) return;

    const targetColumnIndex = updatedColumns.findIndex(col => col.id === toColumnId);
    const fromColumn = collection.columns.find(col => col.id === fromColumnId);
    
    if (targetColumnIndex !== -1 && fromColumn) {
      const targetColumn = updatedColumns[targetColumnIndex];
      
      // Update card tags to reflect the new column
      const updatedCard = {
        ...card,
        tags: card.tags.map(tag => 
          tag === fromColumn.title ? targetColumn.title : tag
        ).filter(tag => tag !== fromColumn.title).concat(
          !card.tags.includes(targetColumn.title) ? [targetColumn.title] : []
        )
      };
      
      const newCards = [...targetColumn.cards];
      newCards.splice(toIndex, 0, updatedCard);
      
      updatedColumns[targetColumnIndex] = {
        ...targetColumn,
        cards: newCards
      };
    }

    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  const addCard = (columnId: string, card: Omit<Card, 'id'>, position: 'top' | 'bottom' = 'bottom') => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString()
    };

    const updatedColumns = collection.columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: position === 'top' ? [newCard, ...column.cards] : [...column.cards, newCard]
        };
      }
      return column;
    });

    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  const updateCard = (columnId: string, cardId: string, updatedCard: Card) => {
    const updatedColumns = collection.columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: column.cards.map(card => 
            card.id === cardId ? updatedCard : card
          )
        };
      }
      return column;
    });

    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  const deleteCard = (columnId: string, cardId: string) => {
    const updatedColumns = collection.columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          cards: column.cards.filter(card => card.id !== cardId)
        };
      }
      return column;
    });

    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  const addColumn = () => {
    if (!newColumnTitle.trim()) return;

    const newColumn: Column = {
      id: Date.now().toString(),
      title: newColumnTitle,
      cards: [],
      rate: false,
      color: ''
    };

    onUpdateCollection({
      ...collection,
      columns: [...collection.columns, newColumn]
    });

    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const updateColumn = (columnId: string, updates: Partial<Column>) => {
    const updatedColumns = collection.columns.map(column => {
      if (column.id === columnId) {
        const updatedColumn = { ...column, ...updates };
        
        // If title is being updated, also update all card tags in this column
        if (updates.title && updates.title !== column.title) {
          updatedColumn.cards = column.cards.map(card => ({
            ...card,
            tags: card.tags.map(tag => 
              tag === column.title ? updates.title! : tag
            )
          }));
        }
        
        return updatedColumn;
      }
      return column;
    });

    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  const deleteColumn = (columnId: string) => {
    if (collection.columns.length <= 3) {
      alert('You must have at least 3 columns.');
      return;
    }

    const updatedColumns = collection.columns.filter(column => column.id !== columnId);
    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  const reorderColumns = (fromIndex: number, toIndex: number) => {
    const updatedColumns = [...collection.columns];
    const [removed] = updatedColumns.splice(fromIndex, 1);
    updatedColumns.splice(toIndex, 0, removed);

    onUpdateCollection({
      ...collection,
      columns: updatedColumns
    });
  };

  return (
    <div className={`flex-1 ${dense ? 'p-3' : 'p-6'}`}>
      <div className={`flex min-h-0 overflow-x-auto ${dense ? 'gap-3 pb-3' : 'gap-6 pb-6'}`}>
        {collection.columns.map((column, index) => (
          <ColumnComponent
            key={column.id}
            column={column}
            index={index}
            onMoveCard={readOnly ? () => {} : moveCard}
            onAddCard={readOnly ? () => {} : addCard}
            onUpdateCard={readOnly ? () => {} : updateCard}
            onDeleteCard={readOnly ? () => {} : deleteCard}
            onUpdateColumn={readOnly ? () => {} : updateColumn}
            onDeleteColumn={readOnly ? () => {} : deleteColumn}
            onReorderColumns={readOnly ? () => {} : reorderColumns}
            dense={dense}
            readOnly={readOnly}
          />
        ))}
        
        {!readOnly && collection.columns.length < 10 && (
          <div className="flex-shrink-0 w-80">
            {isAddingColumn ? (
              <div className="bg-card rounded-lg border border-border p-4">
                <Input
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Column title"
                  className="mb-3"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addColumn();
                    } else if (e.key === 'Escape') {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }
                  }}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button onClick={addColumn} size="sm">
                    Add Column
                  </Button>
                  <Button 
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }} 
                    variant="ghost" 
                    size="sm"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                onClick={() => setIsAddingColumn(true)}
                variant="ghost"
                className="w-full h-14 border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-foreground"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Column
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}