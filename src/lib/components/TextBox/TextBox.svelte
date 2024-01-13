<script lang="ts">
	export let label: string
	export let name: string
	export let value: string
	export let className: string
</script>

<div>
	<label class={className} for={name}>{label}</label>
	<textarea required maxLength={100} {name}>
		{value}
	</textarea>
</div>

<style>
</style>
