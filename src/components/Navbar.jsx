import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FILE_BASE_URL } from '../api/api';

const Navbar = ({
	token,
	userRole,
	isAdmin,
	userName,
	avatarUrl,
	handleLogout,
}) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);

	const toggleDropdown = () => setIsDropdownOpen(prev => !prev);

	const dropdownVariants = {
		hidden: { opacity: 0, y: -10, scale: 0.95 },
		visible: { opacity: 1, y: 0, scale: 1 },
	};

	return (
		<>
			{/* Header для десктопа */}
			<nav className='fixed top-4 left-0 right-0 z-50 mx-4 hidden md:block'>
				<div className='max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-md text-white rounded-full shadow-lg p-4 px-6'>
					<div className='flex justify-between items-center'>
						<div className='flex items-center space-x-4'>
							<Link
								to='/'
								className='flex items-center gap-2 text-2xl font-bold text-cyan-400'
							>
								<svg
									className='w-12 h-12'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth='2'
										d='M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-10v2m0 10v2'
									/>
								</svg>
								FreeTask
							</Link>
							<div className='hidden md:flex items-center space-x-2'>
								<Link
									to='/'
									className='text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 px-3 py-2 rounded-md text-lg font-medium transition-all duration-300'
								>
									Главная
								</Link>
								{token && (
									<>
										<Link
											to='/chats'
											className='text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 px-3 py-2 rounded-md text-lg font-medium transition-all duration-300'
										>
											Чаты
										</Link>
										<Link
											to='/teams'
											className='text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 px-3 py-2 rounded-md text-lg font-medium transition-all duration-300'
										>
											Команды
										</Link>
										{userRole === 'Client' && (
											<Link
												to='/favorites'
												className='text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 px-3 py-2 rounded-md text-lg font-medium transition-all duration-300'
											>
												Избранное
											</Link>
										)}
										{isAdmin && (
											<Link
												to='/admin'
												className='text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 px-3 py-2 rounded-md text-lg font-medium transition-all duration-300'
											>
												Админ
											</Link>
										)}
									</>
								)}
							</div>
						</div>
						<div className='flex items-center'>
							{token ? (
								<div className='relative'>
									<button
										onClick={toggleDropdown}
										className='flex items-center space-x-2'
									>
										{avatarUrl ? (
											<img
												src={`${FILE_BASE_URL}${avatarUrl}`}
												alt='Аватар'
												className='w-10 h-10 rounded-full object-cover'
												onError={e => {
													e.target.outerHTML = `<div class='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium'>${
														userName ? userName[0].toUpperCase() : 'П'
													}</div>`;
												}}
											/>
										) : (
											<div className='w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center text-white font-medium'>
												{userName ? userName[0].toUpperCase() : 'П'}
											</div>
										)}
										<span className='text-gray-300 hidden md:inline'>
											{userName || 'Пользователь'}
										</span>
									</button>
									<AnimatePresence>
										{isDropdownOpen && (
											<motion.div
												initial='hidden'
												animate='visible'
												exit='hidden'
												variants={dropdownVariants}
												transition={{ duration: 0.25 }}
												className='absolute right-0 mt-2 w-48 bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg py-2'
											>
												<Link
													to='/profile'
													className='flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200'
													onClick={() => setIsDropdownOpen(false)}
												>
													<svg
														className='w-5 h-5 mr-2'
														fill='currentColor'
														viewBox='0 0 24 24'
													>
														<path d='M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-5.52 0-10 2.24-10 5v1h20v-1c0-2.76-4.48-5-10-5z' />
													</svg>
													Профиль
												</Link>
												<Link
													to='/settings'
													className='flex items-center px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200'
													onClick={() => setIsDropdownOpen(false)}
												>
													<svg
														className='w-5 h-5 mr-2'
														fill='currentColor'
														viewBox='0 0 24 24'
													>
														<path d='M19.14 12.94a7.5 7.5 0 00-.14-1.88l2.1-1.65a1 1 0 00.24-1.27l-2-3.46a1 1 0 00-1.2-.41l-2.48.99a7.5 7.5 0 00-1.62-1.4l.38-2.56a1 1 0 00-.95-1.15h-4a1 1 0 00-.95 1.15l.38 2.56a7.5 7.5 0 00-1.62 1.4l-2.48-.99a1 1 0 00-1.2.41l-2 3.46a1 1 0 00.24 1.27l2.1 1.65a7.5 7.5 0 00-.14 1.88 7.5 7.5 0 00.14 1.88l-2.1 1.65a1 1 0 00-.24 1.27l2 3.46a1 1 0 001.2.41l2.48-.99a7.5 7.5 0 001.62 1.4l-.38 2.56a1 1 0 00.95 1.15h4a1 1 0 00.95-1.15l-.38-2.56a7.5 7.5 0 001.62-1.4l2.48.99a1 1 0 001.2-.41l2-3.46a1 1 0 00-.24-1.27l-2.1-1.65a7.5 7.5 0 00.14-1.88zM12 15a3 3 0 110-6 3 3 0 010 6z' />
													</svg>
													Настройки
												</Link>
												<button
													onClick={handleLogout}
													className='flex items-center w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200'
												>
													<svg
														className='w-5 h-5 mr-2'
														fill='currentColor'
														viewBox='0 0 24 24'
													>
														<path d='M16 13v-2H7V8l-5 4 5 4v-3h9zM20 3h-9a2 2 0 00-2 2v2h2V5h9v14h-9v-2H9v2a2 2 0 002 2h9a2 2 0 002-2V5a2 2 0 00-2-2z' />
													</svg>
													Выход
												</button>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							) : (
								<div className='flex items-center space-x-2'>
									<Link
										to='/login'
										className='text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 px-4 py-2 rounded-full text-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-blue-500'
									>
										Вход
									</Link>
									<Link
										to='/register'
										className='text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-4 py-2 rounded-full text-lg font-semibold transition-all duration-300 focus:ring-2 focus:ring-blue-500'
									>
										Регистрация
									</Link>
								</div>
							)}
						</div>
					</div>
				</div>
			</nav>
			{/* Bottom Bar для мобильных */}
			<nav className='fixed bottom-4 left-0 right-0 z-50 mx-4 md:hidden'>
				<div className='max-w-4xl mx-auto bg-gray-900/80 backdrop-blur-md text-white rounded-full shadow-lg p-2 px-4'>
					<div className='flex justify-around items-center'>
						<Link
							to='/'
							className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
						>
							<svg
								className='w-6 h-6'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6'
								/>
							</svg>
							<span className='text-xs'>Главная</span>
						</Link>
						{token ? (
							<>
								<Link
									to='/chats'
									className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
								>
									<svg
										className='w-6 h-6'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z'
										/>
									</svg>
									<span className='text-xs'>Чаты</span>
								</Link>
								<Link
									to='/teams'
									className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
								>
									<svg
										className='w-6 h-6'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z'
										/>
									</svg>
									<span className='text-xs'>Команды</span>
								</Link>
								{userRole === 'Client' && (
									<Link
										to='/favorites'
										className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
									>
										<svg
											className='w-6 h-6'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth='2'
												d='M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z'
											/>
										</svg>
										<span className='text-xs'>Избранное</span>
									</Link>
								)}
								{isAdmin && (
									<Link
										to='/admin'
										className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
									>
										<svg
											className='w-6 h-6'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth='2'
												d='M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01-2.438-3.878L12 9.5 7.282 6.7a12.083 12.083 0 01-2.438 3.878L12 14z'
											/>
										</svg>
										<span className='text-xs'>Админ</span>
									</Link>
								)}
								<Link
									to='/profile'
									className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
								>
									{avatarUrl ? (
										<img
											src={`${FILE_BASE_URL}${avatarUrl}`}
											alt='Аватар'
											className='w-6 h-6 rounded-full object-cover'
											onError={e => {
												e.target.outerHTML = `<div class='w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium'>${
													userName ? userName[0].toUpperCase() : 'П'
												}</div>`;
											}}
										/>
									) : (
										<div className='w-6 h-6 rounded-full bg-gray-600 flex items-center justify-center text-white text-xs font-medium'>
											{userName ? userName[0].toUpperCase() : 'П'}
										</div>
									)}
									<span className='text-xs'>Профиль</span>
								</Link>
							</>
						) : (
							<>
								<Link
									to='/auth/login'
									className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
								>
									<svg
										className='w-6 h-6'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1'
										/>
									</svg>
									<span className='text-xs'>Вход</span>
								</Link>
								<Link
									to='/auth'
									className='flex flex-col items-center text-gray-300 hover:text-white transition-all duration-300'
								>
									<svg
										className='w-6 h-6'
										fill='none'
										stroke='currentColor'
										viewBox='0 0 24 24'
									>
										<path
											strokeLinecap='round'
											strokeLinejoin='round'
											strokeWidth='2'
											d='M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z'
										/>
									</svg>
									<span className='text-xs'>Регистрация</span>
								</Link>
							</>
						)}
					</div>
				</div>
			</nav>
		</>
	);
};

export default Navbar;
