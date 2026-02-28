'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { GitBranch, ZoomIn, ZoomOut, Maximize2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

interface GraphNode {
  id: string
  title: string
  icon: string
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  linkCount: number
}

interface GraphEdge {
  source: string
  target: string
}

interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

function useKnowledgeGraph() {
  const [data, setData] = useState<GraphData>({ nodes: [], edges: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/notes?limit=200').then(r => r.json()),
      fetch('/api/notes/links').then(r => r.json()).catch(() => []),
    ]).then(([notes, links]) => {
      const noteList = Array.isArray(notes) ? notes : []
      const linkList = Array.isArray(links) ? links : []

      // Count links per node
      const linkCount: Record<string, number> = {}
      linkList.forEach((l: { source_note_id: string; target_note_id: string }) => {
        linkCount[l.source_note_id] = (linkCount[l.source_note_id] || 0) + 1
        linkCount[l.target_note_id] = (linkCount[l.target_note_id] || 0) + 1
      })

      const nodes: GraphNode[] = noteList.map((n: { id: string; title: string; icon?: string }, i: number) => {
        const angle = (i / noteList.length) * Math.PI * 2
        const dist = 180 + Math.random() * 120
        const lc = linkCount[n.id] || 0
        return {
          id: n.id,
          title: n.title || 'Untitled',
          icon: n.icon || '📝',
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          radius: 6 + Math.min(lc * 2, 12),
          linkCount: lc,
        }
      })

      const edges: GraphEdge[] = linkList.map((l: { source_note_id: string; target_note_id: string }) => ({
        source: l.source_note_id,
        target: l.target_note_id,
      }))

      setData({ nodes, edges })
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return { data, loading }
}

export default function KnowledgeGraphPage() {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const { data, loading } = useKnowledgeGraph()

  // Camera state
  const camera = useRef({ x: 0, y: 0, zoom: 1 })
  const dragging = useRef<{ node: GraphNode | null; panStart: { x: number; y: number } | null }>({
    node: null,
    panStart: null,
  })
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null)
  const nodesRef = useRef<GraphNode[]>([])
  // Cache nodeMap so we don't rebuild it every frame
  const nodeMapRef = useRef<Map<string, GraphNode>>(new Map())
  // Alpha for physics cooling — starts hot, cools down so simulation stops when settled
  const alphaRef = useRef(1.0)

  // Sync nodes ref and rebuild cached nodeMap when data changes
  useEffect(() => {
    nodesRef.current = data.nodes
    nodeMapRef.current = new Map(data.nodes.map(n => [n.id, n]))
    alphaRef.current = 1.0 // reheat when graph changes
  }, [data.nodes])

  // Force-directed simulation — uses cached nodeMapRef, cools via alphaRef
  const simulate = useCallback(() => {
    const nodes = nodesRef.current
    const edges = data.edges
    if (!nodes.length) return

    const alpha = alphaRef.current * 0.05
    const repulsion = 3000
    const attraction = 0.05
    const damping = 0.85
    const centerStrength = 0.002

    // Repulsion between all nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[j].x - nodes[i].x
        const dy = nodes[j].y - nodes[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 1
        const force = repulsion / (dist * dist)
        const fx = (dx / dist) * force * alpha
        const fy = (dy / dist) * force * alpha
        nodes[i].vx -= fx
        nodes[i].vy -= fy
        nodes[j].vx += fx
        nodes[j].vy += fy
      }
    }

    // Attraction along edges — use cached nodeMap, no rebuild
    const nodeMap = nodeMapRef.current
    for (const edge of edges) {
      const src = nodeMap.get(edge.source)
      const tgt = nodeMap.get(edge.target)
      if (!src || !tgt) continue
      const dx = tgt.x - src.x
      const dy = tgt.y - src.y
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const targetDist = 80
      const force = (dist - targetDist) * attraction
      const fx = (dx / dist) * force
      const fy = (dy / dist) * force
      src.vx += fx
      src.vy += fy
      tgt.vx -= fx
      tgt.vy -= fy
    }

    // Center gravity + apply velocity
    for (const node of nodes) {
      node.vx += -node.x * centerStrength
      node.vy += -node.y * centerStrength
      node.vx *= damping
      node.vy *= damping
      if (!dragging.current.node || dragging.current.node.id !== node.id) {
        node.x += node.vx
        node.y += node.vy
      }
    }

    // Cool down — reduce alpha so simulation slows and eventually stops
    alphaRef.current *= 0.99
  }, [data.edges])

  // Draw — uses cached nodeMapRef instead of rebuilding every frame
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width
    const H = canvas.height
    const { x: cx, y: cy, zoom } = camera.current
    const nodes = nodesRef.current
    const edges = data.edges

    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#0A0A0F'
    ctx.fillRect(0, 0, W, H)

    ctx.save()
    ctx.translate(W / 2 + cx, H / 2 + cy)
    ctx.scale(zoom, zoom)

    const nodeMap = nodeMapRef.current

    // Draw edges
    for (const edge of edges) {
      const src = nodeMap.get(edge.source)
      const tgt = nodeMap.get(edge.target)
      if (!src || !tgt) continue
      ctx.beginPath()
      ctx.moveTo(src.x, src.y)
      ctx.lineTo(tgt.x, tgt.y)
      ctx.strokeStyle = 'rgba(99,102,241,0.25)'
      ctx.lineWidth = 1 / zoom
      ctx.stroke()
    }

    // Draw nodes
    for (const node of nodes) {
      const isHovered = hoveredNode?.id === node.id
      const hasLinks = node.linkCount > 0

      // Glow for connected nodes
      if (hasLinks) {
        ctx.beginPath()
        ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(99,102,241,0.12)'
        ctx.fill()
      }

      // Node circle
      ctx.beginPath()
      ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
      ctx.fillStyle = isHovered ? '#6366F1' : (hasLinks ? '#4F46E5' : '#1C1C28')
      ctx.strokeStyle = isHovered ? '#A5B4FC' : '#6366F1'
      ctx.lineWidth = isHovered ? 2 / zoom : 1 / zoom
      ctx.fill()
      ctx.stroke()

      // Label (show at zoom >= 0.6, or if hovered)
      if (zoom >= 0.6 || isHovered) {
        ctx.fillStyle = isHovered ? '#F2F2F7' : '#9999B3'
        ctx.font = `${12 / zoom}px Inter, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(
          node.title.length > 20 ? node.title.slice(0, 18) + '…' : node.title,
          node.x,
          node.y + node.radius + 14 / zoom
        )
      }
    }

    ctx.restore()
  }, [data.edges, hoveredNode])

  // Animation loop — skips physics once alpha cools below threshold
  useEffect(() => {
    if (loading || !data.nodes.length) return

    const loop = () => {
      // Only run physics while hot (alpha > 0.005), always redraw for hover etc.
      if (alphaRef.current > 0.005) simulate()
      draw()
      animRef.current = requestAnimationFrame(loop)
    }
    animRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(animRef.current)
  }, [loading, data.nodes.length, simulate, draw])

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio
      canvas.height = canvas.offsetHeight * window.devicePixelRatio
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    }
    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  // Mouse interactions
  const getWorldPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const { x: cx, y: cy, zoom } = camera.current
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    return {
      x: (mx - canvas.offsetWidth / 2 - cx) / zoom,
      y: (my - canvas.offsetHeight / 2 - cy) / zoom,
    }
  }

  const hitTest = (wx: number, wy: number): GraphNode | null => {
    const nodes = nodesRef.current
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i]
      const dx = n.x - wx
      const dy = n.y - wy
      if (Math.sqrt(dx * dx + dy * dy) <= n.radius + 4) return n
    }
    return null
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getWorldPos(e)
    const node = hitTest(x, y)
    setHoveredNode(node)

    if (dragging.current.node) {
      dragging.current.node.x = x
      dragging.current.node.y = y
      dragging.current.node.vx = 0
      dragging.current.node.vy = 0
    } else if (dragging.current.panStart) {
      camera.current.x = e.clientX - dragging.current.panStart.x
      camera.current.y = e.clientY - dragging.current.panStart.y
    }
  }

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y } = getWorldPos(e)
    const node = hitTest(x, y)
    if (node) {
      dragging.current.node = node
      alphaRef.current = 0.3 // reheat so graph resettles after drag
    } else {
      dragging.current.panStart = {
        x: e.clientX - camera.current.x,
        y: e.clientY - camera.current.y,
      }
    }
  }

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (dragging.current.node && !dragging.current.panStart) {
      // Click (no significant movement) → navigate
      const node = dragging.current.node
      dragging.current.node = null
      router.push(`/notes/${node.id}`)
      return
    }
    dragging.current.node = null
    dragging.current.panStart = null
  }

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    camera.current.zoom = Math.max(0.2, Math.min(3, camera.current.zoom * factor))
  }

  const resetView = () => {
    camera.current = { x: 0, y: 0, zoom: 1 }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-[var(--color-accent-300)]" />
          <div>
            <h1 className="text-xl font-semibold text-[var(--color-text)]">Knowledge Graph</h1>
            <p className="text-sm text-[var(--color-text-secondary)]">
              {loading ? 'Loading…' : `${data.nodes.length} notes · ${data.edges.length} connections`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => { camera.current.zoom = Math.min(3, camera.current.zoom * 1.2) }}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { camera.current.zoom = Math.max(0.2, camera.current.zoom / 1.2) }}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={resetView}>
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--color-accent-300)]" />
              <p className="text-sm text-[var(--color-text-secondary)]">Building knowledge graph…</p>
            </motion.div>
          </div>
        ) : data.nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center">
              <GitBranch className="h-12 w-12 text-[var(--color-text-tertiary)] mx-auto mb-3" />
              <h3 className="text-[var(--color-text)] font-medium mb-1">No notes yet</h3>
              <p className="text-sm text-[var(--color-text-secondary)]">Create notes with [[wikilinks]] to see your knowledge graph.</p>
            </motion.div>
          </div>
        ) : (
          <>
            <canvas
              ref={canvasRef}
              className="w-full h-full"
              style={{ cursor: hoveredNode ? 'pointer' : 'grab' }}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={() => { dragging.current = { node: null, panStart: null }; setHoveredNode(null) }}
              onWheel={handleWheel}
            />
            {/* Tooltip */}
            {hoveredNode && (
              <div
                className="absolute pointer-events-none bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-2 text-sm shadow-xl"
                style={{ bottom: 24, left: '50%', transform: 'translateX(-50%)' }}
              >
                <span className="mr-1.5">{hoveredNode.icon}</span>
                <span className="text-[var(--color-text)] font-medium">{hoveredNode.title}</span>
                <span className="text-[var(--color-text-tertiary)] ml-2 text-xs">
                  {hoveredNode.linkCount} link{hoveredNode.linkCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
            {/* Legend */}
            <div className={cn(
              'absolute bottom-4 right-4 bg-[var(--color-bg-elevated)] border border-[var(--color-border)]',
              'rounded-lg px-3 py-2 text-xs text-[var(--color-text-secondary)] space-y-1'
            )}>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#4F46E5]" /> Connected note</div>
              <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#1C1C28] border border-[#6366F1]" /> Standalone note</div>
              <div className="text-[var(--color-text-tertiary)] mt-1">Scroll to zoom · Click to open · Drag to move</div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
