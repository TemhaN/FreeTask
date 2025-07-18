import { useState, useRef, useCallback } from 'react';

const useMedia = () => {
	const [selectedFile, setSelectedFile] = useState(null);
	const [audioBlob, setAudioBlob] = useState(null);
	const [isRecording, setIsRecording] = useState(false);
	const [recordingTime, setRecordingTime] = useState(0);
	const [toast, setToast] = useState('');
	const mediaRecorderRef = useRef(null);
	const recordingTimerRef = useRef(null);

	const handleFileChange = useCallback(e => {
		const file = e.target.files[0];
		if (file) {
			const allowedTypes = [
				'image/jpeg',
				'image/png',
				'application/pdf',
				'audio/mpeg',
				'video/mp4',
				'video/quicktime',
			];
			if (!allowedTypes.includes(file.type)) {
				setToast(
					'Недопустимый тип файла. Поддерживаются: JPG, PNG, PDF, MP3, MP4, MOV'
				);
				setSelectedFile(null);
				return;
			}
			if (file.size > 10 * 1024 * 1024) {
				setToast('Файл превышает лимит в 10 МБ');
				setSelectedFile(null);
				return;
			}
			setSelectedFile(file);
			setToast('');
		}
	}, []);

	const startRecording = useCallback(async () => {
		try {
			const permissionStatus = await navigator.permissions.query({
				name: 'microphone',
			});
			if (permissionStatus.state === 'denied') {
				setToast(
					'Доступ к микрофону заблокирован. Разрешите доступ в настройках браузера.'
				);
				return;
			}

			const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
			const supportedMimeTypes = [
				'audio/webm;codecs=opus',
				'audio/ogg;codecs=opus',
				'audio/webm',
				'audio/ogg',
				'audio/mpeg',
				'audio/mp3',
			];
			const mimeType =
				supportedMimeTypes.find(type => MediaRecorder.isTypeSupported(type)) ||
				'audio/webm';

			if (!MediaRecorder.isTypeSupported(mimeType)) {
				setToast('Запись аудио не поддерживается в этом браузере.');
				stream.getTracks().forEach(track => track.stop());
				return;
			}

			mediaRecorderRef.current = new MediaRecorder(stream, { mimeType });
			const chunks = [];

			mediaRecorderRef.current.ondataavailable = e => chunks.push(e.data);
			mediaRecorderRef.current.onstop = () => {
				const extension = mimeType.includes('webm')
					? 'webm'
					: mimeType.includes('ogg')
					? 'ogg'
					: 'mp3';
				const blob = new Blob(chunks, { type: mimeType });
				setAudioBlob(
					new File([blob], `voice-${Date.now()}.${extension}`, {
						type: mimeType,
					})
				);
				stream.getTracks().forEach(track => track.stop());
				clearInterval(recordingTimerRef.current);
				setRecordingTime(0);
			};

			mediaRecorderRef.current.start();
			setIsRecording(true);
			setRecordingTime(0);
			recordingTimerRef.current = setInterval(() => {
				setRecordingTime(prev => prev + 1);
			}, 1000);
		} catch (err) {
			setToast(
				err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
					? 'Доступ к микрофону запрещён. Проверьте настройки браузера.'
					: err.name === 'NotFoundError'
					? 'Микрофон не найден. Подключите устройство.'
					: `Ошибка записи: ${err.message}`
			);
		}
	}, []);

	const stopRecording = useCallback(() => {
		if (mediaRecorderRef.current && isRecording) {
			mediaRecorderRef.current.stop();
			setIsRecording(false);
			clearInterval(recordingTimerRef.current);
		}
	}, [isRecording]);

	return {
		selectedFile,
		setSelectedFile,
		audioBlob,
		setAudioBlob,
		isRecording,
		setIsRecording,
		recordingTime,
		handleFileChange,
		startRecording,
		stopRecording,
		toast,
		setToast,
	};
};

export default useMedia;
