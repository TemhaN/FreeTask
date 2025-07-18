import React, { useState } from 'react';

const CreateTeam = ({ onSubmit }) => {
	const [name, setName] = useState('');
	const [skills, setSkills] = useState('');

	const handleSubmit = e => {
		e.preventDefault();
		onSubmit({ Name: name, Skills: skills.split(',') });
	};

	return (
		<form onSubmit={handleSubmit} className='space-y-4 mb-4'>
			<div>
				<label className='block'>Название команды</label>
				<input
					type='text'
					value={name}
					onChange={e => setName(e.target.value)}
					className='w-full border p-2 rounded'
					required
				/>
			</div>
			<div>
				<label className='block'>Навыки (через запятую)</label>
				<input
					type='text'
					value={skills}
					onChange={e => setSkills(e.target.value)}
					className='w-full border p-2 rounded'
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

export default CreateTeam;
