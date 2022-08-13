import { Typography } from "@mui/material";
import { CONTRACTS } from "../../constants/constants";

export default function ReviewPropose(props: any) {
  console.log(props.address);
  console.log(props.method);
  console.log(props.parameters);

  const contractName = CONTRACTS.find(
    (c) =>
      c.value.address.toString().toLowerCase() ===
      props.address.toString().toLowerCase()
  )?.label;
  console.log(contractName);
  const parameters: Record<string, string> = props.parameters;
  const args = Object.values(parameters);

  return (
    <div>
      <Typography
        component="h1"
        variant="body1"
        align="left"
        fontFamily="Arial"
      >
        <b>Contract: </b>
        {contractName}
      </Typography>
      <Typography
        component="h1"
        variant="body1"
        align="left"
        fontFamily="Arial"
      >
        <b>Method: </b>
        {props.method.methodSignature}
      </Typography>
      <Typography
        component="h1"
        variant="body1"
        align="center"
        fontFamily="Arial"
      >
        <b>Parameters: </b>
        {args}
        <div>{"\n"}</div>
      </Typography>
    </div>
  );
}
