import React, { useState, useEffect } from 'react';
import {
	deleteChat,
	deleteFile,
	sendTestNotification,
	getPendingReports,
} from '../api/api';
import PendingReports from '../components/Admin/PendingReports';

const AdminPage = ({ token }) => {
	const [error, setError] = useState('');
	const [chatId, setChatId] = useState('');
	const [fileId, setFileId] = useState('');
	const [notificationContent, setNotificationContent] = useState('');
	const [reports, setReports] = useState([]);

	useEffect(() => {
		const fetchReports = async () => {
			try {
				const res = await getPendingReports(1, 10, token);
				setReports(res.data);
			} catch (err) {
				setError(err.response?.data?.message || 'Бля, ошибка загрузки жалоб');
			}
		};
		fetchReports();
	}, [token]);

	const handleDeleteChat = async e => {
		e.preventDefault();
		try {
			await deleteChat(chatId, token);
			setError('Чат удалён, пиздец ему');
			setChatId('');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка удаления чата');
		}
	};

	const handleDeleteFile = async e => {
		e.preventDefault();
		try {
			await deleteFile(fileId, token);
			setError('Файл удалён, хуй с ним');
			setFileId('');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка удаления файла');
		}
	};

	const handleSendNotification = async e => {
		e.preventDefault();
		try {
			await sendTestNotification({ Content: notificationContent }, token);
			setError('Тестовое уведомление отправлено');
			setNotificationContent('');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка отправки уведомления');
		}
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Админ-панель</h2>
			{error && <p className='text-red-500 mb-4'>{error}</p>}
			<form onSubmit={handleDeleteChat} className='space-y-4 mb-4'>
				<h3 className='text-xl'>Удалить чат</h3>
				<input
					type='text'
					value={chatId}
					onChange={e => setChatId(e.target.value)}
					placeholder='ID чата'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-red-500 text-white px-4 py-2 rounded'
				>
					Удалить чат
				</button>
			</form>
			<form onSubmit={handleDeleteFile} className='space-y-4 mb-4'>
				<h3 className='text-xl'>Удалить файл</h3>
				<input
					type='text'
					value={fileId}
					onChange={e => setFileId(e.target.value)}
					placeholder='ID файла'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-red-500 text-white px-4 py-2 rounded'
				>
					Удалить файл
				</button>
			</form>
			<form onSubmit={handleSendNotification} className='space-y-4 mb-4'>
				<h3 className='text-xl'>Отправить тестовое уведомление</h3>
				<input
					type='text'
					value={notificationContent}
					onChange={e => setNotificationContent(e.target.value)}
					placeholder='Текст уведомления'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 rounded'
				>
					Отправить
				</button>
			</form>
			<PendingReports reports={reports} token={token} setError={setError} />
		</div>
	);
};

export default AdminPage;
