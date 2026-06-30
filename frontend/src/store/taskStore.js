import { create } from 'zustand'
import api from '../config/axios'

const useTaskStore = create((set, get) => ({
  tasks: [],
  myTasks: [],
  isLoading: false,
  error: null,

  getMyTasks: async (isDone) => {
    set({ isLoading: true, error: null })
    try {
      const query = isDone !== undefined ? `?isDone=${isDone}` : ''
      const res = await api.get(`/tasks/my${query}`)
      set({ myTasks: res.data.data, isLoading: false })
    } catch (err) {
      console.error('Failed to get my tasks:', err)
      set({ error: err.response?.data?.message || 'Failed to get my tasks', isLoading: false })
    }
  },

  getEventTasks: async (eventId) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.get(`/tasks/event/${eventId}`)
      set({ tasks: res.data.data, isLoading: false })
    } catch (err) {
      console.error('Failed to get event tasks:', err)
      set({ error: err.response?.data?.message || 'Failed to get event tasks', isLoading: false })
    }
  },

  createTask: async (taskData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.post('/tasks', taskData)
      set((state) => ({
        tasks: [res.data.data, ...state.tasks],
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to create task:', err)
      set({ error: err.response?.data?.message || 'Failed to create task', isLoading: false })
      throw err
    }
  },

  updateTask: async (id, taskData) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/tasks/${id}`, taskData)
      set((state) => ({
        tasks: state.tasks.map(task => task._id === id ? res.data.data : task),
        myTasks: state.myTasks.map(task => task._id === id ? res.data.data : task),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to update task:', err)
      set({ error: err.response?.data?.message || 'Failed to update task', isLoading: false })
      throw err
    }
  },

  completeTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      const res = await api.put(`/tasks/${id}/complete`)
      set((state) => ({
        tasks: state.tasks.map(task => task._id === id ? res.data.data : task),
        myTasks: state.myTasks.map(task => task._id === id ? res.data.data : task),
        isLoading: false
      }))
      return res.data.data
    } catch (err) {
      console.error('Failed to complete task:', err)
      set({ error: err.response?.data?.message || 'Failed to complete task', isLoading: false })
      throw err
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await api.delete(`/tasks/${id}`)
      set((state) => ({
        tasks: state.tasks.filter(task => task._id !== id),
        myTasks: state.myTasks.filter(task => task._id !== id),
        isLoading: false
      }))
    } catch (err) {
      console.error('Failed to delete task:', err)
      set({ error: err.response?.data?.message || 'Failed to delete task', isLoading: false })
      throw err
    }
  },
}))

export default useTaskStore
