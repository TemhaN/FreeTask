import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Login from '../components/Auth/Login';
import VerifyEmail from '../components/Auth/VerifyEmail';
import { login, verifyEmailLink, API_BASE_URL } from '../api/api';

const LoginPage = ({ setToken, setUserId, setIsAdmin }) => {
	const [error, setError] = useState('');
	const [showVerify, setShowVerify] = useState(false);
	const [email, setEmail] = useState('');
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		const params = new URLSearchParams(location.search);
		const token = params.get('token');
		const error = params.get('error');

		if (error) {
			setError(decodeURIComponent(error));
			navigate('/login');
			return;
		}

		if (token) {
			setToken(token);
			localStorage.setItem('token', token);
			const decoded = jwtDecode(token);
			setUserId(decoded.sub);
			setIsAdmin(decoded.role === 'Admin');
			localStorage.setItem('userId', decoded.sub);
			localStorage.setItem('isAdmin', decoded.role === 'Admin');
			navigate('/');
		}
	}, [location, navigate, setToken, setUserId, setIsAdmin]);

	const handleGoogleLogin = () => {
		window.location.href = `${API_BASE_URL}/auth/google?role=${encodeURIComponent(
			'Client'
		)}`;
	};

	const handleLogin = async data => {
		try {
			const res = await login(data);
			const token = res.data.accessToken;
			setToken(token);
			localStorage.setItem('token', token);
			const decoded = jwtDecode(token);
			const userId = decoded.sub;
			const isAdmin = decoded.role === 'Admin';
			setUserId(userId);
			setIsAdmin(isAdmin);
			localStorage.setItem('userId', userId);
			localStorage.setItem('isAdmin', isAdmin);
			setError('');
			navigate('/');
		} catch (err) {
			if (err.response?.data?.message.includes('Email не подтвержден')) {
				setEmail(data.email);
				setShowVerify(true);
				setError('Email не подтверждён, код отправлен на почту');
			} else {
				setError(err.response?.data?.message || 'Ошибка входа');
			}
		}
	};

	const handleVerifyEmailLink = async (email, code) => {
		try {
			await verifyEmailLink(email, code);
			setError('Email подтверждён, попробуй войти снова');
			setShowVerify(false);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка верификации');
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center px-4 sm:px-6 lg:px-8'
		>
			<div className='max-w-md w-full bg-gray-800 rounded-xl shadow-lg p-6 sm:p-8'>
				<h2 className='text-3xl font-bold text-white text-center mb-6'>Вход</h2>
				<AnimatePresence>
					{error && (
						<motion.p
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							className='text-red-400 text-center mb-4'
						>
							{error}
						</motion.p>
					)}
				</AnimatePresence>
				{showVerify ? (
					<VerifyEmail
						email={email}
						setError={setError}
						verifyEmailLink={handleVerifyEmailLink}
					/>
				) : (
					<>
						<Login
							onSubmit={handleLogin}
							inputClassName='w-full px-4 py-3 bg-gray-700 text-white placeholder-gray-400 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all duration-300'
							labelClassName='!text-white font-medium mb-2'
						/>
						<button
							onClick={handleGoogleLogin}
							className='flex items-center justify-center w-full mt-4 px-6 py-3 bg-white text-gray-700 rounded-lg border border-gray-300 font-semibold hover:bg-gray-100 hover:shadow-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500'
						>
							<svg
								className='w-5 h-5 mr-2'
								viewBox='0 0 24 24'
								fill='none'
								xmlns='http://www.w3.org/2000/svg'
							>
								<path
									d='M21.805 10.023H12.172v4.146h5.414c-.234 1.324-.916 2.446-1.957 3.293v2.735h3.164c1.853-1.705 2.916-4.227 2.916-7.174 0-.633-.057-1.254-.15-1.857z'
									fill='#4285F4'
								/>
								<path
									d='M12.172 22c2.648 0 4.883-.879 6.508-2.379l-3.164-2.735c-.879.59-2.008.938-3.344.938-2.57 0-4.75-1.734-5.527-4.066H3.418v2.555C5.035 19.51 8.383 22 12.172 22z'
									fill='#34A853'
								/>
								<path
									d='M6.645 14.379c-.199-.59-.316-1.223-.316-1.879s.117-1.289.316-1.879V7.066H3.418c-.586 1.172-.918 2.492-.918 3.934 0 1.441.332 2.762.918 3.934l3.227-2.555z'
									fill='#FBBC05'
								/>
								<path
									d='M12.172 5.586c1.453 0 2.762.5 3.793 1.48l2.836-2.836C16.883 2.672 14.648 1.5 12.172 1.5c-3.789 0-7.137 2.49-8.754 5.766l3.227 2.555c.777-2.332 2.957-4.235 5.527-4.235z'
									fill='#EA4335'
								/>
							</svg>
							Войти через Google
						</button>
						<button
							onClick={() => navigate('/reset-password')}
							className='text-cyan-400 hover:text-cyan-300 hover:underline mt-4 block w-full text-center text-lg font-medium transition-all duration-300'
						>
							Забыли пароль?
						</button>

						<Link
							to='/register'
							className='text-white py-2 rounded-lg w-full mt-4 block text-center text-lg'
						>
							Нет аккаунта? Зарегистрироваться
						</Link>
					</>
				)}
			</div>
		</motion.div>
	);
};

export default LoginPage;
