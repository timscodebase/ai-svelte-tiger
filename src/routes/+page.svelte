<script lang="ts">
	import { onMount } from 'svelte'
	import { z } from 'zod'
	import OpenAI from 'openai'
	import { PromptTemplate } from 'langchain/prompts'
	import party from 'party-js'
	import type { DynamicSourceType } from 'party-js/lib/systems/sources.js'
	import { allFighters, jsFormSubmit } from '$lib'
	import { imgStore, stateStore } from '$stores'
	import { TextBox, Dialog, Svg } from '$lib'

	let winnerInput: HTMLTextAreaElement | null = null

	onMount(() => {
		winnerInput = document.querySelector(`textarea[name=${$stateStore.winner}]`)
	})

	const template = `You're a professional fighting judge with a sense of humor. Who would win in a fight between {opponent1} ("opponent1") and {opponent2} ("opponent2")? Only tell me who the winner is and a funny reason why.

  Format the response like this:
  winner: opponent1 or opponent2. reason: the reason they won.

  For the winner use only their label ("opponent1" or "opponent2"). For the reason, use their name.`

	const handleSubmit = async (event: Event) => {
		stateStore.set({ isLoading: true, text: '', winner: '' })

		const form = event.target as HTMLFormElement

		const response = await jsFormSubmit(form)

		if (!response.ok) {
			stateStore.set({ isLoading: false })
			alert('The request experienced an issue.')
			return
		}

		if (!response.body) {
			stateStore.set({ isLoading: false })
			return
		}

		// Parse streaming body
		const reader = response.body.getReader()
		const decoder = new TextDecoder()
		let isStillStreaming = true

		while (isStillStreaming) {
			const { value, done } = await reader.read()
			const chunkValue = decoder.decode(value)

			const text = (stateStore.text += chunkValue)
			stateStore.set({ text })

			isStillStreaming = !done
		}

		const winnerPattern = /winner:\s+(\w+).*/gi
		const match = winnerPattern.exec($stateStore.text)

		const winner = match?.length ? match[1].toLowerCase() : ''
		stateStore.set({ winner })

		if ($stateStore.winner) {
			if (winnerInput) {
				party.confetti(winnerInput as DynamicSourceType, {
					count: 40,
					size: 2,
					spread: 15
				})
			}
		}

		$stateStore.isLoading = false
	}

	const promptTemplate = new PromptTemplate({
		template: template,
		inputVariables: ['opponent1', 'opponent2']
	})

	const pickRandomFighters = () => {
		stateStore.set({ text: '', winner: '' })

		const fighters = [...allFighters]
		const index1 = Math.floor(Math.random() * fighters.length)
		const [fighter1] = fighters.splice(index1, 1)
		const index2 = Math.floor(Math.random() * fighters.length)
		const fighter2 = fighters[index2]

		$stateStore.opponent1 = fighter1
		$stateStore.opponent2 = fighter2
	}

	const onSubmitImg = async (event: Event) => {
		imgStore.set({ showDialog: true, isLoading: true })

		const form = event.target as HTMLFormElement

		const response = await jsFormSubmit(form)
		const results = await response.json()

		imgStore.set({ url: results.url, isLoading: false })
	}
</script>

<main class="max-w-4xl mx-auto p-4">
	<h1 class="text-4xl">AI of the Tiger 🐯</h1>
	<p>A silly AI bot that can tell you who would win in a fight between...</p>

	<form method="post" class="grid gap-4 mt-8" on:submit={handleSubmit}>
		<div class="grid gap-4 sm:grid-cols-2">
			<TextBox
				label="Opponent 1"
				name="opponent1"
				value={$stateStore.opponent1}
				className={$stateStore.winner === 'opponent1' ? 'rainbow' : ''}
			/>
			<TextBox
				label="Opponent 2"
				name="opponent2"
				value={$stateStore.opponent2}
				className={$stateStore.winner === 'opponent2' ? 'rainbow' : ''}
			/>
		</div>

		<div class="flex gap-4">
			<button type="submit" aria-disabled={$stateStore.isLoading}>
				{#if $stateStore.isloading}
					<Svg alt="Loading" icon="icon-spinner" />
				{:else}
					Tell me
				{/if}
			</button>
			<button type="button" title="Feeling lucky?" on:click={pickRandomFighters}>
				<Svg alt="Pre-fill random fighter" icon="icon-random" />
			</button>
		</div>
	</form>

	{#if $stateStore.text}
		<article class="mt-4 border border-2 rounded-lg p-4 bg-[canvas]">
			<p>{$stateStore.text.slice(26)}</p>
		</article>
	{/if}

	{#if $stateStore.winner}
		<form action="/ai-image" on:submit={onSubmitImg} class="mt-4">
			<input type="hidden" name="opponent1" value={$stateStore.opponent1} required />
			<input type="hidden" name="opponent2" value={$stateStore.opponent2} required />
			<input type="hidden" name="winner" value={$stateStore.winner} required />
			<button type="submit"> Show me </button>
		</form>
	{/if}

	<Dialog
		toggle={false}
		open={$imgStore.showDialog}
		onClose$={() => ($imgStore.showDialog = false)}
	>
		{#if $imgStore.isLoadong}
			<Svg alt="Loading" icon="icon-spinner" class="text-8xl" />
		{:else}
			<img
				src={$imgStore.url}
				alt={`An epic battle between ${$stateStore.opponent1} and ${$stateStore.opponent2}`}
			/>
		{/if}
	</Dialog>

	<p class="my-10 sm:mt-20 text-center">
		Disclaimer: This app uses AI to generate content, so things may come out a lil' wonky.
	</p>
</main>
