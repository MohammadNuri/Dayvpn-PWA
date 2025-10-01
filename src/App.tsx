import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginScreen from './components/LoginScreen.tsx'
import Home from './components/Home.tsx';
import { Toaster } from "react-hot-toast";
import './App.css'
import { AuthProvider } from "./AuthContext.tsx";
import PrivateRoute from "./PrivateRoute.tsx";

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
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: { background: "#4b0b6dff", color: "#fff", borderRadius: "10px" },
        }}
      />
    </AuthProvider>
  );
}

export default App
