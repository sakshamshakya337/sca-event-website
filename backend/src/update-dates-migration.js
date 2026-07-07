import mongoose from 'mongoose'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.join(__dirname, '../.env') })

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.error("MONGODB_URI is not defined in .env")
  process.exit(1)
}

const eventSchema = new mongoose.Schema({}, { strict: false })
const Event = mongoose.model('Event', eventSchema)

async function updateEvents() {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('Connected to MongoDB')

    const eventsToUpdate = await Event.find({
      date: { $exists: true },
      startDate: { $exists: false }
    })

    console.log(`Found ${eventsToUpdate.length} events to migrate`)

    let updatedCount = 0
    for (let event of eventsToUpdate) {
      await Event.updateOne(
        { _id: event._id },
        { 
          $set: { 
            startDate: event.get('date'),
            endDate: event.get('date') 
          },
          $unset: {
            date: ""
          }
        }
      )
      updatedCount++
    }

    console.log(`Successfully migrated ${updatedCount} events`)
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected from MongoDB')
  }
}

updateEvents()
