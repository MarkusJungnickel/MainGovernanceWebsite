import { Avatar, Grid } from "@material-ui/core";
import DealIcon from "@mui/icons-material/MonetizationOn";
import { Box, Paper, Typography } from "@mui/material";
import { useState } from "react";
import { RecordContextProvider } from "react-admin";
import { fromWei, toBN } from "web3-utils";
import logo from "./logo.png";

function stringToColor(string: string) {
  let hash = 0;
  let i;

  /* eslint-disable no-bitwise */
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  let color = "#";

  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  /* eslint-enable no-bitwise */

  return color;
}

function stringAvatar(name: string) {
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: `${name[0][0]}`,
  };
}

const ComTile = (props: any) => {
  const [elevation, setElevation] = useState(1);

  return (
    <Grid
      onMouseEnter={() => setElevation(4)}
      onMouseLeave={() => setElevation(1)}
    >
      <a
        target="_blank"
        href={
          "https://gnosis-safe.io/app/rin:" +
          props.data.safeAddress +
          "/apps?appUrl=http://localhost:3006/"
        }
        style={{ textDecoration: "none" }}
      >
        <Paper
          sx={{
            height: 200,
            width: 177,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1em",
          }}
          elevation={elevation}
        >
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar src={logo} />
            <Typography variant="subtitle2" fontWeight="bold">
              {props.data.coreInfo.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {props.data.coreInfo.sector}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <>
              {!props.data.budgetData.frozen && (
                <DealIcon color="disabled" sx={{ mr: 1 }} />
              )}
              {props.data.budgetData.frozen && (
                <Typography variant="h4">&#129398;</Typography>
              )}
            </>

            <div>
              <Typography variant="subtitle2" sx={{ mb: -0.5 }}>
                {fromWei(
                  toBN(
                    props.data.budgetData.totalAmount -
                      props.data.budgetData.amountUsed
                  )
                ) + " "}
                ETH
              </Typography>
            </div>
          </Box>
        </Paper>
      </a>
    </Grid>
  );
};

// <Box
// left="30"
// height="90%"
// justifySelf="center"
// sx={{
//   width: 740,
//   flexDirection: "column",
//   borderColor: "blue",
//   border: 1,
//   boxShadow: 1,
//   pl: 5,
//   pr: 5,
//   pt: 5,
//   pb: 5,
//   ml: 3,
//   mt: 10,
// }}
// >

function CommitteeGrid(props: any) {
  return (
    <Grid container spacing={3}>
      {props.tileData.map((record: any) => (
        <RecordContextProvider key={record.safeAddress} value={record}>
          <Grid item>
            <ComTile data={record} id={""} />
          </Grid>
        </RecordContextProvider>
      ))}
    </Grid>
  );
}

export default CommitteeGrid;
