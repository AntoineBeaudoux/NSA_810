import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import { AuthPage } from './pages/AuthPage'
import { HomePage } from './pages/HomePage'

function App() {
  return (
    <Router>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route
            path="/"
            element={
              <div>
                <h1>SAlut React</h1>
                <p>
                  Utilisez les liens pour naviguer vers les différentes pages.
                </p>
              </div>
            }
          />
        </Routes>
    </Router>
  );
}

export default App;
