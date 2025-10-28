// App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Inscription from './components/Inscription';
import Confirmation from './components/Confirmation';
import Home from './components/Home.tsx';
import Login from './components/Connexion.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Inscription />} />
        <Route path="/confirmation" element={<Confirmation />} />
        <Route path="/connection" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
