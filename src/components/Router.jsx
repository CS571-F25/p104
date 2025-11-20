import { HashRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import About from './pages/About'
import CourseList from './pages/CourseList'
import { csConfig } from '../majors/csConfig'

export default function Router() {
  return <HashRouter>
  <Routes>
    <Route path="/" element={<Home config={csConfig} />} />
    <Route path="/courses" element={<CourseList config={csConfig} />} />
    <Route path="/about" element={<About />} />
  </Routes>
</HashRouter>
}