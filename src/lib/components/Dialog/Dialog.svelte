<script lang="ts">
	import { randomString } from '$lib'
	export let id = randomString(8)
	export let toggle: string | false

	let isOpen = false

	const toggleDialog = () => {
		isOpen = !isOpen
	}

	const handleDialogClick = (event: MouseEvent) => {
		const dialog = event.target as HTMLDialogElement
		if (dialog.localName !== 'dialog') return
		toggleDialog()

		if (isOpen) {
			dialog.showModal()
		} else {
			dialog.close()
		}
	}
</script>

<div>
	{#if toggle}
		<button aria-controls={id} aria-expanded={isOpen} on:click={toggleDialog}>
			{toggle}
		</button>
	{/if}

	<dialog class="dialog" {id} on:click={handleDialogClick}>
		<div class="p-2">
			<slot />
		</div>
	</dialog>
</div>

<style>
</style>
