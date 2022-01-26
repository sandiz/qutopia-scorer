import { Container, TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import React from 'react';
import Alert from '@mui/material/Alert';
import { State } from './OBSComponent';

export function Default(props: { state: Readonly<State>; onConnect: (h: string, p: number, pwd: string) => Promise<void>; }) {
	const { state } = props;
	const [host, setHost] = React.useState('localhost');
	const [port, setPort] = React.useState(4444);
	const [pwd, setPwd] = React.useState('');
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
			<TextField
				required
				id="outlined-required"
				label="Host"
				style={{ margin: 10 }}
				value={host}
				onChange={(v) => setHost(v.target.value)} />
			<TextField
				id="outlined"
				label="Port"
				datatype="number"
				style={{ margin: 10 }}
				value={port}
				onChange={(v) => setPort(parseInt(v.target.value))} />
			<TextField
				id="outlined"
				label="Password"
				style={{ margin: 10 }}
				value={pwd}
				onChange={(v) => setPwd(v.target.value)} />
			<LoadingButton
				variant="contained"
				style={{ margin: 20 }}
				loading={state.connection === 'connecting'}
				onClick={() => props.onConnect(host, port, pwd)}
			>
				Connect
			</LoadingButton>
			{state.connection === 'error' &&
				<Alert severity="error" sx={{ width: '100%' }}>
					Failed to connect
				</Alert>}
		</Container>
	);
}
