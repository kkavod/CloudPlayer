import React, { Component } from 'react';
import moment from 'moment';
import SC from 'soundcloud';

import Container from '@material-ui/core/Container';
import CssBaseline from '@material-ui/core/CssBaseline';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import Fab from '@material-ui/core/Fab';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import ButtonBase from '@material-ui/core/ButtonBase';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import LinearProgress from '@material-ui/core/LinearProgress';
import { withStyles, createStyles } from '@material-ui/styles';

import noImage from './noimage.png';

const soundCloudClientId = '3a792e628dbaf8054e55f6e134ebe5fa';

SC.initialize({
  client_id: soundCloudClientId
});

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
  artwork: {
    width: 128,
    height: 128,
  },
  progress: {
    height: 48,
    background: 'red',
    position: 'absolute',
    opacity: 0.1,
  },
  waveform: {
    maxHeight: 48,
    minWidth: '100%',
  },
})

class App extends Component<PlayerProps, PlayerState> {
  audioElement: HTMLAudioElement | null = null;

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

  async search(query: string) {
    this.setState({ isLoading: true })
    const tracks = await SC.get('/tracks', { q: query });
    this.setState({ tracks, isLoading: false })
    console.log('Got tracks', tracks)
  }

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

  pause() {
    if (!this.audioElement) {
      return
    }
    this.audioElement.pause()
  }

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

          <Card className={classes.card}>
            <CardContent>

            <Grid container spacing={1}>
              <Grid item>
                <ButtonBase className={classes.artwork}>
                  <img
                    src={track.artwork_url ? track.artwork_url : noImage}
                    alt={track.title}
                  />
                </ButtonBase>
              </Grid>

              <Grid item xs={12} sm container>

                <Grid item xs container direction="column" spacing={2}>

                  <Grid item xs container>

                    <Grid item xs={1}>
                      {(track.id !== trackId || !isPlaying) &&
                        <Fab
                          color="primary"
                          aria-label="play"
                          onClick={() => this.play(track.id, track.stream_url)}
                          size="small"
                        >
                          <PlayArrowIcon />
                        </Fab>
                      }

                      {track.id === trackId && isPlaying &&
                        <Fab
                          color="primary"
                          aria-label="pause"
                          onClick={() => this.pause()}
                          size="small"
                        >
                          <PauseIcon />
                        </Fab>
                      }

                    </Grid>

                    <Grid item xs>
                      <Typography gutterBottom variant="subtitle1">
                        {track.user.username}
                      </Typography>

                      <Typography variant="body2" gutterBottom>
                        {track.title}
                      </Typography>
                    </Grid>

                    <Grid item>
                      <Typography variant="subtitle1">{moment(track.created_at).fromNow()}</Typography>
                    </Grid>

                  </Grid>

                  <Grid item>
                    {track.id === trackId &&
                      <div
                        className={classes.progress}
                        style={{ width: `${progress}%` }}
                      />
                    }
                    <img
                      className={classes.waveform}
                      src={track.waveform_url}
                      alt={track.title}
                    />
                  </Grid>

                </Grid>
              </Grid>
            </Grid>

            </CardContent>
          </Card>


          ))}
        </Paper>

      </div>

    </Container>
  )
  }
}

export default withStyles(styles)(App);
