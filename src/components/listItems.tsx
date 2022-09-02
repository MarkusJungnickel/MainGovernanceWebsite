import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import DashboardIcon from "@mui/icons-material/Dashboard";
import LayersIcon from "@mui/icons-material/Layers";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import PeopleIcon from "@mui/icons-material/People";
import PieChartIcon from "@mui/icons-material/PieChart";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  MenuItem,
  TextField,
} from "@mui/material";
import Box from "@mui/material/Box";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import * as React from "react";
import Web3 from "web3";
import { toWei } from "web3-utils";
import { BUDGETMODIFIER_ABI } from "../constants/ABIs/BUDGETMODIFIER_ABI";
import { FACTORY_ABI } from "../constants/ABIs/FACTORY_ABI";
import { PERMISSIONREG_ABI } from "../constants/ABIs/PERMISSIONREG_ABI";
import {
  MODIFIER_ADDRESS,
  PERMISSIONREG_ADDRESS,
  PROVIDER_XDAI,
  ROLES,
  WEB3_PROVIDER,
  WRAPPER_FACTORY_ADDRESS,
} from "../constants/constants";
import { ProviderContext } from "../context/Provider";
import ContractCall from "./ContractCall/ContractCall";
import Delegate from "./Delegate";
import CheckoutPropose from "./Propose/ContractCallPropose";
import { switchChain } from "./utils";
import Votes from "./Votes";

export default function MainListItems() {
  // Committee Dialog
  const [openCommittee, setCommitteeOpen] = React.useState(false);
  const handleCommitteeOpen = () => {
    switchChain(walletProvider, "0x4", "rinkeby", WEB3_PROVIDER);
    setCommitteeOpen(true);
  };
  const handleCommitteeClose = () => {
    setCommitteeOpen(false);
  };
  // Votes Dialog
  const [openVotes, setVotesOpen] = React.useState(false);
  const handleVotesOpen = () => {
    switchChain(walletProvider, "0x64", "xDai", PROVIDER_XDAI);
    setVotesOpen(true);
  };
  const handleVotesClose = () => {
    setVotesOpen(false);
  };

  // ========= Role Dialog ========
  const [openRole, setRoleOpen] = React.useState(false);
  const handleRoleOpen = () => {
    switchChain(walletProvider, "0x4", "rinkeby", WEB3_PROVIDER);
    setRoleOpen(true);
  };
  const handleRoleClose = () => {
    setRoleOpen(false);
  };
  const [selectedRole, setSelectedRole] = React.useState<Number>(0);
  const handleRoleSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedRole(Number(event.target.value));
    console.log(Number(event.target.value));
  };
  const [selectedEnable, setSelectedEnable] = React.useState<Number>(0);
  const handleEnableSelection = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    console.log(Number(event.target.value));
    setSelectedEnable(Number(event.target.value));
  };

  // ========= Propose Dialog ========

  const [openPropose, setProposeOpen] = React.useState(false);
  const handleProposeOpen = () => {
    setProposeOpen(true);
  };
  const handleProposeClose = () => {
    setProposeOpen(false);
  };

  // ========= Delegate Dialog ========

  const [openDelegate, setDelegateOpen] = React.useState(false);
  const handleDelegateOpen = () => {
    setDelegateOpen(true);
    switchChain(walletProvider, "0x64", "xDai", PROVIDER_XDAI);
  };
  const handleDelegateClose = () => {
    setDelegateOpen(false);
  };

  // ========= Contract Dialog ========
  const [openContract, setContractOpen] = React.useState(false);
  const handleContractOpen = () => {
    switchChain(walletProvider, "0x4", "rinkeby", WEB3_PROVIDER);
    setContractOpen(true);
  };
  const handleContractClose = () => {
    setContractOpen(false);
  };

  const { walletProvider, currentAccount, connectFunction } =
    React.useContext(ProviderContext);

  let web3 = new Web3(walletProvider);
  const permissionReg = new web3.eth.Contract(
    PERMISSIONREG_ABI,
    PERMISSIONREG_ADDRESS
  );
  const factory = new web3.eth.Contract(FACTORY_ABI, WRAPPER_FACTORY_ADDRESS);
  const budgetModifier = new web3.eth.Contract(
    BUDGETMODIFIER_ABI,
    MODIFIER_ADDRESS
  );

  async function setRole(user: any, role: any, enable: any) {
    if (!walletProvider.isConnected()) {
      console.log("not connected");
      connectFunction();
    }

    const txs = {
      from: currentAccount,
      to: PERMISSIONREG_ADDRESS,
      value: "0",
      data: permissionReg.methods
        .setUserRole(user, role, Number(enable))
        .encodeABI(),
      chainId: "0x4",
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

  async function deploySafeWithBudget(
    budget: any,
    interval: any,
    name: any,
    department: any,
    members: any,
    threshold: any
  ) {
    const budgetWei = toWei(budget);
    if (!walletProvider.isConnected()) {
      connectFunction();
    }
    const salt = Date.now() * 1000 + Math.floor(Math.random() * 1000);
    const owners = members.split(",");
    const txs = {
      from: currentAccount,
      to: WRAPPER_FACTORY_ADDRESS,
      value: "0",
      data: factory.methods
        .createSafeWrapperWithBudget(
          currentAccount,
          "0x529F7DbD167ea367f72d95589DA986d2575F84e7",
          budgetWei,
          interval,
          MODIFIER_ADDRESS,
          salt,
          owners,
          threshold,
          name,
          department
        )
        .encodeABI(),
      chainId: "0x4",
    };

    const txHash = await walletProvider.request({
      method: "eth_sendTransaction",
      params: [txs],
    });
    console.log(txHash);
    factory.events.createdSafeWrapper(function (error: any, event: any) {
      console.log("Safe: ", event.returnValues.safe);
      console.log("Wrapper: ", event.returnValues.safeWrapper);
    });
  }

  async function callContract(parameters: any) {
    console.log(parameters);
    const txs = {
      from: currentAccount,
      to: MODIFIER_ADDRESS,
      value: "0",
      data: budgetModifier.methods.setFreeze(parameters).encodeABI(),
      chainId: "0x4",
    };

    const txHash = await walletProvider.request({
      method: "eth_sendTransaction",
      params: [txs],
    });
    console.log(txHash);
  }

  const handleCommitteeSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await deploySafeWithBudget(
      data.get("amount"),
      data.get("interval"),
      data.get("name"),
      data.get("department"),
      data.get("members"),
      data.get("threshold")
    );
  };

  const handleRoleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await setRole(data.get("user"), data.get("role"), data.get("enable"));
  };

  const handleContractSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await callContract(data.get("parameters"));
  };

  return (
    <React.Fragment>
      <ListItemButton onClick={handleCommitteeOpen}>
        <ListItemIcon>
          <DashboardIcon sx={{ color: "black" }} />
        </ListItemIcon>
        <ListItemText primary="Committee Factory" />
      </ListItemButton>
      <ListItemButton onClick={handleRoleOpen}>
        <ListItemIcon>
          <PeopleIcon sx={{ color: "black" }} />
        </ListItemIcon>
        <ListItemText primary="Assign Roles" />
      </ListItemButton>
      <ListItemButton onClick={handleContractOpen}>
        <ListItemIcon>
          <LayersIcon sx={{ color: "black" }} />
        </ListItemIcon>
        <ListItemText primary="Call Contract" />
      </ListItemButton>
      <ListItemButton onClick={handleProposeOpen}>
        <ListItemIcon>
          <LightbulbIcon sx={{ color: "black" }} />
        </ListItemIcon>
        <ListItemText primary="Make Proposal" />
      </ListItemButton>
      <ListItemButton onClick={handleDelegateOpen}>
        <ListItemIcon>
          <AssignmentIndIcon sx={{ color: "black" }} />
        </ListItemIcon>
        <ListItemText primary="Delegate Power" />
      </ListItemButton>
      <ListItemButton onClick={handleVotesOpen}>
        <ListItemIcon>
          <PieChartIcon sx={{ color: "black" }} />
        </ListItemIcon>
        <ListItemText primary="Voting Power" />
      </ListItemButton>
      <Dialog open={openCommittee} onClose={handleCommitteeClose}>
        <Box
          component="form"
          noValidate
          onSubmit={handleCommitteeSubmit}
          sx={{ mt: 3 }}
        >
          <DialogTitle>Committee Factory</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Create a new spring DAO Committee
            </DialogContentText>

            <Grid container spacing={1}>
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <TextField
                  required
                  fullWidth
                  id="name"
                  label="Committee Name"
                  name="name"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <TextField
                  required
                  fullWidth
                  id="department"
                  label="Department"
                  name="department"
                />
              </Grid>
              <Grid item xs={9}>
                <TextField
                  required
                  fullWidth
                  id="members"
                  label="Members"
                  name="members"
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  required
                  fullWidth
                  id="threshold"
                  label="Threshold"
                  name="threshold"
                />
              </Grid>

              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <TextField
                  fullWidth
                  required
                  id="amount"
                  label="Budget"
                  name="amount"
                />
              </Grid>
              <Grid item xs={6} sm={6} md={6} lg={6} xl={6}>
                <TextField
                  fullWidth
                  required
                  name="interval"
                  label="Budget Period"
                  id="interval"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCommitteeClose}>Close</Button>
            <Button type="submit">Create New Committee</Button>
          </DialogActions>
        </Box>
      </Dialog>
      <Dialog open={openRole} onClose={handleRoleClose}>
        <Box
          component="form"
          noValidate
          onSubmit={handleRoleSubmit}
          sx={{ mt: 3 }}
        >
          <DialogTitle>Permission Registry</DialogTitle>
          <DialogContent>
            <DialogContentText>Adjust a member's role</DialogContentText>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  id="user"
                  label="Member Address"
                  name="user"
                  helperText="Input the wallet address"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="role"
                  name="role"
                  select
                  label="Role"
                  value={selectedRole}
                  onChange={handleRoleSelection}
                  helperText="Select the role"
                >
                  {ROLES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  id="enable"
                  name="enable"
                  select
                  label="Action"
                  value={selectedEnable}
                  onChange={handleEnableSelection}
                  helperText="Remove or grant"
                >
                  <MenuItem value={1}>Grant</MenuItem>
                  <MenuItem value={0}>Remove</MenuItem>
                </TextField>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRoleClose}>Close</Button>
            <Button type="submit">Change Role</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={openContract} onClose={handleContractClose}>
        <ContractCall />
      </Dialog>
      <Dialog open={openPropose} onClose={handleProposeClose}>
        <CheckoutPropose />
      </Dialog>
      <Dialog open={openDelegate} onClose={handleDelegateClose}>
        <Delegate handleClose={handleDelegateClose} />
      </Dialog>
      <Dialog open={openVotes} onClose={handleVotesClose}>
        <Votes handleClose={handleVotesClose} />
      </Dialog>
    </React.Fragment>
  );
}

// <Dialog open={openContract} onClose={handleContractClose}>
// <Box
//   component="form"
//   noValidate
//   onSubmit={handleContractSubmit}
//   sx={{ mt: 3 }}
// >
//   <DialogTitle>Contract Call</DialogTitle>
//   <DialogContent>
//     <DialogContentText>
//       Call a function in a DAO contract
//     </DialogContentText>
//     <Grid container spacing={2}>
//       <Grid item xs={12}>
//         <TextField
//           id="contract"
//           name="contract"
//           select
//           label="Contract"
//           helperText="Select the ontract"
//         >
//           <MenuItem value={0}>Permission Registry</MenuItem>
//           <MenuItem value={1}>Budget Modifier</MenuItem>
//           <MenuItem value={2}>Committee Factory</MenuItem>
//           <MenuItem value={3}>Core Treasury Contract</MenuItem>
//         </TextField>
//       </Grid>
//       <Grid item xs={12}>
//         <TextField
//           id="function"
//           name="function"
//           select
//           label="Function"
//           helperText="Choose the function to call"
//         >
//           <MenuItem value={0}>freezeBudget</MenuItem>
//         </TextField>
//       </Grid>
//       <Grid item xs={12}>
//         <TextField
//           id="parameters"
//           name="parameters"
//           label="Parameters"
//           helperText="Input the parameters"
//         ></TextField>
//       </Grid>
//     </Grid>
//   </DialogContent>
//   <DialogActions>
//     <Button onClick={handleContractClose}>Close</Button>
//     <Button type="submit">Call</Button>
//   </DialogActions>
// </Box>
// </Dialog>
