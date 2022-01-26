import { Button, Container, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react';
import { State } from './OBSComponent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

export function Quiz(props: {
	state: Readonly<State>;
	addScore: (teamA: number, teamB: number, q: number) => Promise<void>;
	showScores: () => Promise<void>;
}) {
	const { state } = props;
	const [team, setTeam] = React.useState(state.teamA);
	const [score, setScore] = React.useState(state.fullpoints);
	const [q, setQ] = React.useState(1);
	return (
		<Container
			maxWidth="md"
			style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<ToggleButtonGroup
				color="primary"
				value={team}
				exclusive
				onChange={(e, a) => setTeam(a)}
				style={{ margin: 10 }}
			>
				<ToggleButton value={state.teamA}>{state.teamA}</ToggleButton>
				<ToggleButton value={state.teamB}>{state.teamB}</ToggleButton>
			</ToggleButtonGroup>
			<TextField
				id="outlined"
				datatype="number"
				label="Score"
				style={{ margin: 10 }}
				value={score}
				onChange={(v) => setScore(parseInt(v.target.value))} />
			<TextField
				id="outlined"
				datatype="number"
				label="Question Number"
				style={{ margin: 10 }}
				value={q}
				onChange={(v) => setQ(parseInt(v.target.value))} />
			<div>
				<LoadingButton
					variant="contained"
					style={{ margin: 20 }}
					onClick={() => props.addScore(team === state.teamA ? score : 0, team === state.teamB ? score : 0, q)}
				>
					Add Score
				</LoadingButton>
				<Button
					variant="contained"
					style={{ margin: 20 }}
					onClick={() => props.showScores()}
				>
					End Quiz
				</Button>
			</div>
		</Container>
	);
}
