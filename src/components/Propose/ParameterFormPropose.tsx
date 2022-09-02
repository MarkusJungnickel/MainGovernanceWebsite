import { TextField } from "@material-ui/core";
import { Box, Grid, Typography } from "@mui/material";
import React from "react";
import { isArrayParameter, isBoolParameter } from "./AbiUtilsPropose";

export default function ParameterForm(props: any) {
  const [parameters, setParameters] = React.useState<Record<string, any>>({});

  const handleChange = (data: any) => {
    console.log(data.target);
    const parameter = data.target.id;
    let parametersTmp = parameters;

    if (isArrayParameter(getType(parameter))) {
      parametersTmp[parameter] = [data.target.value];
    } else {
      parametersTmp[parameter] = data.target.value;
      if (isBoolParameter(getType(parameter))) {
        if (
          parametersTmp[parameter] == "1" ||
          parametersTmp[parameter].toLowerCase() == "true"
        ) {
          parametersTmp[parameter] = true;
        } else {
          parametersTmp[parameter] = false;
        }
      }
    }
    setParameters(parametersTmp);
    console.log(parametersTmp);
    props.parentCallback(parametersTmp);
  };
  console.log(props.method);

  function getType(name: string): string {
    for (const input of props.method.value.inputs) {
      if (input.name == name) {
        return input.type;
      }
    }
    return "";
  }

  return (
    <div>
      <React.Fragment>
        <Typography variant="h6" gutterBottom>
          Enter the Parameters
        </Typography>
        <Box component="form" noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={12}>
              {props.method.value.inputs?.map((record: any) => (
                <TextField
                  variant="outlined"
                  label={record.name}
                  required
                  placeholder={record.type}
                  id={record.name}
                  key={record.name}
                  onChange={handleChange}
                ></TextField>
              ))}
            </Grid>
          </Grid>
        </Box>
      </React.Fragment>
    </div>
  );
}
