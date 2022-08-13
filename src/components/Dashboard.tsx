import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import MenuIcon from "@mui/icons-material/Menu";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import MuiDrawer from "@mui/material/Drawer";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import { createTheme, styled, ThemeProvider } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useContext } from "react";
import Web3 from "web3";
import { BUDGETMODIFIER_ABI } from "../constants/ABIs/BUDGETMODIFIER_ABI";
import { FACTORY_ABI } from "../constants/ABIs/FACTORY_ABI";
import { LOGIC_ABI } from "../constants/ABIs/LOGIC_ABI";
import { PERMISSIONREG_ABI } from "../constants/ABIs/PERMISSIONREG_ABI";
import {
  MODIFIER_ADDRESS,
  PERMISSIONREG_ADDRESS,
  WEB3_PROVIDER,
  WRAPPER_FACTORY_ADDRESS,
} from "../constants/constants";
import { ProviderContext } from "../context/Provider";
import CommitteeGrid from "./GridList";
import MainListItems from "./listItems";
import Proposals from "./Proposals";
import Roles from "./roles";
import { delay } from "./utils";

const drawerWidth: number = 240;

let web3 = new Web3(WEB3_PROVIDER);
const factory = new web3.eth.Contract(FACTORY_ABI, WRAPPER_FACTORY_ADDRESS);
const permissionReg = new web3.eth.Contract(
  PERMISSIONREG_ABI,
  PERMISSIONREG_ADDRESS
);
const budgetModifier = new web3.eth.Contract(
  BUDGETMODIFIER_ABI,
  MODIFIER_ADDRESS
);

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme, open }) => ({
  zIndex: theme.zIndex.drawer + 1,
  color: "black",
  backgroundColor: "white",
  elevation: 0,
  shadow: "none",
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    backgroundColor: "white",
    color: "black",
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  "& .MuiDrawer-paper": {
    position: "relative",
    whiteSpace: "nowrap",

    elevation: 1,
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    boxSizing: "border-box",
    ...(!open && {
      overflowX: "hidden",
      transition: theme.transitions.create("width", {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
      }),
      width: theme.spacing(7),
      [theme.breakpoints.up("sm")]: {
        width: theme.spacing(9),
      },
    }),
  },
}));

const mdTheme = createTheme({
  typography: {
    fontFamily: "Arial",
  },
});

function DashboardContent() {
  const { walletProvider, currentAccount, connectFunction } =
    useContext(ProviderContext);
  const [open, setOpen] = React.useState(true);
  const toggleDrawer = () => {
    setOpen(!open);
  };

  const [committees, setCommittee] = React.useState<any>([]);
  const [roleNFTs, setRoleNFTs] = React.useState<any>([]);

  async function getCommitteesSetup() {
    let committeeArray: any[] = [];
    await factory
      .getPastEvents("ProxyCreation", { fromBlock: 1074967 })
      .then(async (events) => {
        for (const event of events) {
          await delay(500);
          const proxyAddress = event.returnValues.proxy;
          const proxy = new web3.eth.Contract(LOGIC_ABI, proxyAddress);
          const budgetData = await budgetModifier.methods
            .getBudget(proxyAddress)
            .call();
          const name = await proxy.methods.name().call();
          const sector = await proxy.methods.sector().call();
          let committeeData = {
            coreInfo: { name: name, sector: sector },
            budgetData: budgetData,
            safeAddress: "",
          };
          await proxy
            .getPastEvents("SafeSucessfullyRegistered", { fromBlock: 1074967 })
            .then((proxyEvents) => {
              const safeAddress = proxyEvents[0].returnValues.newSafe;
              committeeData.safeAddress = safeAddress;
              committeeArray.push(committeeData);
            });
        }
      });
    setCommittee(committeeArray);
  }

  async function getRoles() {
    let nfts: any[] = [];
    for (let i = 0; i < 10; i++) {
      const nftURI = await permissionReg.methods
        .getNFT(currentAccount, i)
        .call();
      const nftID = await permissionReg.methods
        .getTokenID(currentAccount, i)
        .call();
      if (nftURI != "") {
        let response = await fetch(nftURI);
        let responseJson = await response.json();
        responseJson.opensea = `https://testnets.opensea.io/assets/rinkeby/${PERMISSIONREG_ADDRESS}/${nftID}`;
        nfts.push(responseJson);
      }
    }
    setRoleNFTs(nfts);
  }

  React.useEffect(() => {
    getCommitteesSetup();
    getRoles();
  }, [currentAccount]);

  React.useEffect(() => {
    const interval = setInterval(() => {
      getCommitteesSetup();
      getRoles();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentAccount]);

  return (
    <ThemeProvider theme={mdTheme}>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />

        <AppBar position="absolute" open={open}>
          <Box sx={{ border: 1 }}>
            <Toolbar
              sx={{
                pr: "24px", // keep right padding when drawer closed
              }}
            >
              <IconButton
                edge="start"
                color="inherit"
                aria-label="open drawer"
                onClick={toggleDrawer}
                sx={{
                  marginRight: "36px",
                  ...(open && { display: "none" }),
                }}
              >
                <MenuIcon />
              </IconButton>
              <Typography
                component="h1"
                variant="h6"
                color="inherit"
                fontWeight="bold"
                fontSize={50}
                noWrap
                sx={{ flexGrow: 1 }}
              >
                SPRING DAO
              </Typography>
              <IconButton color="inherit" onClick={connectFunction}>
                <AccountBalanceWalletIcon />
              </IconButton>
            </Toolbar>
          </Box>
        </AppBar>

        <Box
          sx={{
            border: 1,
          }}
        >
          <Drawer variant="permanent" open={open}>
            <Toolbar
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
                color: " black",
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>
            <Divider />
            <List>
              <MainListItems />
            </List>
          </Drawer>
        </Box>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            height: "100vh",
            overflow: "auto",
          }}
        >
          <Toolbar />
          <Container maxWidth="lg" sx={{ mt: 5, mb: 5, mr: 0, ml: 0 }}>
            <Grid container spacing={3}>
              {/* Committees */}
              <Grid item xs={6} sm={7} md={8} lg={9} xl={11}>
                <Box
                  sx={{
                    // minWidth: 860,
                    border: 1,
                    pt: 3,
                    pl: 3,
                    pb: 3,
                    pr: 3,
                  }}
                >
                  <CommitteeGrid tileData={committees} />
                </Box>
              </Grid>

              {/* Roles */}
              <Grid item xs={6} sm={5} md={4} lg={3} xl={1}>
                <Box
                  sx={{
                    width: 250,
                    border: 1,
                    pt: 3,
                    pl: 3.3,
                    pb: 2.5,
                  }}
                >
                  <Roles NFTData={roleNFTs} />
                </Box>
              </Grid>
              <Grid item xs={6} sm={7} md={8} lg={9} xl={11}>
                <Box
                  sx={{
                    minWidth: 848,
                    // maxWidth: 860,
                    border: 1,
                    pt: 3,
                    pl: 3,
                    pb: 3,
                    pr: 3,
                  }}
                >
                  <Proposals />
                </Box>
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Dashboard() {
  return <DashboardContent />;
}
