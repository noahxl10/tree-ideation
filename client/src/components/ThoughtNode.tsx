import { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ThoughtNodeData {
  content: string;
  response: string | null;
  isSelected: boolean;
  onDelete: () => void;
}

function ThoughtNode({ data }: NodeProps<ThoughtNodeData>) {
  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <Card className={cn(
        "w-64 transition-all",
        data.isSelected && "ring-2 ring-primary shadow-lg"
      )}>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex justify-between items-start">
              <p className="text-sm font-medium">{data.content}</p>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  data.onDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {data.response && (
              <p className="text-sm text-muted-foreground">{data.response}</p>
            )}
          </div>
        </CardContent>
      </Card>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default memo(ThoughtNode);