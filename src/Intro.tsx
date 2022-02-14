import { Container, TextField, Button } from '@mui/material';
import React from 'react';
import { logToScores, State } from './OBSComponent';

export function Intro(props: {
	state: Readonly<State>;
	updateOBS: (teams: string[], scores: number[], fullpoints: number, qm: string, theme: string, qs: number) => Promise<void>;
	showQuiz: () => Promise<void>;
}) {
	const [teams, setTeams] = React.useState(props.state.teams);
	const [fullpoints, setFullpoints] = React.useState(props.state.fullpoints);
	const [numTeams, setNumTeams] = React.useState(props.state.numTeams);
	const [qm, setQm] = React.useState(props.state.qm);
	const [theme, setTheme] = React.useState(props.state.theme);
	const [qs, setQs] = React.useState(props.state.qs);
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
				label="Num Teams"
				style={{ margin: 10 }}
				value={numTeams}
				onChange={(v) => {
					const num = parseInt(v.target.value) || 0;
					setNumTeams(!isNaN(num) ? num : 0);
				}}
			/>
			{
				new Array(numTeams).fill(0).map((_, i) => {
					return (
						<TextField
							required
							key={ i }
							id="outlined-required"
							label={`Team Name ${i + 1}`}
							style={{ margin: 10 }}
							value={teams[i]}
							onChange={(v) => {
								teams[i] = v.target.value;
								setTeams(teams)
							}} />
					);
				})
			}
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
					onClick={() => props.updateOBS(teams, logToScores(props.state), fullpoints, qm, theme, qs)}
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
