import React, { useState } from 'react';
import {
	createTestPayment,
	releasePayment,
	refundPayment,
	getPaymentStatus,
} from '../api/api';
import Payment from '../components/Payments/Payment';

const PaymentsPage = ({ token, userId }) => {
	const [error, setError] = useState('');

	const handleCreatePayment = async data => {
		try {
			await createTestPayment(data, token);
			setError('Тестовый платёж создан');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка создания платежа');
		}
	};

	const handleReleasePayment = async paymentId => {
		try {
			await releasePayment(paymentId, token);
			setError('Средства выпущены');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка выпуска средств');
		}
	};

	const handleRefundPayment = async (paymentId, reason) => {
		try {
			await refundPayment(paymentId, { Reason: reason }, token);
			setError('Возврат выполнен');
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка возврата');
		}
	};

	const handleGetStatus = async paymentId => {
		try {
			const res = await getPaymentStatus(paymentId, token);
			setError(`Статус платежа: ${res.data.Status}`);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка получения статуса');
		}
	};

	return (
		<div className='max-w-4xl mx-auto'>
			<h2 className='text-2xl font-bold mb-4'>Платежи</h2>
			{error && <p className='text-red-500 mb-4'>{error}</p>}
			<Payment
				onCreate={handleCreatePayment}
				onRelease={handleReleasePayment}
				onRefund={handleRefundPayment}
				onGetStatus={handleGetStatus}
			/>
		</div>
	);
};

export default PaymentsPage;
