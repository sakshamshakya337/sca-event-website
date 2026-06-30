import { create } from 'zustand'
import api from '../config/axios'

const useTodoStore = create((set, get) => ({
  todos: [],
  isLoading: false,
  error: null,

  getEventTodos: async (eventId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get(`/todos/event/${eventId}`)
      set({ todos: res.data.data, isLoading: false })
    } catch (err) {
      console.error('Failed to get todos:', err)
      set({ error: err.response?.data?.message || 'Failed to get todos', isLoading: false })
    }
  },

  createTodo: async (todoData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/todos', todoData)
      set((state) => ({
        todos: [res.data.data, ...state.todos],
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to create todo:', err)
      set({ error: err.response?.data?.message || 'Failed to create todo', isLoading: false })
      throw err
    }
  },

  updateTodo: async (id, todoData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/todos/${id}`, todoData)
      set((state) => ({
        todos: state.todos.map(todo => todo._id === id ? res.data.data : todo),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to update todo:', err)
      set({ error: err.response?.data?.message || 'Failed to update todo', isLoading: false })
      throw err
    }
  },

  completeTodo: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/todos/${id}/complete`)
      set((state) => ({
        todos: state.todos.map(todo => todo._id === id ? res.data.data : todo),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to complete todo:', err)
      set({ error: err.response?.data?.message || 'Failed to complete todo', isLoading: false })
      throw err
    }
  },

  deleteTodo: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/todos/${id}`)
      set((state) => ({
        todos: state.todos.filter(todo => todo._id !== id),
        isLoading: false
      }))
    } catch (err) {
      console.error('Failed to delete todo:', err)
      set({ error: err.response?.data?.message || 'Failed to delete todo', isLoading: false })
      throw err
    }
  },
}))

export default useTodoStore
