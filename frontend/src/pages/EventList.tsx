type Event = {
    id: string
    title: string
    // Add other fields if needed
  }
  
  interface EventListProps {
    events: Event[]
    onEventUpdate: () => void
  }
  
  export default function EventList({ events, onEventUpdate }: EventListProps) {
    return (
      <div>
        {events.map((event) => (
          <div key={event.id}>
            <h2>{event.title}</h2>
          </div>
        ))}
      </div>
    )
  }
  