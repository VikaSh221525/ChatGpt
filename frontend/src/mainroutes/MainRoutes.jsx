import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HeroPage from '../pages/HeroPage'
import Login from '../pages/Login'
import Register from '../pages/Register'

const MainRoutes = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<HeroPage/>} />
                <Route path='Login' element={<Login/>} />
                <Route path='Register' element={<Register/>} />
            </Routes>
        </>
    )
}

export default MainRoutes