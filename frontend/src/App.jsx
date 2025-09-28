import React,{ useState } from 'react'
import RegisterPage from './pages/RegisterPage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'


function App() {
  const [count, setCount] = useState(0)

  return (
    <NotFoundPage/>
  )
}

export default App
