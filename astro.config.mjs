/**
 * Config file for Astro Starlight SSG
 */

// @ts-check //-> enable static type checking by the TypeScript compiler

import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';

// Docs https://astro.build/config
export default defineConfig({
	// Github Pages configuration
	site: 'https://DmKu33.github.io',
	base: '/full-stack-devlogs',
	integrations: [
		starlight({
			title: 'full-stack devlogs',
			logo: {
				src: './public/favicon.svg',
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/DmKu33/full-stack-devlogs' }],
			editLink: {
				baseUrl: 'https://github.com/DmKu33/full-stack-devlogs',
			},
			defaultLocale: 'root',
			locales: {
				root: {
					label: 'English',
					lang: 'en',
				},
			},
			customCss: [
				'./src/styles/custom.css',
				'./src/styles/tailwind-overrides.css',
			],
			sidebar: [
				// add sidebar links directly
				{ label: 'Syllabus', link: './' },

				// autogenerate sidebar links using folder/file names
				{ label: 'Schedule', autogenerate: { directory: 'schedule' }, },
			],
			components: {
				// override default Starlight components
				SiteTitle: './src/components/SiteTitle.astro',
			},
		}),
		svelte() // add svelte integration
	], 
	vite: {
		plugins: [
			// @ts-ignore //-> tell the compiler to suppress all errors from the following line
			tailwindcss()
		]
	},
});