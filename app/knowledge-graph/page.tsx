'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, MapPin, Activity, Building, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import * as d3 from 'd3'

interface Node {
  id: string
  label: string
  name?: string
  type?: string
  city?: string
}

interface Edge {
  source: string
  target: string
  relationship: string
  context?: string
  description?: string
  schedule?: string
}

interface KnowledgeGraphData {
  nodes: Node[]
  edges: Edge[]
  insights: string[]
}

interface D3Node extends Node {
  x?: number
  y?: number
  fx?: number
  fy?: number
  vx?: number
  vy?: number
  index?: number
}

interface D3Edge extends Edge {
  source: D3Node
  target: D3Node
}

export default function KnowledgeGraphPage() {
  const router = useRouter()
  const svgRef = useRef<SVGSVGElement>(null)
  const [graphData, setGraphData] = useState<KnowledgeGraphData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedNode, setSelectedNode] = useState<D3Node | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchKnowledgeGraph = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8000/knowledge-graph')
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`)
        }
        
        const data = await response.json()
        setGraphData(data)
      } catch (err) {
        console.error('Error fetching knowledge graph:', err)
        setError(err instanceof Error ? err.message : 'Failed to load knowledge graph')
      } finally {
        setLoading(false)
      }
    }

    fetchKnowledgeGraph()
  }, [])

  useEffect(() => {
    if (!graphData || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 800
    const height = 600
    
    svg.attr('viewBox', `0 0 ${width} ${height}`)

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })

    svg.call(zoom)

    const g = svg.append('g')

    // Create arrow markers for directed edges
    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 20)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#94a3b8')

    // Color mapping for node types
    const getNodeColor = (node: D3Node) => {
      switch (node.label.toLowerCase()) {
        case 'person': return '#3b82f6'
        case 'place': return '#10b981'
        case 'activity': return '#8b5cf6'
        case 'business': return '#f97316'
        default: return '#6b7280'
      }
    }

    // Prepare data for D3
    const nodes: D3Node[] = graphData.nodes.map(d => ({ ...d }))
    const edges: D3Edge[] = graphData.edges.map(d => ({
      ...d,
      source: nodes.find(n => n.id === d.source)!,
      target: nodes.find(n => n.id === d.target)!
    }))

    // Create force simulation
    const simulation = d3.forceSimulation<D3Node>(nodes)
      .force('link', d3.forceLink<D3Node, D3Edge>(edges)
        .id(d => d.id)
        .distance(100)
        .strength(0.5))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30))

    // Create links
    const link = g.append('g')
      .selectAll('line')
      .data(edges)
      .enter().append('line')
      .attr('stroke', '#64748b')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2)
      .attr('marker-end', 'url(#arrowhead)')

    // Create link labels
    const linkLabels = g.append('g')
      .selectAll('text')
      .data(edges)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px')
      .attr('fill', '#94a3b8')
      .attr('font-family', 'system-ui, sans-serif')
      .text(d => d.relationship)

    // Create nodes
    const node = g.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter().append('circle')
      .attr('r', 20)
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .call(d3.drag<SVGCircleElement, D3Node>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        setSelectedNode(d)
        setShowDetails(true)
      })
      .on('mouseover', function(event, d) {
        d3.select(this).attr('r', 25)
      })
      .on('mouseout', function(event, d) {
        d3.select(this).attr('r', 20)
      })

    // Create node labels
    const nodeLabels = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 35)
      .attr('font-size', '12px')
      .attr('fill', 'white')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('font-weight', '500')
      .style('pointer-events', 'none')
      .text(d => d.name || d.id)

    // Create node type icons (simplified text representation)
    const nodeIcons = g.append('g')
      .selectAll('text')
      .data(nodes)
      .enter().append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', 5)
      .attr('font-size', '14px')
      .attr('fill', 'white')
      .attr('font-family', 'system-ui, sans-serif')
      .style('pointer-events', 'none')
      .text(d => {
        switch (d.label.toLowerCase()) {
          case 'person': return '👤'
          case 'place': return '📍'
          case 'activity': return '⚡'
          case 'business': return '🏢'
          default: return '●'
        }
      })

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
    }

    function dragged(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGCircleElement, D3Node, D3Node>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // Update positions on tick
    simulation.on('tick', () => {
      link
        .attr('x1', d => d.source.x!)
        .attr('y1', d => d.source.y!)
        .attr('x2', d => d.target.x!)
        .attr('y2', d => d.target.y!)

      linkLabels
        .attr('x', d => ((d.source.x! + d.target.x!) / 2))
        .attr('y', d => ((d.source.y! + d.target.y!) / 2))

      node
        .attr('cx', d => d.x!)
        .attr('cy', d => d.y!)

      nodeLabels
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)

      nodeIcons
        .attr('x', d => d.x!)
        .attr('y', d => d.y!)
    })

    // Add zoom controls
    const zoomIn = () => {
      svg.transition().call(zoom.scaleBy, 1.5)
    }

    const zoomOut = () => {
      svg.transition().call(zoom.scaleBy, 1 / 1.5)
    }

    const resetZoom = () => {
      svg.transition().call(zoom.transform, d3.zoomIdentity)
    }

    // Store zoom functions for button handlers
    ;(svg.node() as any).zoomIn = zoomIn
    ;(svg.node() as any).zoomOut = zoomOut
    ;(svg.node() as any).resetZoom = resetZoom

    return () => {
      simulation.stop()
    }
  }, [graphData])

  const getNodeIcon = (node: Node) => {
    switch (node.label.toLowerCase()) {
      case 'person': return Users
      case 'place': return MapPin
      case 'activity': return Activity
      case 'business': return Building
      default: return Activity
    }
  }

  const handleZoomIn = () => {
    if (svgRef.current) {
      ;(svgRef.current as any).zoomIn?.()
    }
  }

  const handleZoomOut = () => {
    if (svgRef.current) {
      ;(svgRef.current as any).zoomOut?.()
    }
  }

  const handleResetZoom = () => {
    if (svgRef.current) {
      ;(svgRef.current as any).resetZoom?.()
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-[color:var(--gumo-yellow)] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading knowledge graph...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[color:var(--gumo-bg)] flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🕸️</div>
          <h1 className="text-2xl font-bold text-white mb-2">Connection Failed</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-[color:var(--gumo-yellow)] text-black hover:brightness-110 mr-4"
          >
            Retry
          </Button>
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="text-white border-white/20"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  if (!graphData) {
    return null
  }

  return (
    <div className="min-h-screen bg-[color:var(--gumo-bg)] p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Knowledge Graph</h1>
            <p className="text-white/70">Your personal activity and preference network</p>
          </div>
          <Button
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="text-white border-white/20"
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Graph Visualization */}
          <div className="lg:col-span-2">
            <Card className="bg-[color:var(--gumo-surface)] border-white/10 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Interactive Graph</h2>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomIn}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleZoomOut}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleResetZoom}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="bg-[color:var(--gumo-bg)] rounded-lg p-2">
                <svg
                  ref={svgRef}
                  className="w-full h-[600px] border border-white/10 rounded"
                />
              </div>

              <div className="mt-4 text-sm text-white/70">
                <p>💡 <strong>Tip:</strong> Click and drag nodes to rearrange the graph. Click on nodes to see details. Use mouse wheel or zoom controls to zoom in/out.</p>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                  <span className="text-white/70 text-sm">Person</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-green-500"></div>
                  <span className="text-white/70 text-sm">Place</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-purple-500"></div>
                  <span className="text-white/70 text-sm">Activity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-orange-500"></div>
                  <span className="text-white/70 text-sm">Business</span>
                </div>
              </div>
            </Card>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-[color:var(--gumo-surface)] border border-white/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[color:var(--gumo-yellow)]">
                  {graphData.nodes.length}
                </div>
                <div className="text-white/70 text-sm">Entities</div>
              </div>
              <div className="bg-[color:var(--gumo-surface)] border border-white/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[color:var(--gumo-yellow)]">
                  {graphData.edges.length}
                </div>
                <div className="text-white/70 text-sm">Relationships</div>
              </div>
              <div className="bg-[color:var(--gumo-surface)] border border-white/10 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-[color:var(--gumo-yellow)]">
                  {graphData.insights.length}
                </div>
                <div className="text-white/70 text-sm">Insights</div>
              </div>
            </div>
          </div>

          {/* Side Panel */}
          {showDetails && (
            <div className="space-y-6">
              {/* Selected Node Details */}
              {selectedNode && (
                <Card className="bg-[color:var(--gumo-surface)] border-white/10 p-4">
                  <h3 className="text-lg font-semibold text-white mb-3">Selected Node</h3>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {React.createElement(getNodeIcon(selectedNode), { className: "w-4 h-4 text-white" })}
                      <span className="font-medium text-white">{selectedNode.name || selectedNode.id}</span>
                    </div>
                    <div className="text-sm text-white/70">
                      <div>Type: {selectedNode.label}</div>
                      {selectedNode.type && <div>Category: {selectedNode.type}</div>}
                      {selectedNode.city && <div>Location: {selectedNode.city}</div>}
                    </div>
                  </div>
                </Card>
              )}

              {/* AI Insights */}
              <Card className="bg-[color:var(--gumo-surface)] border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">AI Insights</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {graphData.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-3 bg-green-500/10 rounded-lg border border-green-500/20"
                    >
                      <div className="flex items-start gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        <p className="text-green-200 text-sm leading-relaxed">{insight}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Recent Relationships */}
              <Card className="bg-[color:var(--gumo-surface)] border-white/10 p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Key Relationships</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {graphData.edges.slice(0, 5).map((edge, index) => {
                    const sourceNode = graphData.nodes.find(n => n.id === edge.source)
                    const targetNode = graphData.nodes.find(n => n.id === edge.target)
                    
                    return (
                      <div
                        key={index}
                        className="p-2 bg-white/5 rounded border border-white/10"
                      >
                        <div className="text-xs text-white/90">
                          <strong>{sourceNode?.name || edge.source}</strong>
                          <span className="mx-1 text-[color:var(--gumo-yellow)]">→</span>
                          <strong>{targetNode?.name || edge.target}</strong>
                        </div>
                        <div className="text-xs text-white/60 mt-1">{edge.relationship}</div>
                      </div>
                    )
                  })}
                </div>
              </Card>
            </div>
          )}
        </div>

        {/* Bottom padding for mobile navigation */}
        <div className="h-20" />
      </div>
    </div>
  )
}