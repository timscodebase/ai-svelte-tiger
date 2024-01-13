<script lang="ts">
	let label: string
	let name: string
	let value: string
	let className: string
</script>

<div>
	<label class={className} for={name}>{label}</label>
	<textarea required maxLength={100} {name}>
		{value}
	</textarea>
</div>

<style>
</style>
