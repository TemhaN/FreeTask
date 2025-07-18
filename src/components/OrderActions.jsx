import React, { useState, useCallback } from 'react';
import {
	acceptOrder,
	cancelOrder,
	createPayment,
	createInvoice,
	updateOrderStatus,
	createReview,
} from '../../api/api';

	const OrderActions = ({
		orderId,
		userId,
		token,
		onActionComplete,
		chatId,
		userRole,
		orderStatus,
		paymentStatus,
		order,
		setMessages,
	}) => {
		const [error, setError] = useState('');
		const [isLoading, setIsLoading] = useState(false);
		const [showReviewForm, setShowReviewForm] = useState(false);
		const [reviewData, setReviewData] = useState({
			rating: 5,
			comment: '',
			isAnonymous: false,
		});
		const messageSentRef = useRef(false); // Флаг для предотвращения дублирования
	
		const sendSystemMessage = useCallback(async (content) => {
			if (messageSentRef.current) return; // Пропускаем, если сообщение уже отправлено
			try {
				messageSentRef.current = true;
				const messageData = {
					content,
					isVoice: false,
					attachment: null,
				};
				const response = await sendMessage(token, chatId, messageData);
				setMessages(prev => [...prev, response.data]);
			} catch (err) {
				console.error('Failed to send system message:', err);
			}
		}, [token, chatId, setMessages]);
	
		const handleAcceptOrder = useCallback(async () => {
			if (isLoading) return; // Блокируем повторные вызовы
			setIsLoading(true);
			setError('');
			messageSentRef.current = false; // Сбрасываем флаг перед новым действием
			try {
				await acceptOrder(token, orderId, { freelancerId: userId, accept: true });
				onActionComplete('OrderAccepted');
				await sendSystemMessage('Фрилансер принял заказ.');
			} catch (err) {
				setError(
					err.response?.data?.message === 'Order is not open for acceptance'
						? 'Заказ не открыт для принятия. Пожалуйста, уточните у клиента.'
						: err.response?.data?.message || 'Ошибка при принятии заказа'
				);
			} finally {
				setIsLoading(false);
			}
		}, [orderId, token, userId, onActionComplete, sendSystemMessage, isLoading]);
	
		const handleDeclineOrder = useCallback(async () => {
			if (isLoading) return;
			setIsLoading(true);
			setError('');
			messageSentRef.current = false;
			try {
				await acceptOrder(token, orderId, { freelancerId: userId, accept: false });
				onActionComplete('OrderDeclined');
				await sendSystemMessage('Фрилансер отклонил заказ.');
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка при отклонении заказа');
			} finally {
				setIsLoading(false);
			}
		}, [orderId, token, userId, onActionComplete, sendSystemMessage, isLoading]);
	
		const handleCancelOrder = useCallback(async () => {
			if (isLoading) return;
			setIsLoading(true);
			setError('');
			messageSentRef.current = false;
			try {
				await cancelOrder(token, orderId);
				onActionComplete('OrderCancelled');
				await sendSystemMessage('Заказ был отменён.');
			} catch (err) {
				setError(err.response?.data?.message || 'Ошибка при отмене заказа');
			} finally {
				setIsLoading(false);
			}
		}, [orderId, token, onActionComplete, sendSystemMessage, isLoading]);

	const handleCompleteOrder = useCallback(async () => {
		setIsLoading(true);
		setError('');
		try {
			await updateOrderStatus(
				orderId,
				{ status: 'CompletedByFreelancer' },
				token
			);
			if (userRole === 'Client' && showReviewForm) {
				await createReview(
					{
						orderId,
						rating: reviewData.rating,
						comment: reviewData.comment,
						isAnonymous: reviewData.isAnonymous,
					},
					token
				);
			}
			onActionComplete('OrderCompleted');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при завершении заказа');
		} finally {
			setIsLoading(false);
		}
	}, [orderId, token, userRole, showReviewForm, reviewData, onActionComplete]);

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

	const toggleInvoiceForm = useCallback(() => {
		setShowInvoiceForm(prev => !prev);
		setError('');
	}, []);

	if (userRole === 'Client') {
		return (
			<div className='flex flex-col gap-4'>
				{error && <div className='text-red-500'>{error}</div>}
				<div className='flex gap-2 flex-wrap'>
					{paymentStatus === 'Pending' && invoice && (
						<button
							onClick={handlePayOrder}
							disabled={isLoading}
							className={`px-4 py-2 rounded ${
								isLoading
									? 'bg-gray-400 cursor-not-allowed'
									: 'bg-green-500 text-white hover:bg-green-600'
							}`}
						>
							Оплатить счет (${invoice.amount})
						</button>
					)}
					{paymentStatus === 'Paid' &&
						orderStatus === 'CompletedByFreelancer' && (
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

	if (userRole === 'Freelancer') {
		return (
			<div className='flex flex-col gap-4'>
				{error && <div className='text-red-500'>{error}</div>}
				<div className='flex gap-2 flex-wrap'>
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
					{orderStatus === 'InProgress' &&
						paymentStatus === 'Pending' &&
						!invoice && (
							<button
								onClick={toggleInvoiceForm}
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
					{orderStatus === 'InProgress' &&
						paymentStatus === 'Pending' &&
						invoice && (
							<div className='text-gray-600'>
								Счет на ${invoice.amount} выставлен (ожидает оплаты)
							</div>
						)}
					{orderStatus === 'InProgress' && paymentStatus === 'Paid' && (
						<button
							onClick={handleCompleteOrder}
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
				</div>
				{showInvoiceForm && (
					<div className='bg-white p-4 rounded-lg shadow-md'>
						<h3 className='font-semibold mb-2'>Выставить счет</h3>
						<div className='flex flex-col gap-2'>
							<label>
								Сумма (макс. ${order.budget}):
								<input
									type='number'
									value={invoiceAmount}
									onChange={e => setInvoiceAmount(e.target.value)}
									className='border p-2 rounded w-full'
									placeholder={`Введите сумму до ${order.budget}`}
									min='1'
									max={order.budget}
								/>
							</label>
							<div className='flex gap-2'>
								<button
									onClick={handleCreateInvoice}
									disabled={isLoading}
									className={`px-4 py-2 rounded ${
										isLoading
											? 'bg-gray-400 cursor-not-allowed'
											: 'bg-green-500 text-white hover:bg-green-600'
									}`}
								>
									Отправить счет
								</button>
								<button
									onClick={toggleInvoiceForm}
									disabled={isLoading}
									className={`px-4 py-2 rounded ${
										isLoading
											? 'bg-gray-400 cursor-not-allowed'
											: 'bg-gray-500 text-white hover:bg-gray-600'
									}`}
								>
									Отмена
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	}

	return null;
};

export default OrderActions;
