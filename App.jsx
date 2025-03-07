import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/*" element={
          <ProtectedRoute>
            {/* Your existing app routes go here */}
            <YourMainComponent />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 