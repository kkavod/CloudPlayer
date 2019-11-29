import React, { Component } from 'react';
import moment from 'moment';
import SC from 'soundcloud';
import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles, createStyles } from '@material-ui/styles';

import Track from './Track'

const soundCloudClientId = '3a792e628dbaf8054e55f6e134ebe5fa';

type PlayerState = {
  tracks: object[],
  trackId: number | null,
  progress: number,
  streamUrl: string | null,
  isLoading: boolean,
  isPlaying: boolean,
}

type PlayerProps = {
  classes: object
}

const styles = ({ spacing }: Theme) => createStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '1rem',
    marginBottom: '1rem',
  },
  paper: {
    width: '100%',
    overflowX: 'auto',
  },
})

/**
 * @class App
 */
class App extends Component<PlayerProps, PlayerState> {
  audioElement: HTMLAudioElement | null = null;

	/**
	 * Creates an instance of CloudPlayer App.
	 * @memberof App
	 */
  constructor(props: PlayerProps) {
    super(props)

    this.state = {
      tracks: [],
      trackId: null,
      progress: 0,
      streamUrl: null,
      isLoading: false,
      isPlaying: false,
    }
  }

	/**
	 * Initializes SoundCloud SDK
	 * @memberof App
	 */
  componentDidMount() {
    SC.initialize({
      client_id: soundCloudClientId
    });
  }

	/**
   * Queries SoundCloud search API.
   *
   * @param {string} query
	 * @memberof App
	 */
  async search(query: string) {
    this.setState({ isLoading: true })
    const tracks = await SC.get('/tracks', { q: query });
    this.setState({ tracks, isLoading: false })
    console.log('Got tracks', tracks)
  }

	/**
   * Plays a sound track and sets the track as the current
   *
   * @param {number} trackId
   * @param {string} streamUrl
	 * @memberof App
	 */
  play(trackId: number, streamUrl: string) {
    if (!this.audioElement) {
      return
    }

    // Track already selected
    if (this.state.trackId === trackId) {
      this.audioElement.play()
      return
    }

    const clientStreamUrl = `${streamUrl}?client_id=${soundCloudClientId}`

    this.setState({
      trackId,
      progress: 0,
      streamUrl: clientStreamUrl
    })

    this.audioElement.autoplay = true
  }

	/**
   * Pauses the current track.
   *
	 * @memberof App
	 */
  pause() {
    if (!this.audioElement) {
      return
    }
    this.audioElement.pause()
  }

	/**
   * Binds audio element event handlers.
   *
   * @param {HTMLAudioElement} element
	 * @memberof App
	 */
  initAudioElement(element: HTMLAudioElement | null) {
    if (element === null) {
      return
    }

    const update = (isPlaying: boolean) => (
      () => this.setState({ isPlaying })
    )

    element.onplay = update(true)
    element.onpause = update(false)
    element.onended = update(false)

    element.ontimeupdate = (event: any) => {
      const { target } = event

      if (Number.isNaN(target.duration)) {
        return
      }

      const progress = 100.0 * target.currentTime / target.duration

      this.setState({ progress })
    }

    this.audioElement = element
  }

	/**
	 * @memberof App
	 */
  render() {
    const { classes } = this.props

    const {
      trackId,
      tracks,
      progress,
      isPlaying
    } = this.state

    return (
     <Container component="main" maxWidth="md">

       <audio
         src={this.state.streamUrl}
         ref={element => this.initAudioElement(element)}
       />

      <CssBaseline />

      <div className={classes.root}>

        <Typography component="h1" variant="h5">
          CloudPlayer
        </Typography>

        <TextField
          id="standard-search"
          label="Search tracks"
          type="search"
          margin="normal"
          onChange={e => this.search(e.target.value)}
          fullWidth
        />

        {this.state.isLoading &&
          <LinearProgress />
        }

        <Paper className={classes.paper}>

          {tracks.map(track => (
            <Track
              track={track}
              isPlaying={track.id === trackId && isPlaying}
              progress={track.id === trackId ? progress : null}
              onPlay={() => this.play(track.id, track.stream_url)}
              onPause={() => this.pause()}
            />
          ))}
        </Paper>

      </div>

    </Container>
  )
  }
}

export default withStyles(styles)(App);
