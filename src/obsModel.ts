import OBSWebSocket from "obs-websocket-js";

const IMAGES = {
	BG: 'https://images.unsplash.com/photo-1570937943292-a574bd5bc722?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8]',
	BG2: 'https://images.unsplash.com/photo-1641582493393-b838bb4c1c6d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=3732&q=80',
}
const SCENES: Record<string, boolean> = {
	'Intro': false,
	'Quiz': false,
	'Scores': false,
};

class OBSModel {
	obs: OBSWebSocket | undefined;

	login(ip = 'localhost', port = 4444, password: string) {
		this.obs = new OBSWebSocket();
		return this.obs.connect({ address: `${ip}:${port}`, password });
	}

	logout() {
		this.obs?.disconnect();
	}

	async createElements() {
		await this.createSceneElements();
		await this.createIntroSourceElements();
	}

	async createSceneElements() {
		if (!this.obs) { return; }
		const list = await this.obs.send('GetSceneList');
		const ids = Object.keys(SCENES);
		for (let i = 0; i < ids.length; i++) {
			const scene = ids[i];
			if (SCENES[scene]) { return; }
			SCENES[scene] = Boolean(list.scenes.find(s => s.name === scene));
			if (!SCENES[scene]) {
				try {
					await this.obs?.send('CreateScene', { 'sceneName': scene });
					SCENES[scene] = true;
				} catch {
					console.warn('e');
				}
			}
		}
		await this.obs?.send('SetCurrentScene', { 'scene-name': 'Intro' });
	}

	async createIntroSourceElements() {
		if (!this.obs) { return; }
		const sources = await this.obs.send('GetSourcesList');

		const imageBGSettings = {
			url: IMAGES.BG,
			width: 1920,
			height: 1080,
		};
		const hasBG = Boolean(sources.sources.find(s => s.name === 'BG'));
		if (hasBG) {
			this.obs.send('SetSourceSettings', {
				sourceName: 'BG',
				sourceSettings: imageBGSettings,
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind: 'browser_source',
				sourceName: 'BG',
				sourceSettings: imageBGSettings,
				sceneName: 'Intro',
				setVisible: true,
			});
		}
		const welcomeTextSettings = {
			text: `General Quiz\nQM: Sayan Mohanty`,
			color1: 4294945280,
			color2: 4294945280,
			font: {
				face: "Helvetica",
				flags: 0,
				size: 70,
				style: "Regular",
				dropShadow: true,
			},
		};
		const hasWelcomeText = Boolean(sources.sources.find(s => s.name === 'WelcomeText'));
		if (hasWelcomeText) {
			await this.obs.send('SetSourceSettings', {
				sourceName: 'WelcomeText',
				sourceSettings: {
					...welcomeTextSettings,
				}
			});
		} else {
			await this.obs.send('CreateSource', {
				sourceKind: 'text_ft2_source',
				sourceName: 'WelcomeText',
				sourceSettings: welcomeTextSettings,
				sceneName: 'Intro',
				setVisible: true,
			});
		}
		const props = await this.obs.send('GetSceneItemProperties', {
			"scene-name": "Intro",
			item: { name: "WelcomeText" },
		})
		const { height, width } = props;
		await this.obs.send('SetSceneItemProperties', {
			"scene-name": "Intro",
			item: {
				name: "WelcomeText",
			},
			position: {
				x: 50,
				y: 1080 - (height + 100),
			},
			scale: {
				x: 1,
				y: 1,
			},
			crop: {},
			bounds: {},
		});

		/*	
		this.obs.send('GetSourceSettings', { 'sourceName': 'Browser' }).then(data => {
			console.log('GetSourceSettings', data);
		});
		*/
	}

	async getSourceSettings(sourceName: string) {
		const settings = await this.obs?.send('GetSourceSettings', {
			sourceName: 'WelcomeText',
		});
		console.warn('source settings for', sourceName, settings);
	}
}

const OBS = new OBSModel();
export default OBS;