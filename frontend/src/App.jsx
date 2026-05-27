import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Admin } from './pages/Admin';
import { Analytics } from './pages/Analytics';
import { Cards } from './pages/Cards';
import { Dashboard } from './pages/Dashboard';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Profile } from './pages/Profile';
import { Register } from './pages/Register';
import { Support } from './pages/Support';
import { Transactions } from './pages/Transactions';
import { Transfers } from './pages/Transfers';
export default function App() {
    return (<Routes>
      <Route path="/" element={<Landing />}/>
      <Route path="/login" element={<Login />}/>
      <Route path="/register" element={<Register />}/>
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />}/>
        <Route path="/cards" element={<Cards />}/>
        <Route path="/transfers" element={<Transfers />}/>
        <Route path="/transactions" element={<Transactions />}/>
        <Route path="/analytics" element={<Analytics />}/>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/support" element={<Support />}/>
        <Route path="/admin" element={<Admin />}/>
      </Route>
      <Route path="*" element={<Navigate to="/"/>}/>
    </Routes>);
}
