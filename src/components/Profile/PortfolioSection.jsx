import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FILE_BASE_URL } from '../../api/api';
import placeholderImage from '../../images/placeholder.png';

const PortfolioSection = ({
	profile,
	portfolioFile,
	portfolioDescription,
	isLoading,
	error,
	setPortfolioFile,
	setPortfolioDescription,
	addPortfolioItemHandler,
	deletePortfolioItemHandler,
	userId,
	navigate,
}) => {
	const [selectedItem, setSelectedItem] = useState(null);
	const profileId = profile?.id;

	const handleSubmit = async e => {
		e.preventDefault();
		await addPortfolioItemHandler();
	};

	const openModal = item => setSelectedItem(item);
	const closeModal = () => setSelectedItem(null);

	const isAuthor = userId === profileId;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='mt-8'
		>
			<h3 className='text-2xl font-semibold text-white mb-6'>Портфолио</h3>
			{error && (
				<motion.p
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='text-red-400 mb-4 text-center'
				>
					{error}
				</motion.p>
			)}
			{isAuthor && (
				<form onSubmit={handleSubmit} className='space-y-4 mb-8'>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Файл портфолио
						</label>
						<input
							type='file'
							onChange={e => setPortfolioFile(e.target.files[0] || null)}
							className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 file:bg-cyan-500 file:text-white file:border-0 file:rounded-md file:px-4 file:py-2 hover:file:bg-cyan-600 transition-all'
							accept='image/*,video/*'
						/>
					</div>
					<div>
						<label className='block text-sm font-medium text-gray-300 mb-2'>
							Описание
						</label>
						<textarea
							value={portfolioDescription}
							onChange={e => setPortfolioDescription(e.target.value)}
							className='w-full bg-gray-800/50 text-white border border-gray-600 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-cyan-400'
							rows='3'
							placeholder='Опишите работу'
							maxLength={1000}
						/>
					</div>
					<motion.button
						type='submit'
						disabled={isLoading}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={`bg-gradient-to-r from-cyan-500 to-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
							isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'
						}`}
					>
						{isLoading ? 'Добавление...' : 'Добавить в портфолио'}
					</motion.button>
				</form>
			)}
			{profile.portfolioItems?.length > 0 ? (
				<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
					{profile.portfolioItems.map((item, index) => (
						<motion.div
							key={item.id || index}
							initial={{ opacity: 0, scale: 0.9 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: index * 0.1 }}
							className='bg-gray-700/50 rounded-lg overflow-hidden border border-gray-600 hover:border-cyan-500 hover:shadow-xl transition-all duration-300 cursor-pointer'
							onClick={() => openModal(item)}
						>
							{item.url &&
							(item.url.endsWith('.mp4') || item.url.endsWith('.mov')) ? (
								<video
									src={`${FILE_BASE_URL}${item.url}`}
									controls
									className='w-full h-40 object-cover'
									onError={e => {
										e.target.src = placeholderImage;
									}}
								/>
							) : (
								<img
									src={
										item.url ? `${FILE_BASE_URL}${item.url}` : placeholderImage
									}
									alt={item.description || 'Портфолио'}
									className='w-full h-40 object-cover'
									onError={e => {
										e.target.src = placeholderImage;
									}}
								/>
							)}
							<div className='p-4'>
								<p className='text-gray-300 text-sm truncate'>
									{item.description || 'Без описания'}
								</p>
								{isAuthor && (
									<motion.button
										onClick={e => {
											e.stopPropagation();
											deletePortfolioItemHandler(item.id);
										}}
										disabled={isLoading}
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className={`mt-2 bg-red-500 text-white px-4 py-2 rounded-lg w-full transition-all duration-300 ${
											isLoading
												? 'opacity-50 cursor-not-allowed'
												: 'hover:bg-red-600'
										}`}
									>
										{isLoading ? 'Удаление...' : 'Удалить'}
									</motion.button>
								)}
							</div>
						</motion.div>
					))}
				</div>
			) : (
				<p className='text-gray-400'>Портфолио пусто</p>
			)}
			{selectedItem && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					className='fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4'
					onClick={closeModal}
				>
					<motion.div
						className='relative bg-gray-800 rounded-lg max-w-3xl w-full p-6'
						initial={{ scale: 0.8 }}
						animate={{ scale: 1 }}
						onClick={e => e.stopPropagation()}
					>
						<motion.button
							onClick={() => navigate(-1)}
							className='absolute top-4 left-4 flex items-center text-cyan-400 hover:text-cyan-300 transition-all duration-300 text-lg font-medium'
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<svg
								className='w-5 h-5 mr-2'
								fill='none'
								stroke='currentColor'
								viewBox='0 0 24 24'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M15 19l-7-7 7-7'
								/>
							</svg>
							Назад
						</motion.button>
						<motion.button
							onClick={closeModal}
							className='absolute top-4 right-4 p-2 text-gray-300 hover:text-white'
							whileHover={{ scale: 1.2 }}
							whileTap={{ scale: 0.8 }}
						>
							<svg
								xmlns='http://www.w3.org/2000/svg'
								className='h-6 w-6'
								fill='none'
								viewBox='0 0 24 24'
								stroke='currentColor'
							>
								<path
									strokeLinecap='round'
									strokeLinejoin='round'
									strokeWidth='2'
									d='M6 18L18 6M6 6l12 12'
								/>
							</svg>
						</motion.button>
						{selectedItem.url &&
						(selectedItem.url.endsWith('.mp4') ||
							selectedItem.url.endsWith('.mov')) ? (
							<video
								src={`${FILE_BASE_URL}${selectedItem.url}`}
								controls
								autoPlay
								className='w-full max-h-[70vh] rounded-lg object-contain'
								onError={e => {
									e.target.src = placeholderImage;
								}}
							/>
						) : (
							<img
								src={
									selectedItem.url
										? `${FILE_BASE_URL}${selectedItem.url}`
										: placeholderImage
								}
								alt={selectedItem.description || 'Портфолио'}
								className='w-full max-h-[70vh] rounded-lg object-contain'
								onError={e => {
									e.target.src = placeholderImage;
								}}
							/>
						)}
						<div className='mt-4'>
							<p className='text-white text-lg'>
								{selectedItem.description || 'Без описания'}
							</p>
						</div>
					</motion.div>
				</motion.div>
			)}
		</motion.div>
	);
};

export default PortfolioSection;
