import React, { useState, useEffect } from 'react';
import {
	getOrders,
	createOrder,
	placeBid,
	updateOrderStatus,
	extendDeadline,
} from '../api/api';
import CreateOrder from '../components/Orders/CreateOrder';
import OrderList from '../components/Orders/OrderList';

const OrdersPage = ({ token, userId }) => {
	const [orders, setOrders] = useState([]);
	const [error, setError] = useState('');

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await getOrders({});
				setOrders(res.data);
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка загрузки заказов');
			}
		};
		fetchOrders();
	}, []);

	const handleCreateOrder = async data => {
		try {
			const res = await createOrder(data, token);
			setOrders([...orders, res.data]);
			setError('Заказ создан');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка создания заказа');
		}
	};

	const handlePlaceBid = async (orderId, data) => {
		try {
			await placeBid(orderId, data, token);
			setError('Заявка подана');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка подачи заявки');
		}
	};

	const handleUpdateStatus = async (orderId, status) => {
		try {
			await updateOrderStatus(orderId, { Status: status }, token);
			setOrders(
				orders.map(order =>
					order.Id === orderId ? { ...order, Status: status } : order
				)
			);
			setError('Статус обновлён');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка обновления статуса');
		}
	};

	const handleExtendDeadline = async (orderId, newDeadline) => {
		try {
			await extendDeadline(orderId, { NewDeadline: newDeadline }, token);
			setError('Дедлайн продлён');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка продления дедлайна');
		}
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Заказы</h2>
			{error && <p className='text-red-500 mb-4'>{error}</p>}
			<CreateOrder onSubmit={handleCreateOrder} />
			<OrderList
				orders={orders}
				onPlaceBid={handlePlaceBid}
				onUpdateStatus={handleUpdateStatus}
				onExtendDeadline={handleExtendDeadline}
				userId={userId}
			/>
		</div>
	);
};

export default OrdersPage;
