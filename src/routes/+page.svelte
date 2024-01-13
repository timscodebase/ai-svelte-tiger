<script lang="ts">
	import { onMount } from 'svelte'
	import { enhance } from '$app/forms'
	import { allFighters, jsFormSubmit } from '$lib'
	import { TextBox, Dialog, Svg } from '$lib'
	import stateStore from '$lib/stateStore'

	let winnerInput: HTMLTextAreaElement | null = null

	onMount(() => {
		winnerInput = document.querySelector(`textarea[name=${stateStore.winner}]`)
	})

	$: imgStore = {
		showDialog: false,
		url: '',
		isLoading: false
	}

	const pickRandomFighters = () => {
		stateStore.text = ''
		stateStore.winner = ''

		const fighters = [...allFighters]
		const index1 = Math.floor(Math.random() * fighters.length)
		const [fighter1] = fighters.splice(index1, 1)
		const index2 = Math.floor(Math.random() * fighters.length)
		const fighter2 = fighters[index2]

		stateStore.opponent1 = fighter1
		stateStore.opponent2 = fighter2
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

	<form method="POST" class="grid gap-4 mt-8" action="?/prompt" use:enhance>
		<div class="grid gap-4 sm:grid-cols-2">
			<TextBox
				label="Opponent 1"
				name="opponent1"
				value={stateStore.opponent1}
				className={stateStore.winner === 'opponent1' ? 'rainbow' : ''}
			/>
			<TextBox
				label="Opponent 2"
				name="opponent2"
				value={stateStore.opponent2}
				className={stateStore.winner === 'opponent2' ? 'rainbow' : ''}
			/>
		</div>

		<div class="flex gap-4">
			<button formaction="?/get_winner" aria-disabled={stateStore.isLoading}>
				{#if stateStore.isLoading}
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

	{#if stateStore.text}
		<article class="mt-4 border border-2 rounded-lg p-4 bg-[canvas]">
			<p>{stateStore.text.slice(26)}</p>
		</article>
	{/if}

	{#if stateStore.winner}
		<form action="/ai-image" on:submit={onSubmitImg} class="mt-4">
			<input type="hidden" name="opponent1" value={stateStore.opponent1} required />
			<input type="hidden" name="opponent2" value={stateStore.opponent2} required />
			<input type="hidden" name="winner" value={stateStore.winner} required />
			<button type="submit"> Show me </button>
		</form>
	{/if}

	<Dialog toggle={false} open={imgStore.showDialog} onClose$={() => (imgStore.showDialog = false)}>
		{#if imgStore.isLoadong}
			<Svg alt="Loading" icon="icon-spinner" class="text-8xl" />
		{:else}
			<img
				src={imgStore.url}
				alt={`An epic battle between ${stateStore.opponent1} and ${stateStore.opponent2}`}
			/>
		{/if}
	</Dialog>

	<p class="my-10 sm:mt-20 text-center">
		Disclaimer: This app uses AI to generate content, so things may come out a lil' wonky.
	</p>
</main>
