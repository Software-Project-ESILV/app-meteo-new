import { connectToDb } from './db/mongo.js'
import app from './app.js'

const port = process.env.PORT || 3000

async function start () {
  await connectToDb()
  app.listen(port, () => {
    console.log(`API running at http://localhost:${port}`)
  })
}

start()
