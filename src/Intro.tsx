import { Container, TextField, Button } from '@mui/material';
import React from 'react';
import { State } from './OBSComponent';

export function Intro(props: {
	state: Readonly<State>;
	updateOBS: (teams: {
		teamA: string,
		teamB: string,
		fullpoints: number,
	}, qm: string, theme: string, qs: number) => Promise<void>;
	showQuiz: () => Promise<void>;
}) {
	const [teamA, setTeamA] = React.useState('Team A');
	const [teamB, setTeamB] = React.useState('Team B');
	const [fullpoints, setFullpoints] = React.useState(10);
	const [qm, setQm] = React.useState('Nemo');
	const [theme, setTheme] = React.useState('General');
	const [qs, setQs] = React.useState(50);
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
			<TextField
				required
				id="outlined-required"
				label="Quiz Master"
				style={{ margin: 10 }}
				value={qm}
				onChange={(v) => setQm(v.target.value)} />
			<TextField
				required
				id="outlined-required"
				label="Theme"
				style={{ margin: 10 }}
				value={theme}
				onChange={(v) => setTheme(v.target.value)} />
			<TextField
				required
				id="outlined-required"
				label="Team Name"
				style={{ margin: 10 }}
				value={teamA}
				onChange={(v) => setTeamA(v.target.value)} />
			<TextField
				required
				id="outlined"
				label="Team Name"
				style={{ margin: 10 }}
				value={teamB}
				onChange={(v) => setTeamB((v.target.value))} />
			<TextField
				required
				id="outlined"
				label="Points for direct"
				style={{ margin: 10 }}
				value={fullpoints}
				datatype="number"
				onChange={(v) => setFullpoints(parseInt(v.target.value))} />
			<TextField
				required
				id="outlined"
				datatype="number"
				label="Num of questions"
				style={{ margin: 10 }}
				value={qs}
				onChange={(v) => setQs(parseInt(v.target.value))} />
			<div>
			<Button
				variant="contained"
				style={{ margin: 20 }}
				onClick={() => props.updateOBS( { teamA, teamB, fullpoints, }, qm, theme, qs )}
			>
				Update OBS
			</Button>
			<Button
				variant="contained"
				style={{ margin: 20 }}
				onClick={() => props.showQuiz()}
			>
				Start Quiz
			</Button>
			</div>
		</Container>
	);
}
