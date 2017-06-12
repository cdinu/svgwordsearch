import React from 'react';
import { compose, flatten, map, max, range, replace, split, trim, zipWith } from 'lodash/fp';

const config = {}

config.grid = `
O H W K P D N R Y E R S L S E
D D E A O A A L R L A H I J L
A Y N D M A F D S E L E O R E
S D R W G R L T K P L E N R N
A I O E E E A A P H I P E E R
A N O T G R H A L A P H S A X
S R T O F I R O T N R T C A T
D U B I R R T L G T E E R H T
B O S E O O A D W N T F M E D
L H G T Z Y G B U Z A F O R R
C A K E P U R N B C C A N E I
Q T R P S U S U A I K R K H B
R U A S O N I D C K T I E T O
B H S N A K E E E B M G Y G O
C R O C O D I L E O R A N G E
`;

config.grid = `
A P A S R
S A V I N
X U P M s
A L I U Z
1 2 3 4 è
`;
config.words = `
  BEE CAKE CATERPILLAR DINOSAUR ELEPHANT HEDGEHOG KOALA NEST
  PARROT SHEEP STARFISH TIGER BIRD CAR CROCODILE DOG GIRAFFE
  HERE LION ORANGE RABBIT SNAKE THERE ZEBRA BUTTERFLY CAT
  DAD DUCK HAPPY KANGOROO MONKEY PANDA SAD SNOWMAN THREE
`;

const initialState = {
  dragFrom: {},
  dragTo: {},
  currentLine: {},
  lines: [],
};

let globalState = initialState;
const globalStateListeners = [];
const onGlobalStateUpdate = f =>  globalStateListeners.push(f);

const reduceState = (state = initialState, action) => {
  switch (action.type) {
    case 'onMouseDown':
      return { ...state, dragFrom: { c: action.c, r: action.r }}
    case 'onMouseUp':
      return {
        ...state,
        dragFrom: {},
        currentLine: {},
        lines: [...state.lines, {
          c1: state.dragFrom.c,
          r1: state.dragFrom.r,
          c2: action.c,
          r2: action.r,
        }],
      };
    case 'onMouseMove':
      return { ...state, currentLine: { c: action.c, r: action.r } };
    default:
      return state;
  }
}

const dispatch = action => {
  globalState = reduceState(globalState, action);
  map(listener => listener(globalState), globalStateListeners);
};

const letters = compose(
  map(compose(split(''), replace(/\W/g, ''))),
  split(/[\n]+/),
  trim
)(config.grid);

const words = compose(
  split(' '),
  replace(/\W+/g, ' ')
)(config.words)

const size = max([letters.length, compose(max, map(x=>x.length))(letters)]);

const LetterBox = ({ r, c, l='', w }) => (
  <g>
    <text
      x={c * w}
      y={r * w}
      dx={w / 2}
      dy={w / 2}
      alignmentBaseline="central"
      textAnchor="middle"
      style={{
        fontSize: w * 0.7,
        userSelect: 'none',
      }}
    >
      {l}
    </text>
  </g>
);

const dispatchMouseAction = (type, w) => e => {
  if(type === 'Move' && !e.buttons) return;

  dispatch({
    type: `onMouse${type}`,
    c: Math.floor((e.pageX - e.target.getBoundingClientRect().left) / w),
    r: Math.floor((e.pageY - e.target.getBoundingClientRect().top) / w),
  })
  e.stopPropagation();
};

const TouchOverlay = ({w}) => (
  <rect
    x={0}
    y={0}
    onMouseDown={dispatchMouseAction('Down', w)}
    onMouseMove={dispatchMouseAction('Move', w)}
    onMouseUp={dispatchMouseAction('Up', w)}
    onMouseLeave={dispatchMouseAction('Leave', w)}
    fill="rgba(0, 0, 0, 0)"
    stroke="none"
    style={{ width: '100%', height: '100%'}}
  />
);

const Grid = ({ size = 0, width = 300, letters = [[]] }) =>(
  <g>
    {
      flatten(
        zipWith(
          (r, row) => zipWith(
            (c, l) => (<LetterBox key={`${r}-${c}`} r={r} c={c} w={width/size*1.0} l={l} />),
            range(0, row.length),
            row
          ),
          range(0, letters.length),
          letters
        )
      )
    }
    <TouchOverlay w={width/size*1.0} />
  </g>
)

const Line = ({ r1, c1, r2, c2, w, color='rgba(10, 255, 10, 0.9)'}) => (
  <line
    strokeLinecap="round"
    x1={(c1 + 0.5) * w}
    y1={(r1 + 0.5) * w}
    x2={(c2 + 0.5) * w}
    y2={(r2 + 0.5) * w}
    dx={w/2}
    dy={w/2}
    stroke={color}
    opacity={0.5}
    strokeWidth={w * 0.95}
  />
);

export default class App extends React.Component {
  componentWillMount() {
    onGlobalStateUpdate(state => this.setState(state))
  }

  render() {
    const { width=300, height=300 } = this.props;
    const lines = this.state && this.state.lines || {};
    const current = this.state && this.state.currentLine && this.state.currentLine.r !== undefined && (
      <Line
        r1={this.state.currentLine.r}
        c1={this.state.currentLine.c}
        r2={this.state.dragFrom.r}
        c2={this.state.dragFrom.c}
        color="rgb(255, 255, 0)"
        w={width/size}
      />
    );
    return(
      <svg
        className="lf-wordsearch-grid"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ userSelect: 'none' }}
        width={width}
      >
        {map(l => <Line key={[l.r1, l.c1, l.r2, l.c2].join('-')} r1={l.r1} c1={l.c1} r2={l.r2} c2={l.c2} w={width/size} />, lines)}
        {current}

        <Grid size={size} width={width} letters={letters} />
      </svg>
    );
  }
}
