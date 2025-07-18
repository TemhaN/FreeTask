import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsSection = ({
	title = 'Аналитика профиля',
	data = { recentOrders: [], statistics: {} },
}) => {
	const { recentOrders, statistics } = data;

	// Форматирование даты для русского формата (ДД.ММ.ГГГГ ЧЧ:ММ)
	const formatDate = dateString => {
		const date = new Date(dateString);
		return date.toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='bg-gray-800/50 backdrop-blur-md rounded-xl shadow-lg p-6 mt-8'
		>
			<h3 className='text-2xl font-semibold text-white mb-6'>{title}</h3>
			<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6'>
				<motion.div
					initial={{ scale: 0.9 }}
					animate={{ scale: 1 }}
					className='bg-gray-700/50 rounded-lg p-4 text-center'
				>
					<p className='text-2xl font-bold text-white'>
						{statistics.totalOrders || 0}
					</p>
					<p className='text-gray-400'>Всего заказов</p>
				</motion.div>
				<motion.div
					initial={{ scale: 0.9 }}
					animate={{ scale: 1 }}
					className='bg-gray-700/50 rounded-lg p-4 text-center'
				>
					<p className='text-2xl font-bold text-white'>
						{statistics.completedOrders || 0}
					</p>
					<p className='text-gray-400'>Завершено заказов</p>
				</motion.div>
				<motion.div
					initial={{ scale: 0.9 }}
					animate={{ scale: 1 }}
					className='bg-gray-700/50 rounded-lg p-4 text-center'
				>
					<p className='text-2xl font-bold text-white'>
						${(statistics.totalEarnings || 0).toFixed(2)}
					</p>
					<p className='text-gray-400'>Общий заработок</p>
				</motion.div>
			</div>
			<h4 className='text-xl font-semibold text-white mb-4'>
				Последние заказы
			</h4>
			{recentOrders.length > 0 ? (
				<div className='space-y-4'>
					{recentOrders.map((order, index) => (
						<motion.div
							key={order.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1 }}
							className='bg-gray-700/30 rounded-lg p-4 border border-gray-600'
						>
							<p className='text-white font-semibold'>{order.title}</p>
							<p className='text-gray-400 text-sm'>
								Статус: {order.status} | Бюджет: ${order.budget.toFixed(2)}
							</p>
							<p className='text-gray-400 text-sm'>
								Создан: {formatDate(order.createdAt)}
							</p>
							{order.client && (
								<p className='text-gray-400 text-sm'>
									Клиент: {order.client.name || 'Не указан'}
								</p>
							)}
						</motion.div>
					))}
				</div>
			) : (
				<p className='text-gray-400'>Нет недавних заказов</p>
			)}
		</motion.div>
	);
};

export default AnalyticsSection;
