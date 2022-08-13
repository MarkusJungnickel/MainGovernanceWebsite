import { Box, Grid } from "@material-ui/core";
import { View } from "react-native";
import GridList from "../components/GridList";
import Roles from "../components/roles";
import { Avatar, Container } from "@material-ui/core";
import Button from "@mui/material/Button";

function Top() {
  return (
    <Box
      sx={{
        width: 800,
        flexDirection: "column",
        borderColor: "black",
        border: 5,
        boxShadow: 1,
        mt: 10,
      }}
    >
      <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
        Create New Committee
      </Button>
    </Box>
  );
}

export default function CommitteePage() {
  return (
    <>
      <Grid container spacing={0}>
        <Grid item xs={12} md={8}>
          <Top />
        </Grid>
        <Grid item xs={10} md={8}>
          <GridList />
        </Grid>
        <Grid item xs={4} md={2}>
          <Roles />
        </Grid>
      </Grid>
    </>
  );
}
