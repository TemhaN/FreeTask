import React from 'react';
import PropTypes from 'prop-types';
import LoadingSpinner from '../LoadingSpinner';
import placeholderImage from '../../images/placeholder.png';
import { FILE_BASE_URL } from '../../api/api';

const ReviewsSection = ({ reviews, isLoading, error, className }) => {
	if (isLoading) {
		return (
			<div className={className}>
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className={className}>
				<p className='text-red-400 text-center text-lg font-semibold'>
					{error}
				</p>
			</div>
		);
	}

	if (!reviews || reviews.length === 0) {
		return (
			<div className={className}>
				<p className='text-gray-400 text-center text-lg'>Отзывы отсутствуют</p>
			</div>
		);
	}

	return (
		<div className={className}>
			<h3 className='text-2xl font-semibold text-white mb-6'>Отзывы</h3>
			<div className='space-y-4'>
				{reviews.map(review => (
					<div
						key={review.id}
						className='p-4 bg-gray-800 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300'
					>
						<div className='flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-3'>
							<img
								src={
									review.reviewerAvatarUrl
										? `${FILE_BASE_URL}${review.AvatarUrl}`
										: placeholderImage
								}
								alt={review.reviewerName || 'Reviewer'}
								className='w-10 h-10 rounded-full object-cover ring-2 ring-gradient-to-r from-cyan-500 to-blue-500'
								onError={e => {
									e.target.src = placeholderImage;
								}}
							/>
							<div className='flex-1'>
								<div className='flex items-center gap-2'>
									<span className='font-medium text-white text-lg'>
										{review.reviewerName}
									</span>
									<div className='flex items-center'>
										{[...Array(5)].map((_, i) => (
											<svg
												key={i}
												className={`w-5 h-5 ${
													i < review.rating
														? 'text-yellow-400'
														: 'text-gray-500'
												}`}
												fill='currentColor'
												viewBox='0 0 20 20'
											>
												<path d='M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.518 4.674a1 1 0 00.95.69h4.905c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.095 10.401c-.783-.57-.38-1.81.588-1.81h4.905a1 1 0 00.95-.69l1.518-4.674z' />
											</svg>
										))}
									</div>
								</div>
								<p className='text-gray-300 text-base mt-2'>
									{review.comment || ''}
								</p>
								<p className='text-sm text-gray-500 mt-1'>
									{new Date(review.createdAt).toLocaleDateString('ru-RU', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</p>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

ReviewsSection.propTypes = {
	reviews: PropTypes.arrayOf(
		PropTypes.shape({
			id: PropTypes.string.isRequired,
			reviewerName: PropTypes.string.isRequired,
			reviewerAvatarUrl: PropTypes.string,
			rating: PropTypes.number.isRequired,
			comment: PropTypes.string,
			createdAt: PropTypes.string.isRequired,
		})
	),
	isLoading: PropTypes.bool,
	error: PropTypes.string,
	className: PropTypes.string,
};

export default ReviewsSection;
