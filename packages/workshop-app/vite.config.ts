import path from 'path'
import { fileURLToPath } from 'url'
import { vitePlugin as remix } from '@remix-run/dev'
import { flatRoutes } from 'remix-flat-routes'
import { defineConfig } from 'vite'
import { envOnlyMacros } from 'vite-env-only'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const here = (...p: Array<string>) => path.join(__dirname, ...p)

async function makeTshyAliases(moduleName: string, folderName: string) {
	const { default: pkg } = await import(
		here('..', folderName, 'package.json'),
		// @ts-expect-error not sure how to handle this...
		{ assert: { type: 'json' } }
	)

	return Object.entries(pkg.tshy.exports).reduce<Record<string, string>>(
		(acc, [key, value]) => {
			if (typeof value !== 'string') return acc
			const importString = path.join(moduleName, key)
			acc[importString] = here('..', folderName, value)
			return acc
		},
		{},
	)
}

const aliases = {
	...(await makeTshyAliases('@epic-web/workshop-utils', 'workshop-utils')),
	...(await makeTshyAliases(
		'@epic-web/workshop-presence',
		'workshop-presence',
	)),
}

const MODE = process.env.NODE_ENV

export default defineConfig({
	optimizeDeps: {
		exclude: [
			'fsevents',
			'globby',
			'@epic-web/workshop-utils',
			'@epic-web/workshop-presence',
		],
	},
	build: {
		cssMinify: MODE === 'production',
		rollupOptions: {
			external: [
				/node:.*/,
				'stream',
				'crypto',
				'fsevents',
				'globby',
				'@epic-web/workshop-utils',
				'@epic-web/workshop-presence',
			],
		},
	},
	resolve: { alias: aliases },
	plugins: [
		envOnlyMacros(),
		remix({
			ignoredRouteFiles: ['**/*'],
			serverModuleFormat: 'esm',
			routes: async (defineRoutes) => {
				return flatRoutes('routes', defineRoutes, {
					ignoredRouteFiles: [
						'**/.*',
						'**/*.css',
						'**/*.test.{js,jsx,ts,tsx}',
						'**/__*',
						'**/*.server.*',
						'**/*.client.*',
						'**/__*/*',
						'**/*.server/*',
						'**/*.client/*',
					],
				})
			},
		}),
	],
})
