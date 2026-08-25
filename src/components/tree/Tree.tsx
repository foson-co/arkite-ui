import {
  forwardRef,
  useCallback,
  useMemo,
  useState,
  type HTMLAttributes,
  type ReactNode,
} from 'react'
import { Check, ChevronRight, Minus } from 'lucide-react'
import { cn } from '../../utils/cn'
import { warnDeprecated } from '../../utils/deprecate'
import { useLocale } from '../../locale'

/* ─── Types ─── */

export interface TreeNode {
  /** Unique key */
  key: string
  /** Display label */
  label: ReactNode
  /** Child nodes */
  children?: TreeNode[]
  /** Disable this node */
  disabled?: boolean
  /** Custom icon */
  icon?: ReactNode
}

export interface TreeProps extends Omit<HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Tree data */
  data: TreeNode[]
  /** Default expanded keys (uncontrolled) */
  defaultExpandedKeys?: string[]
  /** Expanded keys (controlled) */
  expandedKeys?: string[]
  /** On expand change */
  onExpandChange?: (keys: string[]) => void
  /** Enable checkboxes */
  checkable?: boolean
  /** Default checked keys (uncontrolled) */
  defaultCheckedKeys?: string[]
  /** Checked keys (controlled) */
  checkedKeys?: string[]
  /** On checked keys change */
  onSelectionChange?: (keys: string[]) => void
  /** @deprecated use `onSelectionChange` instead — removed in v1.0 */
  onCheckChange?: (keys: string[]) => void
  /** On node click */
  onSelect?: (key: string, node: TreeNode) => void
  /** Selected key (controlled) */
  selectedKey?: string
  /** Default selected key (uncontrolled) */
  defaultSelectedKey?: string
  /** Show connecting lines */
  showLines?: boolean
  /** Additional class name */
  className?: string
}

/* ─── Helpers ─── */

/** Collect all descendant keys of a node */
function getDescendantKeys(node: TreeNode): string[] {
  const keys: string[] = []
  const stack = [...(node.children ?? [])]
  while (stack.length) {
    const n = stack.pop()!
    keys.push(n.key)
    if (n.children) stack.push(...n.children)
  }
  return keys
}

/** Build a map from child key → parent key */
function buildParentMap(nodes: TreeNode[]): Map<string, string> {
  const map = new Map<string, string>()
  const stack: Array<{ node: TreeNode; parentKey: string | null }> = nodes.map((n) => ({
    node: n,
    parentKey: null,
  }))
  while (stack.length) {
    const { node, parentKey } = stack.pop()!
    if (parentKey !== null) map.set(node.key, parentKey)
    if (node.children) {
      for (const child of node.children) {
        stack.push({ node: child, parentKey: node.key })
      }
    }
  }
  return map
}

/** Build a lookup map for key → TreeNode */
function buildNodeMap(nodes: TreeNode[]): Map<string, TreeNode> {
  const map = new Map<string, TreeNode>()
  const stack = [...nodes]
  while (stack.length) {
    const n = stack.pop()!
    map.set(n.key, n)
    if (n.children) stack.push(...n.children)
  }
  return map
}

/* ─── Checkbox ─── */

type CheckState = 'checked' | 'indeterminate' | 'unchecked'

function TreeCheckbox({
  state,
  onChange,
  disabled,
  'aria-label': ariaLabel,
}: {
  state: CheckState
  onChange: () => void
  disabled?: boolean
  'aria-label'?: string
}) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={state === 'indeterminate' ? 'mixed' : state === 'checked'}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        onChange()
      }}
      className={cn(
        'inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors',
        'focus-visible:ring-ring/40 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        state !== 'unchecked'
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-input bg-background'
      )}
    >
      {state === 'checked' && <Check className="h-3 w-3" />}
      {state === 'indeterminate' && <Minus className="h-3 w-3" />}
    </button>
  )
}

/* ─── Tree Node Renderer ─── */

interface TreeNodeRowProps {
  node: TreeNode
  level: number
  expanded: boolean
  onToggleExpand: (key: string) => void
  checkable: boolean
  checkState: CheckState
  onCheck: (key: string) => void
  selectedKey?: string
  onSelect?: (key: string, node: TreeNode) => void
  showLines: boolean
}

function TreeNodeRow({
  node,
  level,
  expanded,
  onToggleExpand,
  checkable,
  checkState,
  onCheck,
  selectedKey,
  onSelect,
  showLines,
}: TreeNodeRowProps) {
  const locale = useLocale()
  const hasChildren = (node.children?.length ?? 0) > 0
  const isSelected = selectedKey === node.key

  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={isSelected}
      aria-disabled={node.disabled}
      tabIndex={0}
      className={cn(
        'flex h-8 items-center gap-1 px-2 text-sm select-none',
        !node.disabled && 'hover:bg-accent/50 cursor-pointer',
        isSelected && 'bg-accent text-accent-foreground',
        node.disabled && 'cursor-not-allowed opacity-50',
        showLines && 'border-border border-l'
      )}
      style={{ paddingLeft: level * 24 + 8 }}
      onClick={() => {
        if (node.disabled) return
        onSelect?.(node.key, node)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          if (node.disabled) return
          onSelect?.(node.key, node)
        }
      }}
    >
      {/* Expand toggle */}
      {hasChildren ? (
        <button
          type="button"
          aria-label={`${expanded ? locale.tree.collapse : locale.tree.expand} ${typeof node.label === 'string' ? node.label : node.key}`}
          className="hover:bg-accent inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-sm"
          onClick={(e) => {
            e.stopPropagation()
            onToggleExpand(node.key)
          }}
          tabIndex={-1}
        >
          <ChevronRight
            className={cn(
              'text-muted-foreground h-4 w-4 transition-transform duration-150',
              expanded && 'rotate-90'
            )}
          />
        </button>
      ) : (
        <span className="inline-flex h-5 w-5 shrink-0" />
      )}

      {/* Checkbox */}
      {checkable && (
        <TreeCheckbox
          state={checkState}
          onChange={() => onCheck(node.key)}
          disabled={node.disabled}
          aria-label={typeof node.label === 'string' ? node.label : locale.tree.toggle}
        />
      )}

      {/* Icon */}
      {node.icon && (
        <span className="text-muted-foreground inline-flex h-4 w-4 shrink-0 items-center justify-center">
          {node.icon}
        </span>
      )}

      {/* Label */}
      <span className="truncate">{node.label}</span>
    </div>
  )
}

/* ─── Tree Component ─── */

/**
 * Hierarchical tree view with expand/collapse, selection, and optional checkboxes.
 *
 * Supports both controlled and uncontrolled expand state, and parent-child
 * cascading check behavior when `checkable` is enabled.
 */
export const Tree = forwardRef<HTMLDivElement, TreeProps>(function Tree(
  {
    data,
    defaultExpandedKeys = [],
    expandedKeys: controlledExpandedKeys,
    onExpandChange,
    checkable = false,
    defaultCheckedKeys = [],
    checkedKeys: controlledCheckedKeys,
    onSelectionChange,
    onCheckChange,
    onSelect,
    selectedKey: controlledSelectedKey,
    defaultSelectedKey,
    showLines = false,
    className,
    ...rest
  },
  ref
) {
  /* ── Expand state ── */
  const isExpandControlled = controlledExpandedKeys !== undefined
  const [uncontrolledExpanded, setUncontrolledExpanded] = useState<Set<string>>(
    () => new Set(defaultExpandedKeys)
  )
  const expandedSet = useMemo(
    () => (isExpandControlled ? new Set(controlledExpandedKeys) : uncontrolledExpanded),
    [isExpandControlled, controlledExpandedKeys, uncontrolledExpanded]
  )

  const toggleExpand = useCallback(
    (key: string) => {
      const next = new Set(expandedSet)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      const arr = Array.from(next)
      if (!isExpandControlled) setUncontrolledExpanded(next)
      onExpandChange?.(arr)
    },
    [expandedSet, isExpandControlled, onExpandChange]
  )

  /* ── Check state ── */
  const isCheckControlled = controlledCheckedKeys !== undefined
  const [uncontrolledChecked, setUncontrolledChecked] = useState<Set<string>>(
    () => new Set(defaultCheckedKeys)
  )
  const checkedSet = useMemo(
    () => (isCheckControlled ? new Set(controlledCheckedKeys) : uncontrolledChecked),
    [isCheckControlled, controlledCheckedKeys, uncontrolledChecked]
  )

  const parentMap = useMemo(() => buildParentMap(data), [data])
  const nodeMap = useMemo(() => buildNodeMap(data), [data])

  const getCheckState = useCallback(
    (node: TreeNode): CheckState => {
      if (!node.children?.length) {
        return checkedSet.has(node.key) ? 'checked' : 'unchecked'
      }
      const descendantKeys = getDescendantKeys(node)
      const checkedCount = descendantKeys.filter((k) => checkedSet.has(k)).length
      if (checkedCount === 0)
        return checkedSet.has(node.key) && descendantKeys.length === 0 ? 'checked' : 'unchecked'
      if (checkedCount === descendantKeys.length) return 'checked'
      return 'indeterminate'
    },
    [checkedSet]
  )

  const handleCheck = useCallback(
    (key: string) => {
      const node = nodeMap.get(key)
      if (!node || node.disabled) return

      const next = new Set(checkedSet)
      const currentState = getCheckState(node)
      const shouldCheck = currentState !== 'checked'

      // Toggle self
      if (shouldCheck) next.add(key)
      else next.delete(key)

      // Cascade to descendants
      const descendantKeys = getDescendantKeys(node)
      for (const dk of descendantKeys) {
        if (shouldCheck) next.add(dk)
        else next.delete(dk)
      }

      // Cascade to ancestors
      let parentKey = parentMap.get(key)
      while (parentKey) {
        const parentNode = nodeMap.get(parentKey)
        if (parentNode) {
          const allDescendants = getDescendantKeys(parentNode)
          const allChecked = allDescendants.every((k) => next.has(k))
          if (allChecked) next.add(parentKey)
          else next.delete(parentKey)
        }
        parentKey = parentMap.get(parentKey)
      }

      if (!isCheckControlled) setUncontrolledChecked(next)
      const nextKeys = Array.from(next)
      if (onSelectionChange) {
        onSelectionChange(nextKeys)
      } else if (onCheckChange) {
        warnDeprecated('Tree', 'onCheckChange', 'onSelectionChange')
        onCheckChange(nextKeys)
      }
    },
    [
      checkedSet,
      getCheckState,
      isCheckControlled,
      nodeMap,
      parentMap,
      onSelectionChange,
      onCheckChange,
    ]
  )

  /* ── Selected state ── */
  const isSelectControlled = controlledSelectedKey !== undefined
  const [uncontrolledSelectedKey, setUncontrolledSelectedKey] = useState<string | undefined>(
    defaultSelectedKey
  )
  const selectedKey = isSelectControlled ? controlledSelectedKey : uncontrolledSelectedKey

  const handleSelect = useCallback(
    (key: string, node: TreeNode) => {
      if (!isSelectControlled) setUncontrolledSelectedKey(key)
      onSelect?.(key, node)
    },
    [isSelectControlled, onSelect]
  )

  /* ── Render ── */
  const renderNodes = (nodes: TreeNode[], level: number): ReactNode[] =>
    nodes.flatMap((node) => {
      const isExpanded = expandedSet.has(node.key)
      const elements: ReactNode[] = [
        <TreeNodeRow
          key={node.key}
          node={node}
          level={level}
          expanded={isExpanded}
          onToggleExpand={toggleExpand}
          checkable={checkable}
          checkState={checkable ? getCheckState(node) : 'unchecked'}
          onCheck={handleCheck}
          selectedKey={selectedKey}
          onSelect={handleSelect}
          showLines={showLines}
        />,
      ]
      if (isExpanded && node.children?.length) {
        elements.push(...renderNodes(node.children, level + 1))
      }
      return elements
    })

  return (
    <div ref={ref} role="tree" className={cn('text-foreground', className)} {...rest}>
      {renderNodes(data, 0)}
    </div>
  )
})

Tree.displayName = 'Tree'
