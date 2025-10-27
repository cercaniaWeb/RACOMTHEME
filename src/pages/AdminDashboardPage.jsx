import React, { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Zap,
  Package,
  BarChart3,
  Users as UsersIcon,
  UserCircle,
  LogOut,
  ArrowRightLeft,
  ShoppingCart,
  Menu,
  Settings,
  ListTodo,
  Moon,
  Sun,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import AlertsBell from '../features/alerts/AlertsBell';
import ShoppingListModal from '../features/purchases/ShoppingListModal';

import logo from '../utils/logo.png';

const AdminDashboardPage = () => {
  const { handleLogout, currentUser, darkMode, toggleDarkMode } = useAppStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isShoppingListModalOpen, setIsShoppingListModalOpen] = useState(false);
  const location = useLocation();
  const activeTab = location.pathname.split('/').pop();

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} font-sans`}>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} variant="outline" className="p-2 rounded-md shadow">
          <Menu size={24} />
        </Button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-20 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg flex flex-col items-center py-4
                        transform transition-transform duration-200 ease-in-out
                        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                        lg:translate-x-0`}>
        <img src={logo} alt="RACOM POS Logo" className="w-12 h-12 object-contain mt-2" />
        <nav className="flex flex-col items-center space-y-4 mt-8 flex-grow">
          <Link to="pos" className={`p-3 rounded-xl ${activeTab === 'pos' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <Zap size={22} />
          </Link>
          <Link to="inventory" className={`p-3 rounded-xl ${activeTab === 'inventory' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <Package size={22} />
          </Link>
          <Link to="reports" className={`p-3 rounded-xl ${activeTab === 'reports' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <BarChart3 size={22} />
          </Link>
          <Link to="users" className={`p-3 rounded-xl ${activeTab === 'users' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <UsersIcon size={22} />
          </Link>
          <Link to="clients" className={`p-3 rounded-xl ${activeTab === 'clients' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <UsersIcon size={22} />
          </Link>
          <Link to="transfers" className={`p-3 rounded-xl ${activeTab === 'transfers' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <ArrowRightLeft size={22} />
          </Link>
          <Link to="purchases" className={`p-3 rounded-xl ${activeTab === 'purchases' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
            <ShoppingCart size={22} />
          </Link>
          {(currentUser.role === 'admin' || currentUser.role === 'gerente') && (
            <Link to="settings" className={`p-3 rounded-xl ${activeTab === 'settings' ? (darkMode ? 'bg-blue-600 text-white shadow-md' : 'bg-blue-500 text-white shadow-md') : (darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-all duration-200`}>
              <Settings size={22} />
            </Link>
          )}
        </nav>
        <div className="flex flex-col items-center space-y-4 mb-4">
          <Button onClick={toggleDarkMode} variant="outline" className={`p-3 rounded-xl ${(darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-colors`}>
            {darkMode ? <Sun size={22} /> : <Moon size={22} />}
          </Button>
          <AlertsBell />
          <Button onClick={() => setIsShoppingListModalOpen(true)} variant="outline" className={`p-3 rounded-xl ${(darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-colors`}>
            <ListTodo size={22} />
          </Button>
          <a href="#" className={`p-3 rounded-xl flex items-center space-x-2 ${(darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-colors`}>
            <UserCircle size={22} />
          </a>
          <a href="#" onClick={handleLogout} className={`p-3 rounded-xl ${(darkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-200')} transition-colors`}>
            <LogOut size={22} />
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 p-6 ml-20 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'} transition-colors duration-200`}> {/* Reduced padding for better spacing */}
        <div className="max-w-full">
          <Outlet />
        </div>
      </main>

      <Modal isOpen={isShoppingListModalOpen} onClose={() => setIsShoppingListModalOpen(false)} title="Lista de Compras">
        <ShoppingListModal onClose={() => setIsShoppingListModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default AdminDashboardPage;
