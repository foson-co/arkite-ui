import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { Calendar } from '../../components/calendar'

const meta: Meta = {
  title: 'Data Display/Calendar',
  component: Calendar,
}

export default meta

const DefaultDemo = () => {
  const [date, setDate] = useState<Date | null>(null)
  return (
    <div className="space-y-2">
      <Calendar value={date} onSelect={setDate} />
      {date && (
        <p className="text-muted-foreground text-sm">Selected: {date.toLocaleDateString()}</p>
      )}
    </div>
  )
}

export const Default: StoryFn = () => <DefaultDemo />

const WithConstraintsDemo = () => {
  const [date, setDate] = useState<Date | null>(null)
  const today = new Date()
  const minDate = new Date(today.getFullYear(), today.getMonth(), 1)
  const maxDate = new Date(today.getFullYear(), today.getMonth() + 2, 0)

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">Selectable: this month and next month only</p>
      <Calendar value={date} onSelect={setDate} minDate={minDate} maxDate={maxDate} />
    </div>
  )
}

export const WithConstraints: StoryFn = () => <WithConstraintsDemo />

const HighlightedDemo = () => {
  const [date, setDate] = useState<Date | null>(null)
  const today = new Date()
  const highlighted = [
    new Date(today.getFullYear(), today.getMonth(), 5),
    new Date(today.getFullYear(), today.getMonth(), 12),
    new Date(today.getFullYear(), today.getMonth(), 20),
    new Date(today.getFullYear(), today.getMonth(), 25),
  ]

  return (
    <div className="space-y-2">
      <p className="text-muted-foreground text-sm">Days with events are highlighted</p>
      <Calendar value={date} onSelect={setDate} highlightedDates={highlighted} />
    </div>
  )
}

export const WithHighlights: StoryFn = () => <HighlightedDemo />

export const MondayStart: StoryFn = () => {
  const MondayDemo = () => {
    const [date, setDate] = useState<Date | null>(null)
    return <Calendar value={date} onSelect={setDate} weekStartsOn={1} />
  }
  return <MondayDemo />
}
