import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
	acceptOrder,
	cancelOrder,
	createPayment,
	createInvoice,
	updateOrderStatus,
	createReview,
	sendMessage,
	confirmOrder,
	completeOrder,
} from '../../api/api';
import { loadStripe } from '@stripe/stripe-js';
import {
	Elements,
	CardElement,
	useStripe,
	useElements,
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe(
	'pk_test_51RcApbRhoL0HJTfMUe9XTThFDogcuESuhBRlGktNVPLq0pZ8b185dlJhxSSF8LbHWRkMitNXdMaT7I5zaKjj1CAS002IKdIkq8'
);

const CheckoutForm = ({ orderId, invoice, token, onSuccess, setError }) => {
	const stripe = useStripe();
	const elements = useElements();
	const [isProcessing, setIsProcessing] = useState(false);

	const handleSubmit = async e => {
		e.preventDefault();
		if (!stripe || !elements) return;

		setIsProcessing(true);
		try {
			const { clientSecret } = await createPayment(token, orderId, {
				amount: invoice.amount * 100, // в тиынах
				invoiceId: invoice.id,
			}).then(res => res.data);

			const { error, paymentIntent } = await stripe.confirmCardPayment(
				clientSecret,
				{
					payment_method: {
						card: elements.getElement(CardElement),
					},
				}
			);

			if (error) {
				setError(error.message || 'Ошибка при обработке платежа');
			} else if (paymentIntent.status === 'succeeded') {
				onSuccess();
			}
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при создании платежа');
		} finally {
			setIsProcessing(false);
		}
	};

	return (
		<motion.form
			onSubmit={handleSubmit}
			className='bg-gray-800 p-4 rounded-lg shadow-md'
			initial={{ opacity: 0, scale: 0.95 }}
			animate={{ opacity: 1, scale: 1 }}
			transition={{ duration: 0.3 }}
		>
			<h3 className='font-semibold text-white mb-2'>
				Оплатить ${invoice.amount}
			</h3>
			<CardElement
				className='p-3 bg-gray-700 text-white rounded-lg border border-gray-600'
				options={{
					style: {
						base: {
							color: '#ffffff',
							'::placeholder': { color: '#a0aec0' },
						},
						invalid: { color: '#f56565' },
					},
				}}
			/>
			<button
				type='submit'
				disabled={isProcessing || !stripe}
				className={`mt-4 px-6 py-3 rounded-lg w-full font-semibold transition-all duration-300 ${
					isProcessing || !stripe
						? 'bg-gray-500 cursor-not-allowed'
						: 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500'
				}`}
			>
				{isProcessing ? 'Обработка...' : 'Оплатить'}
			</button>
		</motion.form>
	);
};

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
	const [showInvoiceForm, setShowInvoiceForm] = useState(false);
	const [invoiceAmount, setInvoiceAmount] = useState('');
	const [invoice, setInvoice] = useState(
		order.invoices?.[0]
			? {
					id: order.invoices[0].id,
					amount: order.invoices[0].amount,
					status: order.invoices[0].status || 'Pending',
			  }
			: null
	);
	const [showPaymentForm, setShowPaymentForm] = useState(false);
	const [reviewData, setReviewData] = useState({
		rating: 5,
		comment: '',
		isAnonymous: false,
	});
	const messageSentRef = useRef(false);

	React.useEffect(() => {
		console.log('OrderActions render check', {
			paymentStatus,
			invoice,
			showPaymentForm,
			orderStatus,
			orderInvoices: order.invoices,
		});
	}, [paymentStatus, invoice, showPaymentForm, orderStatus, order.invoices]);

	const sendSystemMessage = useCallback(
		async content => {
			if (messageSentRef.current) return;
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
		},
		[token, chatId, setMessages]
	);

	const handleAcceptOrder = useCallback(async () => {
		if (isLoading) return;
		setIsLoading(true);
		setError('');
		messageSentRef.current = false;
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
			await acceptOrder(token, orderId, {
				freelancerId: userId,
				accept: false,
			});
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
			if (userRole === 'Freelancer') {
				console.log('Calling completeOrder with:', { token, orderId });
				await completeOrder(token, orderId);
			} else if (userRole === 'Client' && showReviewForm) {
				await confirmOrder(token, orderId); // Сначала подтверждаем заказ
				await createReview(
					{
						orderId,
						rating: reviewData.rating,
						comment: reviewData.comment,
						isAnonymous: reviewData.isAnonymous,
					},
					token
				); // Затем создаём отзыв
			}
			onActionComplete('OrderCompleted');
			await sendSystemMessage('Заказ завершён.');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при завершении заказа');
			console.error('handleCompleteOrder error:', err.response?.data || err);
		} finally {
			setIsLoading(false);
		}
	}, [
		orderId,
		token,
		userRole,
		showReviewForm,
		reviewData,
		onActionComplete,
		sendSystemMessage,
	]);

	const handlePayOrder = useCallback(() => {
		setShowPaymentForm(true);
		setError('');
	}, []);

	const handleCreateInvoice = useCallback(async () => {
		if (isLoading || !invoiceAmount || invoiceAmount > order.budget) return;
		setIsLoading(true);
		setError('');
		try {
			const response = await createInvoice(token, orderId, {
				amount: invoiceAmount,
			});
			setInvoice({
				id: response.data.id,
				amount: invoiceAmount,
				status: response.data.status || 'Pending',
			});
			setShowInvoiceForm(false);
			setInvoiceAmount('');
			onActionComplete('InvoiceCreated');
			await sendSystemMessage(`Счёт на ${invoiceAmount}$ выставлен.`);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка при выставлении счёта');
		} finally {
			setIsLoading(false);
		}
	}, [
		orderId,
		token,
		invoiceAmount,
		order.budget,
		onActionComplete,
		sendSystemMessage,
		isLoading,
	]);

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
			<motion.div
				className='flex flex-col gap-4'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				<AnimatePresence>
					{error && (
						<motion.div
							className='text-red-400 text-center'
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							{error}
						</motion.div>
					)}
				</AnimatePresence>
				<div className='flex gap-2 flex-wrap'>
					{(invoice?.status === 'Pending' || paymentStatus === 'Pending') &&
						invoice &&
						!showPaymentForm && (
							<button
								onClick={() => {
									console.log('handlePayOrder triggered', {
										orderId,
										invoice,
										paymentStatus,
										invoiceStatus: invoice?.status,
									});
									handlePayOrder();
								}}
								disabled={isLoading}
								className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
									isLoading
										? 'bg-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500'
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
								className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
									isLoading
										? 'bg-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-500'
								}`}
							>
								Подтвердить заказ и оставить отзыв
							</button>
						)}
					{(orderStatus === 'Open' || orderStatus === 'InProgress') && (
						<button
							onClick={handleCancelOrder}
							disabled={isLoading}
							className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
								isLoading
									? 'bg-gray-500 cursor-not-allowed'
									: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-red-500'
							}`}
						>
							Отменить заказ
						</button>
					)}
				</div>
				{showPaymentForm && invoice && (
					<Elements stripe={stripePromise}>
						<CheckoutForm
							orderId={orderId}
							invoice={invoice}
							token={token}
							onSuccess={() => {
								setShowPaymentForm(false);
								onActionComplete('OrderPaid');
								sendSystemMessage(
									`Оплата за заказ (${invoice.amount}$) выполнена.`
								);
								setInvoice(null);
							}}
							setError={setError}
						/>
					</Elements>
				)}
				{showReviewForm && (
					<motion.div
						className='bg-gray-800 p-4 rounded-lg shadow-md'
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<h3 className='font-semibold text-white mb-2'>Оставить отзыв</h3>
						<div className='flex flex-col gap-2'>
							<label className='text-white'>
								Рейтинг:
								<select
									name='rating'
									value={reviewData.rating}
									onChange={handleReviewChange}
									className='border p-2 rounded w-full bg-gray-700 text-white'
								>
									{[1, 2, 3, 4, 5].map(num => (
										<option key={num} value={num}>
											{num}
										</option>
									))}
								</select>
							</label>
							<label className='text-white'>
								Комментарий:
								<textarea
									name='comment'
									value={reviewData.comment}
									onChange={handleReviewChange}
									className='border p-2 rounded w-full bg-gray-700 text-white'
									rows='4'
								/>
							</label>
							<label className='flex items-center gap-2 text-white'>
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
								className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
									isLoading
										? 'bg-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500'
								}`}
							>
								Отправить отзыв и завершить
							</button>
						</div>
					</motion.div>
				)}
			</motion.div>
		);
	}

	if (userRole === 'Freelancer') {
		return (
			<motion.div
				className='flex flex-col gap-4'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.3 }}
			>
				<AnimatePresence>
					{error && (
						<motion.div
							className='text-red-400 text-center'
							initial={{ opacity: 0, y: -10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
						>
							{error}
						</motion.div>
					)}
				</AnimatePresence>
				<div className='flex gap-2 flex-wrap'>
					{orderStatus === 'Open' && (
						<>
							<button
								onClick={handleAcceptOrder}
								disabled={isLoading}
								className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
									isLoading
										? 'bg-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500'
								}`}
							>
								Принять заказ
							</button>
							<button
								onClick={handleDeclineOrder}
								disabled={isLoading}
								className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
									isLoading
										? 'bg-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-red-600 to-pink-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-red-500'
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
								className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
									isLoading
										? 'bg-gray-500 cursor-not-allowed'
										: 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-purple-500'
								}`}
							>
								Выставить счет
							</button>
						)}
					{orderStatus === 'InProgress' &&
						paymentStatus === 'Pending' &&
						invoice && (
							<div className='text-gray-400'>
								Счет на ${invoice.amount} выставлен (ожидает оплаты)
							</div>
						)}
					{orderStatus === 'InProgress' && paymentStatus === 'Paid' && (
						<button
							onClick={handleCompleteOrder}
							disabled={isLoading}
							className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
								isLoading
									? 'bg-gray-500 cursor-not-allowed'
									: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-blue-500'
							}`}
						>
							Завершить заказ
						</button>
					)}
				</div>
				{showInvoiceForm && (
					<motion.div
						className='bg-gray-800 p-4 rounded-lg shadow-md'
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
					>
						<h3 className='font-semibold text-white mb-2'>Выставить счет</h3>
						<div className='flex flex-col gap-2'>
							<label className='text-white'>
								Сумма (макс. ${order.budget}):
								<input
									type='number'
									value={invoiceAmount}
									onChange={e => setInvoiceAmount(e.target.value)}
									className='border p-2 rounded w-full bg-gray-700 text-white'
									placeholder={`Введите сумму до ${order.budget}`}
									min='1'
									max={order.budget}
								/>
							</label>
							<div className='flex gap-2'>
								<button
									onClick={handleCreateInvoice}
									disabled={isLoading}
									className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
										isLoading
											? 'bg-gray-500 cursor-not-allowed'
											: 'bg-gradient-to-r from-green-600 to-teal-600 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-green-500'
									}`}
								>
									Отправить счет
								</button>
								<button
									onClick={toggleInvoiceForm}
									disabled={isLoading}
									className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
										isLoading
											? 'bg-gray-500 cursor-not-allowed'
											: 'bg-gradient-to-r from-gray-600 to-gray-700 text-white hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-gray-500'
									}`}
								>
									Отмена
								</button>
							</div>
						</div>
					</motion.div>
				)}
			</motion.div>
		);
	}

	return null;
};

export default OrderActions;
