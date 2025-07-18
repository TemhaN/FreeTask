import React from 'react';

const TeamList = ({
	teams,
	onAddMember,
	onPlaceBid,
	onRemoveMember,
	onUpdatePortfolio,
	userId,
}) => {
	const handleAddMember = teamId => {
		const freelancerId = prompt('Введите ID фрилансера:');
		const role = prompt('Введите роль:');
		const budgetShare = prompt('Введите долю бюджета (0-1):');
		if (freelancerId && role && budgetShare) {
			onAddMember(teamId, {
				FreelancerId: freelancerId,
				Role: role,
				BudgetShare: parseFloat(budgetShare),
			});
		}
	};

	const handlePlaceBid = teamId => {
		const orderId = prompt('Введите ID заказа:');
		const amount = prompt('Введите сумму:');
		const comment = prompt('Введите комментарий:');
		if (orderId && amount && comment) {
			onPlaceBid(teamId, {
				OrderId: orderId,
				Amount: parseFloat(amount),
				Comment: comment,
			});
		}
	};

	const handleUpdatePortfolio = teamId => {
		const file = prompt('Выберите файл портфолио:');
		const description = prompt('Введите описание:');
		const formData = new FormData();
		formData.append('File', file);
		if (description) formData.append('Description', description);
		onUpdatePortfolio(teamId, formData);
	};

	return (
		<div>
			{teams.map(team => (
				<div key={team.Id} className='border p-4 mb-4 rounded'>
					<h3 className='text-lg font-bold'>{team.Name}</h3>
					<p>Навыки: {team.Skills.join(', ')}</p>
					<p>Лидер: {team.LeaderId}</p>
					{team.LeaderId === userId && (
						<>
							<button
								onClick={() => handleAddMember(team.Id)}
								className='bg-blue-500 text-white px-4 py-2 rounded mr-2'
							>
								Добавить участника
							</button>
							<button
								onClick={() => handlePlaceBid(team.Id)}
								className='bg-green-500 text-white px-4 py-2 rounded mr-2'
							>
								Подать заявку
							</button>
							<button
								onClick={() =>
									onRemoveMember(team.Id, prompt('Введите ID участника:'))
								}
								className='bg-red-500 text-white px-4 py-2 rounded mr-2'
							>
								Удалить участника
							</button>
							<button
								onClick={() => handleUpdatePortfolio(team.Id)}
								className='bg-yellow-500 text-white px-4 py-2 rounded'
							>
								Обновить портфолио
							</button>
						</>
					)}
				</div>
			))}
		</div>
	);
};

export default TeamList;
