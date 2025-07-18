/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		'./src/**/*.{js,jsx,ts,tsx}', // это путь ко всем твоим компонентам
		'./public/index.html', // и html (если юзаешь в public)
	],
	theme: {
		extend: {},
	},
	plugins: [],
};
