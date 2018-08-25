import React, { Component } from 'react';
import PropTypes from 'prop-types';


class Square extends Component {
	render() {
		const bright = this.props.bright;
		const shot = this.props.shot;
		let backgroundColor = bright ? '#000BBB' : '#000AAA'
		let color = bright ? '#000AAA' : '#000BBB'
		backgroundColor = shot === -1 ? '#CC0000' : backgroundColor
		backgroundColor = shot === -2 ? '#000555' : backgroundColor
		
		return (
			<div className="Square"
				style={{
					color,
					backgroundColor,
					width: '100%',
					height: '100%',
				}}>
        {this.props.children}
      </div>
    );
	}

}

Square.propTypes = {
	blue: PropTypes.bool
};

export default Square;
