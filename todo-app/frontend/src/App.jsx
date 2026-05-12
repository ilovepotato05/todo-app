import { useEffect, useState } from 'react'
import './App.css'

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:5000').replace(/\/$/, '')
const API_URL = `${API_BASE_URL}/api/todos`

function App() {
  const [todos, setTodos] = useState([])
  const [newTodo, setNewTodo] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadTodos = async () => {
      try {
        const response = await fetch(API_URL)

        if (!response.ok) {
          throw new Error('Unable to load todos')
        }

        const data = await response.json()
        setTodos(data)
      } catch {
        setError('The todo service is unavailable right now.')
      } finally {
        setIsLoading(false)
      }
    }

    loadTodos()
  }, [])

  const addTodo = async (event) => {
    event.preventDefault()

    const text = newTodo.trim()

    if (!text || isSubmitting) {
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      })

      if (!response.ok) {
        throw new Error('Unable to create todo')
      }

      const createdTodo = await response.json()
      setTodos((currentTodos) => [createdTodo, ...currentTodos])
      setNewTodo('')
    } catch {
      setError('Could not save that task. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTodo = async (id) => {
    setError('')

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Unable to update todo')
      }

      const updatedTodo = await response.json()
      setTodos((currentTodos) =>
        currentTodos.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo)),
      )
    } catch {
      setError('Could not update that task.')
    }
  }

  const deleteTodo = async (id) => {
    setError('')

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Unable to delete todo')
      }

      setTodos((currentTodos) => currentTodos.filter((todo) => todo.id !== id))
    } catch {
      setError('Could not delete that task.')
    }
  }

  const completedCount = todos.filter((todo) => todo.completed).length
  const remainingCount = todos.length - completedCount

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Cloud To-Do App</p>
          <h1>Plan the day. Check it off. Keep moving.</h1>
          <p className="hero-text">
            A small full-stack todo app with a React frontend and an Express API.
          </p>
        </div>

        <div className="stats">
          <div>
            <strong>{todos.length}</strong>
            <span>Total</span>
          </div>
          <div>
            <strong>{remainingCount}</strong>
            <span>Left</span>
          </div>
          <div>
            <strong>{completedCount}</strong>
            <span>Done</span>
          </div>
        </div>
      </section>

      <section className="workspace-card">
        <form className="todo-form" onSubmit={addTodo}>
          <label className="sr-only" htmlFor="todo-input">
            Add a new todo
          </label>
          <input
            id="todo-input"
            type="text"
            value={newTodo}
            onChange={(event) => setNewTodo(event.target.value)}
            placeholder="Write a task and press Enter"
            autoComplete="off"
          />
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add task'}
          </button>
        </form>

        {error ? <p className="status status-error">{error}</p> : null}

        {isLoading ? (
          <div className="empty-state">
            <p>Loading your tasks...</p>
          </div>
        ) : todos.length === 0 ? (
          <div className="empty-state">
            <p>No tasks yet.</p>
            <span>Add your first item to start tracking work.</span>
          </div>
        ) : (
          <ul className="todo-list">
            {todos.map((todo) => (
              <li key={todo.id} className={todo.completed ? 'todo-item completed' : 'todo-item'}>
                <button
                  type="button"
                  className="todo-toggle"
                  onClick={() => toggleTodo(todo.id)}
                  aria-label={todo.completed ? 'Mark todo as incomplete' : 'Mark todo as complete'}
                >
                  <span className="todo-badge" aria-hidden="true" />
                </button>

                <div className="todo-content">
                  <p>{todo.text}</p>
                  <span>{todo.completed ? 'Completed' : 'In progress'}</span>
                </div>

                <button type="button" className="delete-button" onClick={() => deleteTodo(todo.id)}>
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

export default App