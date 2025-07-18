import React, { useState } from 'react';

const Payment = ({ onCreate, onRelease, onRefund, onGetStatus }) => {
	const [orderId, setOrderId] = useState('');
	const [amount, setAmount] = useState('');
	const [paymentId, setPaymentId] = useState('');
	const [reason, setReason] = useState('');

	const handleCreate = e => {
		e.preventDefault();
		onCreate({ OrderId: orderId, Amount: parseFloat(amount) });
	};

	const handleRelease = e => {
		e.preventDefault();
		onRelease(paymentId);
	};

	const handleRefund = e => {
		e.preventDefault();
		onRefund(paymentId, reason);
	};

	const handleStatus = e => {
		e.preventDefault();
		onGetStatus(paymentId);
	};

	return (
		<div className='space-y-4'>
			<form onSubmit={handleCreate} className='space-y-4'>
				<h3 className='text-xl'>Создать тестовый платёж</h3>
				<input
					type='text'
					value={orderId}
					onChange={e => setOrderId(e.target.value)}
					placeholder='ID заказа'
					className='border p-2 rounded'
					required
				/>
				<input
					type='number'
					value={amount}
					onChange={e => setAmount(e.target.value)}
					placeholder='Сумма'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 rounded'
				>
					Создать
				</button>
			</form>
			<form onSubmit={handleRelease} className='space-y-4'>
				<h3 className='text-xl'>Выпустить платёж</h3>
				<input
					type='text'
					value={paymentId}
					onChange={e => setPaymentId(e.target.value)}
					placeholder='ID платежа'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-green-500 text-white px-4 py-2 rounded'
				>
					Выпустить
				</button>
			</form>
			<form onSubmit={handleRefund} className='space-y-4'>
				<h3 className='text-xl'>Вернуть платёж</h3>
				<input
					type='text'
					value={paymentId}
					onChange={e => setPaymentId(e.target.value)}
					placeholder='ID платежа'
					className='border p-2 rounded'
					required
				/>
				<input
					type='text'
					value={reason}
					onChange={e => setReason(e.target.value)}
					placeholder='Причина возврата'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-red-500 text-white px-4 py-2 rounded'
				>
					Вернуть
				</button>
			</form>
			<form onSubmit={handleStatus} className='space-y-4'>
				<h3 className='text-xl'>Проверить статус</h3>
				<input
					type='text'
					value={paymentId}
					onChange={e => setPaymentId(e.target.value)}
					placeholder='ID платежа'
					className='border p-2 rounded'
					required
				/>
				<button
					type='submit'
					className='bg-blue-500 text-white px-4 py-2 rounded'
				>
					Проверить
				</button>
			</form>
		</div>
	);
};

export default Payment;
