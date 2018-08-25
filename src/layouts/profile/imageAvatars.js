import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Avatar from '@material-ui/core/Avatar';

const styles = {
  avatar: {
    margin: 10,
  },
  bigAvatar: {
    width: 70,
    height: 70,
  },
};

function ImageAvatars(props) {
  const { classes } = props;
  return (
    <div>
      <Avatar src={props.src} className={classNames(classes.avatar, classes.bigAvatar)} />
    </div>
  );
}

ImageAvatars.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ImageAvatars);