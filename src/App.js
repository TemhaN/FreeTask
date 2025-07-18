import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrdersPage from './pages/OrdersPage';
import ClientPage from './pages/ClientPage';
import ChatsPage from './pages/ChatsPage';
import TeamProfilePage from './pages/TeamProfilePage';
import TeamsPage from './pages/TeamsPage';
import UserPage from './pages/UserPage';
import PaymentsPage from './pages/PaymentsPage';
import NotificationsPage from './pages/NotificationsPage';
import ModerationPage from './pages/ModerationPage';
import AdminPage from './pages/AdminPage';
import FavoritesPage from './pages/FavoritesPage';
import SettingsPage from './pages/SettingsPage';
import ResetPassword from './components/Auth/ResetPassword';
import ProfilePage from './components/Profile/ProfilePage';
import ChatMessagesPage from './components/chat/ChatMessagesPage';
import { API_BASE_URL, getProfile } from './api/api';

function App() {
	const [token, setToken] = useState(localStorage.getItem('token') || '');
	const [userId, setUserId] = useState(localStorage.getItem('userId') || '');
	const [isAdmin, setIsAdmin] = useState(
		localStorage.getItem('isAdmin') === 'true'
	);
	const [userRole, setUserRole] = useState(
		localStorage.getItem('userRole') || ''
	);
	const [userName, setUserName] = useState('');
	const [avatarUrl, setAvatarUrl] = useState(''); // Новое состояние
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const location = useLocation();

	useEffect(() => {
		const fetchUser = async () => {
			try {
				if (token) {
					const res = await getProfile(token);
					setUserId(res.data.id);
					setUserRole(res.data.role);
					setIsAdmin(res.data.role === 'Admin');
					setUserName(res.data.name || 'Пользователь');
					setAvatarUrl(res.data.avatarUrl || ''); // Сохраняем avatarUrl
					localStorage.setItem('userId', res.data.id);
					localStorage.setItem('userRole', res.data.role);
					localStorage.setItem('isAdmin', res.data.role === 'Admin');
				}
			} catch (err) {
				console.error('Error fetching user:', err);
			}
		};
		fetchUser();
	}, [token]);

	const handleLogout = async () => {
		try {
			await fetch(`${API_BASE_URL}/auth/logout`, {
				method: 'POST',
				headers: { Authorization: `Bearer ${token}` },
			});
			setToken('');
			setUserId('');
			setUserRole('');
			setIsAdmin(false);
			setUserName('');
			setAvatarUrl('');
			localStorage.removeItem('token');
			localStorage.removeItem('userId');
			localStorage.removeItem('userRole');
			localStorage.removeItem('isAdmin');
			setIsDropdownOpen(false);
		} catch (err) {
			console.error('Logout error:', err);
		}
	};

	const pageVariants = {
		initial: { opacity: 0, y: 20 },
		in: { opacity: 1, y: 0 },
		out: { opacity: 0, y: -20 },
	};

	const pageTransition = {
		duration: 0.3,
		ease: 'easeInOut',
	};

	return (
		<div className='min-h-screen bg-gray-900 pt-16'>
			<Navbar
				token={token}
				userRole={userRole}
				isAdmin={isAdmin}
				userName={userName}
				avatarUrl={avatarUrl}
				handleLogout={handleLogout}
				isDropdownOpen={isDropdownOpen}
				setIsDropdownOpen={setIsDropdownOpen}
			/>
			<div className='mx-auto'>
				<AnimatePresence mode='wait'>
					<motion.div
						key={location.pathname}
						initial='initial'
						animate='in'
						exit='out'
						variants={pageVariants}
						transition={pageTransition}
					>
						<Routes location={location}>
							<Route
								path='/'
								element={
									<Home userId={userId} userRole={userRole} token={token} />
								}
							/>
							<Route
								path='/login'
								element={
									token ? (
										<Navigate to='/' />
									) : (
										<LoginPage
											setToken={setToken}
											setUserId={setUserId}
											setIsAdmin={setIsAdmin}
										/>
									)
								}
							/>
							<Route
								path='/register'
								element={
									token ? (
										<Navigate to='/' />
									) : (
										<RegisterPage
											setToken={setToken}
											setUserId={setUserId}
											setIsAdmin={setIsAdmin}
										/>
									)
								}
							/>
							<Route
								path='/profile'
								element={
									token ? (
										<ProfilePage userId={userId} token={token} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/orders'
								element={
									token ? (
										<OrdersPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/chats'
								element={
									token ? (
										<ChatsPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/teams'
								element={
									token ? (
										<TeamsPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/payments'
								element={
									token ? (
										<PaymentsPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/favorites'
								element={
									token ? (
										<FavoritesPage
											userId={userId}
											userRole={userRole}
											token={token}
										/>
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/notifications'
								element={
									token ? (
										<NotificationsPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/moderation'
								element={
									token ? (
										<ModerationPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/settings'
								element={
									token ? (
										<SettingsPage userId={userId} token={token} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/admin'
								element={
									token && isAdmin ? (
										<AdminPage token={token} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/client/:id'
								element={<ClientPage token={token} />}
							/>
							<Route
								path='/chat/:chatId'
								element={
									token ? (
										<ChatMessagesPage token={token} userId={userId} />
									) : (
										<Navigate to='/login' />
									)
								}
							/>
							<Route
								path='/user/:id'
								element={<UserPage userId={userId} token={token} />}
							/>
							<Route
								path='/team/:id'
								element={<TeamProfilePage userId={userId} token={token} />}
							/>
							<Route
								path='/teams'
								element={<TeamsPage token={token} userId={userId} />}
							/>
							<Route path='/reset-password' element={<ResetPassword />} />
						</Routes>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	);
}

export default App;
