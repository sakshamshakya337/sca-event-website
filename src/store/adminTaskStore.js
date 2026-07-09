import { create } from 'zustand'

const initialTasks = [
  {
    id: 1,
    title: 'Review verification applications',
    event: 'Admin Queue',
    priority: 'High',
    dueDate: '2024-07-11',
    completed: false,
  },
  {
    id: 2,
    title: 'Approve event budget',
    event: 'Annual Tech Fest',
    priority: 'Medium',
    dueDate: '2024-07-13',
    completed: false,
  },
  {
    id: 3,
    title: 'Update user permissions',
    event: 'System Admin',
    priority: 'Low',
    dueDate: '2024-07-15',
    completed: true,
  },
  {
    id: 4,
    title: 'Resolve contact queries',
    event: 'Help Desk',
    priority: 'High',
    dueDate: '2024-07-10',
    completed: false,
  },
]

const useAdminTaskStore = create((set, get) => ({
  tasks: initialTasks,
  addTask: (task) => set((state) => ({
    tasks: [...state.tasks, { ...task, id: Date.now() }],
  })),
  toggleTask: (id) => set((state) => ({
    tasks: state.tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ),
  })),
  editTask: (id, updatedTask) => set((state) => ({
    tasks: state.tasks.map(task => task.id === id ? { ...task, ...updatedTask } : task),
  })),
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter(task => task.id !== id),
  })),
}))

export default useAdminTaskStore
