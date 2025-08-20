/** @type {import('tailwindcss').Config} */
module.exports = {
	content: [
		"./src/app/**/*.{ts,tsx}",
		"./src/components/**/*.{ts,tsx}",
		"./src/styles/**/*.{css}"
	],
	theme: {
		extend: {
			colors: {
				brand: {
					50: "#fff5f7",
					100: "#ffe4ea",
					200: "#ffc8d3",
					300: "#ff9fb4",
					400: "#ff6a8e",
					500: "#f4436c",
					600: "#d92b57",
					700: "#b41f46",
					800: "#8f1c3a",
					900: "#731a33"
				}
			}
		}
	},
	plugins: []
};



