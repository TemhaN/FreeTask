// useSignalR.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import {
	FILE_BASE_URL,
	sendMessage,
	updateMessage,
	deleteMessage,
	markChatAsRead,
} from '../api/api';

const useSignalR = (token, chatId, userId, messages, setMessages, setError) => {
	const [connection, setConnection] = useState(null);
	const [isTyping, setIsTyping] = useState(false);
	const [editingMessageId, setEditingMessageId] = useState(null);
	const [newMessage, setNewMessage] = useState('');
	const [contextMenu, setContextMenu] = useState({
		visible: false,
		x: 0,
		y: 0,
		messageId: null,
	});
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [deletingMessageId, setDeletingMessageId] = useState(null);
	const connectionRef = useRef(null);
	const typingTimeoutRef = useRef(null);
	const isConnectingRef = useRef(false);

	const handleSendMessage = useCallback(
		async (e, selectedFile, audioBlob) => {
			e.preventDefault();
			if (!newMessage.trim() && !selectedFile && !audioBlob) return;

			console.log('handleSendMessage called:', {
				editingMessageId,
				newMessage,
				selectedFile,
				audioBlob,
			});

			try {
				if (editingMessageId) {
					console.log('Editing message:', editingMessageId);
					await updateMessage(token, chatId, editingMessageId, {
						content: newMessage,
					});
					setMessages(prev =>
						prev.map(msg =>
							msg.id === editingMessageId
								? { ...msg, content: newMessage, isEdited: true }
								: msg
						)
					);
					setNewMessage('');
					setEditingMessageId(null);
				} else {
					console.log('Sending new message');
					const messageData = {
						content: newMessage || '',
						attachment: selectedFile || audioBlob,
						isVoice: !!audioBlob,
					};
					const response = await sendMessage(token, chatId, messageData);
					setMessages(prev => {
						if (!prev.some(msg => msg.id === response.data.id)) {
							return [...prev, response.data];
						}
						return prev;
					});
					setNewMessage('');
				}
			} catch (err) {
				console.error('Error in handleSendMessage:', err);
				if (err.response?.status === 401) {
					setError('Сессия истекла, войдите снова');
					localStorage.removeItem('token');
					window.location.href = '/login';
				} else {
					setError(
						err.response?.data?.message ||
							'Ошибка отправки/редактирования сообщения'
					);
				}
			}
		},
		[newMessage, editingMessageId, token, chatId, setError, setMessages]
	);

	const handleEditMessage = useCallback(() => {
		const message = messages.find(msg => msg.id === contextMenu.messageId);
		if (message) {
			setNewMessage(message.content || '');
			setEditingMessageId(message.id);
			setContextMenu(prev => ({ ...prev, visible: false }));
		}
	}, [
		contextMenu.messageId,
		messages,
		setNewMessage,
		setEditingMessageId,
		setContextMenu,
	]);

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
	}, [token, chatId, deletingMessageId, setError]);

	const initializeConnection = useCallback(async () => {
		if (connectionRef.current || isConnectingRef.current) {
			console.debug(
				'SignalR: Connection already exists or is being initialized'
			);
			return;
		}

		isConnectingRef.current = true;
		console.debug('SignalR: Initializing new connection');

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
				if (message.chatId === chatId) {
					setMessages(prev => {
						if (!prev.some(msg => msg.id === message.id)) {
							return [...prev, message];
						}
						return prev;
					});
				}
			});

			connect.on('UserTyping', senderId => {
				if (senderId !== userId) {
					if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
					setIsTyping(true);
					typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 1000);
				}
			});

			connect.on('MessageUpdated', updatedMessage => {
				if (updatedMessage.chatId === chatId) {
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
				setMessages(prev => prev.filter(msg => msg.id !== messageId));
			});

			connect.onclose(err => {
				setError(
					'Соединение закрыто: ' + (err?.message || 'Неизвестная ошибка')
				);
				isConnectingRef.current = false;
			});

			connectionRef.current = connect;
			await connect.start();
			console.debug('SignalR: Connection started successfully');
			setConnection(connect);
			await connect.invoke('JoinChat', chatId.toString());
			// Отмечаем чат как прочитанный при подключении
			await markChatAsRead(connect, chatId);
			console.debug('SignalR: Joined chat', chatId);
			isConnectingRef.current = false;
		} catch (err) {
			console.error('SignalR: Failed to initialize connection:', err);
			setError('Не удалось подключиться к чату: ' + err.message);
			isConnectingRef.current = false;
		}
	}, [token, chatId, userId, setMessages, setError]);

	useEffect(() => {
		if (!token || !chatId || !userId) {
			console.warn('SignalR: Missing token, chatId, or userId');
			return;
		}

		initializeConnection();

		return () => {
			if (connectionRef.current && !isConnectingRef.current) {
				console.debug('SignalR: Stopping connection');
				connectionRef.current
					.stop()
					.catch(err =>
						console.error('SignalR: Error stopping connection:', err)
					);
				connectionRef.current = null;
			}
			if (typingTimeoutRef.current) {
				clearTimeout(typingTimeoutRef.current);
			}
		};
	}, [initializeConnection, token, chatId, userId]);

	useEffect(() => {
		if (connection && connection.state === 'Connected' && newMessage) {
			const handleTyping = () => {
				connection.invoke('NotifyTyping', chatId.toString()).catch(err => {
					console.warn('SignalR: Failed to notify typing:', err.message);
				});
			};
			handleTyping();
		}
	}, [newMessage, connection, chatId]);

	return {
		connection,
		isTyping,
		setIsTyping,
		editingMessageId,
		setEditingMessageId,
		newMessage,
		setNewMessage,
		handleSendMessage,
		handleEditMessage,
		handleDeleteMessage,
		confirmDeleteMessage,
		contextMenu,
		setContextMenu,
		showDeleteConfirm,
		setShowDeleteConfirm,
		deletingMessageId,
		setDeletingMessageId,
	};
};

export default useSignalR;
