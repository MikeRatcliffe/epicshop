import { useEffect, useState } from 'react'
import { useEventSource } from 'remix-utils/sse/react'
import kodyImg from '#app/assets/kody.webp'
import {
	Popover,
	PopoverTrigger,
	PopoverContent,
} from '#app/components/ui/popover'

export function loader() {
	return new Response(
		new ReadableStream({
			async start(controller) {
				const messages = [
					'Hello! ',
					'I am Coach Kody. ',
					'How can I help you today?',
				]
				// Add a 1-second delay before starting
				await new Promise((resolve) => setTimeout(resolve, 1000))
				for (const message of messages) {
					for (const char of message) {
						await new Promise((resolve) => setTimeout(resolve, 100))
						controller.enqueue(`data: ${JSON.stringify({ char })}\n\n`)
					}
				}
				controller.close()
			},
		}),
		{
			headers: {
				'Content-Type': 'text/event-stream',
				'Cache-Control': 'no-cache',
				Connection: 'keep-alive',
			},
		},
	)
}

export function CoachKodyButton() {
	const [isOpen, setIsOpen] = useState(false)
	const [text, setText] = useState('')
	const data = useEventSource('/coach-kody', { event: 'message' })

	useEffect(() => {
		if (data) {
			const newChar = JSON.parse(data).char
			setText((prevText) => prevText + newChar)
		}
	}, [data])

	return (
		<Popover open={isOpen} onOpenChange={setIsOpen}>
			<PopoverTrigger asChild>
				<button>
					<img src={kodyImg} alt="Coach Kody" />
				</button>
			</PopoverTrigger>
			<PopoverContent side="right" align="start" sideOffset={5}>
				{text ? <div>{text}</div> : <div>Loading...</div>}
			</PopoverContent>
		</Popover>
	)
}
