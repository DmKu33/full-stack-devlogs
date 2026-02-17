import { useState } from 'preact/hooks';

export default function LikeButton() {
	const [likes, setLikes] = useState(0);

	return (
		<button
			onClick={() => setLikes(likes + 1)}
			style={{
				padding: '0.5em 1em',
				background: '#333',
				color: 'white',
				border: '1px solid #666',
				borderRadius: '4px',
				cursor: 'pointer',
				fontSize: '1em'
			}}
		>
			👍 {likes} {likes === 1 ? 'like' : 'likes'}
		</button>
	);
}
