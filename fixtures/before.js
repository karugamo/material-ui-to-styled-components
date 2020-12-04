const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    first: {
      flexGrow: 1
    },
    second: {
        backgroundColor: 'green',
        width: '100%'
    }
  })
);

function App() {
    const classes = useStyles()

    return <div className={classes.first} open={true}>
        <span className={classes.second}>Hello</span>
    </div>
}

// exclude
console.log('test')