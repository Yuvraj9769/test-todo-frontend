"use client";

import { createContext, useContext, useState } from "react";

type Todo = {
    _id: string;
    title: string;
    description: string;
    status: "pending" | "in-progress" | "completed";
}

interface TodoContextTypes {
    todos: Todo[]
    setTodos: React.Dispatch<React.SetStateAction<Todo[]>>
} 


const TodoContext = createContext<TodoContextTypes | null>(null);

export function TodoProvider({ children }: { children: React.ReactNode }) {

    const [todos, setTodos] = useState<Todo[]>([])

    return (
        <TodoContext.Provider  value={{todos, setTodos}}  >
{children}
        </TodoContext.Provider>
    )

}

export function useTodoContext() {

    const context = useContext(TodoContext);

    if (!context) {
        throw new Error("useTodoContext must be used within a TodoProvider");
    }

    return context;

}