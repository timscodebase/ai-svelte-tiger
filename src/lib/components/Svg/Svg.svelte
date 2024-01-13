<script lang="ts">
	/**
	 * @typedef {import("svelte").HTMLAttributes<SVGElement>} SVGAttributes
	 */

	/**
	 * @type {import("svelte").Component<SVGAttributes & {
	 * alt: string,
	 * } & (
	 * { href: keyof definitions, icon?: never } |
	 * { icon: keyof definitions, href?: never }
	 * )
	 * >}
	 */
	export let alt: string
	export let href: string | null
	export let icon: string | null
	export let className: string
</script>

<svg
	class={{
		[String(className)]: !!className,
		icon: !!icon,
		[String(icon)]: !!icon
	}}
	role="presentation"
>
	<use href={`#${href || icon}`} />
</svg>
<span class="visually-hidden">{alt}</span>

<style>
</style>
