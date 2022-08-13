import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";

export default function ContractFormPropose(props: any) {
  // ========= Contract Dialog ========
  const [description, setDescription] = React.useState("");
  const [stake, setStake] = React.useState("");
  const handleDescriptionChange = async (data: any) => {
    const descriptionTmp = data.target;
    setDescription(descriptionTmp.value);
    props.parentCallback(descriptionTmp.value, stake);
  };
  const handleStakeChange = async (data: any) => {
    const stakeTmp = data.target;
    setStake(stakeTmp.value);
    props.parentCallback(description, stakeTmp.value);
  };

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>
        Enter Proposal Details
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="stake"
            name="stake"
            label="Stake"
            fullWidth
            onChange={handleStakeChange}
            helperText="Tokens to stake"
          />
        </Grid>
        <Grid item xs={12} sm={12}>
          <TextField
            required
            id="description"
            name="description"
            label="Description"
            fullWidth
            multiline
            onChange={handleDescriptionChange}
            helperText="Describe the proposal"
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
