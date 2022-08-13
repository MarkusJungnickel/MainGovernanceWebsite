import { Box, Link as MuiLink, Paper, Typography } from "@mui/material";
import * as React from "react";
import { useState } from "react";
import {
  SelectField,
  useCreatePath,
  useRecordContext,
  UseRecordContextParams,
} from "react-admin";
import { Link } from "react-router-dom";
import { Committee } from "../types";
import { CompanyAvatar } from "./CompanyAvatar";

export const CommitteeCards = (props: UseRecordContextParams<Committee>) => {
  const [elevation, setElevation] = useState(1);
  const createPath = useCreatePath();
  const record = useRecordContext<Committee>(props);

  //test
  return (
    <MuiLink
      component={Link}
      to={createPath({
        resource: "companies",
        id: record.title,
        type: "show",
      })}
      underline="none"
      onMouseEnter={() => setElevation(3)}
      onMouseLeave={() => setElevation(1)}
    >
      <Paper
        sx={{
          height: 200,
          width: 195,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "1em",
        }}
        elevation={elevation}
      >
        <Box display="flex" flexDirection="column" alignItems="center">
          <CompanyAvatar />
          <Box textAlign="center" marginTop={1}>
            <Typography variant="subtitle2">{record.title}</Typography>
            <SelectField color="textSecondary" source="sector" />
          </Box>
        </Box>
      </Paper>
    </MuiLink>
  );
};
