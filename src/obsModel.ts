import OBSWebSocket from "obs-websocket-js";

const IMAGES = {
	BG: 'https://sandiz.github.io/qutopia-scorer/trivia-night.jpeg',
}
const SCENES: Record<string, boolean> = {
	'Intro': false,
	'Quiz': false,
	'Scores': false,
};

type Source = {
	name: string;
	typeId: string;
	type: string;
};

class OBSModel {
	obs: OBSWebSocket | undefined;

	login(ip = 'localhost', port = 4444, password = '') {
		this.obs = new OBSWebSocket();
		return this.obs.connect({ address: `${ip}:${port}`, password });
	}

	logout() {
		this.obs?.disconnect();
	}

	async createElements() {
		if (!this.obs) { return; }
		await this.createSceneElements();

		const sources = await this.obs.send('GetSourcesList');
		await this.createIntroSourceElements(sources.sources);
		await this.createQuizSourceElements(sources.sources);

		//await this.obs?.send('SetCurrentScene', { 'scene-name': 'Intro' });
	}

	async createSceneElements() {
		if (!this.obs) { return; }
		const sceneList = await this.obs.send('GetSceneList');
		const ids = Object.keys(SCENES);
		for (let i = 0; i < ids.length; i++) {
			const scene = ids[i];
			if (SCENES[scene]) { return; }
			SCENES[scene] = Boolean(sceneList.scenes.find(s => s.name === scene));
			if (!SCENES[scene]) {
				try {
					await this.obs?.send('CreateScene', { 'sceneName': scene });
					SCENES[scene] = true;
				} catch {
					console.warn('e');
				}
			}
		}
	}

	async createIntroSourceElements(sources: Source[]) {
		if (!this.obs) { return; }

		await this.createBGSource('IntroBG', 'Intro', {
			url: IMAGES.BG,
		}, sources)

		await this.createTextSource('WelcomeText', 'Intro', {
			...TextSettings,
			text: `General Quiz\nQM: Sayan Mohanty`
		}, sources, ({ height }) => {
			return {
				x: 50,
				y: 1000 - (height)
			}
		});
	}

	async createQuizSourceElements(sources: { name: string; typeId: string; type: string; }[]) {
		if (!this.obs) { return; }
		await this.createBGSource('QuizBG', 'Quiz', {
			url: IMAGES.BG,
		}, sources);

		// score a team a
		await this.createTextSource('TeamA', 'Quiz', {
			...TextSettings,
			text: `Fight Club`
		}, sources, ({ height }) => {
			return {
				x: 50,
				y: 1000 - (height) - 80,
			}
		});
		await this.createTextSource('TeamAScore', 'Quiz', {
			...TextSettings,
			text: `100`
		}, sources, ({ height }) => {
			return {
				x: 50,
				y: 1000 - (height) 
			}
		});

		// score b team b
		await this.createTextSource('TeamB', 'Quiz', {
			...TextSettings,
			text: `Dequel`
		}, sources, ({ width, height }) => {
			console.warn(width)
			return {
				x: 1900 - width,
				y: 1000 - (height) - 80,
			}
		});
		await this.createTextSource('TeamBScore', 'Quiz', {
			...TextSettings,
			text: `50`
		}, sources, ({ width, height }) => {
			return {
				x: 1900 - width,
				y: 1000 - (height) 
			}
		});
	}

	async getSourceSettings(sourceName: string) {
		const settings = await this.obs?.send('GetSourceSettings', {
			sourceName: 'WelcomeText',
		});
		console.warn('source settings for', sourceName, settings);
	}

	async createTextSource(sourceName: string, sceneName: string, settings: {}, sources: Source[], position: (props: any) => { x: number, y:number } = () => ({ x: 0, y: 0 })) {
		if (!this.obs) { return; }
		const hasSource = Boolean(sources.find(s => s.name === sourceName));
		if (hasSource) {
			await this.obs.send('SetSourceSettings', {
				sourceName,
				sourceSettings: settings,
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind: 'text_ft2_source',
				sourceName,
				sourceSettings: settings,
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
		const hasBG = Boolean(sources.find(s => s.name === 'IntroBG'));
		if (hasBG) {
			this.obs.send('SetSourceSettings', {
				sourceName,
				sourceSettings: settings,
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind: 'browser_source',
				sourceName,
				sourceSettings: settings,
				sceneName,
				setVisible: true,
			});
		}
	}
}

//const waitForIt = (n: number) => new Promise(resolve => setTimeout(resolve, n));
const TextSettings = {
	color1: 4294945280,
	color2: 4294945280,
	font: {
		face: "Helvetica",
		flags: 0,
		size: 70,
		style: "Regular",
	},
	drop_shadow: true
}
const OBS = new OBSModel();
export default OBS;