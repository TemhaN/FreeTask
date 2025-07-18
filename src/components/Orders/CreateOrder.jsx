import React, { useState } from 'react';

const CreateOrder = ({ onSubmit }) => {
	const [title, setTitle] = useState('');
	const [description, setDescription] = useState('');
	const [category, setCategory] = useState('');
	const [subCategory, setSubCategory] = useState('');
	const [budget, setBudget] = useState('');
	const [type, setType] = useState('Fixed');
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [deadline, setDeadline] = useState('');

	const handleSubmit = e => {
		e.preventDefault();
		onSubmit({
			Title: title,
			Description: description,
			Category: category,
			SubCategory: subCategory,
			Budget: parseFloat(budget),
			Type: type,
			IsAnonymous: isAnonymous,
			Deadline: deadline,
		});
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4 mb-4'>
			<div>
				<label className='block'>Название</label>
				<input
					type='text'
					value={title}
					onChange={e => setTitle(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<div>
				<label className='block'>Описание</label>
				<textarea
					value={description}
					onChange={e => setDescription(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<div>
				<label className='block'>Категория</label>
				<input
					type='text'
					value={category}
					onChange={e => setCategory(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<div>
				<label className='block'>Подкатегория</label>
				<input
					type='text'
					value={subCategory}
					onChange={e => setSubCategory(e.target.value)}
					className='w-full border p-2 rounded'
				/>
			</div>
			<div>
				<label className='block'>Бюджет</label>
				<input
					type='number'
					value={budget}
					onChange={e => setBudget(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<div>
				<label className='block'>Тип</label>
				<select
					value={type}
					onChange={e => setType(e.target.value)}
					className='w-full border p-2 rounded'
				>
					<option value='Fixed'>Фиксированный</option>
					<option value='Hourly'>Почасовой</option>
				</select>
			</div>
			<div>
				<label className='block'>
					<input
						type='checkbox'
						checked={isAnonymous}
						onChange={e => setIsAnonymous(e.target.checked)}
					/>
					Анонимный
				</label>
			</div>
			<div>
				<label className='block'>Дедлайн</label>
				<input
					type='datetime-local'
					value={deadline}
					onChange={e => setDeadline(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<button
				type='submit'
				className='bg-blue-500 text-white px-4 py-2 rounded'
			>
				Создать
			</button>
		</form>
	);
};

export default CreateOrder;
