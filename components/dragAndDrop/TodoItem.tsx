import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  IconButton,
  Box,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import { CSS } from "@dnd-kit/utilities";
import { format, formatDistanceToNow } from "date-fns";
import { useDraggable } from "@dnd-kit/core";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { TodosType } from "@/utils/types/helper.types";
import { useAuth } from "@clerk/nextjs";
import toast from "react-hot-toast";
import useSupabase from "@/hooks/SupabaseContext";
import EditTodoModal from "./EditTodoModal";

type TodoItemProps = {
  todo: TodosType;
  refreshTodos: () => Promise<void>;
};

const TodoItem = (props: TodoItemProps) => {
  const { todo, refreshTodos } = props;

  const [editTodoShow, setEditTodoShow] = useState<boolean>(false);

  const { userId } = useAuth();
  const supabase = useSupabase();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: todo.id,
      data: {
        type: "todo",
        level: todo.todo_level,
      },
    });

  const handleDelete = async (
    event: React.MouseEvent<HTMLButtonElement>,
    id: number
  ) => {
    event.stopPropagation();

    const { error } = await supabase
      .from("todos")
      .delete()
      .match({ id, clerk_user_id: userId });

    if (error) {
      console.error("Delete Todo Error:", error.message);
      toast.error("Failed to delete todo.");
      return;
    }

    toast.success("Todo deleted successfully.");
    await refreshTodos();
  };

  const handleEditModal = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setEditTodoShow(true);
  };

  const handleEditTodoClose = () => {
    setEditTodoShow(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <div
        ref={setNodeRef}
        {...attributes}
        {...listeners}
        style={{
          transform: CSS.Translate.toString(transform),
          opacity: isDragging ? 0.5 : 1,
          cursor: "grab",
          transition: "transform 0.2s ease, opacity 0.2s ease",
        }}
      >
        <Card
          sx={{
            minWidth: 275,
            boxShadow: isDragging ? "0 0 10px rgba(0,0,0,0.2)" : "0 0 5px 0",
          }}
        >
          <CardContent>
            <Typography sx={{ mb: 1 }}>{todo.text}</Typography>
            <Divider />
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Chip
                sx={{ mt: 2 }}
                icon={<AccessTimeIcon />}
                label={`${formatDistanceToNow(
                  new Date(todo.updated_at || "")
                )} ago, ${format(new Date(todo.updated_at || ""), "HH.mm")}`}
                color="warning"
                variant="outlined"
                size="small"
              />
              <Box>
                <IconButton edge="end" onClick={handleEditModal}>
                  <EditIcon color="success" fontSize="small" />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={(event) => handleDelete(event, todo.id)}
                >
                  <DeleteIcon color="error" fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </div>
      <EditTodoModal
        open={editTodoShow}
        handleClose={handleEditTodoClose}
        todoId={todo.id}
        refreshTodos={refreshTodos}
      />
    </div>
  );
};

export default TodoItem;
