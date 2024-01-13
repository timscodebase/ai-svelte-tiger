<script lang="ts">
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import party from 'party-js'
	import { allFighters, jsFormSubmit, TextBox, Dialog } from '$lib'

	let winnerInput: HTMLTextAreaElement | null = null

	onMount(() => {
		winnerInput = document.querySelector(`textarea[name=${state.winner}]`)
	})

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		state.isLoading = true
		state.text = ''
		state.winner = ''

		const form = event.target as HTMLFormElement

		const response = await jsFormSubmit(form)

		if (!response.ok) {
			state.isLoading = false
			alert('The request experienced an issue.')
			return
		}

		if (!response.body) {
			state.isLoading = false
			return
		}

		// Parse streaming body
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let isStillStreaming = true

		while (isStillStreaming) {
			const { value, done } = await reader.read()
			const chunkValue = decoder.decode(value)

			state.text += chunkValue

			isStillStreaming = !done
		}

		const winnerPattern = /winner:\s+(\w+).*/gi
		const match = winnerPattern.exec(state.text)

		state.winner = match?.length ? match[1].toLowerCase() : ''

		if (state.winner) {
			const winnerInput = document.querySelector(`textarea[name=${state.winner}]`)
			if (winnerInput) {
				party.confetti(winnerInput as DynamicSourceType, {
					count: 40,
					size: 2,
					spread: 15
				})
			}
		}

		state.isLoading = false
	}

	$: imgStore = {
		showDialog: false,
		url: '',
		isLoading: false
	}

	$: state = {
		isLoading: false,
		text: '',
		winner: '',
		opponent1: '',
		opponent2: ''
	}

	const pickRandomFighters = () => {
		state.text = ''
		state.winner = ''

		const fighters = [...allFighters]
		const index1 = Math.floor(Math.random() * fighters.length)
		const [fighter1] = fighters.splice(index1, 1)
		const index2 = Math.floor(Math.random() * fighters.length)
		const fighter2 = fighters[index2]

		state.opponent1 = fighter1
		state.opponent2 = fighter2
	}

	const onSubmitImg = async (event: Event) => {
		imgStore.showDialog = true
		imgStore.isLoading = true

		const form = event.target as HTMLFormElement

		const response = await jsFormSubmit(form)
		const results = await response.json()

		imgStore.url = results.url
		imgStore.isLoading = false
	}
</script>

<main class="max-w-4xl mx-auto p-4">
	<h1 class="text-4xl">AI of the Tiger 🐯</h1>
	<p>A silly AI bot that can tell you who would win in a fight between...</p>

	<form method="POST" class="grid gap-4 mt-8" on:submit|preventDefault={handleSubmit} use:enhance>
		<div class="grid gap-4 sm:grid-cols-2">
			<TextBox
				label="Opponent 1"
				name="opponent1"
				value={state.opponent1}
				className={state.winner === 'opponent1' ? 'rainbow' : ''}
			/>
			<TextBox
				label="Opponent 2"
				name="opponent2"
				value={state.opponent2}
				className={state.winner === 'opponent2' ? 'rainbow' : ''}
			/>
		</div>

		<div class="flex gap-4">
			<button formaction="/prompt" aria-disabled={state.isLoading}>
				{#if state.isLoading}
					<iconify-icon class="svg" icon="pixelarticons:loader" />
				{:else}
					Tell me
				{/if}
			</button>
			<button type="button" title="Feeling lucky?" on:click={pickRandomFighters}>
				<iconify-icon class="svg" icon="game-icons:perspective-dice-six-faces-random" />
			</button>
		</div>
	</form>

	{#if state.text}
		<article class="mt-4 border border-2 rounded-lg p-4 bg-[canvas]">
			<p>{state.text.slice(26)}</p>
		</article>
	{/if}

	{#if state.winner}
		<form action="/ai-image" on:submit={onSubmitImg} class="mt-4">
			<input type="hidden" name="opponent1" value={state.opponent1} required />
			<input type="hidden" name="opponent2" value={state.opponent2} required />
			<input type="hidden" name="winner" value={state.winner} required />
			<button type="submit"> Show me </button>
		</form>
	{/if}

	<Dialog toggle={false} open={imgStore.showDialog} onClose$={() => (imgStore.showDialog = false)}>
		{#if imgStore.isLoadong}
			<iconify-icon class="svg" icon="pixelarticons:loader" />
		{:else}
			<img
				src={imgStore.url}
				alt={`An epic battle between ${state.opponent1} and ${state.opponent2}`}
			/>
		{/if}
	</Dialog>

	<p class="my-10 sm:mt-20 text-center">
		Disclaimer: This app uses AI to generate content, so things may come out a lil' wonky.
	</p>
</main>

<style>
	button {
		display: grid;
		place-items: center;
	}
	.svg {
		font-size: 3rem;
	}
</style>
