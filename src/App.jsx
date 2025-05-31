import React from 'react'
import { Route, Routes } from 'react-router-dom'
import Home from '../components/Home'
import AdminDashboard from '../components/AdminDashboard'
import SearchPage from '../components/SearchPage'
import MusicPlayer from '../components/MusicPlayer'
import LoginPage from '../components/LoginPage'
import SignupPage from '../components/SignupPage'


const App = () => {
  return (
   <>
   <Routes>
    <Route path='/' element={<LoginPage/>}  />
    <Route path="/signup" element={<SignupPage />} />
    <Route path='/admin/dashboard' element={<AdminDashboard/>}  />
    <Route path='/search' element={<SearchPage/>}  />
    <Route path='/player' element={<MusicPlayer/>}  />
    <Route path='/home' element={<Home/>}  />
   </Routes>
   </>
  )
}

export default App