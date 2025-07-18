// useChatListSignalR.js
import { useState, useEffect, useRef, useCallback } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { FILE_BASE_URL } from '../api/api';

const useChatListSignalR = (token, userId, setChats, setError) => {
	const [connection, setConnection] = useState(null);
	const connectionRef = useRef(null);
	const isConnectingRef = useRef(false);

	const initializeConnection = useCallback(async () => {
		if (connectionRef.current || isConnectingRef.current) {
			console.debug(
				'SignalR: Connection already exists or is being initialized'
			);
			return;
		}

		isConnectingRef.current = true;
		console.debug('SignalR: Initializing new connection for chat list');

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

			// Обработка события UpdateChats
			connect.on('UpdateChats', updatedChats => {
				console.debug('SignalR: Received UpdateChats', updatedChats);
				setChats(prev => {
					const sortedChats = updatedChats.sort((a, b) => {
						const aTime = a.lastMessage?.sentAt || a.createdAt;
						const bTime = b.lastMessage?.sentAt || b.createdAt;
						return new Date(bTime) - new Date(aTime);
					});
					return sortedChats;
				});
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
			isConnectingRef.current = false;
		} catch (err) {
			console.error('SignalR: Failed to initialize connection:', err);
			setError('Не удалось подключиться к чату: ' + err.message);
			isConnectingRef.current = false;
		}
	}, [token, userId, setChats, setError]);

	useEffect(() => {
		if (!token || !userId) {
			console.warn('SignalR: Missing token or userId');
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
		};
	}, [initializeConnection, token, userId]);

	return { connection };
};

export default useChatListSignalR;
