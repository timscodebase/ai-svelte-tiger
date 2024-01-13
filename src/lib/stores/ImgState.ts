import { writable } from 'svelte/store';

const imgState = writable({
  showDialog: false,
  isLoading: false,
  url: ''
})

export default imgState