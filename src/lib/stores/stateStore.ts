import { writable } from 'svelte/store';

const stateStore = writable({
  isLoading: false,
  text: '',
  winner: '',
  opponent1: '',
  opponent2: '',
})

export default stateStore