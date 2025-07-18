import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const Toast = ({ message, setMessage }) => {
	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => setMessage(''), 5000);
			return () => clearTimeout(timer);
		}
	}, [message, setMessage]);

	if (!message) return null;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: 20 }}
			transition={{ duration: 0.3 }}
			className='fixed bottom-4 left-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white p-3 rounded-lg shadow-lg max-w-sm z-50 sm:max-w-xs sm:p-2 sm:text-sm'
		>
			{message}
		</motion.div>
	);
};

export default Toast;
