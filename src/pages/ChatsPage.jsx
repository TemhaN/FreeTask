import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getChats, markChatAsRead } from '../api/api';
import useChatListSignalR from '../hooks/useChatListSignalR';
import { FILE_BASE_URL } from '../api/api';
import placeholderImage from '../images/placeholder.png';

const ChatsPage = ({ userId, token }) => {
	const [chats, setChats] = useState([]);
	const [filteredChats, setFilteredChats] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [searchQuery, setSearchQuery] = useState('');
	const { connection } = useChatListSignalR(token, userId, setChats, setError);

	useEffect(() => {
		const fetchChats = async () => {
			if (!token) {
				setError('Токен отсутствует. Пожалуйста, войдите в систему.');
				setIsLoading(false);
				return;
			}
			try {
				setIsLoading(true);
				const res = await getChats(token);
				const sortedChats = res.data.sort((a, b) => {
					const aTime = a.lastMessage?.sentAt || a.createdAt;
					const bTime = b.lastMessage?.sentAt || b.createdAt;
					return new Date(bTime) - new Date(aTime);
				});
				setChats(sortedChats);
				setFilteredChats(sortedChats);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки чатов');
			} finally {
				setIsLoading(false);
			}
		};
		fetchChats();
	}, [token]);

	useEffect(() => {
		const filtered = chats.filter(chat => {
			const name = chat.name || '';
			const orderTitle = chat.orderId ? `Заказ ${chat.orderId}` : '';
			return (
				name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				orderTitle.toLowerCase().includes(searchQuery.toLowerCase())
			);
		});
		setFilteredChats(filtered);
	}, [searchQuery, chats]);

	const handleRetry = async () => {
		setError('');
		setIsLoading(true);
		try {
			const res = await getChats(token);
			const sortedChats = res.data.sort((a, b) => {
				const aTime = a.lastMessage?.sentAt || a.createdAt;
				const bTime = b.lastMessage?.sentAt || b.createdAt;
				return new Date(bTime) - new Date(aTime);
			});
			setChats(sortedChats);
			setFilteredChats(sortedChats);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка загрузки чатов');
		} finally {
			setIsLoading(false);
		}
	};

	const handleChatClick = async chatId => {
		if (connection) {
			try {
				await markChatAsRead(connection, chatId);
			} catch (err) {
				setError('Ошибка при отметке чата как прочитанного');
				console.error('Error marking chat as read:', err);
			}
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className='bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen py-10 px-4 sm:px-6 lg:px-8'
		>
			<div className='max-w-5xl mx-auto'>
				<h1 className='text-4xl font-bold text-white mb-8 text-center'>
					Мои чаты
				</h1>

				{/* Поиск */}
				<div className='relative mb-8'>
					<div className='absolute inset-0 -bottom-2 bg-gradient-to-r from-cyan-500 via-purple-500 to-blue-500 rounded-full blur-2xl opacity-50'></div>
					<div className='relative flex items-center'>
						<svg
							className='w-6 h-6 text-cyan-400 absolute left-4'
							fill='none'
							stroke='currentColor'
							viewBox='0 0 24 24'
						>
							<path
								strokeLinecap='round'
								strokeLinejoin='round'
								strokeWidth='2'
								d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
							/>
						</svg>
						<input
							type='text'
							placeholder='Поиск по имени чата или заказу...'
							value={searchQuery}
							onChange={e => setSearchQuery(e.target.value)}
							className='w-full bg-gray-800/70 text-white border border-gray-600 rounded-full backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 p-4 pl-12 pr-4 text-lg transition-all duration-300'
						/>
					</div>
				</div>

				{/* Лоадер */}
				{isLoading && (
					<div className='flex justify-center items-center my-12'>
						<svg
							className='animate-spin h-8 w-8 text-cyan-500'
							xmlns='http://www.w3.org/2000/svg'
							fill='none'
							viewBox='0 0 24 24'
						>
							<circle
								className='opacity-25'
								cx='12'
								cy='12'
								r='10'
								stroke='currentColor'
								strokeWidth='4'
							></circle>
							<path
								className='opacity-75'
								fill='currentColor'
								d='M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z'
							></path>
						</svg>
					</div>
				)}

				{/* Ошибка */}
				{error && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className='bg-red-900/50 border border-red-600 text-red-300 px-6 py-4 rounded-xl mb-8 flex justify-between items-center'
					>
						<span>{error}</span>
						<button
							onClick={handleRetry}
							className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300'
						>
							Повторить
						</button>
					</motion.div>
				)}

				{/* Список чатов */}
				<AnimatePresence>
					{!isLoading && !error && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className='grid gap-6'
						>
							{filteredChats.length === 0 ? (
								<p className='text-gray-400 text-center text-lg'>
									У вас нет чатов
								</p>
							) : (
								filteredChats.map((chat, index) => (
									<motion.div
										key={chat.id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.1 }}
									>
										<Link
											to={`/chat/${chat.id}`}
											onClick={() => handleChatClick(chat.id)}
											className='block bg-gray-800/50 backdrop-blur-md p-6 rounded-xl border border-gray-700 hover:border-cyan-500 hover:shadow-xl transition-all duration-300'
										>
											<div className='flex items-center'>
												<img
													src={
														chat.avatarUrl
															? `${FILE_BASE_URL}${chat.avatarUrl}`
															: placeholderImage
													}
													alt={chat.name || 'Avatar'}
													className='w-14 h-14 rounded-full object-cover mr-4 ring-2 ring-cyan-500/50'
													onError={e => {
														e.target.src = placeholderImage;
													}}
												/>
												<div className='flex-1'>
													<div className='flex justify-between items-center'>
														<h2 className='text-xl font-semibold text-white'>
															{chat.name || `Чат ${chat.id}`}
														</h2>
														{chat.hasUnreadMessages && (
															<span className='bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full'>
																Новое
															</span>
														)}
													</div>
													<p className='text-sm text-gray-400 mt-1'>
														{chat.orderId
															? `Заказ ${chat.orderId}`
															: 'Нет заказа'}
													</p>
													<p className='text-sm text-gray-300 truncate mt-1'>
														{chat.lastMessage?.content || 'Нет сообщений'}
													</p>
													<p className='text-sm text-gray-500 mt-1'>
														{chat.lastMessage?.sentAt
															? new Date(
																	chat.lastMessage.sentAt
															  ).toLocaleString('ru-RU', {
																	day: '2-digit',
																	month: '2-digit',
																	year: 'numeric',
																	hour: '2-digit',
																	minute: '2-digit',
															  })
															: new Date(chat.createdAt).toLocaleString(
																	'ru-RU',
																	{
																		day: '2-digit',
																		month: '2-digit',
																		year: 'numeric',
																		hour: '2-digit',
																		minute: '2-digit',
																	}
															  )}
													</p>
												</div>
											</div>
										</Link>
									</motion.div>
								))
							)}
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</motion.div>
	);
};

export default ChatsPage;
