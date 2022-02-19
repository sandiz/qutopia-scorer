import { Button, Container, styled, TextField, Typography } from '@mui/material';
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
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
	CategoryScale,
} from 'chart.js';
ChartJS.register(
	CategoryScale,
	LinearScale,
	PointElement,
	LineElement,
	Title,
	Tooltip,
	Legend
);
function selectColor(number: number) {
  const hue = number * 137.508; // use golden angle approximation
  return `hsl(${hue},50%,75%)`;
}

export function Quiz(props: {
	state: Readonly<State>;
	addScore: (scores: number[], q: number) => Promise<void>;
	showScores: () => Promise<void>;
	selectQ: (q: number) => void;
	randomize: () => void;
	editScore: (index: number, scores: number[]) => void;
}) {
	const { state } = props;
	const [scores, setScores] = React.useState(state.log[state.currentq - 1]?.points || new Array<number>(state.numTeams).fill(0));
	const [q, setQ] = React.useState(state.currentq);
	const tableRef = React.useRef<any>();
	const innerTableRef = React.useRef<any>();
	const lineRef = React.useRef<any>();
	const [edit, setEdit] = React.useState(-1);
	useEffect(() => {
		(edit < 0 ) && setQ(state.currentq);
		//tableRef.current.scrollTop = tableRef.current.scrollHeight + 100;
	}, [state, scores, edit]);

	const getChartData = () => {
		const out = state.log.reduce((acc, cur, j) => {
			if (j === 0) {
				acc[j] = cur.points;
			} else {
				acc[j] = cur.points.map((v, i) => v + acc[j - 1][i]);
			}
			return acc;
		}, [] as number[][]);
		//console.warn('getChartData', out);
		return out;
	};

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
				style={{
					marginBottom: 20,
					height: 40 + 'px',
					backgroundColor:  (edit >= 0) ? 'crimson' : 'unset',
				}}
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
							<Button variant="outlined" onClick={() => {
								const s = [...scores];
								s[i] = Math.floor(props.state.fullpoints);
								setScores(s);
							}} style={{ marginRight: 10 }}>100%</Button>
							<Button variant="outlined" style={{ marginRight: 10 }} onClick={() => {
								const s = [...scores];
								s[i] = Math.floor(props.state.fullpoints / 2);
								setScores(s);
							}}>50%</Button>
							<Button variant="outlined" onClick={() => {
								const s = [...scores];
								s[i] = Math.floor(props.state.fullpoints / 3);
								setScores(s);
							}}>33%</Button>
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
						</Container>
					);
				})
			}
			<div>
				{
					(edit < 0) && <LoadingButton
						variant="contained"
						style={{ margin: 20 }}
						onClick={() => {
							setScores(new Array<number>(state.numTeams).fill(0));
							props.addScore(scores, q);
						}}
					>
						Add Score
					</LoadingButton>
				}
				{
					(edit >= 0) && <LoadingButton
						variant="contained"
						style={{ margin: 20 }}
						onClick={() => {
							props.editScore(edit, scores);
							setEdit(-1);
							setQ(state.currentq);
							setScores(new Array<number>(state.numTeams).fill(0));
						}}
					>
						Edit Score
					</LoadingButton>
				}
				{
					false && <LoadingButton
						variant="contained"
						style={{ margin: 20 }}
						onClick={() => {
							props.randomize();
						}}
					>
						Random Score (DEBUG)
					</LoadingButton>
				}
			</div>
			<ResponsiveGrid
				state={state}
				selectQ={props.selectQ}
				edit={(index: number) => {
					if (index < state.log.length) {
						setEdit(index);
						setQ(index + 1);
						setScores(props.state.log[index].points);
					}
				}}
				tableRef={tableRef}
				editIndex={ edit }
				innerTableRef={innerTableRef}
			/>
			<Line
				ref={lineRef}
				data={{
					labels: new Array(state.qs).fill(0).map((v, i) => i + 1),
					datasets: state.teams.map((team, i) => {
						return {
							label: team.toString(),
							data: getChartData().map((v, j) => v[i]),
							borderColor: '#' + Math.floor(Math.random() * 16777215).toString(16),
							backgroundColor: selectColor(i)
						}
					})
				}}
				options={{
					responsive: true,
					plugins: {
						legend: {
							position: 'top' as const,
						},
						title: {
							display: true,
							text: 'Score graph',
						},
					},
				}}
			/>
			<Button
				variant="contained"
				style={{ margin: 20 }}
				onClick={async () => {
					//tableRef.current.style.overflow = 'auto';
					//tableRef.current.style.height = '100%';
					const canvas = await html2canvas(tableRef.current, {
						backgroundColor: '#000000',
					});
					//tableRef.current.style.overflow = 'scroll';
					//tableRef.current.style.height = 215 + 'px';

					canvas.toBlob(async (blob) => {
						blob && saveAs(blob, 'scores.png');

						lineRef.current.canvas.toBlob(async (blob: string | Blob) => {
							blob && saveAs(blob, 'stats.png')
						})
					}, 'image/png');
					//props.showScores();
				}}
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

export function ResponsiveTable(props: { state: State, selectQ: (q: number) => void, tableRef: React.RefObject<any>, innerTableRef: React.RefObject<any> }) {
	const rows = props.state.log;
	return (
		<TableContainer component={Paper} style={{ width: '90%', marginBottom: 30, marginTop: 20, height: 215, overflow: 'auto', padding: 0 }} ref={props.tableRef}>
			<Table sx={{ width: '100%', padding: 0 }} aria-label="customized table" id="score-table" ref={props.innerTableRef}>
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
export function ResponsiveGrid(props: {
	state: State,
	selectQ: (q: number) => void,
	edit: (q: number) => void,
	editIndex: number,
	tableRef: React.RefObject<any>,
	innerTableRef: React.RefObject<any>,
}) {
	return (
		<Box sx={{ flexGrow: 1 }} style={{ margin: 10, padding: 20 }} ref={props.tableRef}>
			<Typography style={{ marginBottom: 20 }}>
				[ {props.state.teams.map((f, i) => `${f} - ${props.state.log.reduce((acc, cur) => {
					acc += cur.points[i];
					return acc;
				}, 0)}`).join(" | ")} ]
			</Typography>
			<Grid container spacing={{ xs: 2, md: 3 }} columns={{ xs: 4, sm: 8, md: 12 }} ref={props.innerTableRef}>
				{Array.from(Array(props.state.qs)).map((_, index) => {
					const qnum = index + 1;
					const team = props.state.log[index];
					const message = team ? (
						<React.Fragment>
							<div>{qnum}. </div>
							<span>[ {team?.points.join(" | ")} ]</span>
						</React.Fragment>
					) : <div>{qnum}</div>;
					const filled = Boolean(props.state.log[index])
					return (
						<Grid item sm={2} md={2} key={index}>
							<Item
								onDoubleClick={ () => props.edit(index) }
								style={{
									background: filled ? ((props.editIndex === index) ? 'crimson' : 'limegreen') : undefined,
									color: filled ? 'black' : 'white',
									fontSize: 14,
									cursor: 'default',
									userSelect: 'none',
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