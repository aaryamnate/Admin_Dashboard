'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { cn } from '@/lib/utils'
import { Dumbbell, Users, RefreshCw, ZoomIn, ZoomOut, Maximize2, X, Crosshair, Sparkles, UserCheck } from 'lucide-react'
import { useDeleteAllocation } from '@/hooks/use-allocations'
import { useToast } from '@/components/ui/toast'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

interface Node {
  id: string
  name: string
  email: string
  role: 'TRAINER' | 'CLIENT'
  avatarUrl: string | null
  specialization?: string | null
  status?: string
  // Dynamic coordinates
  x: number
  y: number
}

interface Link {
  id: string
  trainerId: string
  clientId: string
}

interface AllocationNetworkProps {
  allocations: any[]
  onSelectNode?: (node: any) => void
}

export function AllocationNetwork({ allocations, onSelectNode }: AllocationNetworkProps) {
  const { toast } = useToast()
  const deleteAllocationMutation = useDeleteAllocation()
  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // Container dimensions
  const [dimensions, setDimensions] = useState({ width: 800, height: 520 })
  const isMobile = dimensions.width < 640
  const isSmallMobile = dimensions.width < 420

  // Zoom / Pan states
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })

  // Pinch-to-zoom state for mobile
  const [pinchStartDist, setPinchStartDist] = useState<number | null>(null)
  const [initialPinchZoom, setInitialPinchZoom] = useState(1)

  // Node position & drag states
  const [nodes, setNodes] = useState<Node[]>([])
  const [links, setLinks] = useState<Link[]>([])
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)

  // Center coordinates
  const cx = dimensions.width > 0 ? dimensions.width / 2 : 400
  const cy = dimensions.height > 0 ? dimensions.height / 2 : 260

  // Track container dimensions with ResizeObserver
  useEffect(() => {
    const el = canvasContainerRef.current
    if (!el) return

    const updateSize = () => {
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setDimensions({
          width: Math.round(rect.width),
          height: Math.round(rect.height),
        })
      }
    }

    updateSize()

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        if (width > 0 && height > 0) {
          setDimensions({
            width: Math.round(width),
            height: Math.round(height),
          })
        }
      }
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Recenter and adapt viewport
  const resetViewport = useCallback(() => {
    setPan({ x: 0, y: 0 })
    // On small mobile, default zoom slightly zoomed out to fit nicely
    if (dimensions.width < 420) {
      setZoom(0.85)
    } else if (dimensions.width < 640) {
      setZoom(0.92)
    } else {
      setZoom(1)
    }
    setSelectedNode(null)
  }, [dimensions.width])

  // Reset viewport when screen mode changes between mobile and desktop
  useEffect(() => {
    if (dimensions.width > 0) {
      if (dimensions.width < 420) {
        setZoom(0.85)
      } else if (dimensions.width < 640) {
        setZoom(0.92)
      } else {
        setZoom(1)
      }
      setPan({ x: 0, y: 0 })
    }
  }, [dimensions.width < 640])

  // Layout algorithm: Circular / Orbital Topology centered dynamically
  useEffect(() => {
    if (!allocations || allocations.length === 0) {
      setNodes([])
      setLinks([])
      return
    }

    const tempNodes: Node[] = []
    const tempLinks: Link[] = []
    const trainerIds = new Set<string>()
    const clientIds = new Set<string>()

    // Identify unique trainers and clients
    allocations.forEach((alloc) => {
      const trainer = alloc.trainer
      const client = alloc.client

      if (trainer && !trainerIds.has(trainer.id)) {
        trainerIds.add(trainer.id)
        tempNodes.push({
          id: trainer.id,
          name: trainer.name,
          email: trainer.email,
          role: 'TRAINER',
          avatarUrl: trainer.avatarUrl,
          specialization: trainer.specialization,
          x: 0,
          y: 0,
        })
      }

      if (client && !clientIds.has(client.id)) {
        clientIds.add(client.id)
        tempNodes.push({
          id: client.id,
          name: client.name,
          email: client.email,
          role: 'CLIENT',
          avatarUrl: client.avatarUrl,
          status: client.status,
          x: 0,
          y: 0,
        })
      }

      if (trainer && client) {
        tempLinks.push({
          id: alloc.id,
          trainerId: trainer.id,
          clientId: client.id,
        })
      }
    })

    const trainers = tempNodes.filter((n) => n.role === 'TRAINER')
    const clients = tempNodes.filter((n) => n.role === 'CLIENT')
    const trainerCoordsMap = new Map<string, { x: number; y: number }>()

    const mobileMode = dimensions.width < 640
    const smallMobileMode = dimensions.width < 420

    // Position Trainers centered according to viewport
    if (mobileMode) {
      // Mobile positioning: centralized orbital hub
      if (trainers.length === 1) {
        trainers[0].x = cx
        trainers[0].y = cy - 10
        trainerCoordsMap.set(trainers[0].id, { x: trainers[0].x, y: trainers[0].y })
      } else if (trainers.length === 2) {
        const spread = smallMobileMode ? 65 : 85
        trainers[0].x = cx - spread
        trainers[0].y = cy - 15
        trainers[1].x = cx + spread
        trainers[1].y = cy - 15
        trainerCoordsMap.set(trainers[0].id, { x: trainers[0].x, y: trainers[0].y })
        trainerCoordsMap.set(trainers[1].id, { x: trainers[1].x, y: trainers[1].y })
      } else {
        // 3+ trainers: symmetrical circular constellation around center
        const hubRadius = smallMobileMode ? 65 : 85
        trainers.forEach((t, idx) => {
          const angle = (2 * Math.PI * idx) / trainers.length - Math.PI / 2
          const x = cx + Math.cos(angle) * hubRadius
          const y = cy + Math.sin(angle) * (hubRadius * 0.85) - 10
          t.x = x
          t.y = y
          trainerCoordsMap.set(t.id, { x, y })
        })
      }
    } else {
      // Desktop positioning: balanced horizontal spread
      const trainerSpacing = Math.min(dimensions.width * 0.28, 220)
      trainers.forEach((t, idx) => {
        const x = cx + (idx - (trainers.length - 1) / 2) * trainerSpacing
        const y = cy + (idx % 2 === 0 ? -30 : 30)
        t.x = x
        t.y = y
        trainerCoordsMap.set(t.id, { x, y })
      })
    }

    // Clients cluster around their assigned trainer
    clients.forEach((c) => {
      const allocation = tempLinks.find((l) => l.clientId === c.id)
      if (allocation) {
        const tCoords = trainerCoordsMap.get(allocation.trainerId)
        if (tCoords) {
          const trainerClients = tempLinks.filter((l) => l.trainerId === allocation.trainerId)
          const clientIndex = trainerClients.findIndex((l) => l.clientId === c.id)
          const totalTrainerClients = trainerClients.length || 1

          let angle: number
          let radius: number

          if (mobileMode) {
            // Smaller orbit radius on mobile to stay within bounds
            radius = smallMobileMode ? 48 : 62
            // Distribute clients around their trainer
            const tAngle = Math.atan2(tCoords.y - cy, tCoords.x - cx)
            // Bias client angles outward away from center
            const spreadAngle = (Math.PI * 1.5) / Math.max(totalTrainerClients, 1)
            angle = tAngle + (clientIndex - (totalTrainerClients - 1) / 2) * spreadAngle
          } else {
            radius = 110 // Full desktop orbit radius
            angle = (2 * Math.PI * clientIndex) / totalTrainerClients
          }

          c.x = tCoords.x + Math.cos(angle) * radius
          c.y = tCoords.y + Math.sin(angle) * radius
          return
        }
      }

      // Default fallback coordinates if unallocated
      c.x = Math.random() * (dimensions.width - 120) + 60
      c.y = Math.random() * (dimensions.height - 120) + 60
    })

    setNodes(tempNodes)
    setLinks(tempLinks)
  }, [allocations, dimensions.width, dimensions.height, cx, cy])

  // Coordinate helper: converts screen client coordinates to SVG graph coordinates
  const clientToSvgCoords = (clientX: number, clientY: number) => {
    if (!canvasContainerRef.current) return { x: 0, y: 0 }
    const rect = canvasContainerRef.current.getBoundingClientRect()
    // Relative to canvas
    const relX = clientX - rect.left
    const relY = clientY - rect.top
    // Reverse SVG transform: translate(cx + pan.x, cy + pan.y) scale(zoom) translate(-cx, -cy)
    const svgX = cx + (relX - (cx + pan.x)) / zoom
    const svgY = cy + (relY - (cy + pan.y)) / zoom
    return { x: svgX, y: svgY }
  }

  // --- Mouse Handlers ---
  const handleBgMouseDown = (e: React.MouseEvent) => {
    const target = e.target as SVGElement
    if (target.tagName === 'svg' || target.id === 'grid-bg') {
      setIsPanning(true)
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
    }
  }

  const handleBgMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      })
    } else if (draggingNodeId) {
      const { x: svgX, y: svgY } = clientToSvgCoords(e.clientX, e.clientY)
      setNodes((prev) =>
        prev.map((n) =>
          n.id === draggingNodeId
            ? { ...n, x: svgX - dragOffset.x, y: svgY - dragOffset.y }
            : n
        )
      )
    }
  }

  const handleBgMouseUp = () => {
    setIsPanning(false)
    setDraggingNodeId(null)
  }

  const handleNodeMouseDown = (e: React.MouseEvent, node: Node) => {
    e.stopPropagation()
    setDraggingNodeId(node.id)
    const { x: svgX, y: svgY } = clientToSvgCoords(e.clientX, e.clientY)
    setDragOffset({
      x: svgX - node.x,
      y: svgY - node.y,
    })
    setSelectedNode(node)
    if (onSelectNode) onSelectNode(node)
  }

  // --- Touch Handlers (Mobile Optimization) ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      // 1 touch: check if background panning
      const target = e.target as SVGElement
      if (target.tagName === 'svg' || target.id === 'grid-bg') {
        const touch = e.touches[0]
        setIsPanning(true)
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y })
      }
    } else if (e.touches.length === 2) {
      // 2 touches: start pinch zoom
      setIsPanning(false)
      setDraggingNodeId(null)
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      setPinchStartDist(dist)
      setInitialPinchZoom(zoom)
    }
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDist !== null) {
      // Pinch to zoom gesture
      const t1 = e.touches[0]
      const t2 = e.touches[1]
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
      const scaleFactor = dist / pinchStartDist
      const newZoom = Math.max(0.4, Math.min(2.5, initialPinchZoom * scaleFactor))
      setZoom(newZoom)
      return
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0]
      if (draggingNodeId) {
        const { x: svgX, y: svgY } = clientToSvgCoords(touch.clientX, touch.clientY)
        setNodes((prev) =>
          prev.map((n) =>
            n.id === draggingNodeId
              ? { ...n, x: svgX - dragOffset.x, y: svgY - dragOffset.y }
              : n
          )
        )
      } else if (isPanning) {
        setPan({
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        })
      }
    }
  }

  const handleTouchEnd = () => {
    setIsPanning(false)
    setDraggingNodeId(null)
    setPinchStartDist(null)
  }

  const handleNodeTouchStart = (e: React.TouchEvent, node: Node) => {
    e.stopPropagation()
    if (e.touches.length === 1) {
      const touch = e.touches[0]
      setDraggingNodeId(node.id)
      const { x: svgX, y: svgY } = clientToSvgCoords(touch.clientX, touch.clientY)
      setDragOffset({
        x: svgX - node.x,
        y: svgY - node.y,
      })
      setSelectedNode(node)
      if (onSelectNode) onSelectNode(node)
    }
  }

  // Zoom controls
  const zoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 2.5))
  const zoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.4))

  // Delete Allocation Link
  const handleDisconnect = (linkId: string) => {
    if (window.confirm('Disconnect this trainer-member coaching connection?')) {
      deleteAllocationMutation.mutate(linkId, {
        onSuccess: () => {
          toast({ title: 'Success', description: 'Coaching connection terminated', variant: 'success' })
          setSelectedNode(null)
        },
        onError: (err: any) => {
          toast({ title: 'Error', description: err.message || 'Failed to disconnect', variant: 'error' })
        },
      })
    }
  }

  // Adaptive node sizes
  const trainerRadius = isSmallMobile ? 18 : isMobile ? 20 : 24
  const clientRadius = isSmallMobile ? 13 : isMobile ? 15 : 18

  return (
    <div
      ref={canvasContainerRef}
      className="relative w-full h-[460px] sm:h-[540px] lg:h-[580px] rounded-2xl border border-border/40 bg-card/25 backdrop-blur-md overflow-hidden shadow-2xl touch-none select-none"
    >
      {/* Node linking animation CSS style */}
      <style>{`
        @keyframes pulseLink {
          to { stroke-dashoffset: -20; }
        }
        .network-link-active {
          animation: pulseLink 1.2s linear infinite;
        }
      `}</style>

      {/* SVG Canvas Workspace */}
      <svg
        className="w-full h-full cursor-grab active:cursor-grabbing select-none touch-none"
        onMouseDown={handleBgMouseDown}
        onMouseMove={handleBgMouseMove}
        onMouseUp={handleBgMouseUp}
        onMouseLeave={handleBgMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <defs>
          {/* Subtle grid background pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--grid-line, rgba(255,255,255,0.04))" strokeWidth="1" />
          </pattern>
          {/* Circular crop mask for trainer avatars */}
          <clipPath id="avatar-clip-trainer">
            <circle cx="0" cy="0" r={trainerRadius} />
          </clipPath>
          {/* Circular crop mask for client avatars */}
          <clipPath id="avatar-clip-client">
            <circle cx="0" cy="0" r={clientRadius} />
          </clipPath>
        </defs>

        {/* Grid Background Layer */}
        <rect id="grid-bg" width="100%" height="100%" fill="url(#grid)" />

        {/* Center-anchored Zoomed/Panned Group Layer */}
        <g
          transform={`translate(${cx + pan.x}, ${cy + pan.y}) scale(${zoom}) translate(${-cx}, ${-cy})`}
        >
          {/* Network Link Vector Lines */}
          {links.map((link) => {
            const trainer = nodes.find((n) => n.id === link.trainerId)
            const client = nodes.find((n) => n.id === link.clientId)

            if (!trainer || !client) return null

            // Draw a curved SVG quadratic path linking trainer to client
            const midX = (trainer.x + client.x) / 2
            const midY = (trainer.y + client.y) / 2 - (isMobile ? 12 : 22)
            const pathData = `M ${trainer.x} ${trainer.y} Q ${midX} ${midY} ${client.x} ${client.y}`
            const isSelected = selectedNode?.id === trainer.id || selectedNode?.id === client.id

            return (
              <g key={link.id} className="group">
                {/* Thick invisible click/touch target line */}
                <path
                  d={pathData}
                  stroke="transparent"
                  strokeWidth={isMobile ? '24' : '18'}
                  fill="none"
                  className="cursor-pointer"
                  onClick={() => handleDisconnect(link.id)}
                />
                {/* Glowing glow-shadow path line */}
                <path
                  d={pathData}
                  stroke={isSelected ? 'var(--color-primary, #6366f1)' : 'rgba(99, 102, 241, 0.25)'}
                  strokeWidth={isSelected ? '3' : isMobile ? '1.8' : '1.5'}
                  fill="none"
                  className={cn(
                    'transition-all duration-300 pointer-events-none',
                    isSelected && 'network-link-active'
                  )}
                  strokeDasharray={isSelected ? '6 4' : undefined}
                />
              </g>
            )
          })}

          {/* Node SVG Groups */}
          {nodes.map((node) => {
            const isTrainer = node.role === 'TRAINER'
            const nodeSize = isTrainer ? trainerRadius : clientRadius
            const isSelected = selectedNode?.id === node.id

            // Label box dimensions
            const labelWidth = isTrainer ? (isSmallMobile ? 80 : 96) : (isSmallMobile ? 68 : 82)
            const labelHeight = isSmallMobile ? 20 : 24

            return (
              <g
                key={node.id}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer group"
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onTouchStart={(e) => handleNodeTouchStart(e, node)}
              >
                {/* Glowing radial outer shadow circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={nodeSize + (isTrainer ? 5 : 3.5)}
                  fill="none"
                  stroke={
                    isTrainer
                      ? 'var(--color-primary, #6366f1)'
                      : node.status === 'ACTIVE'
                      ? 'var(--color-accent, #06b6d4)'
                      : 'rgba(156, 163, 175, 0.5)'
                  }
                  strokeWidth={isSelected ? '3' : '2'}
                  className={cn(
                    'transition-all duration-300',
                    isSelected ? 'opacity-100 scale-110' : 'opacity-70 group-hover:opacity-100'
                  )}
                />

                {/* Translucent background circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={nodeSize}
                  fill="var(--color-card, #0f172a)"
                  className="transition-transform group-hover:scale-105"
                />

                {/* Avatar Image clip */}
                {node.avatarUrl ? (
                  <image
                    href={node.avatarUrl}
                    x={-nodeSize}
                    y={-nodeSize}
                    width={nodeSize * 2}
                    height={nodeSize * 2}
                    clipPath={isTrainer ? 'url(#avatar-clip-trainer)' : 'url(#avatar-clip-client)'}
                    preserveAspectRatio="xMidYMid slice"
                  />
                ) : (
                  // Fallback letter icon
                  <g className="pointer-events-none">
                    <circle
                      cx="0"
                      cy="0"
                      r={nodeSize}
                      fill={isTrainer ? 'rgba(99, 102, 241, 0.25)' : 'rgba(6, 182, 212, 0.2)'}
                    />
                    <text
                      textAnchor="middle"
                      dy={isTrainer ? '4' : '3.5'}
                      className={cn(
                        'font-bold select-none fill-foreground',
                        isTrainer ? 'text-xs sm:text-sm' : 'text-[10px] sm:text-xs'
                      )}
                    >
                      {node.name.slice(0, 1)}
                    </text>
                  </g>
                )}

                {/* Node Name Label Backdrop */}
                <rect
                  x={-labelWidth / 2}
                  y={nodeSize + 4}
                  width={labelWidth}
                  height={labelHeight}
                  fill="rgba(15, 23, 42, 0.85)"
                  rx="5"
                  className="backdrop-blur-sm stroke-border/30 stroke"
                />

                {/* Node Name Text */}
                <text
                  y={nodeSize + 14}
                  textAnchor="middle"
                  className="text-[9px] sm:text-[10px] font-semibold fill-foreground select-none pointer-events-none"
                >
                  {node.name.length > (isSmallMobile ? 10 : 13)
                    ? `${node.name.slice(0, isSmallMobile ? 9 : 12)}…`
                    : node.name}
                </text>
                <text
                  y={nodeSize + (isSmallMobile ? 21 : 23)}
                  textAnchor="middle"
                  className="text-[7px] sm:text-[8px] fill-muted-foreground select-none pointer-events-none capitalize"
                >
                  {isTrainer ? (node.specialization || 'Trainer') : 'Client'}
                </text>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Floating Canvas Controls Overlay (Bottom-Left) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 p-1 bg-card/80 border border-border/50 backdrop-blur-md rounded-xl shadow-lg z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg hover:bg-primary/20 text-foreground"
          onClick={zoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg hover:bg-primary/20 text-foreground"
          onClick={zoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 sm:h-8 sm:w-8 rounded-lg hover:bg-primary/20 text-foreground"
          onClick={resetViewport}
          title="Recenter View"
        >
          <Crosshair className="h-4 w-4" />
        </Button>
      </div>

      {/* Floating Mobile/Touch Interaction Hint Badge (Top-Right) */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-card/75 border border-border/40 backdrop-blur-md rounded-full text-[9px] sm:text-[10px] text-muted-foreground pointer-events-none shadow-md">
        <Sparkles className="h-3 w-3 text-primary animate-pulse" />
        <span className="hidden sm:inline">Drag nodes • Click paths to disconnect</span>
        <span className="sm:hidden">Touch to drag • Pinch zoom</span>
      </div>

      {/* Active Node Info Detail Panel overlay */}
      {selectedNode && (
        <div
          className={cn(
            'absolute z-20 p-3 sm:p-4 rounded-xl border border-border/60 bg-[#070b19]/95 backdrop-blur-xl shadow-2xl animate-fade-in transition-all',
            // Mobile: anchored to bottom above the toolbar, full-width with margins
            'bottom-14 left-3 right-3 sm:bottom-auto sm:left-3 sm:top-3 sm:right-auto sm:w-68'
          )}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                {selectedNode.role === 'TRAINER' ? 'Personal Coach' : 'Gym Member'}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-muted/50 rounded-full"
              onClick={() => setSelectedNode(null)}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </div>

          <div className="flex items-center gap-2.5 mb-2">
            <Avatar fallback={selectedNode.name} size="sm" src={selectedNode.avatarUrl} />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-foreground truncate">{selectedNode.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{selectedNode.email}</p>
            </div>
          </div>

          <div className="space-y-1 text-[10px] text-muted-foreground pt-2 border-t border-border/40">
            {selectedNode.role === 'TRAINER' ? (
              <div className="flex justify-between">
                <span>Specialization:</span>
                <span className="font-semibold text-primary">{selectedNode.specialization || 'Fitness & Conditioning'}</span>
              </div>
            ) : (
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={cn(
                    'font-semibold',
                    selectedNode.status === 'ACTIVE' ? 'text-emerald-400' : 'text-rose-400'
                  )}
                >
                  {selectedNode.status || 'Active'}
                </span>
              </div>
            )}
            <p className="text-[8px] text-muted-foreground/70 italic pt-1">
              Tip: Click or tap any curved connection line to disconnect pairing.
            </p>
          </div>
        </div>
      )}

      {/* Empty State Overlay */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 p-6 bg-[#030712]/50">
          <Dumbbell className="h-10 w-10 text-muted-foreground/40 animate-bounce" />
          <p className="text-sm text-muted-foreground">No coaching connection network records found</p>
        </div>
      )}
    </div>
  )
}
