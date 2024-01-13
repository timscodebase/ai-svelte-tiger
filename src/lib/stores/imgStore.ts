import { writable } from 'svelte/store';

const imgStore = writable({
  showDialog: false,
  isLoading: false,
  url: ''
})

export default imgStore