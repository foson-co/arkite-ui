import { useState, type FormEvent } from 'react'
import {
  Button,
  Form,
  FormActions,
  FormControl,
  FormDescription,
  FormField,
  FormLabel,
  FormMessage,
  FormSection,
  Input,
  PageHeader,
  Select,
  Switch,
  Textarea,
  ToastContainer,
  toast,
} from '../../index'

interface ProjectDraft {
  name: string
  region: string
  description: string
  deployAlerts: boolean
}

const EMPTY_DRAFT: ProjectDraft = {
  name: '',
  region: '',
  description: '',
  deployAlerts: true,
}

const REGIONS = [
  { value: 'ap-northeast', label: 'Asia Pacific (Tokyo)' },
  { value: 'ap-east', label: 'Asia Pacific (Taipei)' },
  { value: 'eu-central', label: 'Europe (Frankfurt)' },
  { value: 'us-west', label: 'US West (Oregon)' },
]

type FieldErrors = Partial<Record<'name' | 'region', string>>

function validate(draft: ProjectDraft): FieldErrors {
  const errors: FieldErrors = {}
  if (!draft.name.trim()) {
    errors.name = 'Project name is required.'
  } else if (draft.name.trim().length < 3) {
    errors.name = 'Project name needs at least 3 characters.'
  }
  if (!draft.region) {
    errors.region = 'Choose the region the project deploys to.'
  }
  return errors
}

/**
 * Recipe: a complete create/edit form page.
 *
 * Composition: PageHeader → Form → FormSection → FormField (FormLabel +
 * FormControl + FormDescription + FormMessage) → FormActions. The Form
 * family is layout-only: values, validation, and submission live in page
 * state, so swapping useState for react-hook-form later changes nothing
 * in the markup. Validation runs on submit; a field's error clears as
 * soon as the user edits it; success fires a toast and resets the form.
 */
export function FormPage() {
  const [draft, setDraft] = useState(EMPTY_DRAFT)
  const [errors, setErrors] = useState<FieldErrors>({})

  const edit = <K extends keyof ProjectDraft>(key: K, value: ProjectDraft[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }))
    // Editing a field dismisses its error until the next submit
    setErrors((prev) => (key in prev ? { ...prev, [key]: undefined } : prev))
  }

  const reset = () => {
    setDraft(EMPTY_DRAFT)
    setErrors({})
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const nextErrors = validate(draft)
    setErrors(nextErrors)
    if (Object.values(nextErrors).some(Boolean)) return

    toast.success('Project created', {
      description: `"${draft.name.trim()}" is ready to use.`,
    })
    reset()
  }

  return (
    <div className="bg-background min-h-screen p-6">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <PageHeader
          title="New project"
          description="Projects group deployments, environments, and alerts."
        />

        <Form onSubmit={handleSubmit} noValidate>
          <FormSection title="General" description="How the project appears across the dashboard.">
            <FormField errorMessage={errors.name}>
              <FormLabel required>Project name</FormLabel>
              <FormControl>
                <Input
                  value={draft.name}
                  onChange={(e) => edit('name', e.target.value)}
                  error={Boolean(errors.name)}
                  placeholder="e.g. Aurora"
                  fullWidth
                />
              </FormControl>
              <FormDescription>Shown in the sidebar and on invoices.</FormDescription>
              <FormMessage />
            </FormField>

            <FormField errorMessage={errors.region}>
              <FormLabel required>Region</FormLabel>
              <FormControl>
                <Select
                  value={draft.region}
                  onChange={(e) => edit('region', e.target.value)}
                  error={Boolean(errors.region)}
                  placeholder="Select a region"
                  options={REGIONS}
                  fullWidth
                />
              </FormControl>
              <FormDescription>Cannot be changed after the first deployment.</FormDescription>
              <FormMessage />
            </FormField>

            <FormField>
              <FormLabel optional>Description</FormLabel>
              <FormControl>
                <Textarea
                  value={draft.description}
                  onChange={(e) => edit('description', e.target.value)}
                  placeholder="What does this project do?"
                />
              </FormControl>
            </FormField>
          </FormSection>

          <FormSection title="Notifications">
            <FormField>
              <Switch
                label="Deploy alerts"
                description="Email the team when a deployment finishes or fails."
                checked={draft.deployAlerts}
                onChange={(e) => edit('deployAlerts', e.target.checked)}
              />
            </FormField>
          </FormSection>

          <FormActions>
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
            <Button type="submit">Create project</Button>
          </FormActions>
        </Form>
      </div>

      <ToastContainer />
    </div>
  )
}
