import React, {
	useState,
	useEffect,
	useRef,
	useCallback,
	useMemo,
} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import {
	getMessages,
	sendMessage,
	updateMessage,
	deleteMessage,
	getOrder,
	getChat,
	getUserProfile,
	getProfile,
	getPaymentStatus,
} from '../api/api';
import { FILE_BASE_URL } from '../api/api';
import OrderActions from '../components/OrderActions';
import MessagesList from './MessagesList';

const ChatMessagesPage = ({ userId, token }) => {
	const { chatId } = useParams();
	const navigate = useNavigate();
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [connection, setConnection] = useState(null);
	const [isTyping, setIsTyping] = useState(false);
	const [deletingMessageId, setDeletingMessageId] = useState(null);
	const [toast, setToast] = useState('');
	const [contextMenu, setContextMenu] = useState({
		visible: false,
		x: 0,
		y: 0,
		messageId: null,
	});
	const [editingMessageId, setEditingMessageId] = useState(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [order, setOrder] = useState(null);
	const [freelancer, setFreelancer] = useState(null);
	const [client, setClient] = useState(null);
	const [timeLeft, setTimeLeft] = useState('');
	const [userRole, setUserRole] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState('Pending');
	const [selectedFile, setSelectedFile] = useState(null);
	const [isRecording, setIsRecording] = useState(false);
	const [audioBlob, setAudioBlob] = useState(null);
	const [recordingTime, setRecordingTime] = useState(0);
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const typingTimeoutRef = useRef(null);
	const contextMenuRef = useRef(null);
	const contextMenuTimeoutRef = useRef(null);
	const connectionRef = useRef(null);
	const mediaRecorderRef = useRef(null);
	const fileInputRef = useRef(null);
	const recordingTimerRef = useRef(null);

	const isValidUrl = useCallback(string => {
		try {
			const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
			return urlPattern.test(string) && string.includes('.');
		} catch (e) {
			return false;
		}
	}, []);

	const formatDate = useCallback(dateString => {
		if (!dateString) return 'Не указан';
		const date = new Date(dateString);
		if (isNaN(date.getTime())) return 'Не указан';
		return date.toLocaleString('ru-RU', {
			timeZone: 'Asia/Yekaterinburg',
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
		});
	}, []);

	const calculateTimeLeft = useCallback(deadline => {
		if (!deadline || isNaN(new Date(deadline).getTime())) {
			return 'Не указан';
		}
		const now = new Date();
		const end = new Date(deadline);
		end.setHours(end.getHours() + 5);
		const diff = end - now;
		if (diff <= 0) return 'Истёк';
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${days}д ${hours}ч ${minutes}м`;
	}, []);

	const formatField = useCallback(value => {
		return value && value.trim() !== 'вфывфвф' ? value : 'Не указано';
	}, []);

	const handleInputChange = useCallback(
		e => {
			setNewMessage(e.target.value);
			if (connection && connection.state === 'Connected') {
				connection
					.invoke('NotifyTyping', chatId.toString(), userId.toString())
					.catch(err => console.warn('Failed to notify typing:', err.message));
			}
		},
		[connection, chatId, userId]
	);

	const handleFileChange = useCallback(e => {
		const file = e.target.files[0];
		if (file) {
			const allowedTypes = [
				'image/jpeg',
				'image/png',
				'application/pdf',
				'audio/mpeg',
				'video/mp4',
				'video/quicktime',
			];
			if (!allowedTypes.includes(file.type)) {
				setError(
					'Недопустимый тип файла. Поддерживаются: JPG, PNG, PDF, MP3, MP4, MOV'
				);
				setSelectedFile(null);
				return;
			}
			if (file.size > 10 * 1024 * 1024) {
				setError('Файл превышает лимит в 10 МБ');
				setSelectedFile(null);
				return;
			}
			setSelectedFile(file);
			setError('');
		}
	}, []);

	const startRecording = useCallback(async () => {
		try {
			const permissionStatus = await navigator.permissions.query({
				name: 'microphone',
			});
			if (permissionStatus.state === 'denied') {
				setToast(
					'Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.'
				);
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const supportedMimeTypes = [
				'audio/webm;codecs=opus',
				'audio/ogg;codecs=opus',
				'audio/webm',
				'audio/ogg',
				'audio/mpeg',
				'audio/mp3',
			];
			const mimeType =
				supportedMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
				'audio/webm';

			if (!MediaRecorder.isTypeSupported(mimeType)) {
				setToast('Запись аудио не поддерживается в этом браузере.');
				stream.getTracks().forEach(track => track.stop());
				return;
			}

			mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
			const chunks = [];

			mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
			mediaRecorderRef.current.onstop = () => {
				const extension = mimeType.includes('webm')
					? 'webm'
					: mimeType.includes('ogg')
					? 'ogg'
					: 'mp3';
				const blob = new Blob(chunks, { type: mimeType });
				setAudioBlob(
					new File([blob], `voice-${Date.now()}.${extension}`, {
						type: mimeType,
					})
				);
				stream.getTracks().forEach(track => track.stop());
				clearInterval(recordingTimerRef.current);
				setRecordingTime(0);
			};

			mediaRecorderRef.current.start();
			setIsRecording(true);
			setRecordingTime(0);
			recordingTimerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
		} catch (err) {
			console.error('Recording error:', err);
			setToast(
				err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
					? 'Доступ к микрофону запрещён. Проверьте настройки браузера.'
					: err.name === 'NotFoundError'
					? 'Микрофон не найден. Подключите устройство.'
					: `Ошибка записи: ${err.message}`
			);
		}
	}, []);

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			clearInterval(recordingTimerRef.current);
		}
	}, [isRecording]);

	const handleContextMenu = useCallback((e, messageId) => {
		e.preventDefault();
		setContextMenu({
			visible: true,
			x: e.clientX,
			y: e.clientY,
			messageId,
		});
		contextMenuTimeoutRef.current = setTimeout(() => {
			setContextMenu(prev => ({ ...prev, visible: false }));
		}, 5000);
	}, []);

	const handleMouseEnter = useCallback(() => {
		if (contextMenuTimeoutRef.current)
			clearTimeout(contextMenuTimeoutRef.current);
	}, []);

	const handleMouseLeave = useCallback(() => {
		contextMenuTimeoutRef.current = setTimeout(() => {
			setContextMenu(prev => ({ ...prev, visible: false }));
		}, 200);
	}, []);

	const handleEditMessage = useCallback(() => {
		const message = messages.find(msg => msg.id === contextMenu.messageId);
		if (message) {
			setNewMessage(message.content);
			setEditingMessageId(message.id);
			setContextMenu(prev => ({ ...prev, visible: false }));
		}
	}, [messages, contextMenu.messageId]);

	const handleDeleteMessage = useCallback(() => {
		setDeletingMessageId(contextMenu.messageId);
		setShowDeleteConfirm(true);
		setContextMenu(prev => ({ ...prev, visible: false }));
	}, [contextMenu.messageId]);

	const confirmDeleteMessage = useCallback(async () => {
		try {
			await deleteMessage(token, chatId, deletingMessageId);
			setShowDeleteConfirm(false);
			setDeletingMessageId(null);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка удаления сообщения');
		}
	}, [token, chatId, deletingMessageId]);

	const handleCancelEdit = useCallback(() => {
		setNewMessage('');
		setEditingMessageId(null);
		setSelectedFile(null);
		setAudioBlob(null);
	}, []);

	const handleOrderActionComplete = useCallback(
		action => {
			if (action === 'OrderAccepted') {
				setOrder(prev => ({
					...prev,
					status: 'InProgress',
					freelancerId: userId,
				}));
			} else if (action === 'OrderCompleted') {
				setOrder(prev => ({
					...prev,
					status: 'Completed',
				}));
			} else if (action === 'OrderDeclined' || action === 'OrderCancelled') {
				setOrder(prev => ({
					...prev,
					status: 'Cancelled',
					freelancerId: null,
				}));
			} else if (action === 'OrderPaid') {
				setPaymentStatus('Paid');
			} else if (action === 'InvoiceCreated') {
				setPaymentStatus('Pending');
			}
		},
		[userId]
	);

	const fetchMoreMessages = useCallback(async () => {
		if (!hasMore || isLoading) return;
		setIsLoading(true);
		try {
			const nextPage = page + 1;
			const messagesRes = await getMessages(token, chatId, nextPage, 20);
			const newMessages = messagesRes.data.reverse();
			console.log('Fetched messages:', newMessages.length);
			setMessages(prev => [...newMessages, ...prev]);
			setPage(nextPage);
			setHasMore(newMessages.length === 20);
		} catch (err) {
			setToast('Ошибка при загрузке сообщений');
			console.error('Fetch more messages error:', err);
		} finally {
			setIsLoading(false);
		}
	}, [hasMore, isLoading, page, token, chatId]);

	useEffect(() => {
		if (order) {
			const updateTimer = () => setTimeLeft(calculateTimeLeft(order.deadline));
			updateTimer();
			if (order.deadline) {
				const interval = setInterval(updateTimer, 60000);
				return () => clearInterval(interval);
			}
		}
	}, [order, calculateTimeLeft]);

	useEffect(() => {
		if (!token || !chatId || !userId) {
			setError('Токен, ID чата или пользователя отсутствует');
			setIsLoading(false);
			return;
		}

		console.log('useEffect triggered with dependencies:', {
			chatId,
			token,
			userId,
		});

		let isMounted = true;

		const fetchProfileAndData = async () => {
			try {
				const profileRes = await getProfile(token);
				const role =
					profileRes.data.role.toLowerCase() === 'freelancer'
						? 'Freelancer'
						: 'Client';
				console.log('User role:', role);
				if (isMounted) setUserRole(role);

				const messagesRes = await getMessages(token, chatId, 1, 20);
				if (isMounted) {
					setMessages(messagesRes.data.reverse());
					setPage(1);
					setHasMore(messagesRes.data.length === 20);
				}

				const chatRes = await getChat(token, chatId);
				const chat = chatRes.data;
				if (chat?.orderId && isMounted) {
					const orderRes = await getOrder(chat.orderId, token);
					console.log('Order data:', orderRes.data);
					setOrder(orderRes.data);
					setTimeLeft(calculateTimeLeft(orderRes.data.deadline));

					try {
						const paymentRes = await getPaymentStatus(token, chat.orderId);
						setPaymentStatus(paymentRes.data.status || 'Pending');
					} catch (err) {
						console.warn('No payment found, assuming Pending:', err.message);
						setPaymentStatus('Pending');
					}

					if (!orderRes.data.isAnonymous && orderRes.data.clientId) {
						setClient(orderRes.data.client);
					} else {
						const clientRes = await getUserProfile(orderRes.data.clientId);
						setClient(clientRes.data);
					}

					if (orderRes.data.freelancerId) {
						const freelancerRes = await getUserProfile(
							orderRes.data.freelancerId
						);
						setFreelancer(freelancerRes.data);
					}
				}
			} catch (err) {
				if (err.response?.status === 401) {
					setError('Сессия истекла, войдите снова');
					localStorage.removeItem('token');
					localStorage.removeItem('userId');
					localStorage.removeItem('userRole');
					navigate('/login');
				} else {
					setError(err.response?.data?.message || 'Ошибка загрузки данных');
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		const initializeConnection = async () => {
			if (connectionRef.current) return;

			try {
				const connect = new HubConnectionBuilder()
					.withUrl(`${FILE_BASE_URL}/chatHub`, {
						accessTokenFactory: () => {
							if (!token) throw new Error('No token available');
							return token;
						},
						withCredentials: false,
					})
					.configureLogging(LogLevel.Debug)
					.withAutomaticReconnect([0, 2000, 10000, 30000])
					.build();

				connect.on('ReceiveMessage', message => {
					if (message.chatId === chatId && isMounted) {
						setMessages(prev => {
							if (!prev.some(msg => msg.id === message.id)) {
								return [...prev, message];
							}
							return prev;
						});
					}
				});

				connect.on('UserTyping', senderId => {
					if (senderId !== userId && isMounted) {
						if (typingTimeoutRef.current)
							clearTimeout(typingTimeoutRef.current);
						setIsTyping(true);
						typingTimeoutRef.current = setTimeout(
							() => setIsTyping(false),
							1000
						);
					}
				});

				connect.on('MessageUpdated', updatedMessage => {
					if (updatedMessage.chatId === chatId && isMounted) {
						setMessages(prev =>
							prev.map(msg =>
								msg.id === updatedMessage.id
									? { ...msg, content: updatedMessage.content, isEdited: true }
									: msg
							)
						);
						setEditingMessageId(null);
						setNewMessage('');
					}
				});

				connect.on('MessageDeleted', messageId => {
					if (isMounted) {
						setMessages(prev => prev.filter(msg => msg.id !== messageId));
					}
				});

				connect.onclose(err => {
					if (isMounted) {
						setError(
							'Соединение закрыто: ' + (err?.message || 'Неизвестная ошибка')
						);
					}
				});

				connectionRef.current = connect;
				await connect.start();
				if (isMounted) {
					setConnection(connect);
					await connect.invoke('JoinChat', chatId.toString());
				}
			} catch (err) {
				if (isMounted) {
					setError('Не удалось подключиться к чату: ' + err.message);
				}
			}
		};

		fetchProfileAndData();
		initializeConnection();

		return () => {
			isMounted = false;
			if (connectionRef.current) {
				connectionRef.current
					.stop()
					.catch(err => console.error('Error stopping SignalR:', err));
				connectionRef.current = null;
			}
			if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
			if (contextMenuTimeoutRef.current)
				clearTimeout(contextMenuTimeoutRef.current);
		};
	}, [chatId, token, userId, navigate, calculateTimeLeft]);

	useEffect(() => {
		if (order) {
			const updateTimer = () => setTimeLeft(calculateTimeLeft(order.deadline));
			updateTimer();
			if (order.deadline) {
				const interval = setInterval(updateTimer, 60000);
				return () => clearInterval(interval);
			}
		}
	}, [order, calculateTimeLeft]);

	useEffect(() => {
		if (toast) {
			const timer = setTimeout(() => setToast(''), 5000);
			return () => clearTimeout(timer);
		}
	}, [toast]);

	const handleSendMessage = useCallback(
		async e => {
			e.preventDefault();
			if (!newMessage.trim() && !selectedFile && !audioBlob) return;

			try {
				if (editingMessageId) {
					await updateMessage(token, chatId, editingMessageId, {
						content: newMessage,
					});
				} else {
					const messageData = {
						content: newMessage || '',
						attachment: selectedFile || audioBlob,
						isVoice: !!audioBlob,
					};
					await sendMessage(token, chatId, messageData);
				}
				setNewMessage('');
				setSelectedFile(null);
				setAudioBlob(null);
				setEditingMessageId(null);
				if (fileInputRef.current) fileInputRef.current.value = '';
			} catch (err) {
				if (err.response?.status === 401) {
					setError('Сессия истекла, войдите снова');
					localStorage.removeItem('token');
					navigate('/login');
				} else {
					const errorMessage =
						err.response?.data?.details ||
						err.response?.data?.message ||
						'Ошибка отправки сообщения';
					setToast(errorMessage);
				}
			}
		},
		[
			newMessage,
			selectedFile,
			audioBlob,
			editingMessageId,
			token,
			chatId,
			navigate,
		]
	);

	const memoizedMessages = useMemo(() => messages, [messages]);

	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-screen'>
				Загрузка...
			</div>
		);
	}
	if (error) {
		return <div className='text-red-500 text-center'>{error}</div>;
	}
	if (userRole && userRole !== 'Freelancer' && userRole !== 'Client') {
		return (
			<div className='text-red-500 text-center'>
				Только фрилансеры или клиенты могут просматривать чат
			</div>
		);
	}

	return (
		<div className='flex flex-col h-screen bg-gray-100'>
			<h1 className='text-2xl font-bold p-4 bg-blue-600 text-white'>Чат</h1>
			{order && (
				<div className='sticky top-0 z-10 bg-white shadow-md p-4 border-b'>
					<div className='flex flex-col gap-4'>
						<div>
							<h2 className='text-xl font-bold'>{formatField(order.title)}</h2>
							<p className='text-gray-600'>{formatField(order.description)}</p>
							<p className='text-gray-800 font-semibold'>
								Бюджет: ${order.budget}
							</p>
							<p className='text-gray-800'>
								Дедлайн: {formatDate(order.deadline)}
							</p>
							<p className='text-red-500 font-bold'>Осталось: {timeLeft}</p>
							<p className='text-gray-600'>
								Статус: {order.status === 'Open' ? 'Открыт' : order.status}
							</p>
							<p className='text-gray-600'>
								Статус платежа:{' '}
								{paymentStatus === 'Pending' ? 'Ожидает оплаты' : paymentStatus}
							</p>
						</div>
						<div className='flex flex-col gap-4'>
							{userRole === 'Client' && (
								<div className='flex items-center gap-4'>
									{freelancer ? (
										<>
											{freelancer.avatarUrl ? (
												<img
													src={`${FILE_BASE_URL}${freelancer.avatarUrl}`}
													alt='Freelancer Avatar'
													className='w-12 h-12 rounded-full'
												/>
											) : (
												<div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center'>
													<span className='text-white font-semibold'>
														{freelancer.name ? freelancer.name[0] : 'F'}
													</span>
												</div>
											)}
											<div>
												<p className='font-semibold'>
													{freelancer.name || 'Без имени'}
												</p>
												<button
													onClick={() => navigate(`/user/${freelancer.id}`)}
													className='text-blue-500 underline'
												>
													Перейти к профилю
												</button>
											</div>
										</>
									) : (
										<p className='text-gray-500'>Загрузка фрилансера...</p>
									)}
								</div>
							)}
							{userRole === 'Freelancer' && (
								<div className='flex items-center gap-4'>
									{order.isAnonymous ? (
										<div>
											<p className='font-semibold'>Аноним</p>
											<p className='text-gray-500'>
												Заказчик скрыл свои данные
											</p>
										</div>
									) : (
										client && (
											<>
												{client.avatarUrl ? (
													<img
														src={`${FILE_BASE_URL}${client.avatarUrl}`}
														alt='Client Avatar'
														className='w-12 h-12 rounded-full'
													/>
												) : (
													<div className='w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center'>
														<span className='text-white font-semibold'>
															{client.name ? client.name[0] : 'C'}
														</span>
													</div>
												)}
												<div>
													<p className='font-semibold'>
														{client.name || 'Без имени'}
													</p>
													<button
														onClick={() => navigate(`/client/${client.id}`)}
														className='text-blue-500 underline'
													>
														Перейти к профилю
													</button>
												</div>
											</>
										)
									)}
								</div>
							)}
							{order && (
								<OrderActions
									orderId={order.id}
									userId={userId}
									token={token}
									onActionComplete={handleOrderActionComplete}
									chatId={chatId}
									userRole={userRole}
									orderStatus={order.status}
									paymentStatus={paymentStatus}
								/>
							)}
						</div>
					</div>
				</div>
			)}
			<MessagesList
				messages={memoizedMessages}
				userId={userId}
				isTyping={isTyping}
				hasMore={hasMore}
				isLoading={isLoading}
				fetchMoreMessages={fetchMoreMessages}
				handleContextMenu={handleContextMenu}
				formatDate={formatDate}
				isValidUrl={isValidUrl}
			/>
			{contextMenu.visible && (
				<div
					ref={contextMenuRef}
					className='absolute bg-white border border-gray-300 rounded shadow-lg'
					style={{ top: contextMenu.y, left: contextMenu.x }}
					onMouseLeave={handleMouseLeave}
					onMouseEnter={handleMouseEnter}
				>
					<button
						onClick={handleEditMessage}
						className='block w-full text-left px-4 py-2 hover:bg-gray-100'
					>
						Редактировать
					</button>
					<button
						onClick={handleDeleteMessage}
						className='block w-full text-left px-4 py-2 hover:bg-gray-100 text-red-500'
					>
						Удалить
					</button>
				</div>
			)}
			{showDeleteConfirm && (
				<div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
					<div className='bg-white p-6 rounded-lg shadow-lg max-w-sm w-full'>
						<h2 className='text-lg font-bold mb-4'>Подтверждение удаления</h2>
						<p className='mb-6'>
							Вы уверены, что хотите удалить это сообщение?
						</p>
						<div className='flex justify-end space-x-4'>
							<button
								onClick={() => setShowDeleteConfirm(false)}
								className='bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600'
							>
								Отмена
							</button>
							<button
								onClick={confirmDeleteMessage}
								className='bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600'
							>
								Подтвердить
							</button>
						</div>
					</div>
				</div>
			)}
			{toast && (
				<div className='fixed bottom-4 left-4 bg-red-500 text-white p-3 rounded-lg shadow-lg max-w-sm z-50'>
					{toast}
				</div>
			)}
			<form
				onSubmit={handleSendMessage}
				className='flex p-4 bg-white border-t items-center gap-2'
			>
				<input
					type='file'
					accept='image/jpeg,image/png,application/pdf,audio/mpeg,video/mp4,video/quicktime'
					onChange={handleFileChange}
					className='hidden'
					ref={fileInputRef}
				/>
				<button
					type='button'
					onClick={() => fileInputRef.current.click()}
					className='bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400'
					title='Прикрепить файл'
				>
					📎
				</button>
				{isRecording ? (
					<button
						type='button'
						onClick={stopRecording}
						className='bg-red-500 text-white p-2 rounded hover:bg-red-600'
						title='Остановить запись'
					>
						🛑 {recordingTime}s
					</button>
				) : (
					<button
						type='button'
						onClick={startRecording}
						className='bg-gray-300 text-gray-800 p-2 rounded hover:bg-gray-400'
						title='Записать голосовое'
					>
						🎤
					</button>
				)}
				<input
					type='text'
					value={newMessage}
					onChange={handleInputChange}
					className='flex-1 p-2 border rounded-l-lg focus:outline-none'
					placeholder={
						editingMessageId
							? 'Редактировать сообщение...'
							: 'Напишите сообщение...'
					}
					disabled={isRecording}
				/>
				{selectedFile && (
					<span className='text-sm text-gray-600 truncate max-w-xs'>
						{selectedFile.name}
					</span>
				)}
				{audioBlob && (
					<span className='text-sm text-gray-600'>
						Голосовое сообщение готово
					</span>
				)}
				{editingMessageId ? (
					<>
						<button
							type='submit'
							className='bg-green-500 text-white px-4 py-2 rounded-r-lg hover:bg-green-600'
						>
							Сохранить
						</button>
						<button
							type='button'
							onClick={handleCancelEdit}
							className='bg-red-500 text-white px-4 py-2 ml-2 rounded hover:bg-red-600'
						>
							Отмена
						</button>
					</>
				) : (
					<button
						type='submit'
						className='bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600'
						disabled={isRecording}
					>
						Отправить
					</button>
				)}
			</form>
		</div>
	);
};

export default ChatMessagesPage;
