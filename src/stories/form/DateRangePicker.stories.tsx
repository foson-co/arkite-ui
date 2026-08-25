import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import { DateRangePicker, type DateRangeValue } from '../../components/date-picker/DateRangePicker'
import { FilterBar, FilterBarFilters } from '../../components/filter-bar/FilterBar'
import { FilterSelect } from '../../components/filter-bar/FilterSelect'

const meta: Meta<typeof DateRangePicker> = {
  title: 'Form/DateRangePicker',
  component: DateRangePicker,
  parameters: { layout: 'padded' },
}

export default meta

// ── Default (interactive) ──

function DefaultDemo() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onStartChange={setStartDate}
      onEndChange={setEndDate}
      onClear={() => {
        setStartDate(null)
        setEndDate(null)
      }}
      aria-label="Select date range"
    />
  )
}

export const Default: StoryFn = () => <DefaultDemo />

// ── With Preset Dates ──

function WithPresetDatesDemo() {
  const today = new Date()
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const [startDate, setStartDate] = useState<Date | null>(today)
  const [endDate, setEndDate] = useState<Date | null>(nextWeek)

  return (
    <DateRangePicker
      startDate={startDate}
      endDate={endDate}
      onStartChange={setStartDate}
      onEndChange={setEndDate}
      onClear={() => {
        setStartDate(null)
        setEndDate(null)
      }}
      startLabel="Check-in"
      endLabel="Check-out"
      aria-label="Select date range"
    />
  )
}

export const WithPresetDates: StoryFn = () => <WithPresetDatesDemo />

// ── Disabled ──

export const Disabled: StoryFn = () => {
  const today = new Date()
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)

  return (
    <DateRangePicker startDate={today} endDate={nextWeek} disabled aria-label="Select date range" />
  )
}

// ── With Error ──

export const WithError: StoryFn = () => {
  return <DateRangePicker startDate={null} endDate={null} error aria-label="Select date range" />
}

// ── Small Size ──

function SmallSizeDemo() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  return (
    <DateRangePicker
      size="sm"
      startDate={startDate}
      endDate={endDate}
      onStartChange={setStartDate}
      onEndChange={setEndDate}
      onClear={() => {
        setStartDate(null)
        setEndDate(null)
      }}
      aria-label="Select date range"
    />
  )
}

export const SmallSize: StoryFn = () => <SmallSizeDemo />

// ── Calendar Range (variant="calendar") ──

function CalendarRangeDemo() {
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)

  return (
    <DateRangePicker
      variant="calendar"
      startDate={startDate}
      endDate={endDate}
      onStartChange={setStartDate}
      onEndChange={setEndDate}
      onClear={() => {
        setStartDate(null)
        setEndDate(null)
      }}
      aria-label="Select date range"
    />
  )
}

export const CalendarRange: StoryFn = () => <CalendarRangeDemo />

// ── Calendar Range with Preset Dates ──

function CalendarRangePresetDemo() {
  const today = new Date()
  const nextWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const [startDate, setStartDate] = useState<Date | null>(today)
  const [endDate, setEndDate] = useState<Date | null>(nextWeek)

  return (
    <DateRangePicker
      variant="calendar"
      startDate={startDate}
      endDate={endDate}
      onStartChange={setStartDate}
      onEndChange={setEndDate}
      onClear={() => {
        setStartDate(null)
        setEndDate(null)
      }}
      aria-label="Select date range"
    />
  )
}

export const CalendarRangeWithDates: StoryFn = () => <CalendarRangePresetDemo />

// ── In a filter bar: labels inside, so the row stays one line ──

/**
 * Stacked labels (`labelPlacement="top"`, the default) add a line above the
 * inputs, which pushes them out of alignment with the single-line controls
 * beside them in a toolbar. `"inside"` moves the label into the field as its
 * placeholder — one line, still an accessible name, format hint on hover.
 *
 * The first example is the anti-pattern on purpose, so it logs the dev-only
 * composition warning to the console. That is the story working, not breaking.
 */
function InFilterBarDemo() {
  const [range, setRange] = useState<DateRangeValue>({ start: null, end: null })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="mb-2 text-sm font-medium">
          labelPlacement=&quot;top&quot; — inputs sit 10px lower than the select
        </p>
        <FilterBar>
          <FilterBarFilters>
            <FilterSelect
              label="Status"
              options={[
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
            <DateRangePicker size="sm" startLabel="From" endLabel="To" onChange={() => {}} />
          </FilterBarFilters>
        </FilterBar>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">
          labelPlacement=&quot;inside&quot; — one aligned row
        </p>
        <FilterBar>
          <FilterBarFilters>
            <FilterSelect
              label="Status"
              options={[
                { value: 'paid', label: 'Paid' },
                { value: 'pending', label: 'Pending' },
              ]}
            />
            <DateRangePicker
              size="sm"
              startLabel="From"
              endLabel="To"
              labelPlacement="inside"
              value={range}
              onChange={(v) => setRange(v)}
            />
          </FilterBarFilters>
        </FilterBar>
      </div>
    </div>
  )
}

export const InFilterBar: StoryFn = () => <InFilterBarDemo />
