import { FormPageShell } from "@/components/PageShell";
import { TaskForm } from "@/components/TaskForm";

export default function NewTaskPage() {
  return (
    <FormPageShell title="Nova tarefa">
      <TaskForm />
    </FormPageShell>
  );
}
