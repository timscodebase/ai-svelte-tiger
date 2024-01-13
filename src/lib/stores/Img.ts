import { writable, type Writable } from 'svelte/store'
import { getContext, setContext } from 'svelte'

type Img = {
  showDialog: boolean
  url: string
  isLoading: boolean
}
type Context = Writable<Img>

export function setImg() {
	const img = writable<Img>({
		showDialog: false,
		url: '',
		isLoading: false
})
	setContext('img', img)
}

export function getImg() {
	return getContext<Context>('img')
}