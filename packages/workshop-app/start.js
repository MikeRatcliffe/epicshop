import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

const packageJson = JSON.parse(
	await fs.readFile(path.resolve(process.cwd(), 'package.json'), 'utf-8'),
)

process.env.EPICSHOP_APP_VERSION ??= packageJson.version
process.env.NODE_ENV ??= 'development'
process.env.EPICSHOP_ENABLE_WATCHER ??= 'true'
const EPICSHOP_CONTEXT_CWD = process.env.EPICSHOP_CONTEXT_CWD ?? process.cwd()
dotenv.config({
	path: path.join(EPICSHOP_CONTEXT_CWD, '.env'),
})

if (process.env.NODE_ENV === 'production') {
	await import('./dist/server/index.js').catch((err) => {
		console.error('Encountered error importing the server, exiting...')
		console.error(err)
		process.exit(1)
	})
} else {
	await import('./server/index.ts').catch((err) => {
		console.error('Encountered error importing the server, exiting...')
		console.error(err)
		process.exit(1)
	})
}

process.on('unhandledRejection', (reason, promise) => {
	console.error(
		'Unhandled Rejection for: ',
		promise,
		'\nWith the reason: ',
		reason,
	)
	throw reason
})
