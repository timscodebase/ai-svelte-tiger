<script lang="ts">
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import { Img, State } from '$lib'
	import party from 'party-js'
	import type { DynamicSourceType } from 'party-js/lib/systems/sources.js'
	import { allFighters, jsFormSubmit, TextBox, Dialog } from '$lib'

	let winnerInput: HTMLTextAreaElement | null

	onMount(() => {
		winnerInput = document.querySelector(`textarea[name=${$State.winner}]`)
	})

	async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {
		$State.isLoading = true
		$State.text = ''
		$State.winner = 'opponent1'

		const form = event.target as HTMLFormElement

		const response = await jsFormSubmit(form)

		if (!response.ok) {
			$State.isLoading = false
			alert('The request experienced an issue.')
			return
		}

		if (!response.body) {
			$State.isLoading = false
			return
		}

		// Parse streaming body
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let isStillStreaming = true

		while (isStillStreaming) {
			const { value, done } = await reader.read()
			const chunkValue = decoder.decode(value)

			$State.text += chunkValue

			isStillStreaming = !done
		}

		const winnerPattern = /winner:\s+(\w+).*/gi
		const match = winnerPattern.exec($State.text)

		$State.winner = match?.length ? match[1].toLowerCase() : ''

		if ($State.winner) {
			const winnerInput = document.querySelector(`textarea[name=${$State.winner}]`)
			if (winnerInput) {
				party.confetti(winnerInput as DynamicSourceType, {
					count: 40,
					size: 2,
					spread: 15
				})
			}
		}

		$State.isLoading = false
	}

	const pickRandomFighters = () => {
		$State.text = ''
		$State.winner = ''

		const fighters = [...allFighters]
		const index1 = Math.floor(Math.random() * fighters.length)
		const [fighter1] = fighters.splice(index1, 1)
		const index2 = Math.floor(Math.random() * fighters.length)
		const fighter2 = fighters[index2]

		$State.opponent1 = fighter1
		$State.opponent2 = fighter2
	}

	const onSubmitImg = async (event: Event) => {
		$Img.showDialog = true
		$Img.isLoading = true

		const form = event.target as HTMLFormElement
		const opp1 = form.get('opponent1')
		const opp2 = form.get('opponent2')

		const res = await fetch(
			`/api/ai-image?eopponent1=${opp1}&opponent2=${opp2}&winner=${$State.winner}`
		)
		const results = await res.json()

		$Img.url = results.url
		$Img.isLoading = false
	}
</script>

<main class="max-w-4xl mx-auto p-4">
	<h1 class="text-4xl">AI of the Tiger 🐯</h1>
	<p>A silly AI bot that can tell you who would win in a fight between...</p>

	<form
		method="POST"
		class="grid gap-4 mt-8"
		on:submit|preventDefault={handleSubmit}
		action="?/prompt"
		use:enhance
	>
		<div class="grid gap-4 sm:grid-cols-2">
			<TextBox
				label="Opponent 1"
				name="opponent1"
				value={$State.opponent1}
				className={$State.winner === 'opponent1' ? 'rainbow' : ''}
			/>
			<TextBox
				label="Opponent 2"
				name="opponent2"
				value={$State.opponent2}
				className={$State.winner === 'opponent2' ? 'rainbow' : ''}
			/>
		</div>

		<div class="flex gap-4">
			<button type="submit" aria-disabled={$State.isLoading}>
				{#if $State.isLoading}
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

	{#if $State.text}
		<article class="mt-4 border rounded-lg p-4 bg-[canvas]">
			<p>{$State.text.slice(26)}</p>
		</article>
	{/if}

	{#if $State.winner}
		<form on:submit|preventDefault={(e) => onSubmitImg(e)} class="mt-4">
			<input type="hidden" name="opponent1" value={$State.opponent1} required />
			<input type="hidden" name="opponent2" value={$State.opponent2} required />
			<input type="hidden" name="winner" value={$State.winner} required />
			<button type="submit"> Show me </button>
		</form>
	{/if}

	<Dialog toggle={false} open={$Img.showDialog} onClose={() => ($Img.showDialog = false)}>
		{#if $Img.isLoading}
			<iconify-icon class="svg" icon="pixelarticons:loader" />
		{:else}
			<img
				src={$Img.url}
				alt={`An epic battle between ${$State.opponent1} and ${$State.opponent2}`}
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
