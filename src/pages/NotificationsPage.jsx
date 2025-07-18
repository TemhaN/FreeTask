import React, { useState, useEffect } from 'react';
import { getNotifications, markAsRead } from '../api/api';
import Notifications from '../components/Notifications/Notifications';

const NotificationsPage = ({ token, userId }) => {
	const [notifications, setNotifications] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchNotifications = async () => {
			try {
				const res = await getNotifications(1, 10, token);
				setNotifications(res.data);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки уведомлений');
			}
		};
		fetchNotifications();
	}, [token]);

	const handleMarkAsRead = async id => {
		try {
			await markAsRead(id, token);
			setNotifications(
				notifications.map(n => (n.Id === id ? { ...n, IsRead: true } : n))
			);
			setError('Уведомление помечено как прочитанное');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка отметки уведомления');
		}
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Уведомления</h2>
			{error && <p className='text-red-500 mb-4'>{error}</p>}
			<Notifications
				notifications={notifications}
				onMarkAsRead={handleMarkAsRead}
			/>
		</div>
	);
};

export default NotificationsPage;
