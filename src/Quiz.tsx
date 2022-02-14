import { Button, Container, styled, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import React, { useEffect } from 'react';
import { State } from './OBSComponent';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

export function Quiz(props: {
	state: Readonly<State>;
	addScore: (scores: number[], q: number) => Promise<void>;
	showScores: () => Promise<void>;
	selectQ: (q: number) => void;
}) {
	const { state } = props;
	const [scores, setScores] = React.useState(state.log[state.currentq - 1]?.points || new Array<number>(state.numTeams).fill(0));
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
			<Button
				variant="outlined"
				style={{ marginBottom: 20, height: 40 + 'px'}}
			>Question {q}
			</Button>
			{
				state.teams.map((team, i) => {
					return (
						<Container
							maxWidth="md"
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<TextField
								key={team}
								id="outlined"
								datatype="number"
								label={`${team} Score`}
								style={{ margin: 10 }}
								value={scores[i]}
								onChange={(v) => {
									const s = [...scores];
									s[i] = parseInt(v.target.value);
									setScores(s);
								}}
							/>
							<Button variant="outlined" onClick={() => {
									const s = [...scores];
									s[i] = props.state.fullpoints;
									setScores(s);
							}} style={{ marginRight: 10 }}>F</Button>
								<Button variant="outlined" onClick={() => {
									const s = [...scores];
									s[i] = props.state.fullpoints / 2;
									setScores(s);
							}}>H</Button>
						</Container>
					);
				})
			}
			<div>
				<LoadingButton
					variant="contained"
					style={{ margin: 20 }}
					onClick={() => props.addScore(scores, q)}
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
				{Array.from(Array(props.state.qs)).map((_, index) => {
					const qnum = index + 1;
					const team = props.state.log[index];
					const points = team?.points.reduce((acc, curr, i) => {
						acc.push(<div>{props.state.teams[i]} - {curr}</div>);
						return acc;
					}, [] as JSX.Element[]);
					const message = team ? (
						<React.Fragment>
							<div>Qs. {qnum}</div>
							{points}
						</React.Fragment>
					) : <div>{qnum}</div>;
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