import React from 'react';
import OBS from './obsModel';
import { Default } from './Default';
import { Intro } from './Intro';
import { Quiz } from './Quiz';


export type State = {
	scene: 'intro' | 'quiz' | 'scores';
	connection: 'connecting' | 'loggedin' | 'loggedout' | 'error';
	teamA: string;
	teamB: string;
	fullpoints: number;
	log: { q: number, points: number, team: string }[];
	qm: string;
	theme: string;
	qs: number;
	currentq: number;
}
class OBSComponent extends React.Component<{}, State> {
	constructor(props: {}) {
		super(props);
		this.state = {
			scene: 'intro',
			connection: 'loggedout',
			teamA: 'Team A',
			teamB: 'Team B',
			fullpoints: 10,
			log: [],
			qm: '',
			theme: 'General',
			qs: 50,
			currentq: 1,
		}
	}
	onConnect = async (host: string, port: number, pwd: string) => {
		this.setState({ connection: 'connecting' })
		try {
			await OBS.login(host, port, pwd, () => { this.setState({ connection: 'loggedout' }) });
			this.setState({ connection: 'loggedin' });
		} catch (e) {
			console.warn('failed to connect');
			this.setState({ connection: 'error' });
			return;
		}
	}
	updateTeams = async (teams: { teamA: string, teamB: string, fullpoints: number }, qm: string, theme: string, qs: number) => {
		this.setState({ qm, theme, qs, ...teams });
		await OBS.createElements();
		await OBS.updateIntroNames(qm, theme);
		await OBS.updateTeamNames(teams);
		await OBS.updateScore({ teamA: 0, teamB: 0 });
		await OBS.showScene('Intro');
	}
	showQuiz = async () => {
		await OBS.showScene('Quiz');
		this.setState({ scene: 'quiz' });
	}
	showScores = async () => {
		await OBS.showScene('Scores');
		this.setState({ scene: 'scores' });
	}
	updateScore = async (teamA: number, teamB: number, q: number) => {
		let { log, currentq } = this.state;
		log.push({ q, points: teamA ? teamA : teamB, team: teamA ? this.state.teamA : this.state.teamB });
		currentq += 1;
		this.setState({ log, currentq });
		const pointsA = log.reduce((cur, acc) => acc.team === this.state.teamA ? acc.points + cur : cur, 0);
		const pointsB = log.reduce((cur, acc) => acc.team === this.state.teamB ? acc.points + cur : cur, 0);
		await OBS.updateScore({ teamA: pointsA , teamB: pointsB });
	}
	selectQ = async (q: number) => {
		this.setState({ currentq: q });
	}
	render() {
		const { state } = this;
		const { scene, connection } = this.state;
		if (connection === 'loggedin') {
			switch (scene) {
				case 'intro':
					return <Intro state={this.state} updateOBS={this.updateTeams} showQuiz={this.showQuiz} />;
				case 'quiz':
					return <Quiz
						state={this.state}
						addScore={this.updateScore}
						showScores={this.showScores}
						selectQ={this.selectQ}
					/>;
				case 'scores':
					return <Scores />;
			}
		}
		else {
			return <Default state={state} onConnect={this.onConnect} />
		}
	}
}


function Scores() {
	return null;
}


export default OBSComponent;