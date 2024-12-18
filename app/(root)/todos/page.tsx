"use client";

import React, { useState, useEffect } from "react";
import { Grid, Container, Button } from "@mui/material";
import TodoList from "@/components/dragAndDrop/TodoList";
import {
  DndContext,
  closestCorners,
  PointerSensor,
  DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useAuth } from "@clerk/nextjs";
import NewTodo from "@/components/dragAndDrop/CreateTodoModal";
import { SortableContext } from "@dnd-kit/sortable";
import { TodosType } from "@/utils/types/helper.types";
import useSupabase from "@/hooks/SupabaseContext";

const cardTitles = [
  { index: 0, title: "Unassigned" },
  { index: 1, title: "Todo" },
  { index: 2, title: "In Progress" },
  { index: 3, title: "Done" },
];

const TodosPage = () => {
  const [todos, setTodos] = useState<TodosType[]>([]);
  const [open, setOpen] = React.useState(false);

  const supabase = useSupabase();
  const { userId } = useAuth();

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5,
    },
  });

  const sensors = useSensors(pointerSensor);

  const getTodos = async () => {
    if (!supabase || !userId) return;

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("clerk_user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error fetching todos:", error.message);
      return;
    }

    setTodos(data as TodosType[]);
  };

  useEffect(() => {
    getTodos();
  }, [supabase, userId]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeIndex = todos.findIndex((todo) => todo.id === active.id);
    const overIndex = todos.findIndex((todo) => todo.id === over.id);

    const newTodoLevel = cardTitles.findIndex(
      (card) => card.title === over.data.current?.level
    );

    if (newTodoLevel === -1) return;

    const updatedTodos = arrayMove(todos, activeIndex, overIndex);

    // Update todo level in database
    const { error } = await supabase
      .from("todos")
      .update({
        todo_level: newTodoLevel,
        updated_at: Date.now(),
      })
      .eq("id", active.id)
      .eq("clerk_user_id", userId);

    if (error) {
      console.error("Error updating todo:", error.message);
      return;
    }

    // Update local state to reflect the change
    setTodos(
      updatedTodos.map((todo) =>
        todo.id === active.id ? { ...todo, todo_level: newTodoLevel } : todo
      )
    );
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Container maxWidth="xl">
        <Grid
          container
          spacing={1}
          sx={{ mt: 5, display: "flex", justifyContent: "center" }}
        >
          <Grid item xs={12}>
            <Button
              color="primary"
              onClick={() => setOpen(true)}
              variant="outlined"
            >
              Create Todo
            </Button>
          </Grid>
          <DndContext
            sensors={sensors}
            onDragEnd={handleDragEnd}
            collisionDetection={closestCorners}
          >
            <Grid
              container
              spacing={2}
              sx={{ mt: 2, display: "flex", justifyContent: "center" }}
            >
              {cardTitles.map((cardTitle) => (
                <SortableContext
                  key={cardTitle.index}
                  items={todos
                    .filter((todo) => todo.todo_level === cardTitle.index)
                    .map((todo) => todo.id)}
                >
                  <TodoList
                    key={cardTitle.index}
                    level={cardTitle.title}
                    todos={todos.filter(
                      (todo) => todo.todo_level === cardTitle.index
                    )}
                    refreshTodos={getTodos}
                  />
                </SortableContext>
              ))}
            </Grid>
          </DndContext>
        </Grid>
      </Container>
      <NewTodo
        open={open}
        handleClose={handleClose}
        onActionFinish={getTodos}
      />
    </>
  );
};

export default TodosPage;
