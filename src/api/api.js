import axios from 'axios';

export const API_BASE_URL = 'https://localhost:7125/api/v1';
export const FILE_BASE_URL = 'https://localhost:7125';

const api = axios.create({
	baseURL: API_BASE_URL,
	headers: { 'Content-Type': 'application/json' },
	withCredentials: true,
});

api.interceptors.request.use(config => {
	const token = localStorage.getItem('token');
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	} else {
		delete config.headers.Authorization;
	}
	return config;
});

api.interceptors.response.use(
	response => response,
	error => {
		if (error.response?.status === 401) {
			localStorage.removeItem('token');
			localStorage.removeItem('userId');
			localStorage.removeItem('userRole');
			localStorage.removeItem('isAdmin');
			window.location.href = '/login';
		}
		return Promise.reject(error);
	}
);

export const setAuthToken = token => {
	if (token) {
		localStorage.setItem('token', token);
	} else {
		localStorage.removeItem('token');
	}
};

export const login = data => api.post('/auth/email/login', data);
export const register = data => api.post('/auth/email/register', data);
export const refreshToken = () => api.post('/auth/refresh-token');
export const logout = () => api.post('/auth/logout');
export const verifyEmail = (email, code) =>
	api.post('/email/verify', { email, code });
export const verifyEmailLink = (email, code) =>
	api.get(`/email/verify-link?email=${email}&code=${code}`);
export const resendVerificationCode = ({ email, type }) =>
	api.post('/email/resend-code', { email, type });
export const requestPasswordReset = data =>
	api.post('/email/reset-password/request', data);
export const resetPassword = data => api.post('/email/reset-password', data);
export const getPopularSkills = (prefix = '') =>
	api.get(`/users/skills/popular?prefix=${encodeURIComponent(prefix)}`);
export const verifyExtended = (formData, token) =>
	api.post('/auth/verify/extended', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
export const verifyProfessional = (formData, token) =>
	api.post('/auth/verify/professional', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
export const notifyTyping = (chatId, token) =>
	api.post(`/chats/${chatId}/typing`, {}, {});
export const deleteChat = (chatId, token) => api.delete(`/chats/${chatId}`, {});
export const addQuickReply = (chatId, data, token) =>
	api.post(`/chats/${chatId}/quick-replies`, data, {});
export const uploadFile = (formData, token) =>
	api.post('/files/upload', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
export const getFile = (fileId, token) =>
	api.get(`/files/${fileId}`, { responseType: 'blob' });
export const deleteFile = (fileId, token) => api.delete(`/files/${fileId}`, {});
export const updateProfile = (id, formData, token) =>
	api.put(`/users/${id}`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});

export const updateClientProfile = async (userId, formData, token) => {
	return api.put(`/users/client/${userId}`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};

export const searchFreelancers = params =>
	api.get('/users/freelancers', { params });
export const getPaymentStatus = (orderId, token) =>
	api.get(`/payments/${orderId}/status`, {});
export const cancelOrder = (token, orderId) =>
	api.put(`/orders/${orderId}/cancel`, {});

export const confirmOrder = (token, orderId) =>
	api.post(`/orders/${orderId}/confirm`, {});

export const createPayment = (token, orderId, data) =>
	api.post(`/payments`, {
		orderId,
		amount: data.amount,
		invoiceId: data.invoiceId,
	});
export const createInvoice = (token, orderId, data) =>
	api.post(`/orders/${orderId}/invoice`, data);
export const getFreelancerProfile = async id => api.get(`/users/${id}`);
export const getTeamProfile = async id => api.get(`/teams/${id}`);
export const addPortfolioItem = (formData, token) =>
	api.post('/users/freelancers/portfolio', formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
export const deletePortfolioItem = (portfolioId, token) =>
	api.delete(`/users/freelancers/portfolio/${portfolioId}`, {});
export const saveSmartFilter = (data, token) =>
	api.post('/users/smart-filters', data, {});
export const getSmartFilters = (page = 1, pageSize = 10, token) =>
	api.get(`/users/smart-filters?page=${page}&pageSize=${pageSize}`, {});
export const getProfileAnalytics = (id, params, token) =>
	api.get(`/users/${id}/analytics`, { params });
export const reportContent = (data, token) =>
	api.post('/moderation/report', data, {});
export const getPendingReports = (page = 1, pageSize = 10, token) =>
	api.get(`/moderation/pending?page=${page}&pageSize=${pageSize}`, {});
export const getNotifications = (page = 1, pageSize = 10, token) =>
	api.get(`/notifications?page=${page}&pageSize=${pageSize}`, {});
export const markAsRead = (id, token) =>
	api.put(`/notifications/${id}/read`, {}, {});
export const sendTestNotification = (data, token) =>
	api.post('/notifications/test', data, {});
export const placeBid = (id, data, token) =>
	api.post(`/orders/${id}/bids`, data, {});
export const updateOrderStatus = (id, data, token) =>
	api.put(`/orders/${id}/status`, data, {});
export const extendDeadline = (id, data, token) =>
	api.post(`/orders/${id}/extend-deadline`, data, {});
export const createTestPayment = (data, token) =>
	api.post('/payments/test', data, {});
export const releasePayment = (id, token) =>
	api.post(`/payments/${id}/release`, {}, {});
export const refundPayment = (id, data, token) =>
	api.post(`/payments/${id}/refund`, data, {});
export const createReview = (data, token) => api.post('/reviews', data, {});
export const getReviews = (userId, page = 1, pageSize = 10) =>
	api.get(`/reviews/${userId}?page=${page}&pageSize=${pageSize}`);
export const disputeReview = (id, data, token) =>
	api.put(`/reviews/${id}/dispute`, data, {});
export const createTeam = (data, token) =>
	api.post('/teams', data, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
export const handleTeamBid = (teamId, bidId, data, token) =>
	api.post(`/teams/${teamId}/bids/${bidId}/accept`, data, {});
export const deleteTeam = async (teamId, token) => {
	const response = await api.delete(`/teams/${teamId}`);
	return response.data;
};
export const getTeamBids = (teamId, token) =>
	api.get(`/teams/${teamId}/bids`, {});
export const getTeams = params => api.get('/teams', { params });
export const addMember = (id, data, token) =>
	api.post(`/teams/${id}/members`, data, {});
export const placeTeamBid = (id, data, token) =>
	api.post(`/teams/${id}/bids`, data, {});
export const removeMember = (teamId, userId, token) =>
	api.delete(`/teams/${teamId}/members/${userId}`, {});
export const updateTeamPortfolio = (id, formData, token) =>
	api.put(`/teams/${id}/portfolio`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
export const getProfile = async token => api.get('/users/profile', {});
export const getUserProfile = async id => api.get(`/users/${id}`);
export const addFavorite = async (payload, token) =>
	api.post('/favorites', payload, {});
export const getFavorites = async token => api.get('/favorites', {});
export const createChat = async (token, data) => api.post('/chats', data, {});
export const sendMessage = async (token, chatId, data) => {
	const formData = new FormData();
	formData.append('content', data.content);
	if (data.attachment) {
		formData.append('attachment', data.attachment);
	}
	formData.append('isVoice', data.isVoice.toString());
	return await api.post(`/chats/${chatId}/messages`, formData, {
		headers: { 'Content-Type': 'multipart/form-data' },
	});
};
export const getMessages = async (token, chatId, page = 1, pageSize = 20) => {
	return await api.get(`/chats/${chatId}/messages`, {
		params: { page, pageSize },
	});
};

export const markChatAsRead = async (connection, chatId) => {
	if (!connection || connection.state !== 'Connected') {
		throw new Error('SignalR connection is not established');
	}
	await connection.invoke('MarkChatAsRead', chatId);
};
export const updateMessage = async (token, chatId, messageId, data) => {
	return await api.put(`/chats/${chatId}/messages/${messageId}`, data);
};
export const deleteMessage = async (token, chatId, messageId) => {
	return await api.delete(`/chats/${chatId}/messages/${messageId}`);
};
export const getChats = async (token, page = 1, pageSize = 20) => {
	return await api.get('/chats', { params: { page, pageSize } });
};
export const getChat = async (token, chatId) => {
	return await api.get(`/chats/${chatId}`, {});
};
export const createOrder = (token, data) => api.post('/orders', data);
export const acceptOrder = (token, orderId, data) =>
	api.post(`/orders/${orderId}/accept`, data);
export const getOrders = params => api.get('/orders', { params });

export const getOrder = async (orderId, token) => {
	try {
		const response = await api.get(`/orders/${orderId}`);
		return response;
	} catch (error) {
		throw new Error(
			`Ошибка ${error.response?.status || 'неизвестно'}: ${
				error.response?.data?.message || error.message
			}`
		);
	}
};
export const getFreelancerReviews = (freelancerId, page = 1, pageSize = 10) =>
	api.get(`/users/${freelancerId}/reviews?page=${page}&pageSize=${pageSize}`);

export const completeOrder = async (token, orderId) => {
	const response = await api.post(`/orders/${orderId}/complete`);
	return response.data;
};
