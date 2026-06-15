import createApp from './createApp.js'

const port = Number(process.env.PORT) || 3000

createApp().listen(port, () => {
  console.log(`jerrypic-upload listening on :${port}`)
})
