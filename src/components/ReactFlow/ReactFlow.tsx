import ReactFlow, { Background, BackgroundVariant, Controls, MiniMap, addEdge, useNodesState, useEdgesState } from 'reactflow'
import { useCallback, useEffect, useState } from 'react'
import SuperVizRoom from '@superviz/sdk'
import { LauncherFacade } from '@superviz/sdk/lib/index'
import { WhoIsOnline, HTMLPin, Comments, Realtime } from '@superviz/sdk/lib/components'
import { initialEdges, initialNodes } from '../../database/initialData'

export default function ReactFlowComponent({ roomId, participantName }: { roomId: string; participantName: string }) {
	const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
	const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
	const [room, setRoom] = useState<LauncherFacade>()
	const [realtime] = useState(new Realtime())

	const handlePositionChange = (updatedNodes: any) => {
		if (updatedNodes[0].participantId != participantName.toLocaleLowerCase()) setNodes(updatedNodes[0].data)
	}

	const handleNodeAdd = (updatedNodes: any) => {
		console.log('handleNodeAdd', updatedNodes[0])
		if (updatedNodes[0].participantId != participantName.toLocaleLowerCase()) nodes.push(updatedNodes[0].data)
	}

	const initSuperViz = async () => {
		const DEVELOPER_KEY = import.meta.env.VITE_DEVELOPER_KEY

		const roomInit = await SuperVizRoom(DEVELOPER_KEY, {
			roomId: roomId,
			participant: {
				name: participantName,
				id: participantName.toLowerCase(),
			},
			group: {
				name: 'Whiteboard',
				id: 'whiteboard',
			},
			environment: 'dev',
		})

		const whoIsOnline = new WhoIsOnline('whoisonline')
		roomInit.addComponent(whoIsOnline)

		const htmlPin = new HTMLPin('reactflow', {
			dataAttributeName: 'data-id',
		})
		const comments = new Comments(htmlPin, {
			position: 'right',
			buttonLocation: 'top-right',
			styles: `
				.container { top: 45px; }
				.comments__floating-button { top: 5px !important }
			`,
		})
		roomInit.addComponent(comments)

		realtime.subscribe('node.change', handlePositionChange)
		realtime.subscribe('node.add', handleNodeAdd)

		roomInit.addComponent(realtime as any)

		setRoom(roomInit)
	}

	const onConnect = useCallback(
		(params: any) => {
			setEdges((eds) => addEdge(params, eds))
		},
		[setEdges]
	)

	const handleNodeDragStop = (_event: any, draggedNode: any) => {
		const updatedNodes = nodes.map((node) => {
			if (node.id === draggedNode.id) {
				return {
					...node,
					position: {
						x: draggedNode.position.x,
						y: draggedNode.position.y,
					},
				}
			}
			return node
		})

		setNodes(updatedNodes)
		realtime.publish('node.change', updatedNodes)
	}

	const onAddNode = () => {
		const newNode = {
			id: (nodes.length + 1).toString(),
			data: { label: `Node ${nodes.length + 1}` },
			position: { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight },
		}

		setNodes((els) => els.concat(newNode))

		realtime.publish('node.add', newNode)
		console.log('node.add', newNode)
	}

	useEffect(() => {
		if (!room) initSuperViz()
	}, [])

	return (
		<main>
			<header>
				<button onClick={onAddNode}>Add Node</button>
				<div id='whoisonline'></div>
			</header>
			<div id='reactflow'>
				<ReactFlow nodes={nodes} edges={edges} onNodeDragStop={handleNodeDragStop} onConnect={onConnect} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}>
					<Controls />
					<MiniMap />
					<Background variant={BackgroundVariant.Cross} color='#f00' />
				</ReactFlow>
			</div>
		</main>
	)
}
