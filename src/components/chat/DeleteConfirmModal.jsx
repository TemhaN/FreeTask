import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DeleteConfirmModal = ({
	showDeleteConfirm,
	setShowDeleteConfirm,
	confirmDeleteMessage,
}) => {
	return (
		<AnimatePresence>
			{showDeleteConfirm && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'
				>
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.9, opacity: 0 }}
						className='bg-gray-800/50 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-sm w-full border border-gray-600 sm:p-4 sm:max-w-xs'
					>
						<h2 className='text-lg font-bold mb-4 text-white sm:text-base'>
							Подтверждение удаления
						</h2>
						<p className='mb-6 text-gray-300 sm:text-sm'>
							Вы уверены, что хотите удалить это сообщение?
						</p>
						<div className='flex justify-end space-x-4'>
							<motion.button
								onClick={() => setShowDeleteConfirm(false)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='bg-gradient-to-r from-gray-500 to-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-all duration-300 sm:px-3 sm:py-1.5 sm:text-sm'
							>
								Отмена
							</motion.button>
							<motion.button
								onClick={confirmDeleteMessage}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className='bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all duration-300 sm:px-3 sm:py-1.5 sm:text-sm'
							>
								Подтвердить
							</motion.button>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default DeleteConfirmModal;
