import * as React from 'react';
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1, olor: '#6BBEA5' }}>
        <LinearProgress variant="determinate" {...props} className='color="book"' />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" sx={{ color: '#6BBEA5' }}>
          {`${Math.round(props.value)}%`}
        </Typography>
      </Box>
    </Box>
  );
}

export default function LinearWithValueLabel({ attendance }: { attendance: number }) {
  const [progress, setProgress] = React.useState(0);
  React.useEffect(() => {
      setProgress(attendance)
      console.log("aaaaaaa", attendance)
    if (attendance === undefined) return;

    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= attendance) {
          clearInterval(timer);
          return attendance;
        }
        return Math.min(prevProgress + 5, attendance);
      });
    }, 100);

    return () => clearInterval(timer);
  }, [attendance]);


  return (
    <Box sx={{ width: '100%' }}>
      <LinearProgressWithLabel value={100} />
    </Box>
  );
}

