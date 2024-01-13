<script lang="ts">
	export let alt: string
	export let href: string | null
	export let icon: string | null
	export let className: string
</script>

<svg class={className} role="presentation">
	<use href={`#${href || icon}`} />
</svg>
<span class="visually-hidden">{alt}</span>

<style>
</style>
