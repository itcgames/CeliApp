import React from "react";
import Svg, {Circle, Text} from 'react-native-svg';

export default class CircularProgressBar extends React.Component
{
	render()
	{
		const size = this.props.size;
		const outerSize = this.props.outerSize;
		const innerSize = this.props.innerSize;
		const innerStokeWidth = this.props.innerStrokeWidth || 2;
		const outerStokeWidth = this.props.outerStrokeWidth || 5;
		const centerText = this.props.text;
		

		return <Svg transform={[{rotate: '270deg'}]} width={size} height={size}>
			<SvgCircle outerSize={size} size={innerSize} strokeWidth={innerStokeWidth} color={'#707070'} progress={1}/>
			<SvgCircle outerSize={size} size={outerSize} strokeWidth={outerStokeWidth} color={this.props.color} progress={this.props.progress}/>
			<Text rotation="-270" originX={size/2} originY={size/2} x={size/2} y = {size/2}  fill="black"  textAnchor="middle"  alignmentBaseline={'central'} fontSize="18">{centerText}</Text>
		</Svg>;
	}	
}

const SvgCircle = ({outerSize, size, strokeWidth, color, progress}) =>
{
	const radius = (size - strokeWidth) / 2;
	const circumference = radius * Math.PI * 2;
	progress = 1 - progress;
	const alpha = progress * Math.PI * 2;
	const strokeDashoffset = alpha * radius;

	return <Circle
		x={(outerSize - size)/2}
		y={(outerSize - size) / 2}
		stroke={color}
		fill='none'
		cx={size / 2}
		cy={size / 2}
		r={radius}
		strokeWidth={strokeWidth}
		strokeDasharray={`${circumference} ${circumference}`}				
		{...{strokeDashoffset}}
	/>
} 