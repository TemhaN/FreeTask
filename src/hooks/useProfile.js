import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
	getProfile,
	updateProfile,
	updateClientProfile,
	getFreelancerReviews,
	addPortfolioItem,
	deletePortfolioItem,
} from '../api/api';

export const useProfile = ({ userId, token }) => {
	const [profile, setProfile] = useState(null);
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [bio, setBio] = useState('');
	const [reviews, setReviews] = useState([]);
	const [reviewsError, setReviewsError] = useState('');
	const [reviewsLoading, setReviewsLoading] = useState(false);
	const [companyName, setCompanyName] = useState('');
	const [skills, setSkills] = useState([]);
	const [avatar, setAvatar] = useState(null);
	const [portfolioFile, setPortfolioFile] = useState(null);
	const [portfolioDescription, setPortfolioDescription] = useState('');
	const [portfolioError, setPortfolioError] = useState('');
	const [portfolioIsLoading, setPortfolioIsLoading] = useState(false);
	const navigate = useNavigate();

	const fetchProfile = async () => {
		setIsLoading(true);
		try {
			const res = await getProfile(token);
			setProfile(res.data);
			setBio(res.data.bio || '');
			setCompanyName(res.data.companyName || '');
			setSkills(res.data.skills || []);
		} catch (err) {
			setError(err.response?.data?.message || 'Ошибка загрузки профиля');
		} finally {
			setIsLoading(false);
		}
	};

	const refreshProfile = async () => {
		await fetchProfile();
	};

	useEffect(() => {
		fetchProfile();
	}, [token]);

	useEffect(() => {
		const fetchReviews = async () => {
			if (!userId) {
				console.error('No userId provided for fetching reviews');
				setReviewsError('Ошибка: отсутствует ID пользователя');
				setReviews([]);
				setReviewsLoading(false);
				return;
			}

			setReviewsLoading(true);
			try {
				console.log(`Fetching reviews for user: ${userId}`);
				const res = await getFreelancerReviews(userId, 1, 10);
				console.log('Reviews fetched:', res.data);
				setReviews(res.data);
				setReviewsError('');
			} catch (err) {
				console.error('Error fetching reviews:', err);
				setReviewsError(
					err.response?.data?.message || 'Ошибка загрузки отзывов'
				);
				setReviews([]);
			} finally {
				setReviewsLoading(false);
			}
		};

		fetchReviews();
	}, [userId]);

	const updateProfileData = async () => {
		if (bio.length > 500) {
			setError('Биография не должна превышать 500 символов');
			return false;
		}
		if (profile?.role === 'Freelancer' && skills.length > 10) {
			setError('Максимум 10 навыков');
			return false;
		}
		if (companyName.length > 100) {
			setError('Название компании не должно превышать 100 символов');
			return false;
		}
		if (avatar && avatar.size > 10 * 1024 * 1024) {
			setError('Аватар не должен превышать 10 МБ');
			return false;
		}

		const formData = new FormData();
		formData.append('Bio', bio || '');
		if (profile?.role === 'Freelancer') {
			formData.append('Skills', JSON.stringify(skills || []));
		}
		if (profile?.role === 'Client') {
			formData.append('CompanyName', companyName || '');
		}
		if (avatar && avatar instanceof File) {
			formData.append('Avatar', avatar);
		}

		for (let [key, value] of formData.entries()) {
			console.log(
				`FormData: ${key}=${value instanceof File ? value.name : value}`
			);
		}

		setIsLoading(true);
		setError('');
		try {
			const updateFn =
				profile?.role === 'Client' ? updateClientProfile : updateProfile;
			await updateFn(userId, formData, token);
			await refreshProfile();
			setAvatar(null);
			setIsEditing(false);
			return true;
		} catch (err) {
			console.error('Error updating profile:', err.response);
			const status = err.response?.status;
			const message =
				err.response?.data?.message || 'Ошибка обновления профиля';
			if (status === 400) setError(message || 'Неверные данные');
			if (status === 401) setError('Неверный токен');
			if (status === 403) setError('Доступ запрещён');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const resetForm = () => {
		setBio(profile?.bio || '');
		setCompanyName(profile?.companyName || '');
		setSkills(profile?.skills || []);
		setAvatar(null);
		setError('');
		setIsEditing(false);
	};

	const addPortfolioItemHandler = async () => {
		if (!portfolioFile) {
			setPortfolioError('Выберите файл');
			return;
		}
		setPortfolioIsLoading(true);
		try {
			const formData = new FormData();
			formData.append('file', portfolioFile);
			formData.append('description', portfolioDescription);
			await addPortfolioItem(formData, token);
			setPortfolioFile(null);
			setPortfolioDescription('');
			setPortfolioError('');
			await refreshProfile(); // Обновляем профиль после добавления
		} catch (err) {
			setPortfolioError(
				err.response?.data?.message || 'Ошибка добавления работы'
			);
		} finally {
			setPortfolioIsLoading(false);
		}
	};

	const deletePortfolioItemHandler = async portfolioId => {
		setPortfolioIsLoading(true);
		try {
			await deletePortfolioItem(portfolioId, token);
			setPortfolioError('');
			await refreshProfile(); // Обновляем профиль после удаления
		} catch (err) {
			setPortfolioError(
				err.response?.data?.message || 'Ошибка удаления работы'
			);
		} finally {
			setPortfolioIsLoading(false);
		}
	};

	return {
		profile,
		error,
		isLoading,
		isEditing,
		bio,
		companyName,
		skills,
		avatar,
		setError,
		setIsEditing,
		setBio,
		setCompanyName,
		setSkills,
		setAvatar,
		updateProfileData,
		resetForm,
		reviews,
		reviewsError,
		reviewsLoading,
		portfolioFile,
		portfolioDescription,
		portfolioError,
		portfolioIsLoading,
		setPortfolioFile,
		setPortfolioDescription,
		setPortfolioError,
		addPortfolioItemHandler,
		deletePortfolioItemHandler,
		refreshProfile,
	};
};
