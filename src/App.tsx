import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from './components/LoginScreen'; // Removed .tsx
import Home from './components/Home'; // Removed .tsx
import './App.css'; // .css extension is usually required
import { AuthProvider } from "./AuthContext"; // Already correct
import PrivateRoute from "./PrivateRoute"; // Removed .tsx
// ✅ Import the ToastContainer from our custom toasts
import { ToastContainer } from "./toast"; // Fixed path and removed .tsx

function App() {
  return (
    // Router must wrap AuthProvider so AuthProvider can use useNavigate()
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginScreen />} />
          <Route
            path="/home"
            element={
              <PrivateRoute>
                <Home />
              </PrivateRoute>
            }
          />
        </Routes>
        {/* ToastContainer should also be inside AuthProvider to be safe */}
        <ToastContainer />
      </AuthProvider>
    </Router>
  );
}

export default App