import { Button, Container, styled, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { useEffect } from 'react';
import { State } from './OBSComponent';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import React from 'react';
export function Quiz(props: {
	state: Readonly<State>;
	addScore: (scores: number[], q: number) => Promise<void>;
	showScores: () => Promise<void>;
	selectQ: (q: number) => void;
}) {
	const { state } = props;
	const [scores, setScores] = React.useState(state.log[state.currentq - 1]?.points || new Array<number>(state.numTeams).fill(0));
	const [q, setQ] = React.useState(state.currentq);
	const tableRef = React.useRef<any>();
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
							key={team}
							maxWidth="md"
							style={{
								display: 'flex',
								flexDirection: 'row',
								alignItems: 'center',
								justifyContent: 'center',
							}}
						>
							<TextField
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
					onClick={() => {
						setScores(new Array<number>(state.numTeams).fill(0));
						props.addScore(scores, q);
						tableRef.current.scrollTop = tableRef.current.scrollHeight + 100;
					}}
				>
					Add Score
				</LoadingButton>
			</div>
			<ResponsiveTable state={state} selectQ={props.selectQ} tableRef={tableRef} />
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
const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
	},
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));

export function ResponsiveTable(props: { state: State, selectQ: (q: number) => void, tableRef: React.RefObject<any> }) {
	const rows = props.state.log;
	return (
		<TableContainer component={Paper} style={{ width: '90%', marginBottom: 30, marginTop: 20, height: 215, overflow: 'scroll' }} ref={props.tableRef}>
			<Table sx={{ width: '100%' }} aria-label="customized table">
				<TableHead>
					<TableRow>
						<StyledTableCell>Question</StyledTableCell>
						{
							props.state.teams.map((team, i) => {
								return (
									<StyledTableCell key={team} align="center">{team}</StyledTableCell>
								)
							})
						}
					</TableRow>
				</TableHead>
				<TableBody>
					{rows.map((row) => (
						<StyledTableRow key={row.q}>
							<StyledTableCell component="th" scope="row">
								{row.q}
							</StyledTableCell>
							{
								row.points.map((point, i) => {
									return (
										<StyledTableCell key={i} align="center">{point}</StyledTableCell>
									)
								})
							}
						</StyledTableRow>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
export function ResponsiveGrid(props: { state: State, selectQ: (q: number) => void}) {
  return (
    <Box sx={{ flexGrow: 1 }} style={{ margin: 20 }}>
      <Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }}>
				{Array.from(Array(props.state.qs)).map((_, index) => {
					const qnum = index + 1;
					const team = props.state.log[index];
					const points = team?.points.reduce((acc, curr, i) => {
						acc.push(<div key={curr}>{props.state.teams[i]} - {curr}</div>);
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