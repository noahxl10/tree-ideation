import { useState } from "react";
import { Card } from "@/components/ui/card";
import ThoughtFlow from "@/components/ThoughtFlow";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AddThoughtDialog } from "@/components/AddThoughtDialog";
import type { SelectThought } from "@db/schema";

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const { data: thoughts = [], isLoading } = useQuery<SelectThought[]>({
    queryKey: ['/api/thoughts'],
  });

  const addThoughtMutation = useMutation({
    mutationFn: async ({ parentId, content }: { parentId: string | null; content: string }) => {
      const res = await fetch('/api/thoughts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parentId, content }),
      });
      if (!res.ok) throw new Error('Failed to add thought');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      toast({
        title: "Thought added",
        description: "Your new thought has been created",
      });
    },
  });

  const deleteThoughtMutation = useMutation({
    mutationFn: async (thoughtId: string) => {
      const res = await fetch(`/api/thoughts/${thoughtId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete thought');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/thoughts'] });
      setSelectedNode(null);
      toast({
        title: "Thought deleted",
        description: "The thought and its branches have been removed",
      });
    },
  });

  const handleAddThought = (content: string) => {
    addThoughtMutation.mutate({ parentId: selectedNode, content });
  };

  const handleDeleteThought = (thoughtId: string) => {
    deleteThoughtMutation.mutate(thoughtId);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Thought Map
            </h1>
            <AddThoughtDialog onAdd={handleAddThought} />
          </div>

          <div className="h-[calc(100vh-12rem)] w-full">
            <ThoughtFlow
              thoughts={thoughts}
              onNodeSelect={setSelectedNode}
              selectedNode={selectedNode}
              onDeleteThought={handleDeleteThought}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}