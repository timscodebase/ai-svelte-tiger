import { writable } from 'svelte/store'

type Img = {
  showDialog: boolean
  url: string
  isLoading: boolean
}

const Img = writable<Img>({
	showDialog: false,
	url: '',
	isLoading: false
})

export default Img