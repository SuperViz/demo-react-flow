import React from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './styles/index.scss'
import Whiteboard from './pages/Whiteboard'

const App: React.FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<Whiteboard />} />
			</Routes>
		</BrowserRouter>
	)
}

export default App
