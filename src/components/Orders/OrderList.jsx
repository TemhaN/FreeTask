import React from 'react';

const OrderList = ({
	orders,
	onPlaceBid,
	onUpdateStatus,
	onExtendDeadline,
	userId,
}) => {
	const handleBid = orderId => {
		const amount = prompt('Введите сумму заявки:');
		const comment = prompt('Введите комментарий:');
		if (amount && comment) {
			onPlaceBid(orderId, { Amount: parseFloat(amount), Comment: comment });
		}
	};

	const handleStatus = orderId => {
		const status = prompt(
			'Введите новый статус (InProgress, Completed, etc.):'
		);
		if (status) {
			onUpdateStatus(orderId, status);
		}
	};

	const handleExtend = orderId => {
		const newDeadline = prompt('Введите новый дедлайн (YYYY-MM-DDTHH:MM):');
		if (newDeadline) {
			onExtendDeadline(orderId, newDeadline);
		}
	};

	return (
		<div>
			{orders.map(order => (
				<div key={order.Id} className='border p-4 mb-4 rounded'>
					<h3 className='text-lg font-bold'>{order.Title}</h3>
					<p>{order.Description}</p>
					<p>Категория: {order.Category}</p>
					<p>Бюджет: {order.Budget}</p>
					<p>Статус: {order.Status}</p>
					<p>Дедлайн: {new Date(order.Deadline).toLocaleString()}</p>
					{order.ClientId !== userId && (
						<button
							onClick={() => handleBid(order.Id)}
							className='bg-blue-500 text-white px-4 py-2 rounded mr-2'
						>
							Подать заявку
						</button>
					)}
					{order.ClientId === userId && (
						<>
							<button
								onClick={() => handleStatus(order.Id)}
								className='bg-green-500 text-white px-4 py-2 rounded mr-2'
							>
								Обновить статус
							</button>
							<button
								onClick={() => handleExtend(order.Id)}
								className='bg-yellow-500 text-white px-4 py-2 rounded'
							>
								Продлить дедлайн
							</button>
						</>
					)}
				</div>
			))}
		</div>
	);
};

export default OrderList;
