import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const thoughtSchema = z.object({
  content: z.string().min(1, "Please enter your thought"),
});

type ThoughtForm = z.infer<typeof thoughtSchema>;

interface AddThoughtDialogProps {
  onAdd: (content: string) => void;
}

export function AddThoughtDialog({ onAdd }: AddThoughtDialogProps) {
  const [open, setOpen] = useState(false);
  const form = useForm<ThoughtForm>({
    resolver: zodResolver(thoughtSchema),
    defaultValues: {
      content: "",
    },
  });

  const onSubmit = (data: ThoughtForm) => {
    onAdd(data.content);
    form.reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add Thought
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a New Thought</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What's on your mind?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your thought here..."
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit">Add Thought</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
