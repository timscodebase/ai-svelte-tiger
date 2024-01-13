import type { Actions } from './$types'
import { SECRET_OPEN_API_KEY } from '$env/static/private'
import { z } from 'zod'
import OpenAI from 'openai'
import { PromptTemplate } from 'langchain/prompts'
import party from 'party-js'
import type { DynamicSourceType } from 'party-js/lib/systems/sources.js'
import stateStore from '$lib/stateStore'
import { jsFormSubmit } from '$lib'

export const actions = {
  prompt: async ({ request }) => {
    const formData = await request.formData();

    const validation = z.object({
      opponent1: z.string().min(1).max(60),
      opponent2: z.string().min(1).max(60),
    }).safeParse(formData)

    // if (!validation.success) {
    //   request.json(400, {
    //     errors: validation.error.issues
    //   })
    //   return 
    // }

    const openai = new OpenAI({
      apiKey: SECRET_OPEN_API_KEY,
    })

    const template = `You're a professional fighting judge with a sense of humor. Who would win in a fight between {opponent1} ("opponent1") and {opponent2} ("opponent2")? Only tell me who the winner is and a funny reason why.

    Format the response like this:
    winner: opponent1 or opponent2. reason: the reason they won.

    For the winner use only their label ("opponent1" or "opponent2"). For the reason, use their name.`

    const promptTemplate = new PromptTemplate({
      template: template,
      inputVariables: ['opponent1', 'opponent2']
    })

    const prompt = await promptTemplate.format({
      opponent1: validation.data.opponent1,
      opponent2: validation.data.opponent2
    })

    const response = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-3.5-turbo",
      max_tokens: 300,
      temperature: 1,
      stream: true
    });

    const writer = request.getWritableStream().getWriter()
    const encoder = new TextEncoder()

    for await (const chunk of response) {
      const text = chunk.choices[0].delta.content || ''
      writer.write(encoder.encode(text))
    }
    writer.close();
  },
  get_winner: async ({ request }) => {
		stateStore.isLoading = true
		stateStore.text = ''
    stateStore.winner = ''

    const formData = await request.formData();

    const response = await jsFormSubmit(formData)

    if (!response.ok) {
      stateStore.isLoading = false
      alert("The request experienced an issue.")
      return
    }

    if (!response.body) {
      stateStore.isLoading = false
      return
    }

    // Parse streaming body
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let isStillStreaming = true

    while(isStillStreaming) {
      const {value, done} = await reader.read()
      const chunkValue = decoder.decode(value)
      
      stateStore.text += chunkValue

      isStillStreaming = !done
    }

    const winnerPattern = /winner:\s+(\w+).*/gi
    const match = winnerPattern.exec(stateStore.text)

    stateStore.winner = match?.length ? match[1].toLowerCase() : ''

    if (stateStore.winner) {
      const winnerInput = document.querySelector(`textarea[name=${stateStore.winner}]`)
      if (winnerInput) {
        party.confetti(winnerInput as DynamicSourceType, {
          count: 40,
          size: 2,
          spread: 15
        })
      }
    }
  
    stateStore.isLoading = false
  }
} satisfies Actions;