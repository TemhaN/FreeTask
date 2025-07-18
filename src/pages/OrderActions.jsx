import React, { useState, useCallback } from 'react';
import {
	releasePayment,
	updateOrderStatus,
	createReview,
	getPaymentStatus,
	acceptOrder,
	cancelOrder,
	createPayment,
	createInvoice,
} from '../api/api';

const OrderActions = ({
	orderId,
	userId,
	token,
	onActionComplete,
	chatId,
	userRole,
	orderStatus,
	paymentStatus, // Новый пропс для статуса платежа
}) => {
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [showReviewForm, setShowReviewForm] = useState(false);
	const [reviewData, setReviewData] = useState({
		rating: 5,
		comment: '',
		isAnonymous: false,
	});

	// Оплата заказа для клиента
	const handlePayOrder = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			const payment = await createPayment(token, orderId, { amount: 0 }); // Сумма будет браться из заказа на сервере
			console.log('Payment created:', payment.data);
			onActionComplete('OrderPaid');
			alert('Оплата инициирована. Проверьте статус платежа.');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при оплате заказа');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, onActionComplete]);

	// Отмена заказа для клиента
	const handleCancelOrder = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			await cancelOrder(token, orderId);
			onActionComplete('OrderCancelled');
			alert('Заказ отменен');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при отмене заказа');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, onActionComplete]);

	// Завершение заказа и отзыв для клиента
	const handleCompleteOrder = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			await updateOrderStatus(orderId, { status: 'Completed' }, token);
			if (showReviewForm) {
				await createReview(
					{
						orderId,
						rating: reviewData.rating,
						comment: reviewData.comment,
						isAnonymous: reviewData.isAnonymous,
					},
					token
				);
				alert('Заказ завершен, отзыв оставлен');
			} else {
				alert('Заказ завершен');
			}
			onActionComplete('OrderCompleted');
			setShowReviewForm(false);
			setReviewData({ rating: 5, comment: '', isAnonymous: false });
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при завершении заказа');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, reviewData, showReviewForm, onActionComplete]);

	// Принятие заказа для фрилансера
	const handleAcceptOrder = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			await acceptOrder(token, orderId, { freelancerId: userId });
			onActionComplete('OrderAccepted');
			alert('Заказ принят');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при принятии заказа');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, userId, onActionComplete]);

	// Отклонение заказа для фрилансера
	const handleDeclineOrder = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			await cancelOrder(token, orderId); // Используем тот же API для отклонения
			onActionComplete('OrderDeclined');
			alert('Заказ отклонен');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при отклонении заказа');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, onActionComplete]);

	// Выставление счета для фрилансера
	const handleCreateInvoice = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			await createInvoice(token, orderId, { amount: 0 }); // Сумма будет браться из заказа
			onActionComplete('InvoiceCreated');
			alert('Счет выставлен');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при выставлении счета');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, onActionComplete]);

	const handleReviewChange = useCallback(e => {
		const { name, value, type, checked } = e.target;
		setReviewData(prev => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	}, []);

	const toggleReviewForm = useCallback(() => {
		setShowReviewForm(prev => !prev);
	}, []);

	// Рендер для клиента
	if (userRole === 'Client') {
		return (
			<div className='flex flex-col gap-4'>
				{error && <div className='text-red-500'>{error}</div>}
				<div className='flex gap-2 flex-wrap'>
					{/* Показываем "Оплатить заказ" только если платеж не оплачен */}
					{paymentStatus === 'Pending' && (
						<button
							onClick={handlePayOrder}
							disabled={isLoading}
							className={`px-4 py-2 rounded ${
								isLoading
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-green-500 text-white hover:bg-green-600'
							}`}
						>
							Оплатить заказ
						</button>
					)}
					{/* Показываем "Завершить заказ" только после оплаты */}
					{paymentStatus === 'Paid' && (
						<button
							onClick={toggleReviewForm}
							disabled={isLoading}
							className={`px-4 py-2 rounded ${
								isLoading
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-blue-500 text-white hover:bg-blue-600'
							}`}
						>
							Завершить заказ
						</button>
					)}
					{/* Показываем "Отменить заказ" в статусах Open или InProgress */}
					{(orderStatus === 'Open' || orderStatus === 'InProgress') && (
						<button
							onClick={handleCancelOrder}
							disabled={isLoading}
							className={`px-4 py-2 rounded ${
								isLoading
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-red-500 text-white hover:bg-red-600'
							}`}
						>
							Отменить заказ
						</button>
					)}
				</div>
				{showReviewForm && (
					<div className='bg-white p-4 rounded-lg shadow-md'>
						<h3 className='font-semibold mb-2'>Оставить отзыв</h3>
						<div className='flex flex-col gap-2'>
							<label>
								Рейтинг:
								<select
									name='rating'
									value={reviewData.rating}
									onChange={handleReviewChange}
									className='border p-2 rounded w-full'
								>
									{[1, 2, 3, 4, 5].map(num => (
										<option key={num} value={num}>
											{num}
										</option>
									))}
								</select>
							</label>
							<label>
								Комментарий:
								<textarea
									name='comment'
									value={reviewData.comment}
									onChange={handleReviewChange}
									className='border p-2 rounded w-full'
									rows='4'
								/>
							</label>
							<label className='flex items-center gap-2'>
								<input
									type='checkbox'
									name='isAnonymous'
									checked={reviewData.isAnonymous}
									onChange={handleReviewChange}
								/>
								Оставить анонимно
							</label>
							<button
								onClick={handleCompleteOrder}
								disabled={isLoading}
								className={`px-4 py-2 rounded ${
									isLoading
										? 'bg-gray-400 cursor-not-allowed'
										: 'bg-green-500 text-white hover:bg-green-600'
								}`}
							>
								Отправить отзыв и завершить
							</button>
						</div>
					</div>
				)}
			</div>
		);
	}

	// Рендер для фрилансера
	if (userRole === 'Freelancer') {
		return (
			<div className='flex flex-col gap-4'>
				{error && <div className='text-red-500'>{error}</div>}
				<div className='flex gap-2 flex-wrap'>
					{/* Показываем "Принять/Отклонить" только в статусе Open */}
					{orderStatus === 'Open' && (
						<>
							<button
								onClick={handleAcceptOrder}
								disabled={isLoading}
								className={`px-4 py-2 rounded ${
									isLoading
										? 'bg-gray-400 cursor-not-allowed'
										: 'bg-green-500 text-white hover:bg-green-600'
								}`}
							>
								Принять заказ
							</button>
							<button
								onClick={handleDeclineOrder}
								disabled={isLoading}
								className={`px-4 py-2 rounded ${
									isLoading
										? 'bg-gray-400 cursor-not-allowed'
										: 'bg-red-500 text-white hover:bg-red-600'
								}`}
							>
								Отклонить заказ
							</button>
						</>
					)}
					{/* Показываем "Выставить счет" в статусе InProgress, если платеж не создан */}
					{orderStatus === 'InProgress' && paymentStatus === 'Pending' && (
						<button
							onClick={handleCreateInvoice}
							disabled={isLoading}
							className={`px-4 py-2 rounded ${
								isLoading
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-purple-500 text-white hover:bg-purple-600'
							}`}
						>
							Выставить счет
						</button>
					)}
				</div>
			</div>
		);
	}

	return null; // Для других ролей ничего не рендерим
};

export default OrderActions;
