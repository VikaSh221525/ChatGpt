import React from 'react'
import {Routes, Route} from 'react-router-dom'
import HeroPage from '../pages/HeroPage'

const MainRoutes = () => {
    return (
        <>
            <Routes>
                <Route path='/' element={<HeroPage/>} />
            </Routes>
        </>
    )
}

export default MainRoutes