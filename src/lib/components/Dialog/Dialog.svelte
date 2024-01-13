<script lang="ts">
	import { onMount } from 'svelte'
	import { randomString } from '$lib'
	export let id = randomString(8)
	export let toggle: string | false
	export let open: boolean = false
	export let onClose: () => {}

	let dialogRef: HTMLDialogElement | null
	let isOpen = false

	onMount(() => {
		id = randomString(8)
		dialogRef = document.querySelector(`.dialog`)

		if (isOpen) {
			dialogRef?.showModal()
		}

		return () => {
			if (isOpen) {
				dialogRef?.close()
				onClose && onClose()
			}
		}
	})

	let handleDialogClick = (event) => {
		const target = event.target
		if (target.localName !== 'dialog') return
		isOpen = false
	}
</script>

<div>
	{#if toggle}
		<button aria-controls={id} aria-expanded={isOpen} on:click={() => (isOpen = true)}>
			{toggle}
		</button>
	{/if}

	<dialog
		class="dialog"
		bind:this={dialogRef}
		{id}
		on:click={handleDialogClick}
		on:close={() => (isOpen = false)}
	>
		<div class="p-2">
			<slot />
		</div>
	</dialog>
</div>
