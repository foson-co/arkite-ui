'use client'

import { useState } from 'react'
import { Badge, Button, DataTable, DatePicker, Modal, toast, type Column } from '@arkite-ui/core'

interface Row {
  id: number
  name: string
  role: string
}

const rows: Row[] = [
  { id: 1, name: '林小明', role: '管理員' },
  { id: 2, name: '陳大文', role: '成員' },
]

const columns: Column<Row>[] = [
  { key: 'name', header: '姓名', sortable: true },
  { key: 'role', header: '角色', cell: (r) => <Badge variant="secondary">{r.role}</Badge> },
]

export function Demo() {
  const [modalOpen, setModalOpen] = useState(false)
  const [date, setDate] = useState<Date | null>(null)

  return (
    <div className="mt-6 flex flex-col gap-4">
      <div className="flex gap-2">
        <Button onClick={() => setModalOpen(true)}>Open modal</Button>
        <Button
          variant="secondary"
          onClick={() => toast.success('已儲存', { description: 'Toast works under Next.' })}
        >
          Show toast
        </Button>
      </div>

      <DatePicker value={date} onChange={setDate} />

      <DataTable data={rows} columns={columns} getRowKey={(r) => r.id} pagination={false} />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Hydrated modal">
        <p data-testid="modal-body">Focus trap, Escape, and locale all live here.</p>
      </Modal>
    </div>
  )
}
