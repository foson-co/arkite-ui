import { useState, type FormEvent } from 'react'
import {
  Badge,
  Button,
  Card,
  ConfirmDialog,
  DescriptionItem,
  DescriptionList,
  Drawer,
  Form,
  FormActions,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
  Input,
  PageHeader,
  Textarea,
  ToastContainer,
  toast,
} from '../../index'

interface Customer {
  name: string
  email: string
  company: string
  notes: string
}

const INITIAL_CUSTOMER: Customer = {
  name: 'Ada Chen',
  email: 'ada@northwind.example',
  company: 'Northwind Trading',
  notes: 'Prefers invoices in USD. Renewal due in Q4.',
}

/**
 * Recipe: a detail page with drawer editing.
 *
 * Composition: PageHeader (back + Edit action) → DescriptionList inside a
 * Card for the read view → Drawer holding the edit form (Form family) →
 * ConfirmDialog guarding unsaved changes → toast confirming the save.
 * Every close path (X, Escape, backdrop, Cancel) funnels through one
 * `requestClose` so the dirty guard can never be bypassed.
 */
export function DetailDrawerPage() {
  const [customer, setCustomer] = useState(INITIAL_CUSTOMER)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [draft, setDraft] = useState(INITIAL_CUSTOMER)
  const [nameError, setNameError] = useState<string | undefined>(undefined)
  const [discardOpen, setDiscardOpen] = useState(false)

  const isDirty =
    draft.name !== customer.name ||
    draft.email !== customer.email ||
    draft.company !== customer.company ||
    draft.notes !== customer.notes

  const openEditor = () => {
    setDraft(customer)
    setNameError(undefined)
    setDrawerOpen(true)
  }

  // The single gate for closing the drawer: dirty → confirm, clean → close.
  const requestClose = () => {
    if (isDirty) {
      setDiscardOpen(true)
    } else {
      setDrawerOpen(false)
    }
  }

  const discardChanges = () => {
    setDiscardOpen(false)
    setDrawerOpen(false)
  }

  const save = (event: FormEvent) => {
    event.preventDefault()
    if (!draft.name.trim()) {
      setNameError('Name is required.')
      return
    }
    setCustomer(draft)
    setDrawerOpen(false)
    toast.success('Customer updated', { description: 'Your changes have been saved.' })
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <PageHeader
          title={customer.name}
          description={customer.company}
          badge={<Badge variant="success">Active</Badge>}
          onBack={() => toast.info('Back', { description: 'Wire onBack to your router.' })}
          actions={<Button onClick={openEditor}>Edit</Button>}
        />

        <Card padding="lg">
          <DescriptionList>
            <DescriptionItem label="Name" value={customer.name} />
            <DescriptionItem label="Email" value={customer.email} />
            <DescriptionItem label="Company" value={customer.company} />
            <DescriptionItem label="Notes" value={customer.notes} />
            <DescriptionItem label="Status">
              <Badge variant="success">Active</Badge>
            </DescriptionItem>
          </DescriptionList>
        </Card>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={requestClose}
        title="Edit customer"
        description="Changes apply after you save."
        size="lg"
      >
        <Form onSubmit={save}>
          <FormField name="name" errorMessage={nameError}>
            <FormLabel required>Name</FormLabel>
            <FormControl>
              <Input
                value={draft.name}
                error={Boolean(nameError)}
                onChange={(e) => {
                  setDraft({ ...draft, name: e.target.value })
                  setNameError(undefined)
                }}
              />
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="email">
            <FormLabel required>Email</FormLabel>
            <FormControl>
              <Input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              />
            </FormControl>
          </FormField>

          <FormField name="company">
            <FormLabel>Company</FormLabel>
            <FormControl>
              <Input
                value={draft.company}
                onChange={(e) => setDraft({ ...draft, company: e.target.value })}
              />
            </FormControl>
          </FormField>

          <FormField name="notes">
            <FormLabel optional>Notes</FormLabel>
            <FormControl>
              <Textarea
                rows={4}
                value={draft.notes}
                onChange={(e) => setDraft({ ...draft, notes: e.target.value })}
              />
            </FormControl>
          </FormField>

          <FormActions>
            <Button type="button" variant="outline" onClick={requestClose}>
              Cancel
            </Button>
            <Button type="submit">Save changes</Button>
          </FormActions>
        </Form>
      </Drawer>

      <ConfirmDialog
        open={discardOpen}
        onClose={() => setDiscardOpen(false)}
        onConfirm={discardChanges}
        variant="warning"
        title="Discard changes?"
        description="You have unsaved edits. Closing the editor will lose them."
        confirmLabel="Discard"
        cancelLabel="Keep editing"
      />

      <ToastContainer />
    </div>
  )
}
