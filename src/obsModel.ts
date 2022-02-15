import OBSWebSocket from "obs-websocket-js";

const IMAGES = {
	BG: 'https://sandiz.github.io/qutopia-scorer/trivia-night.jpeg',
}
const SCENES = [ /* 'Intro', */ 'Quiz', 'Scores',];

type Source = {
	name: string;
	typeId: string;
	type: string;
};
const disableBG = true;
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
		//await this.createIntroSourceElements(sources.sources);
		await this.createQuizSourceElements(sources.sources);
		await this.createScoresSourceElements(sources.sources);

		await this.obs?.send('SetCurrentScene', { 'scene-name': 'Quiz' });
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
		/*await this.createTextSource('Thanks', 'Scores', {
			text: `Thank you for playing!`
		}, sources, ({ width, height }) => {
			return {
				x: (1920 / 2 - width / 2) + 100,
				y: 900 - (height),
			}
		});*/
		await this.createSource('ScorePNG', 'Scores', {
		}, sources, ({ width, height }) => {
			return {
				x: (1920 / 2 - 550 / 2) + 100,
				y: 28,
			}
		}, 'image_source', {
			width: 550,
			height: 1000,
			sourceWidth: 550,
			sourceHeight: 1000,
			scale: {
				x: 0.5,
				y: 0.5,
			}
		});
	}

	async getSourceSettings(sourceName: string) {
		const settings = await this.obs?.send('GetSourceSettings', {
			sourceName,
		});
		console.warn('source settings for', sourceName, settings);
	}

	async createSource(
		sourceName: string,
		sceneName: string,
		settings: {},
		sources: Source[],
		position: (props: any) => { x: number, y: number } = () => ({ x: 0, y: 0 }),
		sourceKind = 'text_ft2_source',
		properties = {},
	) {
		if (!this.obs) { return; }
		const hasSource = Boolean(sources.find(s => s.name === sourceName));
		if (hasSource) {
			await this.obs.send('SetSourceSettings', {
				sourceName,
				sourceSettings: {
					...settings,
				},
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind,
				sourceName,
				sourceSettings: {
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
			...properties,
		});

	}

	async createBGSource(sourceName: string, sceneName: string, settings: {}, sources: Source[]) {
		if (!this.obs || disableBG) { return; }
		const hasBG = Boolean(sources.find(s => s.name === sourceName));
		if (hasBG) {
			const sourceSettings = {
				...BGSettings,
				...settings,
			};
			//@ts-ignore
			sourceSettings.font.size = settings.size || 70;
			this.obs.send('SetSourceSettings', {
				sourceName,
				sourceSettings,
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

	async updateScore(teams: string[], scores: number[]) {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');
		scores.forEach(async (score, index) => {
			const team = teams[index];
			const sourceName = `${team}`;
			await this.createSource(sourceName, 'Quiz', {
				...TextSettings,
				text: `${team}: ${score.toString().padStart(3, '0')	}`,
				size: 30,
			}, sources.sources,({ height }) => {
				return {
					x: 40 + (index * 300),
					y: 1080 - 55,
				}
			});
		});
	}

	/*
	async updateTeamNames(teams: string[]) {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');
		teams.forEach(async (team, index) => {
			const sourceName = `${team}`;
			await this.createTextSource(sourceName, 'Quiz', {
				text: sourceName,
				size: 30,
			}, sources.sources, ({ height }) => {
				return {
					x: 40 + (index * 100),
					y: 1080 - 95,
				}
			});
		});
	}*/

	async updateIntroNames(qm: string, theme: string) {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');
		await this.createSource('WelcomeText', 'Intro', {
			...TextSettings,
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
		face: "DIN Condensed",
		flags: 0,
		size: 40,
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