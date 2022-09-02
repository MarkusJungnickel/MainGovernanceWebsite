import {
  Box,
  Button,
  CardActions,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButtonProps,
  MenuItem,
  TextField,
} from "@material-ui/core";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useState } from "react";
import { RecordContextProvider } from "react-admin";
import { Cell, Legend, Pie, PieChart } from "recharts";
import styled, { keyframes } from "styled-components";
import Web3 from "web3";
import { GOVERNOR_V2_ABI } from "../constants/ABIs/GOVERNOR_V2_ABI";
import { GOVERNOR_V2_ADDRESS, PROVIDER_XDAI } from "../constants/constants";
import { ProviderContext } from "../context/Provider";
import proposalImage from "./proposal.png";

const web3 = new Web3(PROVIDER_XDAI);
const governor = new web3.eth.Contract(GOVERNOR_V2_ABI, GOVERNOR_V2_ADDRESS);

const AnimatedComponent = styled.div`
  animation: ${blinkingEffect} 3s linear infinite;
`;

function blinkingEffect() {
  return keyframes`
    50% {
      opacity: 0;
    }
  `;
}

function blinkingButton(activate: any, state: any) {
  if (activate) {
    return (
      <Typography variant={"inherit"}>
        <AnimatedComponent>&#128499; {state}</AnimatedComponent>
      </Typography>
    );
  } else {
    return <></>;
  }
}

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
  // console.log(props.data);
  // const data01 = [
  //   { name: "For", value: props.data.votes.forVotes },
  //   { name: "Against", value: props.data.votes.againstVotes },
  // ];
  // const data02 = [
  //   { name: "For", value: props.data.votes.forVotes },
  //   { name: "Against", value: props.data.votes.againstVotes },
  // ];

  const [buttonText, setButtonText] = React.useState("No Actions");
  async function setButton() {
    if (props.data.state == "Active" && !alreadyObjected) {
      setButtonText("Object");
      setDisabled(false);
    } else if (props.data.state == "Active" && alreadyObjected) {
      setButtonText("Vote");
      setDisabled(false);
    } else if (props.data.state == "Succeeded") {
      setButtonText("Queue");
      setDisabled(false);
    } else if (props.data.state == "Queued") {
      setButtonText("Execute");
      setDisabled(false);
    } else {
      setButtonText("No Actions");
      setDisabled(true);
    }
  }
  React.useEffect(() => {
    setAlreadyObjected(props.data.objected);
    setButton();
    // setVoteNotActive(false);
    // setAlreadyObjected(true);
  }, [props.data]);

  // React.useEffect(() => {
  //   const interval = setInterval(() => {
  //     checkObjections();
  //   }, 5000);
  //   return () => clearInterval(interval);
  // }, []);

  const votesFor: number = parseInt(props.data.votes.forVotes);
  const votesAgainst: number = parseInt(props.data.votes.againstVotes);
  // console.log(votesFor, votesAgainst);
  // THIS IS WRONG
  const data01 = [
    { name: "For", value: votesFor ** 2 },
    { name: "Against", value: votesAgainst ** 2 },
  ];

  const data02 = [
    { name: "For", value: votesFor },
    { name: "Against", value: votesAgainst },
  ];
  const theme = useTheme();
  const [elevation, setElevation] = useState(1);
  const [disabled, setDisabled] = useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [alreadyObjected, setAlreadyObjected] = React.useState(false);
  interface ExpandMoreProps extends IconButtonProps {
    expand: boolean;
  }

  // const ExpandMore = styled((props: ExpandMoreProps) => {
  //   const { expand, ...other } = props;
  //   return <IconButton {...other} />;
  // })(({ theme }) => ({
  //   //transform: !expand ? "rotate(0deg)" : "rotate(180deg)",
  //   marginLeft: "auto",
  //   transition: theme.transitions.create("transform", {
  //     duration: theme.transitions.duration.shortest,
  //   }),
  // }));

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleCallBackVote = () => {
    props.callbackVote(props.data);
  };

  const handleCallBackObject = () => {
    props.callbackObject(props.data);
  };

  const handleProposalClick = () => {
    if (props.data.state == "Active" && !alreadyObjected) {
      handleCallBackObject();
    } else if (props.data.state == "Active" && alreadyObjected) {
      handleCallBackVote();
    } else if (props.data.state == "Succeeded") {
      console.log(
        props.data.targets,
        props.data.calldatas,
        props.data.description
      );
      props.callbackQueue(
        props.data.targets,
        props.data.calldatas,
        props.data.description
      );
    } else if (props.data.state == "Queued") {
      props.callbackExecute(
        props.data.targets,
        props.data.calldatas,
        props.data.description
      );
    }
  };

  return (
    <Grid
      onMouseEnter={() => setElevation(4)}
      onMouseLeave={() => setElevation(1)}
    >
      <Card
        sx={{
          width: 790,
          display: "flex",
          flexWrap: "wrap",
          p: 1,
        }}
      >
        <CardMedia
          component="img"
          sx={{ width: 151, height: 150 }}
          src={proposalImage}
          alt="Live from space album cover"
        />

        <CardContent sx={{ width: 300, height: 150 }}>
          <Typography component="div" variant="h5" align="left">
            Governance Proposal
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            component="div"
            align="left"
            noWrap
          >
            {blinkingButton(props.data.state == "Active", props.data.state)}
            {props.data.state != "Active" && <>{props.data.state}</>}
          </Typography>

          <div></div>
          <CardMedia>
            <Grid container spacing={3} alignContent={"center"}>
              <Grid item>
                <Button
                  variant="outlined"
                  disabled={disabled}
                  onClick={handleProposalClick}
                >
                  {buttonText}
                </Button>
              </Grid>

              {/* <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleCallBackObject}
                  disabled={voteNotActive || alreadyObjected}
                >
                  Object
                </Button>
              </Grid> */}
            </Grid>
          </CardMedia>
        </CardContent>

        <CardMedia
          sx={{
            width: 151,
            height: 150,
            ml: 12,
          }}
        >
          <PieChart width={151} height={150}>
            <Legend
              verticalAlign="bottom"
              height={20}
              iconSize={10}
              payload={[{ value: "For Votes", id: "data1" }]}
            />
            <Pie
              data={data01}
              dataKey="value"
              nameKey="name"
              id="data1"
              cx="50%"
              cy="50%"
              outerRadius={20}
              fill="#8884d8"
            >
              <Cell fill={"#000000"} />
              <Cell fill={"#bdbdbd"} />
            </Pie>

            <Pie
              data={data02}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={30}
              outerRadius={40}
              fill="#82ca9d"
              label
            >
              <Cell fill={"#000000"} />
              <Cell fill={"#bdbdbd"} />
            </Pie>
          </PieChart>
        </CardMedia>
        <CardContent sx={{}}>
          <CardActions>
            <ExpandMoreIcon onClick={handleExpandClick} />
          </CardActions>
        </CardContent>
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent
            sx={{
              width: 780,
              // background: "#bdbdbd",
              mt: 1,
              ml: 0,
              mb: 1,
              mr: 0,
            }}
          >
            <Typography align="left" fontFamily="Arial">
              <b>Proposer: </b>
              {props.data.proposer}
            </Typography>
            <Typography align="left" fontFamily="Arial">
              <b>ID: </b>
              {props.data.id}
            </Typography>
            <Typography align="left" fontFamily="Arial">
              <b>Remaining voting period: </b> {props.data.remainingTime} {"("}
              {props.data.remainingBlocks} blocks
              {")"}
            </Typography>
            <Typography align="left" fontFamily="Arial">
              <b>Description: </b>
            </Typography>
            <Typography align="left" fontFamily="Arial" paragraph>
              {props.data.description}
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </Grid>
  );
};

function Proposals(props: any) {
  const [proposals, setProposals] = React.useState<any>([]);
  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);
  enum ProposalState {
    Pending,
    Active,
    Canceled,
    Defeated,
    Succeeded,
    Queued,
    Expired,
    Executed,
  }

  async function getPastProposals() {
    let proposalsArray: any[] = [];
    await governor
      .getPastEvents("ProposalCreated", { fromBlock: 23590000 })
      .then(async (events: any) => {
        for (const event of events) {
          const id = event.returnValues.proposalId;
          const state = ProposalState[await governor.methods.state(id).call()];
          const votes = await governor.methods.proposalVotes(id).call();
          const objected = await governor.methods.noObjections(id).call();
          // FIX
          // const currentBlock = { number: 0 };
          const currentBlock = await web3.eth.getBlock("latest");
          const deadline = await governor.methods.proposalDeadline(id).call();
          const remainingBlocks =
            deadline - currentBlock.number >= 0
              ? deadline - currentBlock.number
              : 0;
          const remainingTime = new Date(remainingBlocks * 5 * 1000)
            .toISOString()
            .substr(11, 8);
          let proposalData = {
            id: id,
            proposer: event.returnValues.proposer,
            description: event.returnValues.description,
            state: state,
            votes: votes,
            objected: !objected,
            targets: event.returnValues.targets,
            calldatas: event.returnValues.calldatas,
            remainingBlocks: remainingBlocks,
            remainingTime: remainingTime,
          };
          proposalsArray.push(proposalData);
        }
        setProposals(proposalsArray.reverse());
      });
  }

  React.useEffect(() => {
    getPastProposals();
  }, []);

  React.useEffect(() => {
    const interval = setInterval(() => {
      getPastProposals();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const [openVote, setVoteOpen] = React.useState(false);
  const [proposalData, setProposalData] = React.useState<any>({});
  const handleVoteClose = () => {
    setVoteOpen(false);
  };

  const handleVoteOpen = (data: any) => {
    setProposalData(data);
    setVoteOpen(true);
  };

  async function castVote(votes: any, support: any) {
    switchChain();
    const txs = {
      from: currentAccount,
      to: GOVERNOR_V2_ADDRESS,
      value: "0",
      data: governor.methods
        .castVote(proposalData.id, support, votes)
        .encodeABI(),
      chainId: "0x64",
    };
    console.log(txs);

    const txHash = await walletProvider
      .request({
        method: "eth_sendTransaction",
        params: [txs],
      })
      .catch((error: any) => {
        console.log(error);
      });
    console.log(txHash);
  }

  async function switchChain() {
    try {
      await walletProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x64" }],
      });
    } catch (switchError: any) {
      // This error code indicates that the chain has not been added to MetaMask.
      console.log(switchError);
      if (switchError.code === 4902) {
        try {
          await walletProvider.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: "0x64",
                chainName: "xDai",
                rpcUrls: [PROVIDER_XDAI] /* ... */,
              },
            ],
          });
        } catch (addError) {
          // handle "add" error
        }
      }
      // handle other "switch" errors
    }
  }

  const handleVoteSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await castVote(data.get("votes"), data.get("support"));
  };

  const [openObject, setObjectOpen] = React.useState(false);
  const handleObjectClose = () => {
    setObjectOpen(false);
  };

  const handleObjectOpen = (data: any) => {
    setProposalData(data);
    setObjectOpen(true);
  };

  const handleObjectSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    await object(data.get("stake"));
  };

  async function object(stake: any) {
    switchChain();
    console.log(proposalData.id, stake);
    const txs = {
      from: currentAccount,
      to: GOVERNOR_V2_ADDRESS,
      value: "0",
      data: governor.methods
        .object(proposalData.id, stake, "default", [0, 0])
        .encodeABI(),
      chainId: "0x64",
    };

    const txHash = await walletProvider
      .request({
        method: "eth_sendTransaction",
        params: [txs],
      })
      .catch((error: any) => {
        console.log(error);
      });
    console.log(txHash);
  }

  async function queue(targets: any[], calldatas: any[], description: string) {
    switchChain();
    const descriptionHash: String = web3.utils.keccak256(description);
    const txs = {
      from: currentAccount,
      to: GOVERNOR_V2_ADDRESS,
      value: "0",
      data: governor.methods
        .queue(targets, [0], calldatas, descriptionHash)
        .encodeABI(),
      chainId: "0x64",
    };

    const txHash = await walletProvider
      .request({
        method: "eth_sendTransaction",
        params: [txs],
      })
      .catch((error: any) => {
        console.log(error);
      });
    console.log(txHash);
  }

  async function execute(
    targets: any[],
    calldatas: any[],
    description: string
  ) {
    switchChain();
    console.log(targets, calldatas, description);
    const descriptionHash: String = web3.utils.keccak256(description);
    const txs = {
      from: currentAccount,
      to: GOVERNOR_V2_ADDRESS,
      value: "0",
      data: governor.methods
        .execute(targets, [0], calldatas, descriptionHash)
        .encodeABI(),
      chainId: "0x64",
    };

    const txHash = await walletProvider
      .request({
        method: "eth_sendTransaction",
        params: [txs],
        gas: 3000000,
      })
      .catch((error: any) => {
        console.log(error);
      });
    console.log(txHash);
  }

  const [selectedSupport, setSelectedSupport] = React.useState<Number>(1);
  const handleSupportSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSelectedSupport(Number(event.target.value));
  };

  return (
    <>
      <Grid container spacing={3}>
        {proposals.map((record: any) => (
          <RecordContextProvider key={record.id} value={record}>
            <Grid item>
              <ComTile
                data={record}
                callbackVote={handleVoteOpen}
                callbackObject={handleObjectOpen}
                callbackQueue={queue}
                callbackExecute={execute}
                id={""}
              />
            </Grid>
          </RecordContextProvider>
        ))}
      </Grid>
      <div>
        <Dialog open={openVote} onClose={handleVoteClose}>
          <Box component="form" onSubmit={handleVoteSubmit} sx={{ mt: 3 }}>
            <DialogTitle>Vote</DialogTitle>
            <DialogContent>
              {/* <DialogContentText>
                {"Votes: " +
                  proposalData.votes.forVotes +
                  ":" +
                  proposalData.votes.againstVotes}
              </DialogContentText> */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    required
                    id="votes"
                    label="Votes"
                    name="votes"
                    helperText="Input number of votes"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    variant="outlined"
                    id="support"
                    name="support"
                    select
                    label="Support"
                    value={selectedSupport}
                    onChange={handleSupportSelection}
                    helperText="For or against"
                  >
                    <MenuItem value={1}>For</MenuItem>
                    <MenuItem value={0}>Against</MenuItem>
                  </TextField>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleVoteClose}>Close</Button>
              <Button type="submit">Cast Vote</Button>
            </DialogActions>
          </Box>
        </Dialog>
        <Dialog open={openObject} onClose={handleObjectClose}>
          <Box component="form" onSubmit={handleObjectSubmit} sx={{ mt: 3 }}>
            <DialogTitle>Object</DialogTitle>
            <DialogContent>
              {/* <DialogContentText>
                {"Votes: " +
                  proposalData.votes.forVotes +
                  ":" +
                  proposalData.votes.againstVotes}
              </DialogContentText> */}
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    required
                    variant="outlined"
                    id="stake"
                    label="Stake"
                    name="stake"
                    helperText="Input stake against"
                  />
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleObjectClose}>Close</Button>
              <Button type="submit">Object</Button>
            </DialogActions>
          </Box>
        </Dialog>
      </div>
    </>
  );
}

export default Proposals;
