import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../components/Home'
import AdminDashboard from '../components/AdminDashboard'

const App = () => {
  return (
   <>
   <Routes>
    <Route path='/' element={<Home/>}  />
    <Route path='/admin/dashboard' element={<AdminDashboard/>}  />
   </Routes>
   </>
  )
}

export default App