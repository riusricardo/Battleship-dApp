import React, { Component } from 'react';
import PropTypes from 'prop-types';


//const Square = ( props ) => {
class Square extends Component {
	state = {
		sColor:'#000AAA',
		bColor:'#000AAA'
	};
	render() {
		const { pColor } = this.props;
		const { paint } = this.props;
		/*this.setState({sColor : (paint ? '#000BBB' : '#000AAA')});
		this.setState({bColor : (paint ? '#000AAA' : '#000BBB')});
*/

		const backgroundColor = paint ? '#000BBB' : '#000AAA'
		const color = paint ? '#000AAA' : '#000BBB'
		

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