import React, { useState } from 'react';
import { reportContent } from '../api/api';
import Report from '../components/Moderation/Report';

const ModerationPage = ({ token, userId }) => {
	const [error, setError] = useState('');

	const handleReport = async data => {
		try {
			await reportContent(data, token);
			setError('Жалоба отправлена, пиздец нарушителю');
		} catch (err) {
			setError(err.response?.data?.message || 'Бля, ошибка отправки жалобы');
		}
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Модерация</h2>
			{error && <p className='text-red-500 mb-4'>{error}</p>}
			<Report onSubmit={handleReport} />
		</div>
	);
};

export default ModerationPage;
