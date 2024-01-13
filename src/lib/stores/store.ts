import { writable } from 'svelte/store'

type State = {
  isLoading: boolean
  text: string
  winner: string
  opponent1: string
  opponent2: string
}
const State = writable<State>({
	isLoading: false,
	text: '',
	winner: '',
	opponent1: '',
	opponent2: ''
})

export default State