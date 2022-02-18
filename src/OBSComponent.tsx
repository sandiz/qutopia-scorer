import React from 'react';
import OBS from './obsModel';
import { Default } from './Default';
import { Intro } from './Intro';
import { Quiz } from './Quiz';


export type State = {
	scene: 'intro' | 'quiz' | 'scores';
	connection: 'connecting' | 'loggedin' | 'loggedout' | 'error';
	teams: string[];
	fullpoints: number;
	log: { q: number, points: number[] }[];
	qm: string;
	theme: string;
	qs: number;
	currentq: number;
	numTeams: number;
}
class OBSComponent extends React.Component<{}, State> {
	constructor(props: {}) {
		super(props);
		const numTeams = 2;
		this.state = {
			scene: 'intro',
			connection: 'loggedout',
			fullpoints: 10,
			log: [],
			qm: 'Nemo',
			theme: 'General',
			qs: 50,
			currentq: 1,
			teams: new Array<string>(2).map((i) => `Team ${i + 1}`),
			numTeams,
		}
	}
	onConnect = async (host: string, port: number, pwd: string) => {
		this.setState({ connection: 'connecting' })
		try {
			await OBS.login(host, port, pwd, () => { this.setState({ connection: 'loggedout' }) });
			this.setState({ connection: 'loggedin', log: [] });
		} catch (e) {
			console.warn('failed to connect');
			this.setState({ connection: 'error' });
			return;
		}
	}
	updateTeams = async (teams: string[], scores: number[], fullpoints: number, qm: string, theme: string, qs: number) => {
		this.setState({ qm, theme, qs, teams, numTeams: teams.length, fullpoints, log: [] });
		await OBS.createElements();
		// await OBS.updateIntroNames(qm,s theme);
		await OBS.updateScore(teams, scores);
		await this.showQuiz();
	}
	showQuiz = async () => {
		await OBS.showScene('Quiz');
		this.setState({ scene: 'quiz' });
	}
	showScores = async () => {
		await OBS.showScene('Scores');
		this.setState({ scene: 'scores' });
	}
	updateScore = async (scores: number[], q: number) => {
		let { log, currentq } = this.state;
		log.push({ q, points: scores });
		currentq += 1;
		this.setState({ log, currentq });
		await OBS.updateScore(this.state.teams, logToScores(this.state));
	}
	selectQ = async (q: number) => {
		this.setState({ currentq: q });
	}
	randomize = () => {
		const log = [];
		const fp = this.state.fullpoints;
		const pointsRandom = [fp, Math.floor(fp / 2), Math.floor(fp / 3)];
		for (let i = 0; i < this.state.qs; i++) {
			log.push({
				q: i + 1,
				points: new Array<number>(this.state.numTeams).fill(0).map(() => pointsRandom[Math.floor(Math.random() * pointsRandom.length)])
			});
		}
		this.setState({ log });
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
						randomize={this.randomize}
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

export const logToScores = (state: State) => {
	return state.log.reduce((acc, curr) => {
		curr.points.forEach((p, i) => {
			acc[i] += p;
		});
		return acc;
	}, new Array<number>(state.numTeams).fill(0));
}


export default OBSComponent;