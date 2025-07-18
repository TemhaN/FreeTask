import React, { useState } from 'react';

const Report = ({ onSubmit }) => {
	const [contentId, setContentId] = useState('');
	const [contentType, setContentType] = useState('');
	const [reason, setReason] = useState('');

	const handleSubmit = e => {
		e.preventDefault();
		onSubmit({
			ContentId: contentId,
			ContentType: contentType,
			Reason: reason,
		});
		setContentId('');
		setContentType('');
		setReason('');
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4'>
			<div>
				<label className='block'>ID контента</label>
				<input
					type='text'
					value={contentId}
					onChange={e => setContentId(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<div>
				<label className='block'>Тип контента</label>
				<select
					value={contentType}
					onChange={e => setContentType(e.target.value)}
					className='w-full border p-2 rounded'
					required
				>
					<option value=''>Выбери тип</option>
					<option value='Message'>Сообщение</option>
					<option value='Order'>Заказ</option>
					<option value='Profile'>Профиль</option>
					<option value='Portfolio'>Портфолио</option>
				</select>
			</div>
			<div>
				<label className='block'>Причина жалобы</label>
				<textarea
					value={reason}
					onChange={e => setReason(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<button type='submit' className='bg-red-500 text-white px-4 py-2 rounded'>
				Отправить жалобу
			</button>
		</form>
	);
};

export default Report;
