import { Button, Container, styled, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useEffect } from 'react';
import { State } from './OBSComponent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export function Quiz(props: {
	state: Readonly<State>;
	addScore: (teamA: number, teamB: number, q: number) => Promise<void>;
	showScores: () => Promise<void>;
	selectQ: (q: number) => void;
}) {
	const { state } = props;
	const [team, setTeam] = React.useState(state.teamA);
	const [score, setScore] = React.useState(state.log[state.currentq - 1]?.points ?? state.fullpoints);
	const [q, setQ] = React.useState(state.currentq);
	useEffect(() => {
		setQ(state.currentq);
	}, [state])
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
			</div>
			<ResponsiveGrid state={state} selectQ={props.selectQ} />
			<Button
					variant="contained"
					style={{ margin: 20 }}
					onClick={() => props.showScores()}
				>
					End Quiz
				</Button>
		</Container>
	);
}

const Item = styled(Paper)(({ theme }) => ({
  ...theme.typography.body2,
  padding: theme.spacing(2),
  textAlign: 'center',
	color: theme.palette.text.secondary,
}));

export function ResponsiveGrid(props: { state: State, selectQ: (q: number) => void}) {
  return (
    <Box sx={{ flexGrow: 1 }} style={{ margin: 20 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
				{Array.from(Array(50)).map((_, index) => {
					const qnum = index + 1;
					const team = props.state.log[index]?.team ?? '';
					const message = team ? `${qnum} (${team})` : `${qnum}`
					const filled = Boolean(props.state.log[index])
					return (
						<Grid item sm={2} md={2} key={index}>
							<Item
								style={{
									background: filled ? 'limegreen' : undefined,
									color: filled ? 'black' : 'white',
									fontSize: 15,
									//cursor: 'pointer'
								}}
								//onClick={() => props.selectQ(index + 1)}
							>{message}
							</Item>
						</Grid>
					)
				})}
      </Grid>
    </Box>
  );
}