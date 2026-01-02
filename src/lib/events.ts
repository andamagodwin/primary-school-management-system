import { ID } from 'appwrite'
import { databases, DATABASE_ID, EVENTS_TABLE_ID, USERS_TABLE_ID, account } from './appwrite'

export interface Event {
  $id: string
  $createdAt: string
  $updatedAt: string
  eventId: string
  title: string
  description?: string
  eventDate: string
  eventTime?: string
  location?: string
  eventType: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  createdBy: string
  createdByName: string
}

export interface CreateEventData {
  title: string
  description?: string
  eventDate: string
  eventTime?: string
  location?: string
  eventType: string
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
}

/**
 * Create a new event
 */
export async function createEvent(data: CreateEventData): Promise<Event> {
  try {
    // Get current user (who is creating the event)
    const currentUser = await account.get()
    
    // Get user profile to get full name
    const userProfile = await databases.listDocuments(
      DATABASE_ID,
      USERS_TABLE_ID,
      []
    )
    
    const user = userProfile.documents.find(doc => doc.userId === currentUser.$id)
    const createdByName = user?.fullName || currentUser.name || 'Unknown'
    
    // Generate unique event ID
    const eventId = ID.unique()
    
    // Create event document
    const eventData = {
      eventId,
      title: data.title,
      description: data.description || null,
      eventDate: data.eventDate,
      eventTime: data.eventTime || null,
      location: data.location || null,
      eventType: data.eventType,
      status: data.status || 'upcoming',
      createdBy: currentUser.$id,
      createdByName,
    }
    
    console.log('Creating event with data:', eventData)
    
    const event = await databases.createDocument(
      DATABASE_ID,
      EVENTS_TABLE_ID,
      ID.unique(),
      eventData
    )
    
    console.log('Event created successfully:', event)
    
    return event as unknown as Event
  } catch (error) {
    console.error('Error creating event:', error)
    throw error
  }
}

/**
 * Get all events
 */
export async function getEvents(): Promise<Event[]> {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID,
      EVENTS_COLLECTION_ID
    )
    
    return response.documents as unknown as Event[]
  } catch (error) {
    console.error('Error fetching events:', error)
    throw error
  }
}

/**
 * Get event by ID
 */
export async function getEvent(eventId: string): Promise<Event> {
  try {
    const event = await databases.getDocument(
      DATABASE_ID,
      EVENTS_TABLE_ID,
      eventId
    )
    
    return event as unknown as Event
  } catch (error) {
    console.error('Error fetching event:', error)
    throw error
  }
}

/**
 * Update event
 */
export async function updateEvent(
  documentId: string,
  data: Partial<CreateEventData>
): Promise<Event> {
  try {
    const event = await databases.updateDocument(
      DATABASE_ID,
      EVENTS_TABLE_ID,
      documentId,
      data
    )
    
    return event as unknown as Event
  } catch (error) {
    console.error('Error updating event:', error)
    throw error
  }
}

/**
 * Delete event
 */
export async function deleteEvent(documentId: string): Promise<void> {
  try {
    await databases.deleteDocument(
      DATABASE_ID,
      EVENTS_TABLE_ID,
      documentId
    )
  } catch (error) {
    console.error('Error deleting event:', error)
    throw error
  }
}

