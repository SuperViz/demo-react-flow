import { v4 } from 'uuid'
import ReactFlow from '../components/ReactFlow/ReactFlow'
import { useSearchParams } from 'react-router-dom'

export default function Whiteboard() {
	// http://localhost:5173/?roomId=01&username=Vitor
	const [searchParams] = useSearchParams()
	const roomId = searchParams.get('roomId') || v4()
	const participantName = searchParams.get('username') || 'Vitor'

	return <ReactFlow roomId={roomId} participantName={participantName} />
}
