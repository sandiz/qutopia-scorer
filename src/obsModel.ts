import OBSWebSocket from "obs-websocket-js";

const IMAGES = {
	BG: 'https://sandiz.github.io/qutopia-scorer/trivia-night.jpeg',
}
const SCENES = ['Intro', 'Quiz', 'Scores',];

type Source = {
	name: string;
	typeId: string;
	type: string;
};

class OBSModel {
	obs: OBSWebSocket | undefined;

	login(ip = 'localhost', port = 4444, password = '', cb = () => { }) {
		this.obs = new OBSWebSocket();
		this.obs.on('ConnectionClosed', cb);
		this.obs.on('Exiting', cb);
		return this.obs.connect({ address: `${ip}:${port}`, password });
	}

	logout() {
		this.obs?.disconnect();
		this.obs?.removeAllListeners();
	}

	async createElements() {
		if (!this.obs) { return; }
		await this.createSceneElements();

		const sources = await this.obs.send('GetSourcesList');
		await this.createIntroSourceElements(sources.sources);
		await this.createQuizSourceElements(sources.sources);
		await this.createScoresSourceElements(sources.sources);

		await this.obs?.send('SetCurrentScene', { 'scene-name': 'Intro' });
	}

	async createSceneElements() {
		if (!this.obs) { return; }
		const sceneList = await this.obs.send('GetSceneList');
		for (let i = 0; i < SCENES.length; i++) {
			const scene = SCENES[i];
			const hasScene = Boolean(sceneList.scenes.find(s => s.name === scene));
			if (!hasScene) {
				await this.obs?.send('CreateScene', { 'sceneName': scene });
			}
		}
	}

	async createIntroSourceElements(sources: Source[]) {
		if (!this.obs) { return; }

		await this.createBGSource('IntroBG', 'Intro', {}, sources)
	}

	async createQuizSourceElements(sources: Source[]) {
		if (!this.obs) { return; }
		await this.createBGSource('QuizBG', 'Quiz', {}, sources);
	}

	async createScoresSourceElements(sources: Source[]) {
		if (!this.obs) { return; }
		await this.createBGSource('ScoresBG', 'Scores', {}, sources);

		// thank u for playing
		await this.createTextSource('Thanks', 'Scores', {
			text: `Thank you for playing!`
		}, sources, ({ width, height }) => {
			return {
				x: 1920 / 2 - width / 2,
				y: 1000 / 2 - (height),
			}
		});
	}

	async getSourceSettings(sourceName: string) {
		const settings = await this.obs?.send('GetSourceSettings', {
			sourceName,
		});
		console.warn('source settings for', sourceName, settings);
	}

	async createTextSource(sourceName: string, sceneName: string, settings: {}, sources: Source[], position: (props: any) => { x: number, y:number } = () => ({ x: 0, y: 0 })) {
		if (!this.obs) { return; }
		const hasSource = Boolean(sources.find(s => s.name === sourceName));
		if (hasSource) {
			await this.obs.send('SetSourceSettings', {
				sourceName,
				sourceSettings: {
					...TextSettings,
					...settings,
				},
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind: 'text_ft2_source',
				sourceName,
				sourceSettings: {
					...TextSettings,
					...settings,
				},
				sceneName,
				setVisible: true,
			});
		}

		const props = await this.obs.send('GetSceneItemProperties', {
			"scene-name": sceneName,
			item: { name: sourceName },
		})
		await this.obs.send('SetSceneItemProperties', {
			"scene-name": sceneName,
			item: {
				name: sourceName,
			},
			position: position(props),
			scale: {
				x: 1,
				y: 1,
			},
			crop: {},
			bounds: {},
		});

	}

	async createBGSource(sourceName: string, sceneName: string, settings: {}, sources: Source[]) {
		if (!this.obs) { return; }
		const hasBG = Boolean(sources.find(s => s.name === sourceName));
		if (hasBG) {
			this.obs.send('SetSourceSettings', {
				sourceName,
				sourceSettings: {
					...BGSettings,
					...settings,
				},
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind: 'browser_source',
				sourceName,
				sourceSettings: {
					...BGSettings,
					...settings,
				},
				sceneName,
				setVisible: true,
			});
		}
	}

	async updateScore(score: { teamA: number, teamB: number }) {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');
		await this.createTextSource('TeamAScore', 'Quiz', {
			text: score.teamA.toString().padStart(3, '0'),
		}, sources.sources,({ height }) => {
			return {
				x: 50,
				y: 1000 - (height) 
			}
		});

		await this.createTextSource('TeamBScore', 'Quiz', {
			text: score.teamB.toString().padStart(3, '0'),
		}, sources.sources, ({ width, height }) => {
			return {
				x: 1870 - width,
				y: 1000 - (height) 
			}
		});
	}

	async updateTeamNames(teamNames: { teamA: string, teamB: string }) {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');
		await this.createTextSource('TeamA', 'Quiz', {
			text: teamNames.teamA.toString(),
		}, sources.sources, ({ height }) => {
			return {
				x: 50,
				y: 1000 - (height) - 80,
			}
		});
		await this.createTextSource('TeamB', 'Quiz', {
			text: teamNames.teamB.toString().padStart(3, '0'),
		}, sources.sources, ({ width, height }) => {
			return {
				x: 1870 - width,
				y: 1000 - (height) - 80,
			}
		});
	}

	async updateIntroNames(qm: string, theme: string) {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');
		await this.createTextSource('WelcomeText', 'Intro', {
			text: `${ theme } Quiz\nQM: ${ qm }`
		}, sources.sources, ({ height }) => {
			return {
				x: 50,
				y: 1000 - (height)
			}
		});
	}

	async showScene(sceneName: string) {
		switch (sceneName) {
			case 'Intro':
				await this.obs?.send('SetCurrentScene', { 'scene-name': 'Intro' });
				break;
			case 'Quiz':
				await this.obs?.send('SetCurrentScene', { 'scene-name': 'Quiz' });
				break;
			case 'Scores':
				await this.obs?.send('SetCurrentScene', { 'scene-name': 'Scores' });
				break;
		}
	}
}

//const waitForIt = (n: number) => new Promise(resolve => setTimeout(resolve, n));
const TextSettings = {
	color1: 4294945280,
	color2: 4294945280,
	font: {
		face: "Roboto",
		flags: 0,
		size: 70,
		style: "Regular",
	},
	drop_shadow: true
};
const BGSettings = {
	width: 1920,
	height: 1080,
	url: IMAGES.BG,
}

const OBS = new OBSModel();
export default OBS;