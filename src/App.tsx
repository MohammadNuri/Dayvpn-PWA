import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from './components/LoginScreen.tsx'
import Home from './components/Home.tsx';
import './App.css'
import { AuthProvider } from "./AuthContext.tsx";
import PrivateRoute from "./PrivateRoute.tsx";
// ✅ Import the ToastContainer from our custom toasts
import { ToastContainer } from "../src/toast.tsx";

function App() {
  return (
    <AuthProvider>
      <Router>
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
      </Router>
      {/* Replace your old Toaster with the modern custom one */}
      <ToastContainer />
    </AuthProvider>
  );
}

export default App
