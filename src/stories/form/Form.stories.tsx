import { useState } from 'react'
import type { Meta, StoryFn } from '@storybook/react-vite'
import {
  Form,
  FormField,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormSection,
  FormActions,
} from '../../components/form'
import { Input } from '../../components/input'
import { Select } from '../../components/select'
import { Checkbox } from '../../components/checkbox'
import { Button } from '../../components/button'

const meta = {
  title: 'Form/Form',
  component: Form,
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Form>

export default meta

export const Default: StoryFn = () => (
  <Form className="w-96">
    <FormSection title="Profile" description="Update your personal information">
      <FormField name="name">
        <FormLabel required>Full Name</FormLabel>
        <FormControl>
          <Input placeholder="John Doe" />
        </FormControl>
      </FormField>

      <FormField name="email">
        <FormLabel required>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="john@example.com" />
        </FormControl>
        <FormDescription>We&apos;ll never share your email.</FormDescription>
      </FormField>

      <FormField name="role">
        <FormLabel>Role</FormLabel>
        <FormControl>
          <Select
            options={[
              { value: 'admin', label: 'Admin' },
              { value: 'editor', label: 'Editor' },
              { value: 'viewer', label: 'Viewer' },
            ]}
            placeholder="Select role..."
          />
        </FormControl>
      </FormField>
    </FormSection>

    <FormActions>
      <Button variant="outline">Cancel</Button>
      <Button variant="primary">Save</Button>
    </FormActions>
  </Form>
)

export const WithErrors: StoryFn = () => (
  <Form className="w-96">
    <FormField name="email" errorMessage="Invalid email address">
      <FormLabel required>Email</FormLabel>
      <FormControl>
        <Input type="email" placeholder="john@example.com" error />
      </FormControl>
      <FormMessage />
    </FormField>

    <FormField name="password" errorMessage="Password must be at least 8 characters">
      <FormLabel required>Password</FormLabel>
      <FormControl>
        <Input type="password" error />
      </FormControl>
      <FormMessage />
    </FormField>
  </Form>
)

export const Disabled: StoryFn = () => (
  <Form className="w-96" disabled>
    <FormField name="name">
      <FormLabel>Full Name</FormLabel>
      <FormControl>
        <Input placeholder="John Doe" value="Alice Chen" disabled />
      </FormControl>
    </FormField>

    <FormField name="email">
      <FormLabel>Email</FormLabel>
      <FormControl>
        <Input type="email" value="alice@example.com" disabled />
      </FormControl>
    </FormField>

    <FormActions>
      <Button variant="primary" disabled>
        Save
      </Button>
    </FormActions>
  </Form>
)

const SubmittingDemo = () => {
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => setSubmitting(false), 2000)
  }

  return (
    <Form className="w-96" onSubmit={handleSubmit}>
      <FormField name="name">
        <FormLabel required>Full Name</FormLabel>
        <FormControl>
          <Input placeholder="John Doe" disabled={submitting} />
        </FormControl>
      </FormField>

      <FormField name="email">
        <FormLabel required>Email</FormLabel>
        <FormControl>
          <Input type="email" placeholder="john@example.com" disabled={submitting} />
        </FormControl>
      </FormField>

      <FormActions>
        <Button variant="outline" disabled={submitting}>
          Cancel
        </Button>
        <Button variant="primary" type="submit" loading={submitting}>
          {submitting ? 'Saving...' : 'Save'}
        </Button>
      </FormActions>
    </Form>
  )
}

export const Submitting: StoryFn = () => <SubmittingDemo />

const ValidationDemo = () => {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [values, setValues] = useState({ name: '', email: '', agree: false })

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!values.name.trim()) errs.name = 'Name is required'
    if (!values.email.trim()) errs.email = 'Email is required'
    else if (!values.email.includes('@')) errs.email = 'Invalid email format'
    if (!values.agree) errs.agree = 'You must agree to the terms'
    return errs
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length === 0) {
      alert('Form submitted successfully!')
    }
  }

  return (
    <Form className="w-96" onSubmit={handleSubmit}>
      <FormSection title="Registration" description="Create your account">
        <FormField name="name" errorMessage={errors.name}>
          <FormLabel required>Name</FormLabel>
          <FormControl>
            <Input
              placeholder="Your name"
              value={values.name}
              onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
              error={!!errors.name}
            />
          </FormControl>
          <FormMessage />
        </FormField>

        <FormField name="email" errorMessage={errors.email}>
          <FormLabel required>Email</FormLabel>
          <FormControl>
            <Input
              type="email"
              placeholder="you@example.com"
              value={values.email}
              onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
              error={!!errors.email}
            />
          </FormControl>
          <FormDescription>We&apos;ll send a verification email.</FormDescription>
          <FormMessage />
        </FormField>

        <FormField name="agree" errorMessage={errors.agree}>
          <div className="flex items-center gap-2">
            <FormControl>
              <Checkbox
                checked={values.agree}
                onChange={(e) => setValues((v) => ({ ...v, agree: e.target.checked }))}
              />
            </FormControl>
            <FormLabel>I agree to the terms and conditions</FormLabel>
          </div>
          <FormMessage />
        </FormField>
      </FormSection>

      <FormActions>
        <Button variant="primary" type="submit">
          Register
        </Button>
      </FormActions>
    </Form>
  )
}

export const WithValidation: StoryFn = () => <ValidationDemo />

export const MultiSection: StoryFn = () => (
  <Form className="max-w-lg">
    <FormSection title="Personal Info" description="Basic personal details">
      <FormField name="firstName">
        <FormLabel required>First Name</FormLabel>
        <FormControl>
          <Input placeholder="John" />
        </FormControl>
      </FormField>
      <FormField name="lastName">
        <FormLabel required>Last Name</FormLabel>
        <FormControl>
          <Input placeholder="Doe" />
        </FormControl>
      </FormField>
    </FormSection>

    <FormSection title="Company" description="Your organization details">
      <FormField name="company">
        <FormLabel>Company Name</FormLabel>
        <FormControl>
          <Input placeholder="Acme Inc." />
        </FormControl>
      </FormField>
      <FormField name="role">
        <FormLabel>Job Title</FormLabel>
        <FormControl>
          <Input placeholder="Software Engineer" />
        </FormControl>
      </FormField>
    </FormSection>

    <FormSection title="Preferences" description="Notification preferences">
      <FormField name="notifications">
        <div className="flex items-center gap-2">
          <FormControl>
            <Checkbox />
          </FormControl>
          <FormLabel>Email notifications</FormLabel>
        </div>
      </FormField>
      <FormField name="marketing">
        <div className="flex items-center gap-2">
          <FormControl>
            <Checkbox />
          </FormControl>
          <FormLabel optional>Marketing emails</FormLabel>
        </div>
      </FormField>
    </FormSection>

    <FormActions align="between">
      <Button variant="ghost">Reset</Button>
      <div className="flex gap-2">
        <Button variant="outline">Cancel</Button>
        <Button variant="primary">Save Changes</Button>
      </div>
    </FormActions>
  </Form>
)

export const LabelShorthand: StoryFn = () => (
  <Form className="w-96">
    <FormSection title="Shorthand" description="FormField label/required render a wired FormLabel">
      <FormField name="name" label="Full Name" required>
        <FormControl>
          <Input placeholder="John Doe" />
        </FormControl>
      </FormField>
      <FormField name="bio" label="Bio" errorMessage="Required for public profiles">
        <FormControl>
          <Input />
        </FormControl>
      </FormField>
    </FormSection>
  </Form>
)
