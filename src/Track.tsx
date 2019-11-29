import React, { Component } from 'react';
import moment from 'moment';

import Typography from '@material-ui/core/Typography';
import Fab from '@material-ui/core/Fab';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Grid from '@material-ui/core/Grid';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import PauseIcon from '@material-ui/icons/Pause';
import ButtonBase from '@material-ui/core/ButtonBase';
import { withStyles, createStyles } from '@material-ui/styles';

import noImage from './noimage.png';

type TrackProps = {
  classes: object,
  track: object,
  isPlaying: boolean,
  isCurrent: boolean,
  progress: number | null,
  onPlay: () => void,
  onPause: () => void,
}

const styles = ({ spacing }: Theme) => createStyles({
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

/**
 * Represents the track widget.
 *
 * @class Track
 */
class Track extends Component<TrackProps, {}> {
	/**
	 * @memberof App
	 */
  render() {

    const {
      track,
      classes,
      isPlaying,
      progress
    } = this.props

    return (
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
                    {!isPlaying &&
                      <Fab
                        color="primary"
                        aria-label="play"
                        onClick={() => this.props.onPlay()}
                        size="small"
                      >
                        <PlayArrowIcon />
                      </Fab>
                    }

                    {isPlaying &&
                      <Fab
                        color="primary"
                        aria-label="pause"
                        onClick={() => this.props.onPause()}
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
                  {progress !== null &&
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
    )
  }
}

export default withStyles(styles)(Track);
