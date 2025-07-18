import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	getMessages,
	getOrder,
	getChat,
	getUserProfile,
	getProfile,
} from '../api/api';

const useChatData = (token, chatId, userId) => {
	const [messages, setMessages] = useState([]);
	const [order, setOrder] = useState(null);
	const [freelancer, setFreelancer] = useState(null);
	const [client, setClient] = useState(null);
	const [userRole, setUserRole] = useState(null);
	const [paymentStatus, setPaymentStatus] = useState('Pending');
	const [invoice, setInvoice] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [page, setPage] = useState(1);
	const [hasMore, setHasMore] = useState(true);
	const [timeLeft, setTimeLeft] = useState('');

	const navigate = useNavigate();

	const calculateTimeLeft = useCallback(deadline => {
		if (!deadline || isNaN(new Date(deadline).getTime())) {
			return 'Не указан';
		}
		const now = new Date();
		const end = new Date(deadline);
		end.setHours(end.getHours() + 5); // Коррекция часового пояса (+05:00)
		const diff = end - now;
		if (diff <= 0) return 'Истёк';
		const days = Math.floor(diff / (1000 * 60 * 60 * 24));
		const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		return `${days}д ${hours}ч ${minutes}м`;
	}, []);

	const fetchMoreMessages = useCallback(async () => {
		if (!hasMore || isLoading) return;
		setIsLoading(true);
		try {
			const nextPage = page + 1;
			const messagesRes = await getMessages(token, chatId, nextPage, 20);
			const newMessages = messagesRes.data.reverse();
			setMessages(prev => [...newMessages, ...prev]);
			setPage(nextPage);
			setHasMore(newMessages.length === 20);
		} catch (err) {
			setError('Ошибка при загрузке сообщений: ' + err.message);
			console.error('Fetch more messages error:', err);
		} finally {
			setIsLoading(false);
		}
	}, [hasMore, isLoading, page, token, chatId]);

	useEffect(() => {
		if (!token || !chatId || !userId) {
			setError('Токен, ID чата или пользователя отсутствует');
			setIsLoading(false);
			return;
		}

		let isMounted = true;

		const fetchData = async () => {
			try {
				console.log('Fetching data with token:', token);
				const [profileRes, chatRes, messagesRes] = await Promise.all([
					getProfile(token).catch(err => {
						throw new Error(`getProfile failed: ${err.message}`);
					}),
					getChat(token, chatId).catch(err => {
						throw new Error(`getChat failed: ${err.message}`);
					}),
					getMessages(token, chatId, 1, 20).catch(err => {
						throw new Error(`getMessages failed: ${err.message}`);
					}),
				]);

				if (!isMounted) return;

				console.log('Chat response:', chatRes.data);
				const role =
					profileRes.data.role.toLowerCase() === 'freelancer'
						? 'Freelancer'
						: 'Client';
				setUserRole(role);

				setMessages(messagesRes.data.reverse());
				setPage(1);
				setHasMore(messagesRes.data.length === 20);

				const chat = chatRes.data;
				if (!chat?.orderId) {
					setError('Чат не связан с заказом');
					setIsLoading(false);
					return;
				}

				const orderRes = await getOrder(chat.orderId, token).catch(err => {
					throw new Error(`getOrder failed: ${err.message}`);
				});
				if (!isMounted) return;
				const orderData = orderRes.data;
				console.log('Order response:', orderData);
				setOrder(orderData);
				setTimeLeft(
					orderData.deadline
						? calculateTimeLeft(orderData.deadline)
						: 'Не указан'
				);

				if (orderData.invoices && orderData.invoices.length > 0) {
					const activeInvoice = orderData.invoices.find(
						i => i.status === 'Pending' || i.status === 'Paid'
					);
					if (activeInvoice) {
						setInvoice(activeInvoice);
						setPaymentStatus(activeInvoice.status);
					}
				}

				if (!orderData.isAnonymous && orderData.clientId) {
					setClient(orderData.client);
				} else if (orderData.clientId) {
					const clientRes = await getUserProfile(
						orderData.clientId,
						token
					).catch(err => {
						throw new Error(`getUserProfile (client) failed: ${err.message}`);
					});
					if (isMounted) setClient(clientRes.data);
				}

				if (orderData.freelancerId) {
					const freelancerRes = await getUserProfile(
						orderData.freelancerId,
						token
					).catch(err => {
						throw new Error(
							`getUserProfile (freelancer) failed: ${err.message}`
						);
					});
					if (isMounted) setFreelancer(freelancerRes.data);
				}
			} catch (err) {
				if (err.message.includes('401')) {
					setError('Сессия истекла, войдите снова');
					localStorage.removeItem('token');
					localStorage.removeItem('userId');
					localStorage.removeItem('userRole');
					navigate('/login');
				} else {
					setError(err.message || 'Ошибка загрузки данных');
					console.error('Fetch data error:', err);
				}
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		fetchData();

		return () => {
			isMounted = false;
		};
	}, [token, chatId, userId, navigate, calculateTimeLeft]);

	useEffect(() => {
		if (!order) {
			console.warn('⏰ Заказ отсутствует');
			setTimeLeft('Не указан');
			return;
		}
		if (!order.deadline) {
			console.warn('⏰ Заказ без дедлайна:', order.id);
			setTimeLeft('Не указан');
			return;
		}
		const updateTimer = () => setTimeLeft(calculateTimeLeft(order.deadline));
		updateTimer();
		const interval = setInterval(updateTimer, 60000);
		return () => clearInterval(interval);
	}, [order, calculateTimeLeft]);

	return {
		messages,
		setMessages,
		order,
		setOrder,
		freelancer,
		client,
		userRole,
		paymentStatus,
		setPaymentStatus,
		invoice,
		setInvoice,
		isLoading,
		error,
		setError,
		page,
		setPage,
		hasMore,
		setHasMore,
		fetchMoreMessages,
		timeLeft,
	};
};

export default useChatData;
